-- Migration 0010: Rebuild the streak and the review schedule from attempts.
--
-- Both are derived state. `profiles.streak_count` / `longest_streak` /
-- `last_activity_date` and every row of `user_question_schedule` are produced by
-- triggers on `attempts` (migration 0009), which means they can always be
-- reconstructed from it — and should be reconstructible, because a trigger that
-- is the only writer is also a single point of failure. If one is ever dropped,
-- disabled during a bulk load, or added after the fact, these routines put the
-- derived state back.
--
-- That last case is the immediate one. The triggers only fire on new rows, so
-- any answering history that predates them is invisible to both. Running these
-- credits it.
--
-- IT ALSO CAPS THE REVIEW INTERVAL
-- Testing the rebuild surfaced a flaw in the scheduler shipped in 0009: SM-2
-- compounds without limit, so a question answered correctly nine times in a row
-- reached an interval of 3,559 days — due in 2036. That is arithmetically
-- correct and practically wrong. Someone who knows a point of Quranic knowledge
-- well should still meet it again within a year, both because recall does decay
-- over that horizon and because a question that disappears for a decade is
-- effectively removed from the app. `schedule_question_review` is replaced below
-- with a capped version, and the rebuild applies the same ceiling.
--
-- WHAT THEY DELIBERATELY DO NOT DO
-- The streak rebuild does not apply streak freezes retroactively. A freeze is
-- something a player owned and spent at a moment in time; handing them out
-- backwards would invent a streak that was never actually kept. Gaps in history
-- break the streak, exactly as they would have live.

-- ---------------------------------------------------------------------------
-- 0. Cap the review interval
-- ---------------------------------------------------------------------------
-- Identical to the 0009 version except for the ceiling. Kept as a full
-- replacement rather than an ALTER because a scheduler is easier to review whole
-- than as a diff against a function you have to go and find.

create or replace function public.schedule_question_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ease numeric(4,2);
  v_interval int;
  v_reps int;
  v_lapses int;
  -- A year. Long enough that a well-known question stops crowding the queue,
  -- short enough that it never silently leaves the app.
  c_max_interval constant int := 365;
begin
  select s.ease, s.interval_days, s.reps, s.lapses
    into v_ease, v_interval, v_reps, v_lapses
  from public.user_question_schedule s
  where s.user_id = new.user_id and s.question_id = new.question_id;

  if not found then
    v_ease := 2.50; v_interval := 0; v_reps := 0; v_lapses := 0;
  end if;

  if new.is_correct then
    v_reps := v_reps + 1;
    v_interval := case
                    when v_reps = 1 then 1
                    when v_reps = 2 then 3
                    else greatest(1, round(v_interval * v_ease))::int
                  end;
    v_interval := least(v_interval, c_max_interval);
    if not coalesce(new.used_ask_the_imam_hint, false) then
      v_ease := least(2.80, v_ease + 0.06);
    end if;
  else
    v_reps := 0;
    v_lapses := v_lapses + 1;
    v_interval := 1;
    v_ease := greatest(1.30, v_ease - 0.20);
  end if;

  insert into public.user_question_schedule
    (user_id, question_id, ease, interval_days, due_on, reps, lapses, last_reviewed_at)
  values
    (new.user_id, new.question_id, v_ease, v_interval,
     current_date + v_interval, v_reps, v_lapses, now())
  on conflict (user_id, question_id) do update
    set ease = excluded.ease,
        interval_days = excluded.interval_days,
        due_on = excluded.due_on,
        reps = excluded.reps,
        lapses = excluded.lapses,
        last_reviewed_at = excluded.last_reviewed_at;

  return new;
end;
$$;

comment on function public.schedule_question_review() is
  'SM-2 scheduler, capped at a 365 day interval. Correct answers push the next review out by interval * ease; a miss resets to one day and lowers ease. Runs on every attempt, so the schedule cannot drift from what was actually answered.';

-- Pull any already-scheduled row back under the new ceiling.
update public.user_question_schedule
   set interval_days = 365,
       due_on = least(due_on, last_reviewed_at::date + 365)
 where interval_days > 365;

-- ---------------------------------------------------------------------------
-- 1. Streaks
-- ---------------------------------------------------------------------------
-- Classic gaps-and-islands: number each player's distinct active days, subtract
-- the row number from the date, and consecutive days collapse to a constant.
-- Each constant is one unbroken run.
--
-- `streak_count` is the run ending on the player's most recent active day — the
-- streak as it stood when they last played. The trigger then either continues it
-- or resets it on their next attempt, which is the same thing it would have done
-- had it been there all along.

