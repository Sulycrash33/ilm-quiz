-- Migration 0035: A run's difficulty is decided by the server, like its mode.
--
-- WHAT WAS WRONG
-- Migration 0030 made the *mode* trustworthy: the client sends a run id, the
-- server reads the mode off that row, and the multiplier comes from the
-- database. What it did not do is bind the run to anything about the questions
-- it was opened for.
--
-- So the run id was a bearer token for the multiplier alone. Open Survival at
-- Muhaddith, and its 2x applies to *any* published question the caller names —
-- including tier 1, which the player has long since outgrown. The advertised
-- bargain of Survival is "harder questions, worth more"; only the second half
-- was enforced. A caller who answered nothing but tier-1 questions with a
-- Survival run id earned double for the easiest bank in the game.
--
-- The server already chose the right questions. `/play/[mode]` centres the
-- pool on the player's own rank and hands down three tiers of it. That choice
-- simply never reached the grader, so the grader had no way to notice it was
-- being ignored.
--
-- WHAT THIS DOES
-- The band the pool was drawn from is now written on the run itself, by
-- `start_game_run`, derived in the database from the player's own `total_xp`
-- against `rank_tiers`. Nothing about it arrives as an argument.
--
-- `submit_quiz_answer` then applies the mode multiplier only to a question
-- inside that band. Answering outside it is not refused — a player is free to
-- answer anything, and refusing would break the classic hunt and the level
-- path, which have no run and no band at all. It simply pays the ordinary
-- rate. That is the honest reading of the bargain: the multiplier is for the
-- difficulty, so no difficulty, no multiplier.
--
-- WHY THE BAND, AND NOT THE QUESTION LIST
-- Binding all 300 questions of the pool to the run would be tighter by one
-- degree and much heavier. It also would not be *more* correct: the pool is
-- defined as "every published question in these three tiers", so the band is
-- the same statement, held in two integers instead of three hundred rows.
--
-- The band is read back through `game_run_band`, so `/play/[mode]` draws its
-- pool from the number the run actually recorded rather than from a second
-- copy of the rank thresholds in TypeScript agreeing with the database's.
-- Two copies of a rule is how they drift.
--
-- That read is a separate function on purpose. Returning the band from
-- `start_game_run` would be one call instead of two, but it changes what that
-- function returns — and `create or replace` cannot change a return type, so
-- it would mean dropping and recreating it, which breaks every deployed client
-- calling the old shape for as long as the deploy takes. `start_game_run`
-- keeps its signature exactly; only its body learns to record the band.

alter table public.game_runs
  add column if not exists tier_min smallint,
  add column if not exists tier_max smallint;

comment on column public.game_runs.tier_min is
  'Lowest tier this run pays its mode multiplier on. Server-derived from the '
  'player rank at the moment the run opened; never supplied by a caller. '
  'See migration 0035.';
comment on column public.game_runs.tier_max is
  'Highest tier this run pays its mode multiplier on. See migration 0035.';


-- The rank a given XP total holds, read from `rank_tiers` — the table
-- `constants.ts` names as the source of truth for the very same thresholds.
-- Immutable and side-effect free, so the grader and the run opener can both
-- call it without either owning it.
create or replace function public.rank_level_for_xp(p_total_xp integer)
returns smallint
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select max(rt.sort_order)::smallint
       from public.rank_tiers rt
      where rt.min_xp <= greatest(coalesce(p_total_xp, 0), 0)),
    1::smallint
  );
$$;

revoke all on function public.rank_level_for_xp(integer) from public, anon;
grant execute on function public.rank_level_for_xp(integer) to authenticated;


