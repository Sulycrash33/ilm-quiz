-- A question pays once.
--
-- ── What happened ─────────────────────────────────────────────────────────
-- The owner reset their account, played the five daily questions, and then
-- pressed "Play again" on the summary screen. Three times, in **two minutes
-- and twenty-six seconds**, they went from 0 to 51% of the way to Talib:
--
--   attempts                15
--   distinct questions       5
--   XP from answers        207   (one honest pass is ~104)
--
-- `submit_quiz_answer` had **no duplicate check of any kind**. It looked the
-- question up, computed XP, inserted an attempt and added XP *and* coins to
-- the profile, every time it was called, for the same question, without limit.
-- The "Play again" button on `RunSummary` made that one tap, and the daily
-- challenge's five questions are the same five all day.
--
-- Nothing caught it because `attempts` was 0 until today: the function had
-- never been called twice for one question by anybody, so the hole had never
-- been stood in.
--
-- ── The rule ──────────────────────────────────────────────────────────────
-- **A question pays a player once.** Answer it again and the attempt is still
-- recorded -- practice and review must keep working, and the round review
-- still shows the explanation -- but it awards **0 XP and 0 coins**.
--
-- Three separate things had to change, because the leak was in three places
-- and fixing only the obvious one would have left it open:
--
-- 1. **The award itself.** A repeat answer earns nothing.
-- 2. **The combo multiplier**, which was computed from the last 20 attempts
--    of any kind. Replaying three questions you already know built a 3x
--    multiplier that then applied to the next *new* question -- so even with
--    the award fixed, a replay was still worth farming. The streak now counts
--    first answers only.
-- 3. **"Answer 5 questions today"**, the gate on the daily login reward, which
--    counted `count(*)` of today's attempts in two places. Answering one
--    question five times satisfied it. Both now count distinct questions,
--    which is what the sentence has always meant.
--
-- `complete_daily_challenge_rpc` needed nothing: it already counted
-- `count(distinct a.question_id)`, which is exactly this rule, written by
-- somebody who thought about it in the one place it had been thought about.
--
-- ── What this deliberately does NOT do ────────────────────────────────────
-- It does not stop you replaying. Replaying a level to learn it is the point
-- of a study app, and the spaced-review queue re-serves questions on purpose.
-- What it stops is replaying *paying*. A review answer is worth 0 XP, and if
-- that turns out to be the wrong call for review specifically, the place to
-- change it is here, once, and not by weakening the rule.
--
-- ── Written the safe way ──────────────────────────────────────────────────
-- The three functions are patched **from their own stored source** with
-- `pg_get_functiondef` and `replace()`, not retyped -- the convention this
-- repository adopted after 0035. Every substitution asserts that it actually
-- changed the text, so a whitespace drift fails loudly here instead of
-- silently shipping an unpatched function.

-- The flag. A repeat is not a first answer, and the streak scan needs to be
-- able to tell them apart cheaply rather than re-deriving it per row.
alter table public.attempts
  add column if not exists is_first_answer boolean not null default true;

comment on column public.attempts.is_first_answer is
  'True when this was the player''s first attempt at this question. Only first answers earn XP and coins, and only they build the combo multiplier. See migration 0059.';

-- Backfill: the earliest attempt at each (user, question) is the first one.
update public.attempts a
   set is_first_answer = (
     a.created_at = (
       select min(a2.created_at)
         from public.attempts a2
        where a2.user_id = a.user_id
          and a2.question_id = a.question_id
     )
   );

do $$
declare
  v_src text;
  v_new text;
