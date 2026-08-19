-- Migration 0015: Tell a moderator when something is reported.
--
-- Migration 0014 shipped the moderation queue as a page someone has to
-- remember to visit. With one user that is fine. The moment the forum has
-- traffic it is the weak point in the whole design: content stays up because
-- nobody looked, not because anybody decided it should.
--
-- This adds the missing signal, on the *first* report of a given item.
--
-- WHY FIRST REPORT, NOT EVERY REPORT
-- A popular thread going wrong draws ten reports in a minute. Ten alerts for
-- one decision trains whoever is on the other end to ignore them. The first
-- report is the one that carries information: something needs a look. Every
-- report after that still lands in the queue and still bumps the count shown
-- next to the item, it just does not ring the bell again.
--
-- The alert clears when the item's reports are resolved, so the same item can
-- raise a fresh alert if it is reported again later.
--
-- WHAT "NOTIFY" MEANS HERE
-- Two channels, and only one of them needs anything configured:
--
--   In-app  A count of items awaiting a decision, badged on the admin
--           dashboard. Works today, no setup, no external service.
--   Email   Sent by the Next.js server action after a successful report, but
--           only when RESEND_API_KEY and MODERATION_ALERT_EMAIL are both set.
--           Unset, it is silently skipped. See src/lib/moderation-notify.ts.
--
-- WHY THE FIRST-REPORT FLAG IS NOT A SECRET LEAK
-- `report_content` deliberately tells the *caller* nothing about whether their
-- report was the first — otherwise the report button becomes a way to probe
-- what is already in the queue. That property is preserved: `o_notify` is read
-- by the server action, which runs on the server, and the value never reaches
-- the browser. The client still gets `{ success }` and nothing else.

-- ---------------------------------------------------------------------------
-- 1. One row per item awaiting a decision
-- ---------------------------------------------------------------------------
-- The primary key is what makes the alert exactly-once: two people reporting
-- the same post in the same instant both try to insert, one wins, one conflicts,
-- and only the winner is told to notify.

create table if not exists public.moderation_alerts (
  target_kind       text not null check (target_kind in ('forum_topic', 'forum_reply', 'mentor_question', 'mentor_answer')),
  target_id         uuid not null,
  first_reported_at timestamptz not null default now(),
  primary key (target_kind, target_id)
);

comment on table public.moderation_alerts is
  'One row per piece of content with at least one unresolved report. Created by report_content on the first report, deleted by moderate_content/dismiss_report once nothing is outstanding. The primary key makes the "first report" decision exactly-once under concurrency.';

grant select on public.moderation_alerts to authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.moderation_alerts from authenticated, anon;
revoke all on public.moderation_alerts from anon;

alter table public.moderation_alerts enable row level security;

drop policy if exists "Moderators can read alerts" on public.moderation_alerts;
create policy "Moderators can read alerts"
  on public.moderation_alerts for select to authenticated
  using (public.is_moderator());

-- Backfill: anything already reported and still unresolved is awaiting a
-- decision, so it belongs in the table. Nothing is notified for these — they
-- predate the alert and the badge will show them from now on.
insert into public.moderation_alerts (target_kind, target_id, first_reported_at)
select r.target_kind, r.target_id, min(r.created_at)
from public.content_reports r
where r.resolved_at is null
group by r.target_kind, r.target_id
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 2. Reporting raises the alert
-- ---------------------------------------------------------------------------
-- Widens the OUT parameters, so the function is dropped rather than replaced.
-- Existing callers keep working: they read `o_success` and `o_error` by name
-- and both are still there.

