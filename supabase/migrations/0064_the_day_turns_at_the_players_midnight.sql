-- 0064 — The day turns at the player's midnight.
--
-- ── The report ────────────────────────────────────────────────────────────
-- The owner finished the daily challenge at about 12:17 in Lagos and the card
-- said **"Next challenge in 12h 42m 56s"**. Their objection: *"inside you see
-- that the count down is for 12 hours which is supposed to be for 24 hours."*
--
-- The 12h was arithmetically correct and still wrong. The challenge is keyed
-- on `current_date`, this database runs in **UTC**, and 12:17 in Lagos is
-- 11:17 UTC — so the next challenge really was 12h43m away. But the promise
-- the screen was keeping was *"come back tomorrow"*, and for that player
-- "tomorrow" began at **01:00 their time**, an hour they never asked for and
-- would never have guessed.
--
-- Two rules were on the table and they cannot both hold:
--
--   * a fixed midnight — the countdown is 0–24h depending on when you play,
--     and it is only ever exactly 24h at the instant the day flips;
--   * a rolling 24 hours from completion — always 24h, but the reset drifts
--     later every day, so finishing at 8pm Monday locks you out until 8pm
--     Tuesday, and "the same five questions for everyone today" breaks the
--     moment one player's cooldown straddles the calendar.
--
-- The owner chose the midnight, moved to **the player's own timezone**. So a
-- Lagos player's day now turns at 00:00 in Lagos and a Kuala Lumpur player's
-- at 00:00 there. "Come back tomorrow" is now literally true, and the
-- countdown is honest at every hour without naming one.
--
-- ── What this means for "the same five for everyone" ──────────────────────
-- It narrows, and it is worth writing down rather than discovering later. Two
-- players in the same timezone still get the same five questions on the same
-- day, which is what the promise is for. Two players eight zones apart are on
-- different `challenge_date` rows for part of each real day. That is inherent
-- to a local midnight; there is no version of this change that avoids it.
--
-- ── Where the timezone comes from, and why not from the request ───────────
-- **The client does not get to say what day it is.** It says what *zone* it is
-- in, once, through `set_my_timezone_rpc`, and the zone is stored on the
-- profile; every date is then derived server-side from that stored value. If
-- the day came from the request, a player could send a different date on every
-- call and mint a fresh daily each time — the same shape as the replay bug
-- migration 0059 closed, and this project does not need to learn it twice.
--
-- `authenticated` is deliberately **not** granted UPDATE on the new column
-- (the grants on `profiles` are column-scoped — checked, not assumed), so the
-- rate-limited RPC is the only way in.
--
-- ── What a zone change can and cannot buy ────────────────────────────────
-- Worth measuring rather than guessing, because the first guess was wrong.
-- Moving a zone east advances the local date, which does reach a day's rewards
-- sooner. Run against the owner's own account, rolled back:
--
--   Africa/Lagos      local 2026-09-09  login: already claimed   challenge: already completed
--   Pacific/Kiritimati local 2026-09-10  login: PAID 20 coins     challenge: a new day's row
--
-- So a jump east does pay. What it **cannot** do is pay twice for one day, and
-- that is the property that matters. Every one of these four things is keyed on
-- a calendar date — `user_login_claims.claim_date`, `daily_challenges.
-- challenge_date` unique per date with completions unique per (user, challenge),
-- and the task and streak derived per date. A date pays once. A zone change
-- moves you to a *different* date; it does not make a date pay again.
--
-- And dates only move forward in real time. Jumping east from +14 is not
-- possible, and jumping back west *retards* the local date onto days already
-- claimed, which pays nothing. So the ceiling is: **a player can run at most
-- one calendar day ahead of themselves, and never collect a day twice.** They
-- reach tomorrow's reward early; they do not get an extra one.
--
-- On top of that ceiling, `set_my_timezone_rpc` rate limits changes to one per
-- 20 hours (verified: a same-day second jump comes back
-- `timezone_change_rate_limited`), and `authenticated` has no UPDATE grant on
-- the column, so the RPC is the only door.
--
-- That is a small enough hole to leave open on purpose. Closing it entirely
-- means deferring a zone change to the next local midnight, which would leave
-- every new player on UTC for their first day — a worse bug for everyone than
-- this is for the few who would go looking.
--
-- ── What is NOT moved to local time ───────────────────────────────────────
-- `daily_hadith` (one hadith a day, cosmetic), `spin_wheel_rpc` (already a
-- rolling 24h from `last_spin_at`, so it has no midnight to move) and the
-- league week. Only the things the countdown actually governs move: the
-- challenge, the login reward, the day's task, and the study streak — because
-- the streak sits directly above the countdown on the same card, and a streak
-- that rolls over at a different hour than the reward beside it is the kind of
-- split this project keeps paying to remove.
--
-- No explicit `begin`/`commit` here, matching 0060-0063: the migration
-- runner wraps each file in its own transaction, so the assertions below
-- still roll the whole thing back on a miss.

