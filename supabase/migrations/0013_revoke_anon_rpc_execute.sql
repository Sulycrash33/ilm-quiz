-- Migration 0013: Stop anonymous callers executing the game's RPCs.
--
-- WHAT WAS WRONG
-- Every `SECURITY DEFINER` function in `public` was executable by `anon` —
-- signed-out callers, over the public REST endpoint, using the publishable key
-- that ships in the browser bundle. Twenty-four of them.
--
-- This was not a mistake in any one migration. Each of 0005 through 0012 did:
--
--     revoke all on function ... from public;
--     grant execute on function ... to authenticated;
--
-- which looks exhaustive and is not. Supabase ships a default privilege —
-- `alter default privileges in schema public grant all on functions to anon,
-- authenticated, service_role` — that issues a *direct* grant to the `anon`
-- role at creation time. `revoke ... from public` revokes the implicit
-- PUBLIC grant; it does not touch a direct grant to a named role. So the
-- revoke/grant pair left `anon` exactly where the default put it.
--
-- WHAT IT MEANT IN PRACTICE
-- Most of these functions open with `if auth.uid() is null then return`, so a
-- signed-out call got nothing back. The exceptions are the ones that do not ask
-- who is calling, because they were written as internal helpers:
--
--   ensure_daily_challenge(date)  writes a `daily_challenges` row for any date
--                                 passed in — including dates years out.
--   close_league_week(date)       ranks and closes a past league week.
--   close_circle_weeks(uuid)      records a circle's completed weeks.
--   cleanup_old_rooms()           deletes finished and abandoned quiz rooms.
--
-- None of them can be made to pay a player, leak another player's data, or
-- delete a live game — `cleanup_old_rooms` only touches rooms already finished
-- or abandoned for 30 minutes. So this is hardening, not an incident. But
-- unauthenticated writes to game state should not be reachable at all.

-- ---------------------------------------------------------------------------
-- 1. Revoke what is already granted
-- ---------------------------------------------------------------------------
-- Done as a loop rather than by name so nothing is missed, and so this stays
-- correct if it is ever replayed against a database with more functions than
-- the migrations in this folder create.
--
-- Trigger functions are included. PostgREST cannot invoke them anyway — a
-- function returning `trigger` is not exposed as an endpoint — but the linter
-- still reports them, and revoking is free: Postgres checks EXECUTE on a
-- trigger function when the trigger is created, not each time it fires, so the
-- triggers already attached to `attempts` and `auth.users` keep working.
--
-- Both grants have to go. Six functions predating the revoke convention —
-- submit_quiz_answer, claim_daily_login_rpc, and the four room RPCs — still
-- carried Postgres's own `=X/postgres` grant to PUBLIC, which `anon` inherits;
-- revoking from `anon` alone left them reachable. Revoking from PUBLIC does not
-- disturb the explicit grants to `authenticated` and `service_role`.

do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
  loop
    execute format('revoke execute on function %s from public, anon', r.sig);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Stop the default from putting it back
-- ---------------------------------------------------------------------------
-- Without this, the next `create function` in the next migration arrives with
-- `anon` holding EXECUTE again, and the loop above has to be re-run forever.
--
-- This narrows a Supabase default. `authenticated` and `service_role` keep
-- theirs; only `anon` loses the blanket grant, and only for functions created
-- by the migration role from here on. Existing functions are handled above.
-- To undo: `alter default privileges in schema public grant execute on
-- functions to anon;`.
--
-- This does NOT make the per-function `revoke all on function ... from public`
-- redundant. Postgres itself grants EXECUTE on every new function to PUBLIC,
-- and `anon` inherits through PUBLIC. Both halves are needed: this line removes
-- the Supabase direct grant, the per-function revoke removes the built-in one.
-- Keep writing both in future migrations.

alter default privileges in schema public revoke execute on functions from anon;

-- ---------------------------------------------------------------------------
-- 3. Pin the two functions with a mutable search_path
-- ---------------------------------------------------------------------------
-- A `SECURITY DEFINER` function without `set search_path` resolves its table
-- names using whatever search_path the caller has set. Both of these predate
-- the convention the later migrations follow.

create or replace function public.cleanup_old_rooms()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.quiz_rooms where status = 'finished' and finished_at < now() - interval '1 hour';
  delete from public.quiz_rooms where status = 'waiting'  and created_at  < now() - interval '30 minutes';
end;
$$;

revoke all on function public.cleanup_old_rooms() from public, anon;
grant execute on function public.cleanup_old_rooms() to authenticated;

-- `league_rules` is immutable and returns three constants, so a mutable
-- search_path cannot hurt it — but it costs nothing to be consistent.
create or replace function public.league_rules()
returns table (promote_top int, relegate_bottom int, max_division int)
language sql
immutable
set search_path = public
as $$ select 3, 2, 10 $$;

revoke all on function public.league_rules() from public, anon;
grant execute on function public.league_rules() to authenticated;
