-- The three unbuilt game modes: Speed Round, Survival and Practice.
--
-- Each advertises an XP multiplier on the Game Modes page — 1.5x, 2x and 0.5x.
-- That number cannot come from the client. `submit_quiz_answer` is SECURITY
-- DEFINER precisely because the XP it writes must not be forgeable, and handing
-- it a multiplier as an argument would undo that in one line. This is the same
-- mistake migration 0006 fixed in the store, where the caller passed the price.
--
-- So the mode lives on a row the *server* created. `start_game_run` opens a run
-- and returns its id; `submit_quiz_answer` takes that id, reads the mode from
-- the row, and looks the multiplier up here. The client never names a number,
-- and a run id belonging to someone else, or already closed, is ignored.
--
-- A player can still open a survival run and answer easy questions, which is
-- worth naming: the mode is trustworthy, the *difficulty* is not. Closing that
-- properly means the server choosing the questions for a run, which is a larger
-- change than this one and is not pretended at here.

create table if not exists public.game_mode_rules (
  mode              text primary key,
  -- Stored as a fraction so 1.5x and 0.5x stay exact in integer arithmetic.
  xp_numerator      integer not null check (xp_numerator > 0),
  xp_denominator    integer not null default 1 check (xp_denominator > 0),
  -- Lives, or null for modes that cannot be lost on wrong answers.
  lives             integer check (lives is null or lives > 0),
  -- Seconds on a whole-run clock, or null when there is no run clock.
  run_seconds       integer check (run_seconds is null or run_seconds > 0),
  -- Whether a question is individually timed.
  per_question_timer boolean not null default true,
  -- Whether the run continues past the end of a fixed ladder.
  endless           boolean not null default false
);

insert into public.game_mode_rules (mode, xp_numerator, xp_denominator, lives, run_seconds, per_question_timer, endless)
values
  -- The hunt as it already plays. Present so classic runs can carry a run id
  -- too, rather than being the one mode that works differently.
  ('classic',  1, 1, 3,    null, true,  false),
  -- Speed Round: one clock for the whole run, no lives, questions keep coming
  -- until it runs out. A wrong answer costs time, not the run.
  ('timed',    3, 2, null, 120,  false, true),
  -- Survival: three lives, no ladder end. It stops when the player does.
  ('survival', 2, 1, 3,    null, true,  true),
  -- Practice: no lives, no clock, half XP. The mode someone opens when they
  -- want to learn the material rather than be scored on it.
  ('practice', 1, 2, null, null, false, false)
on conflict (mode) do nothing;

alter table public.game_mode_rules enable row level security;

-- The rules are not secret — the Game Modes page shows every one of them — but
-- they are read through the functions below, so no direct policy is granted.
revoke all on table public.game_mode_rules from public, anon, authenticated;

create table if not exists public.game_runs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  mode        text not null references public.game_mode_rules(mode),
  category_id uuid references public.categories(id) on delete set null,
  started_at  timestamptz not null default now(),
  ended_at    timestamptz
);

create index if not exists game_runs_user_open_idx
  on public.game_runs (user_id, ended_at);

alter table public.game_runs enable row level security;

-- A player may read their own runs. Writes go through the functions below, so
-- that a run's mode is always something the server wrote.
drop policy if exists "own runs are readable" on public.game_runs;
create policy "own runs are readable"
  on public.game_runs for select
  using (auth.uid() = user_id);

/**
 * Open a run in a mode, and return its id.
 *
 * SECURITY DEFINER so it can write `game_runs` while the table itself stays
 * closed to direct inserts — the whole point being that a run's mode is not
 * client-writable after the fact.
 */
