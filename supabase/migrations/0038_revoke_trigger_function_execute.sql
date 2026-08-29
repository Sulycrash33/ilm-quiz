-- Migration 0038: the identity triggers are not an API.
--
-- Postgres grants `execute` on a new function to `public` by default. The
-- SECURITY DEFINER functions in this schema all revoke that and grant back to
-- `authenticated` — migration 0013 is the reference and explains why the
-- revoke alone is not enough. The two trigger functions added in 0036 and 0037
-- were the exception, because a trigger function is not something anyone calls
-- and it did not occur to me that anyone could.
--
-- The Supabase advisor disagreed, and it is right: it flagged both as
-- reachable by `anon` at `/rest/v1/rpc/...`. They run as the definer and write
-- the very columns they exist to protect. Nothing should be able to call them
-- but the triggers that own them, and a trigger does not need `execute` to
-- fire — the grant is checked for a *call*, not for an invocation by the
-- table it is attached to.
--
-- So these get no grant back at all, which is the same shape as
-- `log_admin_action` in migration 0032: granted to nobody, reachable only from
-- inside.

revoke all on function public.stamp_room_player_identity() from public, anon, authenticated;
revoke all on function public.stamp_room_host_identity() from public, anon, authenticated;