-- ---------------------------------------------------------------------------
-- start_game_run: opens the run and records the difficulty it was opened at.
-- Signature unchanged; only the body is new.
-- ---------------------------------------------------------------------------
create or replace function public.start_game_run(p_mode text, p_category_id uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_run_id  uuid;
  v_centre  smallint;
  v_min     smallint;
  v_max     smallint;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to play.';
  end if;

  if not exists (select 1 from public.game_mode_rules r where r.mode = p_mode) then
    raise exception 'Unknown game mode.';
  end if;

  select public.rank_level_for_xp(p.total_xp)
    into v_centre
    from public.profiles p
   where p.id = v_user_id;

  v_centre := coalesce(v_centre, 1);
  -- The same three-tier window `getModeQuestionPool` draws the pool from,
  -- clamped to the nine tiers that exist.
  v_min := greatest(v_centre - 1, 1)::smallint;
  v_max := least(v_centre + 1, 9)::smallint;

  update public.game_runs
     set ended_at = now()
   where user_id = v_user_id and ended_at is null;

  insert into public.game_runs (user_id, mode, category_id, tier_min, tier_max)
  values (v_user_id, p_mode, p_category_id, v_min, v_max)
  returning id into v_run_id;

  return v_run_id;
end;
$$;

revoke all on function public.start_game_run(text, uuid) from public, anon;
grant execute on function public.start_game_run(text, uuid) to authenticated;


-- The band a run was opened at, for the page that has to fetch questions to
-- match it. Readable only for the caller's own run, so it says nothing about
-- anyone else's game.
create or replace function public.game_run_band(p_run_id uuid)
returns table(o_tier_min smallint, o_tier_max smallint)
language sql
stable
security definer
set search_path = public
as $$
  select g.tier_min, g.tier_max
    from public.game_runs g
   where g.id = p_run_id
     and g.user_id = auth.uid();
$$;

revoke all on function public.game_run_band(uuid) from public, anon;
grant execute on function public.game_run_band(uuid) to authenticated;


-- ---------------------------------------------------------------------------
-- submit_quiz_answer: the multiplier is for the difficulty it was sold for.
-- ---------------------------------------------------------------------------
-- Recreated whole rather than patched, because there is exactly one place XP
-- is decided and it should read as one piece. The only change from 0034 is the
-- tier test on the run lookup.
create or replace function public.submit_quiz_answer(
  p_question_id     uuid,
  p_choice_index    integer,
  p_response_time_ms integer default null,
  p_run_id          uuid default null
)
returns table(o_correct boolean, o_correct_index integer, o_explanation text,
              o_citation text, o_xp_earned integer, o_streak_multiplier integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_question record;
  v_streak int := 0;
  v_correct boolean;
  v_multiplier int;
  v_base_xp int;
  v_xp int;
  v_mode_num int := 1;
  v_mode_den int := 1;
  v_double boolean := false;
  v_used_hint boolean := false;
  v_tier int;
  rec record;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to answer.';
  end if;
  if p_choice_index is null or p_choice_index < 0 then
    raise exception 'Invalid answer.';
  end if;

  select q.id, q.choices, q.correct_choice_index, q.explanation,
         q.citation_reference, q.difficulty, q.tier, q.review_status
    into v_question
    from public.questions q
   where q.id = p_question_id;

  if not found then raise exception 'Question not found.'; end if;
  if v_question.review_status <> 'published' then
    raise exception 'This question is not available.';
  end if;

  if p_choice_index >= jsonb_array_length(v_question.choices) then
    raise exception 'Invalid answer.';
  end if;

  v_tier := least(greatest(coalesce(v_question.tier, 1), 1), 9);

  if p_run_id is not null then
    -- The run must be the caller's, still open, AND opened for questions of
    -- this difficulty. A run with no band recorded — one opened before this
    -- migration — still pays, so a run in flight during the deploy is not
    -- silently devalued mid-game.
    select r.xp_numerator, r.xp_denominator
      into v_mode_num, v_mode_den
      from public.game_runs g
      join public.game_mode_rules r on r.mode = g.mode
     where g.id = p_run_id
       and g.user_id = v_user_id
       and g.ended_at is null
       and (g.tier_min is null or v_tier between g.tier_min and g.tier_max);

    if not found then
      v_mode_num := 1;
      v_mode_den := 1;
    end if;
  end if;

  select exists (
    select 1 from public.lifeline_spends s
     where s.user_id = v_user_id
       and s.question_id = p_question_id
       and s.lifeline_id = 'ask-imam'
  ) into v_used_hint;

  update public.lifeline_spends s
     set consumed_at = now()
   where s.user_id = v_user_id
     and s.question_id = p_question_id
     and s.lifeline_id = 'double-points'
     and s.consumed_at is null
  returning true into v_double;

  v_double := coalesce(v_double, false);

  for rec in
    select a.is_correct
      from public.attempts a
     where a.user_id = v_user_id
     order by a.created_at desc
     limit 20
  loop
    exit when not rec.is_correct;
    v_streak := v_streak + 1;
  end loop;

  v_correct := (p_choice_index = v_question.correct_choice_index);
  if v_correct then
    v_multiplier := least(floor(v_streak / 3)::int + 1, 3);
  else
    v_multiplier := 1;
  end if;

  if not v_correct then
    v_base_xp := 0;
  else
    v_base_xp := round((20 + 5 * v_tier) / 3.0);
  end if;

  v_xp := v_base_xp * v_multiplier * (case when v_double then 2 else 1 end);
  v_xp := round((v_xp * v_mode_num)::numeric / v_mode_den);

  insert into public.attempts (
    user_id, question_id, is_correct, xp_earned, response_time_ms, used_ask_the_imam_hint
  )
  values (
    v_user_id, v_question.id, v_correct, v_xp, p_response_time_ms, v_used_hint
  );

  update public.profiles p
     set coins      = coalesce(p.coins, 0) + v_xp,
         total_xp   = coalesce(p.total_xp, 0) + v_xp,
         high_score = greatest(coalesce(p.high_score, 0), coalesce(p.total_xp, 0) + v_xp)
   where p.id = v_user_id;

  return query
    select v_correct,
           v_question.correct_choice_index::int,
           v_question.explanation,
           v_question.citation_reference,
           v_xp,
           v_multiplier;
end;
$$;
