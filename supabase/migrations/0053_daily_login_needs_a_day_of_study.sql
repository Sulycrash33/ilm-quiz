-- ---------------------------------------------------------------------------
-- 0053 — The daily login reward stops paying for opening the app.
-- ---------------------------------------------------------------------------
--
-- `claim_daily_login_rpc` paid coins and XP for signing in. Nothing else was
-- asked. On an education app that is a reward for launching an icon, and it
-- competes with the thing the app exists to make attractive: answering a
-- question.
--
-- The wheel is the free one. It is meant to be a gift, it costs nothing, it
-- asks nothing, and 0008 already stripped the gamble out of it so it is a
-- reveal rather than a bet. Two unconditional gifts on one screen made the
-- daily claim indistinguishable from it. Now they say different things: the
-- wheel is a gift, the daily reward is earned.
--
-- ── The gate ──────────────────────────────────────────────────────────────
-- Answer `daily_task_questions()` questions today, then claim. Progress is
-- counted from `attempts`, so any question anywhere in the app counts — a
-- level run, the daily challenge, multiplayer. Making it a specific set would
-- have meant a player who answered forty questions in the wrong room being
-- told they had done nothing.
--
-- ── Why the number is a function ──────────────────────────────────────────
-- The owner asked for "five or four or three", which is a number that will be
-- tuned once real players exist and nobody has yet seen one play. Isolated in
-- `daily_task_questions()` so changing it is one line in one place and needs
-- no redeploy of anything, the same treatment `asset_code_segment()` gets in
-- the sister project for the same reason.
--
-- ── Enforced here, not on the screen ──────────────────────────────────────
-- The button is disabled in the UI, and that is decoration. A reward that a
-- client can ask for is a reward a client can help itself to, which is why
-- migration 0034 exists. The count is taken inside the function, from the
-- table, under the caller's own `auth.uid()`. There is no argument to forge.
--
-- ── The return grew, so the function is dropped first ─────────────────────
-- Adding a column to a `returns table` needs a `drop function`; Postgres will
-- not replace one with a different output shape. The two new columns let the
-- rewards screen show "3 of 5" from the same source that decides the claim,
-- rather than counting again in TypeScript and drifting.

create or replace function public.daily_task_questions()
returns integer
language sql
immutable
set search_path = public
as $$ select 5 $$;

comment on function public.daily_task_questions() is
  'Questions that must be answered today before the daily login reward can be claimed. One line to tune.';

revoke all on function public.daily_task_questions() from public, anon;
grant execute on function public.daily_task_questions() to authenticated, service_role;

drop function if exists public.claim_daily_login_rpc();

create function public.claim_daily_login_rpc()
returns table(
  o_success boolean,
  o_already_claimed boolean,
  o_day_number integer,
  o_coins_awarded integer,
  o_xp_awarded integer,
  o_task_required integer,
  o_task_answered integer,
  o_error text
)
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_user_id uuid := auth.uid();
  v_today date := current_date;
  v_yesterday date := current_date - 1;
  v_existing int;
  v_yesterday_day int;
  v_next_day int;
  v_reward record;
  v_required int := public.daily_task_questions();
  v_answered int;
begin
  if v_user_id is null then
    return query select false, false, null::int, null::int, null::int,
                        v_required, 0, 'You must be signed in.'::text;
    return;
  end if;

  -- Counted before anything else, because every branch below reports it: the
  -- screen shows this number whether the claim succeeds, is already spent, or
  -- is still locked.
  select count(*) into v_answered
    from public.attempts a
   where a.user_id = v_user_id
     and a.created_at >= v_today::timestamptz
     and a.created_at <  (v_today + 1)::timestamptz;

  select c.day_number into v_existing
    from public.user_login_claims c
   where c.user_id = v_user_id and c.claim_date = v_today;

  if found then
    return query select false, true, v_existing, null::int, null::int,
                        v_required, v_answered, null::text;
    return;
  end if;

  -- The gate. Deliberately *after* the already-claimed check: someone who
  -- claimed this morning and has not answered anything since should be told
  -- they already claimed, which is true and final, rather than told to go and
  -- study for a reward they cannot collect twice anyway.
  if v_answered < v_required then
    return query select false, false, null::int, null::int, null::int,
                        v_required, v_answered, 'daily_task_incomplete'::text;
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
    return query select false, false, null::int, null::int, null::int,
                        v_required, v_answered, 'Reward catalog is missing that day.'::text;
    return;
  end if;

  insert into public.user_login_claims (user_id, claim_date, day_number)
  values (v_user_id, v_today, v_next_day);

  update public.profiles p
     set coins    = p.coins + v_reward.coins,
         total_xp = p.total_xp + v_reward.xp
   where p.id = v_user_id;

  return query select true, false, v_next_day, v_reward.coins, v_reward.xp,
                      v_required, v_answered, null::text;
end;
$function$;

revoke all on function public.claim_daily_login_rpc() from public, anon;
grant execute on function public.claim_daily_login_rpc() to authenticated;

-- Progress for the screen, without asking it to claim to find out. Same count
-- and same threshold as the gate above, so the two cannot disagree.
create or replace function public.daily_task_progress()
returns table(o_required integer, o_answered integer)
language plpgsql
stable
security definer
set search_path = public
as $function$
declare
  v_user_id uuid := auth.uid();
  v_today date := current_date;
begin
  if v_user_id is null then
    return query select public.daily_task_questions(), 0;
    return;
  end if;
  return query
    select public.daily_task_questions(),
           (select count(*)::int from public.attempts a
             where a.user_id = v_user_id
               and a.created_at >= v_today::timestamptz
               and a.created_at <  (v_today + 1)::timestamptz);
end;
$function$;

revoke all on function public.daily_task_progress() from public, anon;
grant execute on function public.daily_task_progress() to authenticated;
