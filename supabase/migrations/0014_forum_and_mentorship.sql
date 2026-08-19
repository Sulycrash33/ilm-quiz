-- Migration 0014: Make the forum and mentorship tabs real.
--
-- Both tabs have shipped since the community page existed, both showing a
-- "coming soon" card. Neither had a table behind it. This adds both, plus the
-- moderation machinery they cannot safely ship without.
--
-- ===========================================================================
-- WHY THESE TWO FEATURES ARE SHAPED THE WAY THEY ARE
-- ===========================================================================
-- This app's onboarding offers "Under 13" and "13-17" as age ranges, and its
-- own content policy (src/ai/flows/draft-questions.ts) refuses to let machine-
-- drafted Islamic content reach a user without a qualified human scholar's
-- approval. Two things follow.
--
-- 1. A FORUM POST IS UNREVIEWED RELIGIOUS CONTENT.
--    A player asserting a ruling in a thread is the same hazard the AI policy
--    guards against, with none of the review. Pre-moderating every post would
--    kill the feature, so this uses post-moderation with teeth: anyone can
--    report, any reviewer or admin can hide, posting is rate limited, and a
--    reviewer can mark a single reply as checked. That verification flag is the
--    only marker of religious authority anywhere in the forum — everything else
--    is explicitly peer discussion, and the UI says so.
--
-- 2. MENTORSHIP BETWEEN ADULTS AND MINORS CANNOT BE PRIVATE.
--    The obvious build — match a mentor to a mentee, give them a message
--    thread — is an unmoderated private channel between an adult and a child.
--    This app has no age verification and no safeguarding process, so that
--    channel is not something to ship.
--
--    So there is no private channel here. There is no direct-message table in
--    this migration at all. Mentorship is public Q&A: a learner asks in the
--    open, an approved mentor answers in the open, everything is readable by
--    any signed-in user and reportable by any of them. Becoming a mentor
--    requires an admin to approve the application — the `reviewer`/`admin`
--    roles from migration 0001 are reused rather than inventing a new one.
--
--    If private mentoring is ever wanted, it needs age verification, a
--    safeguarding policy, and someone accountable for it. Not a table.
--
-- WHAT IS DELIBERATELY NOT HERE
--   - Direct messages of any kind.
--   - Any way for a mentor to be contacted off-platform. Posts are text; there
--     is no contact field, and the reporting reasons cover attempts to trade one.
--   - Age gating on posting. `profiles.age_range` is self-reported at onboarding
--     and never verified, so gating on it would provide the appearance of a
--     safeguard rather than a safeguard. Noted as a follow-up.

-- ---------------------------------------------------------------------------
-- 0. Shared vocabulary
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'content_status') then
    create type content_status as enum ('visible', 'hidden', 'removed');
  end if;
  if not exists (select 1 from pg_type where typname = 'mentor_status') then
    create type mentor_status as enum ('pending', 'approved', 'rejected', 'paused');
  end if;
end $$;

comment on type content_status is
  'visible: shown normally. hidden: taken down by a moderator, still readable by its author and by reviewers. removed: author deleted it.';

/** True when the current user may moderate. Mirrors the role check migration
 * 0001 wrote inline into four policies; centralised here because this migration
 * needs it in a dozen places. */
create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('reviewer', 'admin')
  );
$$;

revoke all on function public.is_moderator() from public, anon;
grant execute on function public.is_moderator() to authenticated;

-- ---------------------------------------------------------------------------
-- 1. Forum
-- ---------------------------------------------------------------------------