-- ── 1. Where the player's day begins ─────────────────────────────────────
alter table public.profiles
  add column if not exists timezone text not null default 'UTC';

-- When the zone was last *changed*. Null on a profile that has never set one,
-- which is what makes the first set free and every later one rate limited.
alter table public.profiles
  add column if not exists timezone_set_at timestamptz;

comment on column public.profiles.timezone is
  'IANA zone name deciding when this player''s day turns. Written only by set_my_timezone_rpc; authenticated has no UPDATE grant on it.';

-- ── 2. Reading it safely ─────────────────────────────────────────────────
create or replace function public.is_valid_timezone(p_tz text)
returns boolean
language sql
stable
set search_path to 'public'
as $fn$
  select p_tz is not null
     and exists (select 1 from pg_timezone_names z where z.name = p_tz)
$fn$;

-- The zone, or UTC. Never raises: a stored value that Postgres cannot resolve
-- falls back rather than taking down every screen that needs to know the date.
-- The probe is a cast attempt rather than a `pg_timezone_names` lookup because
-- this is called several times per request and that view is a ~1,200 row scan.
create or replace function public.user_timezone(p_user uuid)
returns text
language plpgsql
stable
security definer
set search_path to 'public'
as $fn$
declare
  v_tz text;
  v_probe timestamp;
begin
  if p_user is null then
    return 'UTC';
  end if;

  select nullif(btrim(p.timezone), '') into v_tz
    from public.profiles p where p.id = p_user;

  if v_tz is null then
    return 'UTC';
  end if;

  begin
    v_probe := now() at time zone v_tz;
  exception when others then
    return 'UTC';
  end;

  return v_tz;
end;
$fn$;

-- Today, where the player is standing.
create or replace function public.user_local_date(p_user uuid default auth.uid())
returns date
language sql
stable
security definer
set search_path to 'public'
as $fn$
  select (now() at time zone public.user_timezone(p_user))::date
$fn$;

-- The instant their day began, as a real timestamptz. Attempt windows are
-- built from this rather than by casting a local date, because casting a date
-- to timestamptz uses the *session* zone (UTC) and would silently rebuild the
-- UTC day this migration exists to replace.
create or replace function public.user_local_day_start(p_user uuid default auth.uid())
returns timestamptz
language sql
stable
security definer
set search_path to 'public'
as $fn$
  select ((now() at time zone public.user_timezone(p_user))::date)::timestamp
           at time zone public.user_timezone(p_user)
$fn$;

-- The instant their next day begins — the number the countdown counts to.
-- Computed as (local date + 1) rather than (day start + 24h) so it stays
-- correct across a daylight-saving boundary, where those two differ by an hour.
create or replace function public.user_next_local_midnight(p_user uuid default auth.uid())
returns timestamptz
language sql
stable
security definer
set search_path to 'public'
as $fn$
  select (((now() at time zone public.user_timezone(p_user))::date + 1)::timestamp)
           at time zone public.user_timezone(p_user)
$fn$;

-- One round trip for everything a page needs to know about the player's day.
create or replace function public.my_day_bounds()
returns table(o_local_date date, o_day_start timestamptz, o_next_midnight timestamptz)
language sql
stable
security definer
set search_path to 'public'
as $fn$
  select public.user_local_date(auth.uid()),
         public.user_local_day_start(auth.uid()),
         public.user_next_local_midnight(auth.uid())
$fn$;

-- ── 3. Setting it ────────────────────────────────────────────────────────
create or replace function public.set_my_timezone_rpc(p_timezone text)
returns table(o_success boolean, o_timezone text, o_error text)
language plpgsql
security definer
set search_path to 'public'
as $fn$
declare
  v_user uuid := auth.uid();
  v_current text;
  v_set_at timestamptz;
