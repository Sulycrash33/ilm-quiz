-- Put the maintenance jobs on a clock.
--
-- Three functions were written, tested, and then never called by anything:
-- `cleanup_old_rooms`, `close_circle_weeks`, and `close_league_week` had zero
-- call sites in the app. So finished multiplayer rooms accumulated forever,
-- study-circle weeks were only ever closed if a member happened to open the
-- circle page, and no league week had ever been ranked at all — meaning
-- promotion and relegation, both fully implemented, could not happen.
--
-- The fix is a scheduler, not more call sites. Work that must happen whether
-- or not somebody opens a page does not belong behind a page load.

create extension if not exists pg_cron;

-- ── Wrappers ───────────────────────────────────────────────────────────────
-- pg_cron takes a single SQL command, so anything with a loop or a computed
-- argument needs a function to call. These also give each job a name that
-- says what it does when it shows up in `cron.job_run_details`.

/**
 * Closes every study circle's finished weeks.
 *
 * `close_circle_weeks` takes one circle at a time and was called from the
 * circle page, so a circle nobody visited never had its weeks recorded — and
 * its members' effort simply went unscored. Iterating here means the record
 * is complete regardless of who logs in.
 */
create or replace function public.cron_close_circle_weeks()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_circle uuid;
  v_total  int := 0;
begin
  for v_circle in select id from study_circles loop
    -- One circle's failure must not abandon the rest of them.
    begin
      v_total := v_total + coalesce(close_circle_weeks(v_circle), 0);
    exception when others then
      raise warning 'close_circle_weeks failed for circle %: %', v_circle, sqlerrm;
    end;
  end loop;
  return v_total;
end;
$$;

/**
 * Ranks the week that just ended.
 *
 * `close_league_week` refuses to rank a week still in progress, so it is
 * always handed the *previous* week. It only fills rows where
 * `rank_in_cohort is null`, which makes a re-run harmless.
 */
create or replace function public.cron_close_league_week()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows int;
begin
  select rows_closed into v_rows
  from close_league_week((date_trunc('week', current_date) - interval '7 days')::date);
  return coalesce(v_rows, 0);
end;
$$;

/**
 * Creates today's challenge before anyone asks for it.
 *
 * `ensure_daily_challenge` is already called lazily on page load, so this
 * changes nothing about correctness — it just means the first player of the
 * day doesn't pay for creating it, and the challenge exists at midnight
 * rather than whenever someone first opens the app.
 */
create or replace function public.cron_ensure_daily_challenge()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform ensure_daily_challenge(current_date);
end;
$$;

-- These run only from the scheduler, which connects as the table owner.
-- Nothing in the app should be able to trigger a league close or a bulk week
-- roll-up, so no role gets EXECUTE.
revoke all on function public.cron_close_circle_weeks()     from public, anon, authenticated;
revoke all on function public.cron_close_league_week()      from public, anon, authenticated;
revoke all on function public.cron_ensure_daily_challenge() from public, anon, authenticated;

-- ── Schedule ───────────────────────────────────────────────────────────────
-- All times are UTC, which is what pg_cron reads. The weekly jobs are spaced
-- a few minutes apart rather than all firing at midnight, so a slow one never
-- delays the next.
--
-- Unscheduling first makes this migration re-runnable: `cron.schedule` on an
-- existing name updates it, but only if the name matches exactly, and being
-- explicit is cheaper than debugging a duplicate job later.

do $$
declare
  v_name text;
begin
  foreach v_name in array array[
    'ilm-cleanup-rooms',
    'ilm-daily-challenge',
    'ilm-close-league-week',
    'ilm-close-circle-weeks'
  ] loop
    if exists (select 1 from cron.job where jobname = v_name) then
      perform cron.unschedule(v_name);
    end if;
  end loop;
end;
$$;

-- Finished rooms are deleted an hour after they end and abandoned lobbies
-- after thirty minutes, so a quarter-hourly sweep is fine-grained enough to
-- keep the table small without churning.
select cron.schedule('ilm-cleanup-rooms', '*/15 * * * *', $job$ select public.cleanup_old_rooms(); $job$);

-- Just after midnight UTC, so the day's challenge is waiting rather than
-- being created by whoever opens the app first.
select cron.schedule('ilm-daily-challenge', '5 0 * * *', $job$ select public.cron_ensure_daily_challenge(); $job$);

-- Monday, after the week has definitively rolled over. League first, because
-- promotion and relegation are what players are waiting to see.
select cron.schedule('ilm-close-league-week', '20 0 * * 1', $job$ select public.cron_close_league_week(); $job$);
select cron.schedule('ilm-close-circle-weeks', '30 0 * * 1', $job$ select public.cron_close_circle_weeks(); $job$);
