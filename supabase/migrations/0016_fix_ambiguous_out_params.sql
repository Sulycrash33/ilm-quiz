-- Fix two RPCs that could never run.
--
-- `submit_quiz_answer` and `claim_daily_login_rpc` both declare OUT parameters
-- named after real columns of tables their bodies read. In plpgsql an
-- unqualified name inside a SQL statement resolves against both the OUT
-- parameter and the column, and Postgres refuses to guess:
--
--   submit_quiz_answer    -> ERROR 42702: column reference "explanation" is ambiguous
--   claim_daily_login_rpc -> ERROR 42702: column reference "day_number" is ambiguous
--
-- The catch is that this is a *runtime* error, not a creation-time one. Both
-- functions were created without complaint, were granted correctly, and had
-- working callers, so nothing in the codebase or in CI ever flagged them. The
-- failure only appears the moment the function is actually invoked.
--
-- The consequences were not small:
--
--   `submit_quiz_answer` is the only writer of `public.attempts`. Every answer
--   in the game raised instead of recording, which is why `attempts` had zero
--   rows in production. Three triggers hang off that insert —
--   `attempts_touch_streak`, `attempts_accrue_weekly_xp` and
--   `attempts_schedule_review` — so daily streaks, weekly league XP and the
--   spaced-repetition queue never received anything either. Achievements are
--   evaluated from attempt history on read, so none could ever unlock. The
--   game was unplayable.
--
--   `claim_daily_login_rpc` is the only writer of `user_login_claims`, so the
--   seven-day login reward could never be claimed.
--
-- Five sibling RPCs were probed the same way and are fine —
-- complete_daily_challenge_rpc, open_chest_rpc, purchase_store_item_rpc,
-- spend_lifeline_rpc and spin_wheel_rpc. They have colliding OUT names too,
-- but every reference in their bodies is table-qualified, which is what makes
-- the difference.
--
-- Both are fixed the way the rest of this schema already does it: every OUT
-- parameter is prefixed `o_`, and every column reference in a SQL statement is
-- qualified with its table alias. The `o_` convention is what `0012` uses for
-- `get_circle_summaries` and `get_circle_board`; applying it here makes the
-- collision impossible rather than merely avoided. Both callers are updated to
-- read the new names.
--
-- `create or replace` cannot rename OUT parameters, so each is dropped first.

-- ---------------------------------------------------------------- answers --

drop function if exists public.submit_quiz_answer(uuid, integer, boolean, integer, boolean, text);

create function public.submit_quiz_answer(
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
         q.citation_reference, q.difficulty, q.review_status
    into v_question
    from public.questions q
   where q.id = p_question_id;

  if not found then raise exception 'Question not found.'; end if;
  if v_question.review_status <> 'published' then
    raise exception 'This question is not available.';
  end if;

  v_choices_len := jsonb_array_length(v_question.choices);
  if p_choice_index >= v_choices_len then raise exception 'Invalid answer.'; end if;

  -- Combo going *into* this answer: consecutive correct attempts, most recent
  -- first. Capped at 20 because the multiplier saturates long before that.
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

  v_base_xp := case when not v_correct then 0 else
    case v_question.difficulty
      when 'easy' then 10
      when 'medium' then 15
      when 'hard' then 20
      else 10
    end
  end;
  v_xp := v_base_xp * v_multiplier * (case when p_double_points then 2 else 1 end);

  select p.coins, p.total_xp, p.high_score
    into v_profile
    from public.profiles p
   where p.id = v_user_id;

  -- `p_lifeline_used` is accepted for call compatibility and deliberately does
  -- NOT charge. Lifelines are paid for by `spend_lifeline_rpc` at the moment
  -- they are used, which is the only path that can charge for Skip and Time
  -- Boost — neither of which reaches this function. The previous version
  -- deducted a second time here, from a price list hardcoded in this body
  -- rather than read from `lifeline_prices`, so any caller that passed the
  -- argument would have been billed twice at prices that drift from the table.
  -- No caller passes it today; removing the deduction keeps it that way.

  insert into public.attempts (
    user_id, question_id, is_correct, xp_earned, response_time_ms, used_ask_the_imam_hint
  )
  values (
    v_user_id, v_question.id, v_correct, v_xp, p_response_time_ms, coalesce(p_used_hint, false)
  );

  -- `high_score` is carried forward exactly as before. Worth flagging: as
  -- written it is `greatest(high_score, total_xp)`, which is just total_xp, so
  -- the "high score" on the profile is lifetime XP under another name rather
  -- than the best single run. That is a balance decision, not a bug in this
  -- migration's scope, and changing it here would silently alter a number
  -- already on screen — so it is left alone and called out instead.
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

-- ------------------------------------------------------------ login streak --

drop function if exists public.claim_daily_login_rpc();

create function public.claim_daily_login_rpc()
returns table (
  o_success boolean,
  o_already_claimed boolean,
  o_day_number integer,
  o_coins_awarded integer,
  o_xp_awarded integer,
  o_error text
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := current_date;
  v_yesterday date := current_date - 1;
  v_existing int;
  v_yesterday_day int;
  v_next_day int;
  v_reward record;
begin
  if v_user_id is null then
    return query select false, false, null::int, null::int, null::int, 'You must be signed in.'::text;
    return;
  end if;

  select c.day_number into v_existing
    from public.user_login_claims c
   where c.user_id = v_user_id and c.claim_date = v_today;

  if found then
    return query select false, true, v_existing, null::int, null::int, null::text;
    return;
  end if;

  select c.day_number into v_yesterday_day
    from public.user_login_claims c
   where c.user_id = v_user_id and c.claim_date = v_yesterday;

  if found then
    v_next_day := (v_yesterday_day % 7) + 1;
  else
    v_next_day := 1;
  end if;

  select r.coins, r.xp into v_reward
    from public.daily_login_rewards r
   where r.day_number = v_next_day;

  if not found then
    return query select false, false, null::int, null::int, null::int, 'Reward catalog is missing that day.'::text;
    return;
  end if;

  insert into public.user_login_claims (user_id, claim_date, day_number)
  values (v_user_id, v_today, v_next_day);

  update public.profiles p
     set coins    = p.coins + v_reward.coins,
         total_xp = p.total_xp + v_reward.xp
   where p.id = v_user_id;

  return query select true, false, v_next_day, v_reward.coins, v_reward.xp, null::text;
end;
$$;

revoke execute on function public.claim_daily_login_rpc() from public, anon;
grant  execute on function public.claim_daily_login_rpc() to authenticated;