create or replace function public.rebuild_streaks_from_attempts()
returns table (profiles_updated int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_role text;
  v_count int;
begin
  -- Maintenance routine: admins only. Left callable from the app rather than
  -- SQL-editor-only so it can be wired to an admin screen later.
  if v_caller is not null then
    select p.role::text into v_role from public.profiles p where p.id = v_caller;
    if v_role is distinct from 'admin' then
      raise exception 'Only an admin can rebuild streaks.';
    end if;
  end if;

  with active_days as (
    select distinct a.user_id, a.created_at::date as day
    from public.attempts a
  ),
  islands as (
    select
      user_id,
      day,
      day - (row_number() over (partition by user_id order by day))::int as island
    from active_days
  ),
  runs as (
    select user_id, island, count(*)::int as run_length, max(day) as run_ended
    from islands
    group by user_id, island
  ),
  per_user as (
    select
      r.user_id,
      max(r.run_length) as longest,
      max(r.run_ended) as last_active,
      -- The run that ends on the most recent active day is the current one.
      max(r.run_length) filter (
        where r.run_ended = (select max(r2.run_ended) from runs r2 where r2.user_id = r.user_id)
      ) as current_run
    from runs r
    group by r.user_id
  )
  update public.profiles p
     set streak_count = per_user.current_run,
         -- Never lower a longest_streak that is already higher: it may record a
         -- run from before this history, and losing it would be a regression.
         longest_streak = greatest(coalesce(p.longest_streak, 0), per_user.longest),
         last_activity_date = per_user.last_active
  from per_user
  where p.id = per_user.user_id;

  get diagnostics v_count = row_count;
  return query select v_count;
end;
$$;

comment on function public.rebuild_streaks_from_attempts() is
  'Recomputes streak_count, longest_streak and last_activity_date for every player from their answering history. Safe to run repeatedly. Does not apply streak freezes retroactively.';

revoke all on function public.rebuild_streaks_from_attempts() from public;
grant execute on function public.rebuild_streaks_from_attempts() to authenticated;

-- ---------------------------------------------------------------------------
-- 2. The review schedule
-- ---------------------------------------------------------------------------
-- Replays every attempt in order through the same SM-2 state machine the
-- trigger runs, so a rebuilt schedule is identical to one that was maintained
-- live. The one difference is intentional: `due_on` is computed from the date of
-- the attempt rather than today, so a question answered a month ago with a
-- one-day interval comes back overdue instead of being quietly deferred.
--
-- The SM-2 constants below are duplicated from schedule_question_review(). That
-- duplication is a real cost — change one and the other must change with it —
-- and is accepted because the alternative is a shared helper that both a trigger
-- and a batch loop can call, which is more machinery than two matching CASE
-- expressions are worth. If a third caller ever appears, extract it. The 365 day
-- ceiling is part of what must stay in step.

create or replace function public.rebuild_review_schedule_from_attempts()
returns table (rows_written int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_role text;
  v_attempt record;
  v_ease numeric(4,2);
  v_interval int;
  v_reps int;
  v_lapses int;
  v_key_user uuid;
  v_key_question uuid;
  v_count int := 0;
begin
  if v_caller is not null then
    select p.role::text into v_role from public.profiles p where p.id = v_caller;
    if v_role is distinct from 'admin' then
      raise exception 'Only an admin can rebuild the review schedule.';
    end if;
  end if;

  -- Rebuilt wholesale rather than patched: a partial schedule is harder to
  -- reason about than an empty one, and the replay below reproduces every row.
  delete from public.user_question_schedule;

  for v_attempt in
    select a.user_id, a.question_id, a.is_correct,
           coalesce(a.used_ask_the_imam_hint, false) as used_hint,
           a.created_at
    from public.attempts a
    order by a.user_id, a.question_id, a.created_at
  loop
    -- New (user, question) pair: start a fresh SM-2 state.
    if v_key_user is distinct from v_attempt.user_id
       or v_key_question is distinct from v_attempt.question_id then
      v_key_user := v_attempt.user_id;
      v_key_question := v_attempt.question_id;
      v_ease := 2.50; v_interval := 0; v_reps := 0; v_lapses := 0;
    end if;

    if v_attempt.is_correct then
      v_reps := v_reps + 1;
      v_interval := case
                      when v_reps = 1 then 1
                      when v_reps = 2 then 3
                      else greatest(1, round(v_interval * v_ease))::int
                    end;
      -- Same ceiling as the trigger. These two must move together.
      v_interval := least(v_interval, 365);
      if not v_attempt.used_hint then
        v_ease := least(2.80, v_ease + 0.06);
      end if;
    else
      v_reps := 0;
      v_lapses := v_lapses + 1;
      v_interval := 1;
      v_ease := greatest(1.30, v_ease - 0.20);
    end if;

    insert into public.user_question_schedule
      (user_id, question_id, ease, interval_days, due_on, reps, lapses, last_reviewed_at)
    values
      (v_attempt.user_id, v_attempt.question_id, v_ease, v_interval,
       v_attempt.created_at::date + v_interval, v_reps, v_lapses, v_attempt.created_at)
    on conflict (user_id, question_id) do update
      set ease = excluded.ease,
          interval_days = excluded.interval_days,
          due_on = excluded.due_on,
          reps = excluded.reps,
          lapses = excluded.lapses,
          last_reviewed_at = excluded.last_reviewed_at;
  end loop;

  select count(*)::int into v_count from public.user_question_schedule;
  return query select v_count;
end;
$$;

comment on function public.rebuild_review_schedule_from_attempts() is
  'Replays every attempt through the SM-2 state machine to regenerate user_question_schedule. due_on is derived from each attempt date, so history that predates the trigger comes back correctly overdue rather than deferred. Safe to run repeatedly.';

revoke all on function public.rebuild_review_schedule_from_attempts() from public;
grant execute on function public.rebuild_review_schedule_from_attempts() to authenticated;

-- ---------------------------------------------------------------------------
-- Note
-- ---------------------------------------------------------------------------
-- At the time this migration was written `attempts` held zero rows, so running
-- either routine changes nothing. They exist for the moment there is history —
-- and so that neither piece of derived state is unrecoverable if its trigger is
-- ever lost.