begin
  ------------------------------------------------------------------ 1. award
  select pg_get_functiondef(p.oid) into v_src
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'submit_quiz_answer';

  if v_src is null then raise exception 'submit_quiz_answer not found'; end if;

  -- a) a variable to hold it
  v_new := replace(v_src,
    E'  rec record;\nbegin',
    E'  rec record;\n  v_first boolean;\nbegin');
  if v_new = v_src then raise exception 'patch a (declare v_first) matched nothing'; end if;
  v_src := v_new;

  -- b) the combo counts first answers only
  v_new := replace(v_src,
    E'      from public.attempts a\n     where a.user_id = v_user_id\n     order by a.created_at desc',
    E'      from public.attempts a\n     where a.user_id = v_user_id\n       and a.is_first_answer\n     order by a.created_at desc');
  if v_new = v_src then raise exception 'patch b (streak counts first answers) matched nothing'; end if;
  v_src := v_new;

  -- c) a repeat earns nothing, and is recorded as a repeat
  v_new := replace(v_src,
    E'  insert into public.attempts (\n    user_id, question_id, is_correct, xp_earned, response_time_ms, used_ask_the_imam_hint\n  )\n  values (\n    v_user_id, v_question.id, v_correct, v_xp, p_response_time_ms, v_used_hint\n  );',
    E'  -- A question pays once. Answering it again is recorded -- practice,\n'
    || E'  -- review and the round summary all depend on the attempt existing -- but\n'
    || E'  -- it earns nothing. Checked before the insert, so it does not see the row\n'
    || E'  -- it is about to write.\n'
    || E'  select not exists (\n'
    || E'    select 1 from public.attempts a\n'
    || E'     where a.user_id = v_user_id\n'
    || E'       and a.question_id = p_question_id\n'
    || E'  ) into v_first;\n'
    || E'\n'
    || E'  if not v_first then\n'
    || E'    v_xp := 0;\n'
    || E'    v_multiplier := 1;\n'
    || E'  end if;\n'
    || E'\n'
    || E'  insert into public.attempts (\n    user_id, question_id, is_correct, xp_earned, response_time_ms, used_ask_the_imam_hint, is_first_answer\n  )\n  values (\n    v_user_id, v_question.id, v_correct, v_xp, p_response_time_ms, v_used_hint, v_first\n  );');
  if v_new = v_src then raise exception 'patch c (pay once) matched nothing'; end if;

  execute v_new;

  --------------------------------------------------------- 2. the daily gate
  select pg_get_functiondef(p.oid) into v_src
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'daily_task_progress';

  if v_src is null then raise exception 'daily_task_progress not found'; end if;

  v_new := replace(v_src,
    '(select count(*)::int from public.attempts a',
    '(select count(distinct a.question_id)::int from public.attempts a');
  if v_new = v_src then raise exception 'patch d (daily_task_progress distinct) matched nothing'; end if;

  execute v_new;

  ------------------------------------------------- 3. the same gate, enforced
  select pg_get_functiondef(p.oid) into v_src
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'claim_daily_login_rpc';

  if v_src is null then raise exception 'claim_daily_login_rpc not found'; end if;

  v_new := replace(v_src,
    E'  select count(*) into v_answered\n    from public.attempts a',
    E'  select count(distinct a.question_id) into v_answered\n    from public.attempts a');
  if v_new = v_src then raise exception 'patch e (login gate distinct) matched nothing'; end if;

  execute v_new;
end $$;

-- Proof, on the live definitions rather than on intent.
do $$
declare
  v_src text;
begin
  select pg_get_functiondef(p.oid) into v_src
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'submit_quiz_answer';
  if position('into v_first' in v_src) = 0 then
    raise exception 'submit_quiz_answer does not check for a previous answer';
  end if;
  if position('and a.is_first_answer' in v_src) = 0 then
    raise exception 'the combo multiplier still counts repeats';
  end if;

  select pg_get_functiondef(p.oid) into v_src
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'daily_task_progress';
  if position('count(distinct a.question_id)' in v_src) = 0 then
    raise exception 'daily_task_progress still counts repeats';
  end if;

  select pg_get_functiondef(p.oid) into v_src
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'claim_daily_login_rpc';
  if position('count(distinct a.question_id)' in v_src) = 0 then
    raise exception 'the login gate still counts repeats';
  end if;
end $$;