drop function if exists public.report_content(text, uuid, text, text);
create function public.report_content(
  p_kind text,
  p_id uuid,
  p_reason text,
  p_detail text default null
)
returns table (o_success boolean, o_error text, o_notify boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_exists boolean;
  v_notify boolean;
begin
  if v_user_id is null then
    return query select false, 'You must be signed in.'::text, false;
    return;
  end if;

  case p_kind
    when 'forum_topic'     then select exists(select 1 from public.forum_topics     where id = p_id) into v_exists;
    when 'forum_reply'     then select exists(select 1 from public.forum_replies    where id = p_id) into v_exists;
    when 'mentor_question' then select exists(select 1 from public.mentor_questions where id = p_id) into v_exists;
    when 'mentor_answer'   then select exists(select 1 from public.mentor_answers   where id = p_id) into v_exists;
    else
      return query select false, 'Unknown content type.'::text, false;
      return;
  end case;

  if not v_exists then
    return query select false, 'That post no longer exists.'::text, false;
    return;
  end if;

  insert into public.content_reports (reporter_id, target_kind, target_id, reason, detail)
  values (v_user_id, p_kind, p_id, p_reason, nullif(btrim(coalesce(p_detail, '')), ''))
  on conflict (reporter_id, target_kind, target_id) do nothing;

  -- Raise the alert if nobody has already raised it for this item. `returning`
  -- yields no row on conflict, so v_notify stays null and becomes false.
  insert into public.moderation_alerts (target_kind, target_id)
  values (p_kind, p_id)
  on conflict (target_kind, target_id) do nothing
  returning true into v_notify;

  -- The caller is told the report landed and nothing else. o_notify is for the
  -- server action; see the header.
  return query select true, null::text, coalesce(v_notify, false);
end;
$$;

revoke all on function public.report_content(text, uuid, text, text) from public, anon;
grant execute on function public.report_content(text, uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Acting on it clears the alert
-- ---------------------------------------------------------------------------
-- Both moderator paths end the same way: if the item has no unresolved reports
-- left, it is no longer awaiting a decision, so its alert row goes. Reporting it
-- again later raises a fresh one.

create or replace function public.clear_moderation_alert(p_kind text, p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.moderation_alerts a
   where a.target_kind = p_kind
     and a.target_id = p_id
     and not exists (
       select 1 from public.content_reports r
       where r.target_kind = p_kind and r.target_id = p_id and r.resolved_at is null
     );
$$;

revoke all on function public.clear_moderation_alert(text, uuid) from public, anon;

create or replace function public.moderate_content(
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

  perform public.clear_moderation_alert(p_kind, p_id);

  return query select true, null::text;
end;
$$;

revoke all on function public.moderate_content(text, uuid, content_status, text) from public, anon;
grant execute on function public.moderate_content(text, uuid, content_status, text) to authenticated;

create or replace function public.dismiss_report(p_report_id uuid, p_note text default null)
returns table (o_success boolean, o_error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_kind text;
  v_target uuid;
begin
  if v_user_id is null or not public.is_moderator() then
    return query select false, 'Only a reviewer or admin can do that.'::text;
    return;
  end if;

  update public.content_reports
     set resolved_at = now(), resolved_by = v_user_id,
         resolution = coalesce(nullif(btrim(coalesce(p_note, '')), ''), 'dismissed')
   where id = p_report_id and resolved_at is null
  returning target_kind, target_id into v_kind, v_target;

  if v_kind is null then
    return query select false, 'That report is already resolved.'::text;
    return;
  end if;

  -- Only clears if this was the last one outstanding on that item.
  perform public.clear_moderation_alert(v_kind, v_target);

  return query select true, null::text;
end;
$$;

revoke all on function public.dismiss_report(uuid, text) from public, anon;
grant execute on function public.dismiss_report(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. The badge
-- ---------------------------------------------------------------------------
-- Two numbers, both for moderators only: items awaiting a decision, and mentor
-- applications waiting. Non-moderators get zeros rather than an error, so a
-- shared layout can call it without branching.

drop function if exists public.get_moderation_alert_counts();
create function public.get_moderation_alert_counts()
returns table (o_reports int, o_applications int)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_moderator() then
    return query select 0, 0;
    return;
  end if;

  return query
  select
    (select count(*)::int from public.moderation_alerts),
    (select count(*)::int from public.mentor_profiles where status = 'pending');
end;
$$;

revoke all on function public.get_moderation_alert_counts() from public, anon;
grant execute on function public.get_moderation_alert_counts() to authenticated;
