-- Migration 0007: Revoke the write privileges Supabase's default privileges
-- hand out automatically.
--
-- Discovered while verifying 0006 against the live project: `authenticated`
-- held INSERT/UPDATE/DELETE on public.store_items and public.user_inventory
-- even though 0006 only ever issued `grant select`. Supabase ships
--
--   alter default privileges in schema public
--     grant all on tables to anon, authenticated, service_role;
--
-- so every newly created table in `public` arrives with full CRUD for client
-- sessions no matter what the migration asked for. This is easy to miss because
-- a local Postgres has no such default and reports exactly the grants you wrote
-- — the local test of 0006 passed with "permission denied" on both attacks, and
-- production would have relied on RLS alone.
--
-- Nothing was actually exploitable: store_items and user_inventory carry SELECT
-- policies only, and under RLS a statement with no matching policy is denied.
-- But that is a single layer between a player and their own coin balance, and
-- the grant should match the intent rather than contradict it.
--
-- Applies to the 0005 tables for the same reason.

revoke insert, update, delete, truncate, references, trigger
  on public.store_items from authenticated, anon;

revoke insert, update, delete, truncate, references, trigger
  on public.user_inventory from authenticated, anon;

revoke insert, update, delete, truncate, references, trigger
  on public.lifeline_prices from authenticated, anon;

-- hunt_runs is insert-and-select by design (players file their own runs), so
-- only the privileges beyond that are removed.
revoke update, delete, truncate, references, trigger
  on public.hunt_runs from authenticated, anon;

-- anon has no business reading either of these; the policies require
-- `to authenticated` regardless.
revoke select on public.user_inventory from anon;
revoke select on public.hunt_runs from anon;

-- NOTE for future migrations in this project: creating a table in `public` and
-- writing only the grants you want is not sufficient. Either revoke explicitly
-- as above, or narrow the default privileges once at the schema level.
