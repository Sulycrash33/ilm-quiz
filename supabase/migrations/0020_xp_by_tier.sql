-- Pay XP by tier rather than by the three-way band.
--
-- Questions now carry a rank tier 1-9 (migration 0019), but `submit_quiz_answer`
-- still priced them from `difficulty`, so every question in the whole top third
-- paid a flat 20 XP whether it was pitched at Shaykh or at Mujaddid. Nine levels
-- of difficulty with three levels of reward is not a progression.
--
-- The scale is linear and deliberately pinned to the existing values at the
-- three points where old and new meet:
--
--   tier  1  2  3  4  5  6  7  8  9
--   xp    8 10 12 13 15 17 18 20 22
--                ^        ^        ^
--   old easy = 10 at tier 2, medium = 15 at tier 5, hard = 20 at tier 8
--
-- Because the 0019 backfill placed every existing question at tier 2, 5 or 8,
-- no question already in the database changes value. This migration only
-- decides what the six tiers that had no price are worth. Balance is unchanged
-- today and becomes meaningful as authored content fills the gaps.
--
-- The multiplier and the double-points lifeline still apply on top, unchanged.

create or replace function public.submit_quiz_answer(
  p_question_id uuid,
  p_choice_index integer,
  p_used_hint boolean default false,
  p_response_time_ms integer default null,
  p_double_points boolean default false,
  p_lifeline_used text default null
)
returns table (
  o_correct boolean,
  o_correct_index integer,
  o_explanation text,
  o_citation text,
  o_xp_earned integer,
  o_streak_multiplier integer
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_user_id uuid := auth.uid();
  v_question record;
  v_streak int := 0;
  v_correct boolean;
  v_multiplier int;
  v_base_xp int;
  v_xp int;
  v_profile record;
  v_choices_len int;
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

  v_choices_len := jsonb_array_length(v_question.choices);
  if p_choice_index >= v_choices_len then raise exception 'Invalid answer.'; end if;

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

  -- Linear in tier, pinned to the old easy/medium/hard values at tiers 2/5/8.
  if not v_correct then
    v_base_xp := 0;
  else
    v_base_xp := round((20 + 5 * least(greatest(coalesce(v_question.tier, 1), 1), 9)) / 3.0);
  end if;

  v_xp := v_base_xp * v_multiplier * (case when p_double_points then 2 else 1 end);

  select p.coins, p.total_xp, p.high_score
    into v_profile
    from public.profiles p
   where p.id = v_user_id;

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
$$;

revoke execute on function public.submit_quiz_answer(uuid, integer, boolean, integer, boolean, text) from public, anon;
grant  execute on function public.submit_quiz_answer(uuid, integer, boolean, integer, boolean, text) to authenticated;
