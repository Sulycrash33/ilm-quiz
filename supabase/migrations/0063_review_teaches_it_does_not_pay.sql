-- Review teaches. It does not pay, and it does not count.
--
-- **"The review that pops up shouldn't have any effect, it's just to help
-- players better. It shouldn't carry any point or coins."**
--
-- ── What was already true ─────────────────────────────────────────────────
-- A review session draws from `user_question_schedule`, which is built out of
-- questions the player has already answered. So since 0059 — a question pays
-- once — **every review answer already earned 0 XP and 0 coins.** That half of
-- the request was met before it was made.
--
-- ── What was not, and it is the larger half ───────────────────────────────
-- "No effect" is broader than the payout, and three things were still moving:
--
-- 1. **`award_achievements` counted every attempt.** `count(*)` for
--    `attempts_count`, `count(*) filter (where is_correct)` for
--    `correct_count`, and a per-category `count(*)` for `category_count` and
--    breadth. Re-answering one question ten times in review advanced all four.
-- 2. **`award_chests` counted the same way** (0060), so review pushed a player
--    toward the 250 / 1,000 / 5,000 correct-answer chests — the milestones
--    0061 had just been asked to make *harder*.
-- 3. **The daily task counted it.** `daily_task_progress` and
--    `claim_daily_login_rpc` count distinct questions answered today, and a
--    review answer is a question answered today, so five review answers
--    unlocked the login reward without a single new question studied.
--
-- Accuracy moved too: a re-answer changed the percentage the achievements read
-- and the home screen shows.
--
-- ── The rule ──────────────────────────────────────────────────────────────
-- **Progression counts first answers. The attempts table keeps everything.**
--
-- Every row still lands in `attempts` — the round summary, the SM-2 schedule
-- and the honest history all need it — but anything that *advances* the player
-- reads `is_first_answer`, the column 0059 added for exactly this distinction.
-- One flag, now meaning the same thing everywhere instead of only where the
-- XP is computed.
--
-- This is deliberately wider than "review". Any repeat is a repeat: replaying
-- a category level teaches, and it does not advance you either. That is the
-- same answer 0059 gave and the reason it is the same column.
--
-- ── Patched from stored source ────────────────────────────────────────────
-- The four functions are rewritten with `pg_get_functiondef` and `replace()`
-- rather than retyped, each substitution asserting that it changed the text,
-- so a whitespace drift fails here instead of silently shipping an unpatched
-- function. Same method as 0059, for the same reason.

do $$
declare
  v_src text;
  v_new text;
begin
  ------------------------------------------------------------ achievements
  select pg_get_functiondef(p.oid) into v_src
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'award_achievements';
  if v_src is null then raise exception 'award_achievements not found'; end if;

  -- the stats CTE: totals, correct count, accuracy and the lifeline flag
  v_new := replace(v_src,
    E'    from attempts a\n    where a.user_id = v_user\n  ),',
    E'    from attempts a\n    where a.user_id = v_user\n      and a.is_first_answer\n  ),');
  if v_new = v_src then raise exception 'patch a (achievements stats) matched nothing'; end if;
  v_src := v_new;

  -- the per-category CTE, which feeds both breadth and category_count
  v_new := replace(v_src,
    E'    where a.user_id = v_user\n    group by c.slug',
    E'    where a.user_id = v_user\n      and a.is_first_answer\n    group by c.slug');
  if v_new = v_src then raise exception 'patch b (achievements by_category) matched nothing'; end if;

  execute v_new;

  ------------------------------------------------------------------ chests
  select pg_get_functiondef(p.oid) into v_src
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'award_chests';
  if v_src is null then raise exception 'award_chests not found'; end if;

  v_new := replace(v_src,
    E'    from public.attempts a\n    where a.user_id = v_user\n  ),',
    E'    from public.attempts a\n    where a.user_id = v_user\n      and a.is_first_answer\n  ),');
  if v_new = v_src then raise exception 'patch c (chest stats) matched nothing'; end if;
  v_src := v_new;

  v_new := replace(v_src,
    E'    where a.user_id = v_user\n    group by c.slug',
    E'    where a.user_id = v_user\n      and a.is_first_answer\n    group by c.slug');
  if v_new = v_src then raise exception 'patch d (chest by_category) matched nothing'; end if;

  execute v_new;

  -------------------------------------------------------------- daily task
  select pg_get_functiondef(p.oid) into v_src
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'daily_task_progress';
  if v_src is null then raise exception 'daily_task_progress not found'; end if;

  v_new := replace(v_src,
    E'             where a.user_id = v_user_id\n',
    E'             where a.user_id = v_user_id\n               and a.is_first_answer\n');
  if v_new = v_src then raise exception 'patch e (daily_task_progress) matched nothing'; end if;

  execute v_new;

  ------------------------------------------------------- the same gate, enforced
  select pg_get_functiondef(p.oid) into v_src
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'claim_daily_login_rpc';
  if v_src is null then raise exception 'claim_daily_login_rpc not found'; end if;

  v_new := replace(v_src,
    E'   where a.user_id = v_user_id\n     and a.created_at >= v_today::timestamptz',
    E'   where a.user_id = v_user_id\n     and a.is_first_answer\n     and a.created_at >= v_today::timestamptz');
  if v_new = v_src then raise exception 'patch f (login gate) matched nothing'; end if;

  execute v_new;
end $$;

-- Proof, read off the live definitions rather than off intent.
do $$
declare
  v_src text;
  v_name text;
begin
  foreach v_name in array array['award_achievements','award_chests','daily_task_progress','claim_daily_login_rpc']
  loop
    select pg_get_functiondef(p.oid) into v_src
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = v_name;
    if position('is_first_answer' in v_src) = 0 then
      raise exception '% still advances the player on repeat answers', v_name;
    end if;
  end loop;
end $$;