create or replace function public.start_game_run(p_mode text, p_category_id uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_run_id  uuid;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to play.';
  end if;

  if not exists (select 1 from public.game_mode_rules r where r.mode = p_mode) then
    raise exception 'Unknown game mode.';
  end if;

  -- Close anything the player left open, so an abandoned run cannot be
  -- resurrected later to attach a multiplier to fresh answers.
  update public.game_runs
     set ended_at = now()
   where user_id = v_user_id and ended_at is null;

  insert into public.game_runs (user_id, mode, category_id)
  values (v_user_id, p_mode, p_category_id)
  returning id into v_run_id;

  return v_run_id;
end;
$$;

create or replace function public.end_game_run(p_run_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.game_runs
     set ended_at = coalesce(ended_at, now())
   where id = p_run_id and user_id = auth.uid();
$$;

/**
 * The rules for one mode, for the client to lay out the run with.
 *
 * The multiplier is returned for display only. Nothing the client does with
 * these numbers affects what `submit_quiz_answer` writes.
 */
create or replace function public.game_mode_rules_for(p_mode text)
returns table (
  o_mode text,
  o_xp_numerator integer,
  o_xp_denominator integer,
  o_lives integer,
  o_run_seconds integer,
  o_per_question_timer boolean,
  o_endless boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select r.mode, r.xp_numerator, r.xp_denominator, r.lives,
         r.run_seconds, r.per_question_timer, r.endless
    from public.game_mode_rules r
   where r.mode = p_mode;
$$;

revoke all on function public.start_game_run(text, uuid)      from public, anon;
revoke all on function public.end_game_run(uuid)              from public, anon;
revoke all on function public.game_mode_rules_for(text)       from public, anon;
grant execute on function public.start_game_run(text, uuid)   to authenticated;
grant execute on function public.end_game_run(uuid)           to authenticated;
grant execute on function public.game_mode_rules_for(text)    to authenticated;

/**
 * Grading, now aware of which mode the answer was given in.
 *
 * The only change to the body is `p_run_id`: when it names a run that belongs
 * to the caller and is still open, that run's mode multiplier is applied to the
 * XP. Everything else — the tier base, the streak multiplier, the attempt row,
 * the profile update — is exactly as it was, so a classic run with no run id
 * behaves identically to before this migration.
 *
 * `p_double_points` is left as it was found, deliberately and with a warning:
 * it is client-supplied and checked against nothing, so any caller can claim it
 * without owning the power-up. Fixing that means tracking a lifeline spend
 * against the question it was spent on, which is a change to the lifeline flow
 * rather than to this migration's subject. It is called out here so it is not
 * mistaken for something this migration introduced. The exposure it adds here
 * is bounded rather than capped by code: the mode multiplier is read from a
 * four-row table whose largest value is 2x, so a forged `p_double_points` on a
 * survival run is worth 4x and no more.
 */
-- The old six-argument signature must go, not merely be replaced. Adding a
-- seventh parameter with a default creates an *overload*: both functions would
-- then exist, and every existing six-argument call — which is what the app
-- sends today — becomes ambiguous and fails with "function is not unique".
-- Dropping it first makes this a replacement rather than a second definition.
drop function if exists public.submit_quiz_answer(uuid, integer, boolean, integer, boolean, text);

create or replace function public.submit_quiz_answer(
  p_question_id uuid,
  p_choice_index integer,
  p_used_hint boolean default false,
  p_response_time_ms integer default null,
  p_double_points boolean default false,
  p_lifeline_used text default null,
  p_run_id uuid default null
)
returns table(
  o_correct boolean,
  o_correct_index integer,
  o_explanation text,
  o_citation text,
  o_xp_earned integer,
  o_streak_multiplier integer
)
language plpgsql
security definer
set search_path = public
as $function$
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

  -- The mode comes from the run row, never from the caller. An unknown,
  -- finished, or someone else's run simply leaves the multiplier at 1.
  if p_run_id is not null then
    select r.xp_numerator, r.xp_denominator
      into v_mode_num, v_mode_den
      from public.game_runs g
      join public.game_mode_rules r on r.mode = g.mode
     where g.id = p_run_id
       and g.user_id = v_user_id
       and g.ended_at is null;

    if not found then
      v_mode_num := 1;
      v_mode_den := 1;
    end if;
  end if;

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
    v_base_xp := round((20 + 5 * least(greatest(coalesce(v_question.tier, 1), 1), 9)) / 3.0);
  end if;

  v_xp := v_base_xp * v_multiplier * (case when p_double_points then 2 else 1 end);
  -- Mode multiplier last, so Practice halves the whole award rather than only
  -- the base, and Survival doubles it the same way.
  v_xp := round((v_xp * v_mode_num)::numeric / v_mode_den);

  insert into public.attempts (
    user_id, question_id, is_correct, xp_earned, response_time_ms, used_ask_the_imam_hint
  )
  values (
    v_user_id, v_question.id, v_correct, v_xp, p_response_time_ms, coalesce(p_used_hint, false)
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
$function$;

revoke all on function public.submit_quiz_answer(uuid, integer, boolean, integer, boolean, text, uuid) from public, anon;
grant execute on function public.submit_quiz_answer(uuid, integer, boolean, integer, boolean, text, uuid) to authenticated;