begin
  if v_user is null then
    return query select false, null::text, 'You must be signed in.'::text;
    return;
  end if;

  if not public.is_valid_timezone(p_timezone) then
    return query select false, null::text, 'unknown_timezone'::text;
    return;
  end if;

  select nullif(btrim(p.timezone), ''), p.timezone_set_at
    into v_current, v_set_at
    from public.profiles p where p.id = v_user;

  -- Already there. Succeeds without spending the rate limit, so the client is
  -- free to call this on every load — which is how a profile ever learns the
  -- zone in the first place.
  if v_current is not distinct from p_timezone then
    return query select true, p_timezone, null::text;
    return;
  end if;

  -- The first zone a profile is given is free. Twenty hours rather than
  -- twenty-four for later ones, so someone who genuinely travels and opens the
  -- app at roughly the same time each day is not refused by a few minutes.
  if v_set_at is not null and v_set_at > now() - interval '20 hours' then
    return query select false, v_current, 'timezone_change_rate_limited'::text;
    return;
  end if;

  update public.profiles p
     set timezone = p_timezone,
         timezone_set_at = now()
   where p.id = v_user;

  return query select true, p_timezone, null::text;
end;
$fn$;

grant execute on function public.user_local_date(uuid) to authenticated, anon;
grant execute on function public.user_local_day_start(uuid) to authenticated, anon;
grant execute on function public.user_next_local_midnight(uuid) to authenticated, anon;
grant execute on function public.my_day_bounds() to authenticated, anon;
grant execute on function public.set_my_timezone_rpc(text) to authenticated;

-- ── 4. Moving the four functions that decide what day it is ──────────────
--
-- Patched from their own stored source rather than retyped, the convention
-- this repository adopted after 0035: `pg_get_functiondef` + `replace` + an
-- assertion per substitution. If any pattern stops matching — because someone
-- edited the function since — the migration raises and the whole transaction
-- rolls back, rather than half-applying and leaving two notions of "today".
do $mig$
declare
  v_src text;
  v_new text;
begin
  -- ── ensure_daily_challenge: which day gets materialised ────────────────
  -- Its default was `CURRENT_DATE`, so a call with no arguments built the UTC
  -- day. It now builds the caller's day. Under `cron_ensure_daily_challenge`
  -- there is no caller, `auth.uid()` is null, and it falls back to UTC — which
  -- is the right thing for a pre-materialising cron.
  select pg_get_functiondef(p.oid) into v_src
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'ensure_daily_challenge';

  v_new := replace(v_src,
    'p_date date DEFAULT CURRENT_DATE',
    'p_date date DEFAULT public.user_local_date()');
  if v_new = v_src then
    raise exception '0064/ensure_daily_challenge: default CURRENT_DATE not found';
  end if;
  v_src := v_new;

  -- Belt as well as braces: PostgREST omits an unsupplied argument today, but
  -- an explicit null would skip the default entirely and match no row.
  v_new := replace(v_src,
    E'begin\n  select dc.id as cid',
    E'begin\n  p_date := coalesce(p_date, public.user_local_date());\n\n  select dc.id as cid');
  if v_new = v_src then
    raise exception '0064/ensure_daily_challenge: begin block not found';
  end if;
  execute v_new;

  -- ── complete_daily_challenge_rpc: which day pays ───────────────────────
  select pg_get_functiondef(p.oid) into v_src
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'complete_daily_challenge_rpc';

  v_new := replace(v_src,
    'where dc.challenge_date = current_date;',
    'where dc.challenge_date = public.user_local_date(v_user_id);');
  if v_new = v_src then
    raise exception '0064/complete_daily_challenge_rpc: challenge_date lookup not found';
  end if;
  v_src := v_new;

  -- `a.created_at::date = current_date` cast the timestamp to a date in the
  -- *session* zone, which is UTC. A half-open window between two real instants
  -- has no zone to get wrong.
  v_new := replace(v_src,
    E'    and a.created_at::date = current_date;',
    E'    and a.created_at >= public.user_local_day_start(v_user_id)\n    and a.created_at <  public.user_next_local_midnight(v_user_id);');
  if v_new = v_src then
    raise exception '0064/complete_daily_challenge_rpc: attempt window not found';
  end if;
  execute v_new;

  -- ── daily_task_progress: how far through the day's questions ───────────
  select pg_get_functiondef(p.oid) into v_src
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'daily_task_progress';

  v_new := replace(v_src,
    E'  v_today date := current_date;',
    E'  v_day_start timestamptz := public.user_local_day_start(v_user_id);\n  v_day_end   timestamptz := public.user_next_local_midnight(v_user_id);');
  if v_new = v_src then
    raise exception '0064/daily_task_progress: v_today declaration not found';
  end if;
  v_src := v_new;

  v_new := replace(v_src,
    E'               and a.created_at >= v_today::timestamptz\n               and a.created_at <  (v_today + 1)::timestamptz);',
    E'               and a.created_at >= v_day_start\n               and a.created_at <  v_day_end);');
  if v_new = v_src then
    raise exception '0064/daily_task_progress: attempt window not found';
  end if;
  execute v_new;

  -- ── claim_daily_login_rpc: which day the Day 1-7 ladder advances on ────
  select pg_get_functiondef(p.oid) into v_src
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'claim_daily_login_rpc';

  v_new := replace(v_src,
    E'  v_today date := current_date;\n  v_yesterday date := current_date - 1;',
    E'  v_today date := public.user_local_date(v_user_id);\n  v_yesterday date := public.user_local_date(v_user_id) - 1;\n  v_day_start timestamptz := public.user_local_day_start(v_user_id);\n  v_day_end   timestamptz := public.user_next_local_midnight(v_user_id);');
  if v_new = v_src then
    raise exception '0064/claim_daily_login_rpc: date declarations not found';
  end if;
  v_src := v_new;

  v_new := replace(v_src,
    E'     and a.created_at >= v_today::timestamptz\n     and a.created_at <  (v_today + 1)::timestamptz;',
    E'     and a.created_at >= v_day_start\n     and a.created_at <  v_day_end;');
  if v_new = v_src then
    raise exception '0064/claim_daily_login_rpc: attempt window not found';
  end if;
  execute v_new;

  -- ── touch_streak_on_attempt: which day the streak counts ───────────────
  -- Three occurrences, all of them the same question: what day is it for the
  -- player this attempt belongs to. `new.user_id` rather than `auth.uid()`
  -- because this runs as a trigger and the row is the authority on whose
  -- attempt it is.
  select pg_get_functiondef(p.oid) into v_src
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'touch_streak_on_attempt';

  -- Declared once and reused, rather than substituted in place three times:
  -- this runs on **every** attempt insert, and three `current_date` reads
  -- becoming three profile lookups per answered question is a cost the busiest
  -- write path in the app should not pay for a value that cannot change
  -- mid-statement.
  v_new := replace(v_src,
    E'declare\n  v_last date;',
    E'declare\n  v_today date := public.user_local_date(new.user_id);\n  v_last date;');
  if v_new = v_src then
    raise exception '0064/touch_streak_on_attempt: declare block not found';
  end if;
  v_src := v_new;

  v_new := replace(v_src, 'current_date', 'v_today');
  if v_new = v_src then
    raise exception '0064/touch_streak_on_attempt: current_date not found';
  end if;
  if position('current_date' in v_new) > 0 then
    raise exception '0064/touch_streak_on_attempt: current_date still present after patch';
  end if;
  execute v_new;
