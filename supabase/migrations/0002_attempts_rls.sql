-- Migration 0002: RLS for the quiz `attempts` table.
--
-- Context: the live quiz now records one row per answered question via the
-- `submitAnswer` server action (src/app/(app)/quiz/actions.ts). Previously no
-- code ever inserted into `attempts`, so it had no user-facing policies. These
-- policies let a signed-in player insert and read ONLY their own attempts.
-- Grading itself still happens server-side; this just governs row access.

alter table public.attempts enable row level security;

-- A player may record their own attempts (user_id must be themselves).
drop policy if exists "Users can insert their own attempts" on public.attempts;
create policy "Users can insert their own attempts"
  on public.attempts
  for insert
  with check (auth.uid() = user_id);

-- A player may read back their own attempts (progress, history, stats).
drop policy if exists "Users can view their own attempts" on public.attempts;
create policy "Users can view their own attempts"
  on public.attempts
  for select
  using (auth.uid() = user_id);
