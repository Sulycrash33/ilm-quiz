-- Migration 0001: Content review roles + RLS for the AI-draft -> scholar-review pipeline
--
-- Context: `questions.review_status` already supports draft/ai_drafted/scholar_approved/
-- published/rejected (set up in an earlier, untracked schema pass). This migration adds
-- the role gate that lets a human reviewer see and act on non-published rows, and locks
-- everyone else to `published` only via RLS (never trust the client to filter this itself).
--
-- NOTE: this is the first tracked migration file for this project. Schema changes prior
-- to this (rank_tiers, categories, profiles, questions, attempts, weekly_xp,
-- leaderboard_cohorts, achievements, daily_challenges, etc.) were applied directly to the
-- live DB and are NOT captured as migration files. Treat this file as the new baseline
-- going forward; consider a `supabase db pull` reconciliation pass separately if a full
-- reproducible history is ever needed.

-- 1. Role enum + column on profiles
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type app_role as enum ('user', 'reviewer', 'admin');
  end if;
end $$;

alter table public.profiles
  add column if not exists role app_role not null default 'user';

comment on column public.profiles.role is
  'Gates the content-review workflow. reviewer/admin can see and act on ai_drafted, scholar_approved, and rejected questions; regular users only ever see published via RLS.';

-- 2. Reviewers/admins can see every question regardless of status
drop policy if exists "Reviewers and admins can view all questions" on public.questions;
create policy "Reviewers and admins can view all questions"
  on public.questions
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('reviewer', 'admin')
    )
  );

-- 3. Reviewers/admins can insert questions (covers both the AI-draft trigger and
--    any manually-authored question)
drop policy if exists "Reviewers and admins can insert questions" on public.questions;
create policy "Reviewers and admins can insert questions"
  on public.questions
  for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('reviewer', 'admin')
    )
  );

-- 4. Reviewers/admins can update review_status / reviewed_by / reviewed_at / content
--    (approve, reject, edit-then-approve)
drop policy if exists "Reviewers and admins can update questions" on public.questions;
create policy "Reviewers and admins can update questions"
  on public.questions
  for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('reviewer', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('reviewer', 'admin')
    )
  );

-- 5. Bootstrap note: there is no admin yet because no one has signed up through real
-- auth. After the first real signup, run this once by hand (see project notes) to
-- promote that account:
--   update public.profiles set role = 'admin' where id = '<your-auth-uid>';