end;
$mig$;

-- ── 5. Checks that fail the migration rather than the player ─────────────
do $mig$
declare
  v_def text;
  v_name text;
begin
  -- Not one of the moved functions may still ask Postgres what day it is.
  foreach v_name in array array[
    'complete_daily_challenge_rpc',
    'daily_task_progress',
    'claim_daily_login_rpc',
    'touch_streak_on_attempt'
  ] loop
    select pg_get_functiondef(p.oid) into v_def
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = v_name;

    if v_def is null then
      raise exception '0064: % is missing after the patch', v_name;
    end if;
    if position('current_date' in v_def) > 0 then
      raise exception '0064: % still reads current_date', v_name;
    end if;
    if position('user_local_date' in v_def) = 0
       and position('user_local_day_start' in v_def) = 0 then
      raise exception '0064: % does not use the player''s day at all', v_name;
    end if;
  end loop;

  -- The zone must not be writable straight from the client, or the rate limit
  -- in `set_my_timezone_rpc` is decoration.
  if has_column_privilege('authenticated', 'public.profiles', 'timezone', 'UPDATE') then
    raise exception '0064: authenticated can UPDATE profiles.timezone directly';
  end if;

  -- And the whole point: two zones fourteen hours apart must not agree on the
  -- date at every instant of the day.
  -- Kiritimati is +14 and Niue is -11: twenty-five hours apart, so there is no
  -- instant at which they share a calendar date. If they ever do, the zone
  -- data underneath all of this is not what this migration assumes.
  if (now() at time zone 'Pacific/Kiritimati')::date
     = (now() at time zone 'Pacific/Niue')::date then
    raise exception '0064: timezone data looks wrong - +14 and -11 agree on the date';
  end if;
end;
$mig$;
