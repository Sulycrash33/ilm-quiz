-- Migration 0005: Make lifelines actually cost coins, and journal Hunt runs.
--
-- Two separate problems, both from the same root: the run loop had no
-- server-side existence.
--
-- 1. LIFELINES WERE FREE.
--    `QuizView` showed a coin price on every lifeline and pushed the id into
--    local state, but the only thing that ever reached the server was
--    `p_lifeline_used` on `submit_quiz_answer` — which is only called when the
--    player commits to an answer. So "Skip" (which advances without answering),
--    "Time Boost" followed by a timeout, and "50/50" followed by a timeout all
--    charged nothing at all. The displayed balance was local state seeded from
--    `profiles.coins` and then incremented by XP, so it drifted from the real
--    balance the moment a player answered anything.
--
--    Since 0003-era hardening, `profiles.coins` can't be written directly from
--    a client session (that's why `purchase_store_item_rpc` exists), so the fix
--    has to be a SECURITY DEFINER function. `spend_lifeline_rpc` below is that
--    function, and it holds the price list itself — the client sends only which
--    lifeline it wants, never what it costs.
--
-- 2. RUNS LEFT NO TRACE.
--    Individual answers land in `attempts`, but a "run" — ten questions, a
--    combo, lives, an ending — existed only in React state and vanished on
--    unmount. `hunt_runs` gives runs a history to read back for the profile,
--    run-based achievements, and "best run" leaderboards.

-- ---------------------------------------------------------------------------
-- 1. Lifeline price list
-- ---------------------------------------------------------------------------
-- A table rather than a CASE inside the function so prices can be re-balanced
-- with an UPDATE instead of a migration, and so the app can read the live
-- prices to render the dock (no second copy of the numbers in TypeScript that
-- silently drifts out of date).

create table if not exists public.lifeline_prices (
  id text primary key,
  cost int not null check (cost >= 0),
  enabled boolean not null default true,
  sort_order int not null default 0
);

comment on table public.lifeline_prices is
  'Authoritative coin cost of each lifeline. The client never sends a price; spend_lifeline_rpc reads it from here.';

insert into public.lifeline_prices (id, cost, sort_order) values
  ('fifty-fifty',   50, 1),
  ('ask-imam',      75, 2),
  ('skip',          25, 3),
  ('double-points', 100, 4),
  ('time-boost',    30, 5)
on conflict (id) do nothing;

alter table public.lifeline_prices enable row level security;

-- Prices are public information — the dock has to render them. Read-only:
-- there is no insert/update/delete policy, so no client session can re-price
-- a lifeline.
drop policy if exists "Anyone signed in can read lifeline prices" on public.lifeline_prices;
create policy "Anyone signed in can read lifeline prices"
  on public.lifeline_prices
  for select
  to authenticated
  using (true);

-- Granted explicitly rather than leaning on Supabase's default privileges for
-- the public schema. RLS only narrows what a role can already reach: without
-- the table grant the policy above is unreachable and every read fails with
-- "permission denied". Migration 0004 grants the same way for the same reason.
grant select on public.lifeline_prices to authenticated;

-- ---------------------------------------------------------------------------
-- 2. spend_lifeline_rpc — the only path that can charge for a lifeline
-- ---------------------------------------------------------------------------
-- Returns a row rather than raising, matching the shape the app already uses
-- for purchase_store_item_rpc / open_chest_rpc: { success, error, new_balance }.
--
-- The UPDATE carries `coins >= v_cost` in its own WHERE clause, so the check
-- and the deduction are one atomic statement. A double-tapped lifeline button
-- racing itself can't overdraw the balance: the second UPDATE matches no row.

create or replace function public.spend_lifeline_rpc(p_lifeline_id text)
returns table (success boolean, error text, new_balance int, cost int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_cost int;
  v_new_balance int;
begin
  if v_user_id is null then
    return query select false, 'You must be signed in.'::text, null::int, null::int;
    return;
  end if;

  select lp.cost into v_cost
  from public.lifeline_prices lp
  where lp.id = p_lifeline_id and lp.enabled;

  if v_cost is null then
    return query select false, 'Unknown lifeline.'::text, null::int, null::int;
    return;
  end if;

  update public.profiles p
     set coins = p.coins - v_cost
   where p.id = v_user_id
     and p.coins >= v_cost
  returning p.coins into v_new_balance;

  if v_new_balance is null then
    -- Either the profile row is missing or the balance was too low. Report the
    -- balance back either way so the client can resync its display.
    select p.coins into v_new_balance from public.profiles p where p.id = v_user_id;
    return query select false, 'Not enough coins.'::text, v_new_balance, v_cost;
    return;
  end if;

  return query select true, null::text, v_new_balance, v_cost;
end;
$$;

revoke all on function public.spend_lifeline_rpc(text) from public;
grant execute on function public.spend_lifeline_rpc(text) to authenticated;

comment on function public.spend_lifeline_rpc(text) is
  'Atomically charges the signed-in user for one lifeline at the price held in lifeline_prices. Never trusts a client-supplied cost.';

-- ---------------------------------------------------------------------------
-- 3. hunt_runs — the run journal
-- ---------------------------------------------------------------------------

create table if not exists public.hunt_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  status text not null check (status in ('won', 'lost')),
  -- Questions actually put in front of the player this run.
  stages int not null check (stages >= 0),
  correct int not null default 0 check (correct >= 0),
  wrong int not null default 0 check (wrong >= 0),
  timed_out int not null default 0 check (timed_out >= 0),
  best_combo int not null default 0 check (best_combo >= 0),
  lives_left int not null default 0 check (lives_left >= 0),
  lifelines_used int not null default 0 check (lifelines_used >= 0),
  -- XP the server credited across this run's answers, copied here for display.
  -- See the warning below before using this for anything else.
  xp_earned int not null default 0 check (xp_earned >= 0),
  -- Pace points. A run score, not currency.
  speed_score int not null default 0 check (speed_score >= 0),
  created_at timestamptz not null default now()
);

comment on table public.hunt_runs is
  'History of completed Hunt runs, one row per run. WRITTEN BY THE CLIENT: every count here is self-reported and must be treated as display-only. The authoritative record of what a player answered is public.attempts, and the authoritative XP/coin balance is public.profiles — never grant currency, achievements, or leaderboard rank from these numbers without cross-checking attempts.';

create index if not exists hunt_runs_user_created_idx
  on public.hunt_runs (user_id, created_at desc);

alter table public.hunt_runs enable row level security;

drop policy if exists "Users can record their own runs" on public.hunt_runs;
create policy "Users can record their own runs"
  on public.hunt_runs
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can view their own runs" on public.hunt_runs;
create policy "Users can view their own runs"
  on public.hunt_runs
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Deliberately no update or delete policy: a run journal that can be edited
-- after the fact is not a journal.

-- Insert and select only — matching the policies above. No update/delete grant
-- is issued, so the absence of those policies can't be worked around.
grant select, insert on public.hunt_runs to authenticated;

-- ---------------------------------------------------------------------------
-- Residual risk / follow-ups (not closed here)
-- ---------------------------------------------------------------------------
-- a) `hunt_runs` rows are client-reported, as the table comment says. That is
--    fine for "your last 10 runs" on a profile. It is NOT fine as the basis of
--    a competitive leaderboard — a crafted POST can claim a flawless run. The
--    honest fix is to derive run stats server-side from `attempts` (which is
--    written only by `submit_quiz_answer`) and either drop these columns or
--    reduce them to a cache keyed off that derivation. Doing it properly needs
--    a run id threaded through `submit_quiz_answer`, which means changing that
--    function — deferred so this migration stays additive.
--
-- b) The speed bonus is scored on the client from its own clock and is
--    therefore not credited as XP anywhere. `speed_score` is stored for run
--    history only. If pace should ever pay real XP, it has to be computed in
--    `submit_quiz_answer` from `p_response_time_ms`, not accepted from here.
--
-- c) `purchase_store_item_rpc` still takes `p_price` from the caller, which has
--    the same shape of problem this migration fixes for lifelines. Not touched
--    here to keep the change reviewable, but it should get the same treatment:
--    a server-side price list keyed by item id.