create table if not exists public.forum_topics (
  id               uuid primary key default gen_random_uuid(),
  author_id        uuid not null references public.profiles(id) on delete cascade,
  category_id      uuid references public.categories(id) on delete set null,
  title            text not null check (char_length(btrim(title)) between 5 and 160),
  body             text not null check (char_length(btrim(body)) between 10 and 8000),
  language         app_language not null default 'en',
  status           content_status not null default 'visible',
  pinned           boolean not null default false,
  reply_count      int not null default 0,
  last_activity_at timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.forum_topics is
  'Peer discussion threads. Not a fatwa service: nothing here is reviewed before it is shown, which is why reporting and moderation exist and why the UI labels it as discussion.';

create table if not exists public.forum_replies (
  id          uuid primary key default gen_random_uuid(),
  topic_id    uuid not null references public.forum_topics(id) on delete cascade,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  body        text not null check (char_length(btrim(body)) between 2 and 8000),
  status      content_status not null default 'visible',
  -- Set by a reviewer or admin. The only claim of religious authority in the
  -- forum, and it is a person's claim, not the system's.
  verified_by uuid references public.profiles(id) on delete set null,
  verified_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists forum_topics_activity_idx
  on public.forum_topics (pinned desc, last_activity_at desc) where status = 'visible';
create index if not exists forum_topics_author_idx on public.forum_topics (author_id);
create index if not exists forum_replies_topic_idx on public.forum_replies (topic_id, created_at);
create index if not exists forum_replies_author_idx on public.forum_replies (author_id);

-- ---------------------------------------------------------------------------
-- 2. Mentorship
-- ---------------------------------------------------------------------------

create table if not exists public.mentor_profiles (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  bio          text not null check (char_length(btrim(bio)) between 20 and 2000),
  credentials  text check (char_length(credentials) <= 2000),
  languages    app_language[] not null default '{}',
  status       mentor_status not null default 'pending',
  applied_at   timestamptz not null default now(),
  reviewed_by  uuid references public.profiles(id) on delete set null,
  reviewed_at  timestamptz,
  review_note  text check (char_length(review_note) <= 1000),
  answers_given int not null default 0
);

comment on table public.mentor_profiles is
  'Mentor applications and their outcome. status starts at pending and only an admin moves it — nobody self-certifies as a mentor.';

create table if not exists public.mentor_questions (
  id           uuid primary key default gen_random_uuid(),
  asker_id     uuid not null references public.profiles(id) on delete cascade,
  category_id  uuid references public.categories(id) on delete set null,
  title        text not null check (char_length(btrim(title)) between 5 and 160),
  body         text not null check (char_length(btrim(body)) between 10 and 4000),
  language     app_language not null default 'en',
  status       content_status not null default 'visible',
  answer_count int not null default 0,
  answered     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.mentor_questions is
  'A learner''s question, asked in the open. There is no private variant of this table on purpose — see the header of migration 0014.';

create table if not exists public.mentor_answers (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.mentor_questions(id) on delete cascade,
  mentor_id   uuid not null references public.profiles(id) on delete cascade,
  body        text not null check (char_length(btrim(body)) between 10 and 8000),
  status      content_status not null default 'visible',
  -- The asker marks the answer that helped. Says nothing about correctness.
  accepted    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists mentor_questions_open_idx
  on public.mentor_questions (answered, created_at desc) where status = 'visible';
create index if not exists mentor_answers_question_idx on public.mentor_answers (question_id, created_at);
create index if not exists mentor_profiles_status_idx on public.mentor_profiles (status);

-- ---------------------------------------------------------------------------
-- 3. Reports
-- ---------------------------------------------------------------------------
-- One table for all four content kinds, so the moderation queue is one list
-- rather than four. `target_id` is intentionally not a foreign key: it points
-- at whichever of the four tables `target_kind` names, and a report should
-- survive its target being deleted so the queue keeps its history.

create table if not exists public.content_reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_kind text not null check (target_kind in ('forum_topic', 'forum_reply', 'mentor_question', 'mentor_answer')),
  target_id   uuid not null,
  reason      text not null check (reason in ('incorrect_religious_claim', 'harassment', 'spam', 'off_topic', 'contact_details', 'other')),
  detail      text check (char_length(detail) <= 1000),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  resolution  text check (char_length(resolution) <= 1000),
  -- One report per person per item: reporting twice is not a stronger signal,
  -- and without this a single user can flood the queue.
  unique (reporter_id, target_kind, target_id)
);

comment on table public.content_reports is
  'Every report from every surface. target_id is deliberately not a foreign key so a report outlives the content it was about.';

create index if not exists content_reports_open_idx
  on public.content_reports (created_at desc) where resolved_at is null;
create index if not exists content_reports_target_idx on public.content_reports (target_kind, target_id);

-- ---------------------------------------------------------------------------
-- 4. Counter maintenance
-- ---------------------------------------------------------------------------
-- Recomputed rather than incremented, so hiding a reply corrects the count
-- instead of leaving it one too high forever.

create or replace function public.refresh_forum_topic_counters()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_topic uuid := coalesce(new.topic_id, old.topic_id);
begin
  update public.forum_topics t
     set reply_count = (
           select count(*) from public.forum_replies r
           where r.topic_id = v_topic and r.status = 'visible'
         ),
         last_activity_at = greatest(
           t.created_at,
           coalesce((
             select max(r.created_at) from public.forum_replies r
             where r.topic_id = v_topic and r.status = 'visible'
           ), t.created_at)
         )
   where t.id = v_topic;
  return null;
end;
$$;

-- Both halves of the revoke, per the note in migration 0013: the per-function
-- revoke removes Postgres's built-in grant to PUBLIC, and 0013's narrowed
-- default privilege keeps `anon` from getting a direct one. Trigger functions
-- are not reachable through PostgREST, but they are still listed by the linter
-- and there is no reason for the grant to exist.
revoke all on function public.refresh_forum_topic_counters() from public, anon;

drop trigger if exists forum_replies_refresh_counters on public.forum_replies;
create trigger forum_replies_refresh_counters
  after insert or update or delete on public.forum_replies
  for each row execute function public.refresh_forum_topic_counters();

create or replace function public.refresh_mentor_question_counters()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_question uuid := coalesce(new.question_id, old.question_id);
  v_count int;
begin
  select count(*) into v_count
  from public.mentor_answers a
  where a.question_id = v_question and a.status = 'visible';

  update public.mentor_questions q
     set answer_count = v_count,
         answered = (v_count > 0)
   where q.id = v_question;
  return null;
end;
$$;

revoke all on function public.refresh_mentor_question_counters() from public, anon;

drop trigger if exists mentor_answers_refresh_counters on public.mentor_answers;
create trigger mentor_answers_refresh_counters
  after insert or update or delete on public.mentor_answers
  for each row execute function public.refresh_mentor_question_counters();

-- ---------------------------------------------------------------------------
-- 5. Row level security
-- ---------------------------------------------------------------------------
-- Reading: visible content is readable by any signed-in user. Hidden content
-- stays readable by its own author (so a takedown is not silent) and by
-- moderators (so it can be reviewed). Removed content is treated the same way —
-- the row survives for the audit trail, the reader does not see it.
--
-- Writing: there are no INSERT, UPDATE or DELETE policies on any of these
-- tables, and the grants below withdraw those privileges from `authenticated`
-- outright. Every write goes through a SECURITY DEFINER function in section 6,
-- which is what makes the rate limits and the approved-mentor check
-- unavoidable rather than advisory.

alter table public.forum_topics      enable row level security;
alter table public.forum_replies     enable row level security;
alter table public.mentor_profiles   enable row level security;
alter table public.mentor_questions  enable row level security;
alter table public.mentor_answers    enable row level security;
alter table public.content_reports   enable row level security;

drop policy if exists "Visible topics, own topics, or moderating" on public.forum_topics;
create policy "Visible topics, own topics, or moderating"
  on public.forum_topics for select to authenticated
  using (status = 'visible' or author_id = auth.uid() or public.is_moderator());

drop policy if exists "Visible replies, own replies, or moderating" on public.forum_replies;
create policy "Visible replies, own replies, or moderating"
  on public.forum_replies for select to authenticated
  using (status = 'visible' or author_id = auth.uid() or public.is_moderator());

-- An application that has not been approved is not public. A rejected one is
-- visible only to the applicant and to moderators.
drop policy if exists "Approved mentors, own application, or moderating" on public.mentor_profiles;
create policy "Approved mentors, own application, or moderating"
  on public.mentor_profiles for select to authenticated
  using (status = 'approved' or user_id = auth.uid() or public.is_moderator());

drop policy if exists "Visible questions, own questions, or moderating" on public.mentor_questions;
create policy "Visible questions, own questions, or moderating"
  on public.mentor_questions for select to authenticated
  using (status = 'visible' or asker_id = auth.uid() or public.is_moderator());

drop policy if exists "Visible answers, own answers, or moderating" on public.mentor_answers;
create policy "Visible answers, own answers, or moderating"
  on public.mentor_answers for select to authenticated
  using (status = 'visible' or mentor_id = auth.uid() or public.is_moderator());

-- A report is between the reporter and the moderators. Nobody can see who
-- reported them, and nobody can browse the queue to find content to brigade.
drop policy if exists "Own reports, or moderating" on public.content_reports;
create policy "Own reports, or moderating"
  on public.content_reports for select to authenticated
  using (reporter_id = auth.uid() or public.is_moderator());

-- Supabase's default privileges hand every new table full CRUD to anon and
-- authenticated. Read is all any client session needs here.
grant select on public.forum_topics, public.forum_replies, public.mentor_profiles,
                public.mentor_questions, public.mentor_answers, public.content_reports
  to authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.forum_topics, public.forum_replies, public.mentor_profiles,
     public.mentor_questions, public.mentor_answers, public.content_reports
  from authenticated, anon;
revoke all
  on public.forum_topics, public.forum_replies, public.mentor_profiles,
     public.mentor_questions, public.mentor_answers, public.content_reports
  from anon;

-- ---------------------------------------------------------------------------
-- 6. Writes
-- ---------------------------------------------------------------------------

/**
 * How many of a thing one user may create per hour.
 *
 * Low numbers on purpose. These are not throughput limits, they are the floor
 * under a spam flood and under someone using the forum to bury a thread. A
 * person writing in good faith will not notice them.
 */
create or replace function public.posting_limits()
returns table (topics_per_hour int, replies_per_hour int, questions_per_hour int, answers_per_hour int)
language sql
immutable
set search_path = public
as $$ select 5, 20, 5, 30 $$;

revoke all on function public.posting_limits() from public, anon;
grant execute on function public.posting_limits() to authenticated;

drop function if exists public.create_forum_topic(text, text, uuid, app_language);
create function public.create_forum_topic(
  p_title text,
  p_body text,
  p_category_id uuid default null,
  p_language app_language default 'en'
)
returns table (o_success boolean, o_error text, o_topic_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_recent int;
  v_limit int;
  v_id uuid;
begin
  if v_user_id is null then
    return query select false, 'You must be signed in.'::text, null::uuid;
    return;
  end if;

  if char_length(btrim(coalesce(p_title, ''))) < 5 then
    return query select false, 'Give your thread a title of at least 5 characters.'::text, null::uuid;
    return;
  end if;
  if char_length(btrim(coalesce(p_body, ''))) < 10 then
    return query select false, 'Write at least 10 characters.'::text, null::uuid;
    return;
  end if;

  select l.topics_per_hour into v_limit from public.posting_limits() l;
  select count(*) into v_recent
  from public.forum_topics t
  where t.author_id = v_user_id and t.created_at > now() - interval '1 hour';

  if v_recent >= v_limit then
    return query select false, 'You have started several threads recently. Please wait a little while.'::text, null::uuid;
    return;
  end if;

  insert into public.forum_topics (author_id, category_id, title, body, language)
  values (v_user_id, p_category_id, btrim(p_title), btrim(p_body), p_language)
  returning id into v_id;

  return query select true, null::text, v_id;
end;
$$;

revoke all on function public.create_forum_topic(text, text, uuid, app_language) from public, anon;
grant execute on function public.create_forum_topic(text, text, uuid, app_language) to authenticated;

drop function if exists public.create_forum_reply(uuid, text);
create function public.create_forum_reply(p_topic_id uuid, p_body text)
returns table (o_success boolean, o_error text, o_reply_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_recent int;
  v_limit int;
  v_status content_status;
  v_id uuid;
begin
  if v_user_id is null then
    return query select false, 'You must be signed in.'::text, null::uuid;
    return;
  end if;

  if char_length(btrim(coalesce(p_body, ''))) < 2 then
    return query select false, 'Write something first.'::text, null::uuid;
    return;
  end if;

  select t.status into v_status from public.forum_topics t where t.id = p_topic_id;
  if v_status is null then
    return query select false, 'That thread no longer exists.'::text, null::uuid;
    return;
  end if;
  if v_status <> 'visible' then
    return query select false, 'That thread is closed.'::text, null::uuid;
    return;
  end if;

  select l.replies_per_hour into v_limit from public.posting_limits() l;
  select count(*) into v_recent
  from public.forum_replies r
  where r.author_id = v_user_id and r.created_at > now() - interval '1 hour';

  if v_recent >= v_limit then
    return query select false, 'You have posted a lot recently. Please wait a little while.'::text, null::uuid;
    return;
  end if;

  insert into public.forum_replies (topic_id, author_id, body)
  values (p_topic_id, v_user_id, btrim(p_body))
  returning id into v_id;

  return query select true, null::text, v_id;
end;
$$;

revoke all on function public.create_forum_reply(uuid, text) from public, anon;
grant execute on function public.create_forum_reply(uuid, text) to authenticated;

/**
 * Edit or delete your own post.
 *
 * Deleting sets status to 'removed' rather than deleting the row: replies that
 * quote it stay coherent, and a post that was reported stays available to the
 * moderator looking at the report. A moderator's takedown ('hidden') cannot be
 * edited back to visible by its author.
 */
drop function if exists public.edit_own_post(text, uuid, text, boolean);
create function public.edit_own_post(
  p_kind text,
  p_id uuid,
  p_body text default null,
  p_delete boolean default false
)
returns table (o_success boolean, o_error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_owner uuid;
  v_status content_status;
  v_new_status content_status;
begin
  if v_user_id is null then
    return query select false, 'You must be signed in.'::text;
    return;
  end if;

  case p_kind
    when 'forum_topic' then
      select t.author_id, t.status into v_owner, v_status from public.forum_topics t where t.id = p_id;
    when 'forum_reply' then
      select r.author_id, r.status into v_owner, v_status from public.forum_replies r where r.id = p_id;
    when 'mentor_question' then
      select q.asker_id, q.status into v_owner, v_status from public.mentor_questions q where q.id = p_id;
    when 'mentor_answer' then
      select a.mentor_id, a.status into v_owner, v_status from public.mentor_answers a where a.id = p_id;
    else
      return query select false, 'Unknown content type.'::text;
      return;
  end case;

  if v_owner is null then
    return query select false, 'That post no longer exists.'::text;
    return;
  end if;
  if v_owner <> v_user_id then
    return query select false, 'That is not your post.'::text;
    return;
  end if;
  if v_status = 'hidden' then
    return query select false, 'A moderator has taken this down. Contact them if you disagree.'::text;
    return;
  end if;

  v_new_status := case when p_delete then 'removed'::content_status else v_status end;

  if not p_delete and char_length(btrim(coalesce(p_body, ''))) = 0 then
    return query select false, 'Write something first.'::text;
    return;
  end if;

  case p_kind
    when 'forum_topic' then
      update public.forum_topics set body = coalesce(btrim(p_body), body), status = v_new_status, updated_at = now() where id = p_id;
    when 'forum_reply' then
      update public.forum_replies set body = coalesce(btrim(p_body), body), status = v_new_status, updated_at = now() where id = p_id;
    when 'mentor_question' then
      update public.mentor_questions set body = coalesce(btrim(p_body), body), status = v_new_status, updated_at = now() where id = p_id;
    when 'mentor_answer' then
      update public.mentor_answers set body = coalesce(btrim(p_body), body), status = v_new_status, updated_at = now() where id = p_id;
  end case;

  return query select true, null::text;
end;
$$;

revoke all on function public.edit_own_post(text, uuid, text, boolean) from public, anon;
grant execute on function public.edit_own_post(text, uuid, text, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- 7. Mentorship writes
-- ---------------------------------------------------------------------------

/**
 * Apply to be a mentor, or amend an application that has not been approved yet.
 *
 * Always lands on `pending`. An approved mentor who edits their bio goes back
 * into the queue — a mentor profile is a public claim of standing, so a change
 * to it is re-reviewed rather than trusted.
 */
drop function if exists public.apply_as_mentor(text, text, app_language[]);
create function public.apply_as_mentor(
  p_bio text,
  p_credentials text default null,
  p_languages app_language[] default '{}'
)
returns table (o_success boolean, o_error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return query select false, 'You must be signed in.'::text;
    return;
  end if;

  if char_length(btrim(coalesce(p_bio, ''))) < 20 then
    return query select false, 'Tell learners a little about yourself — at least 20 characters.'::text;
    return;
  end if;

  insert into public.mentor_profiles (user_id, bio, credentials, languages, status, applied_at)
  values (v_user_id, btrim(p_bio), nullif(btrim(coalesce(p_credentials, '')), ''),
          coalesce(p_languages, '{}'), 'pending', now())
  on conflict (user_id) do update
    set bio         = excluded.bio,
        credentials = excluded.credentials,
        languages   = excluded.languages,
        status      = 'pending',
        applied_at  = now(),
        reviewed_by = null,
        reviewed_at = null,
        review_note = null;

  return query select true, null::text;
end;
$$;

revoke all on function public.apply_as_mentor(text, text, app_language[]) from public, anon;
grant execute on function public.apply_as_mentor(text, text, app_language[]) to authenticated;

/** Approve, reject or pause a mentor. Moderators only — nobody self-certifies. */
drop function if exists public.review_mentor_application(uuid, mentor_status, text);
create function public.review_mentor_application(
  p_user_id uuid,
  p_status mentor_status,
  p_note text default null
)
returns table (o_success boolean, o_error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null or not public.is_moderator() then
    return query select false, 'Only a reviewer or admin can do that.'::text;
    return;
  end if;
  if p_status = 'pending' then
    return query select false, 'Choose approved, rejected or paused.'::text;
    return;
  end if;

  update public.mentor_profiles
     set status = p_status,
         reviewed_by = v_user_id,
         reviewed_at = now(),
         review_note = nullif(btrim(coalesce(p_note, '')), '')
   where user_id = p_user_id;

  if not found then
    return query select false, 'No application from that person.'::text;
    return;
  end if;

  return query select true, null::text;
end;
$$;

revoke all on function public.review_mentor_application(uuid, mentor_status, text) from public, anon;
grant execute on function public.review_mentor_application(uuid, mentor_status, text) to authenticated;

drop function if exists public.ask_mentor_question(text, text, uuid, app_language);
create function public.ask_mentor_question(
  p_title text,
  p_body text,
  p_category_id uuid default null,
  p_language app_language default 'en'
)
returns table (o_success boolean, o_error text, o_question_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_recent int;
  v_limit int;
  v_id uuid;
begin
  if v_user_id is null then
    return query select false, 'You must be signed in.'::text, null::uuid;
    return;
  end if;
  if char_length(btrim(coalesce(p_title, ''))) < 5 then
    return query select false, 'Summarise your question in at least 5 characters.'::text, null::uuid;
    return;
  end if;
  if char_length(btrim(coalesce(p_body, ''))) < 10 then
    return query select false, 'Give a little more detail — at least 10 characters.'::text, null::uuid;
    return;
  end if;

  select l.questions_per_hour into v_limit from public.posting_limits() l;
  select count(*) into v_recent
  from public.mentor_questions q
  where q.asker_id = v_user_id and q.created_at > now() - interval '1 hour';

  if v_recent >= v_limit then
    return query select false, 'You have asked several questions recently. Please wait a little while.'::text, null::uuid;
    return;
  end if;

  insert into public.mentor_questions (asker_id, category_id, title, body, language)
  values (v_user_id, p_category_id, btrim(p_title), btrim(p_body), p_language)
  returning id into v_id;

  return query select true, null::text, v_id;
end;
$$;

revoke all on function public.ask_mentor_question(text, text, uuid, app_language) from public, anon;
grant execute on function public.ask_mentor_question(text, text, uuid, app_language) to authenticated;

/**
 * Answer a question. Approved mentors only.
 *
 * This is the check the whole feature rests on, which is why it lives in a
 * SECURITY DEFINER function with no INSERT grant behind it: there is no path to
 * `mentor_answers` that does not pass through here.
 */
drop function if exists public.answer_mentor_question(uuid, text);
create function public.answer_mentor_question(p_question_id uuid, p_body text)
returns table (o_success boolean, o_error text, o_answer_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_status mentor_status;
  v_q_status content_status;
  v_recent int;
  v_limit int;
  v_id uuid;
begin
  if v_user_id is null then
    return query select false, 'You must be signed in.'::text, null::uuid;
    return;
  end if;

  select m.status into v_status from public.mentor_profiles m where m.user_id = v_user_id;
  if v_status is distinct from 'approved' then
    return query select false, 'Only approved mentors can answer.'::text, null::uuid;
    return;
  end if;

  if char_length(btrim(coalesce(p_body, ''))) < 10 then
    return query select false, 'An answer needs at least 10 characters.'::text, null::uuid;
    return;
  end if;

  select q.status into v_q_status from public.mentor_questions q where q.id = p_question_id;
  if v_q_status is null then
    return query select false, 'That question no longer exists.'::text, null::uuid;
    return;
  end if;
  if v_q_status <> 'visible' then
    return query select false, 'That question is closed.'::text, null::uuid;
    return;
  end if;

  select l.answers_per_hour into v_limit from public.posting_limits() l;
  select count(*) into v_recent
  from public.mentor_answers a
  where a.mentor_id = v_user_id and a.created_at > now() - interval '1 hour';

  if v_recent >= v_limit then
    return query select false, 'You have answered a lot recently. Please wait a little while.'::text, null::uuid;
    return;
  end if;

  insert into public.mentor_answers (question_id, mentor_id, body)
  values (p_question_id, v_user_id, btrim(p_body))
  returning id into v_id;

  update public.mentor_profiles set answers_given = answers_given + 1 where user_id = v_user_id;

  return query select true, null::text, v_id;
end;
$$;

revoke all on function public.answer_mentor_question(uuid, text) from public, anon;
grant execute on function public.answer_mentor_question(uuid, text) to authenticated;

/** The asker marks the answer that helped them. One per question. */
drop function if exists public.accept_mentor_answer(uuid);
create function public.accept_mentor_answer(p_answer_id uuid)
returns table (o_success boolean, o_error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_question uuid;
  v_asker uuid;
begin
  if v_user_id is null then
    return query select false, 'You must be signed in.'::text;
    return;
  end if;

  select a.question_id, q.asker_id into v_question, v_asker
  from public.mentor_answers a
  join public.mentor_questions q on q.id = a.question_id
  where a.id = p_answer_id;

  if v_question is null then
    return query select false, 'That answer no longer exists.'::text;
    return;
  end if;
  if v_asker <> v_user_id then
    return query select false, 'Only the person who asked can do that.'::text;
    return;
  end if;

  update public.mentor_answers set accepted = (id = p_answer_id), updated_at = now()
   where question_id = v_question;

  return query select true, null::text;
end;
$$;

revoke all on function public.accept_mentor_answer(uuid) from public, anon;
grant execute on function public.accept_mentor_answer(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 8. Reporting and moderation
-- ---------------------------------------------------------------------------

drop function if exists public.report_content(text, uuid, text, text);
create function public.report_content(
  p_kind text,
  p_id uuid,
  p_reason text,
  p_detail text default null
)
returns table (o_success boolean, o_error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_exists boolean;
begin
  if v_user_id is null then
    return query select false, 'You must be signed in.'::text;
    return;
  end if;

  case p_kind
    when 'forum_topic'     then select exists(select 1 from public.forum_topics     where id = p_id) into v_exists;
    when 'forum_reply'     then select exists(select 1 from public.forum_replies    where id = p_id) into v_exists;
    when 'mentor_question' then select exists(select 1 from public.mentor_questions where id = p_id) into v_exists;
    when 'mentor_answer'   then select exists(select 1 from public.mentor_answers   where id = p_id) into v_exists;
    else
      return query select false, 'Unknown content type.'::text;
      return;
  end case;

  if not v_exists then
    return query select false, 'That post no longer exists.'::text;
    return;
  end if;

  insert into public.content_reports (reporter_id, target_kind, target_id, reason, detail)
  values (v_user_id, p_kind, p_id, p_reason, nullif(btrim(coalesce(p_detail, '')), ''))
  on conflict (reporter_id, target_kind, target_id) do nothing;

  -- Reporting twice looks the same as reporting once, deliberately: the caller
  -- is not told whether theirs was the first report on this item.
  return query select true, null::text;
end;
$$;

revoke all on function public.report_content(text, uuid, text, text) from public, anon;
grant execute on function public.report_content(text, uuid, text, text) to authenticated;

/**
 * Take content down or put it back. Moderators only.
 *
 * Resolves every open report against the item in the same statement, so acting
 * on one report clears the queue of its duplicates.
 */
drop function if exists public.moderate_content(text, uuid, content_status, text);
create function public.moderate_content(
  p_kind text,
  p_id uuid,
  p_status content_status,
  p_note text default null
)
returns table (o_success boolean, o_error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null or not public.is_moderator() then
    return query select false, 'Only a reviewer or admin can do that.'::text;
    return;
  end if;

  case p_kind
    when 'forum_topic'     then update public.forum_topics     set status = p_status, updated_at = now() where id = p_id;
    when 'forum_reply'     then update public.forum_replies    set status = p_status, updated_at = now() where id = p_id;
    when 'mentor_question' then update public.mentor_questions set status = p_status, updated_at = now() where id = p_id;
    when 'mentor_answer'   then update public.mentor_answers   set status = p_status, updated_at = now() where id = p_id;
    else
      return query select false, 'Unknown content type.'::text;
      return;
  end case;

  if not found then
    return query select false, 'That post no longer exists.'::text;
    return;
  end if;

  update public.content_reports
     set resolved_at = now(),
         resolved_by = v_user_id,
         resolution  = coalesce(nullif(btrim(coalesce(p_note, '')), ''), p_status::text)
   where target_kind = p_kind and target_id = p_id and resolved_at is null;

  return query select true, null::text;
end;
$$;

revoke all on function public.moderate_content(text, uuid, content_status, text) from public, anon;
grant execute on function public.moderate_content(text, uuid, content_status, text) to authenticated;

/** Dismiss a report without touching the content. */
drop function if exists public.dismiss_report(uuid, text);
create function public.dismiss_report(p_report_id uuid, p_note text default null)
returns table (o_success boolean, o_error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null or not public.is_moderator() then
    return query select false, 'Only a reviewer or admin can do that.'::text;
    return;
  end if;

  update public.content_reports
     set resolved_at = now(), resolved_by = v_user_id,
         resolution = coalesce(nullif(btrim(coalesce(p_note, '')), ''), 'dismissed')
   where id = p_report_id and resolved_at is null;

  if not found then
    return query select false, 'That report is already resolved.'::text;
    return;
  end if;

  return query select true, null::text;
end;
$$;

revoke all on function public.dismiss_report(uuid, text) from public, anon;
grant execute on function public.dismiss_report(uuid, text) to authenticated;

/**
 * Mark a forum reply as checked by a reviewer, or take the mark off.
 *
 * The only place in the forum where anything carries authority. It records who
 * did it, so the claim belongs to a named person rather than to the app.
 */
drop function if exists public.verify_forum_reply(uuid, boolean);
create function public.verify_forum_reply(p_reply_id uuid, p_verified boolean default true)
returns table (o_success boolean, o_error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null or not public.is_moderator() then
    return query select false, 'Only a reviewer or admin can do that.'::text;
    return;
  end if;

  update public.forum_replies
     set verified_by = case when p_verified then v_user_id else null end,
         verified_at = case when p_verified then now() else null end,
         updated_at  = now()
   where id = p_reply_id;

  if not found then
    return query select false, 'That reply no longer exists.'::text;
    return;
  end if;

  return query select true, null::text;
end;
$$;

revoke all on function public.verify_forum_reply(uuid, boolean) from public, anon;
grant execute on function public.verify_forum_reply(uuid, boolean) to authenticated;

/** The moderation queue: open reports with enough context to act on them. */
drop function if exists public.get_moderation_queue();
create function public.get_moderation_queue()
returns table (
  o_report_id   uuid,
  o_target_kind text,
  o_target_id   uuid,
  o_reason      text,
  o_detail      text,
  o_reported_at timestamptz,
  o_report_count int,
  o_author_name text,
  o_excerpt     text,
  o_status      content_status
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_moderator() then
    return;
  end if;

  return query
  select
    r.id,
    r.target_kind,
    r.target_id,
    r.reason,
    r.detail,
    r.created_at,
    (select count(*)::int from public.content_reports r2
      where r2.target_kind = r.target_kind and r2.target_id = r.target_id),
    coalesce(c.author_name, 'Unknown'),
    left(coalesce(c.excerpt, ''), 500),
    c.status
  from public.content_reports r
  left join lateral (
    select p.display_name as author_name, t.title || E'\n' || t.body as excerpt, t.status
      from public.forum_topics t join public.profiles p on p.id = t.author_id
     where r.target_kind = 'forum_topic' and t.id = r.target_id
    union all
    select p.display_name, fr.body, fr.status
      from public.forum_replies fr join public.profiles p on p.id = fr.author_id
     where r.target_kind = 'forum_reply' and fr.id = r.target_id
    union all
    select p.display_name, q.title || E'\n' || q.body, q.status
      from public.mentor_questions q join public.profiles p on p.id = q.asker_id
     where r.target_kind = 'mentor_question' and q.id = r.target_id
    union all
    select p.display_name, a.body, a.status
      from public.mentor_answers a join public.profiles p on p.id = a.mentor_id
     where r.target_kind = 'mentor_answer' and a.id = r.target_id
  ) c on true
  where r.resolved_at is null
  order by r.created_at;
end;
$$;

revoke all on function public.get_moderation_queue() from public, anon;
grant execute on function public.get_moderation_queue() to authenticated;

-- ---------------------------------------------------------------------------
-- Follow-ups
-- ---------------------------------------------------------------------------
-- a) No age gating on posting. `profiles.age_range` is self-reported at
--    onboarding and never verified; gating on it would look like a safeguard
--    without being one. Real age assurance is the prerequisite, not more SQL.
-- b) No notifications. A mentor has to visit the tab to see open questions, and
--    an asker has to come back to see an answer.
-- c) Moderators are notified of nothing either. The queue is a page they visit.
--    An email or push on first report of an item is the obvious next step.
-- d) `content_reports.target_id` has no foreign key, so nothing stops a report
--    pointing at an id that was hard-deleted. `get_moderation_queue` renders
--    those with a null excerpt rather than dropping them.
