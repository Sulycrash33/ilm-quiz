-- Streak reminders: the one thing that brings a player back tomorrow.
--
-- The app had no retention hook of any kind — no notifications, no service
-- worker, nothing that reaches a player who has closed the tab. Streaks were
-- tracked, displayed, and rewarded, and then broke in silence.
--
-- Everything here is opt-in and quiet by design, the same posture as the
-- sound: a learning app that pushes notifications at someone who never asked
-- is a bad guest on their phone, and an Islamic one doubly so.

-- ── Where the browser's push endpoint lives ────────────────────────────────

create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  -- The endpoint URL *is* the identity of a push subscription. It is unique
  -- across the whole push service, so a device that re-subscribes replaces
  -- its old row instead of accumulating duplicates.
  endpoint     text not null unique,
  p256dh       text not null,
  auth         text not null,
  created_at   timestamptz not null default now(),
  last_sent_at timestamptz,
  -- A push service returns 404/410 for an endpoint that no longer exists.
  -- Rows are deleted on those, so this only counts transient trouble.
  failure_count int not null default 0
);

create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id);

comment on table public.push_subscriptions is
  'One row per browser that has agreed to receive streak reminders. Deleted when the push service reports the endpoint is gone.';

alter table public.push_subscriptions enable row level security;

-- A player may see and remove their own subscriptions and nobody else's.
-- Inserts go through `save_push_subscription` rather than a policy, because
-- the upsert-on-endpoint behaviour has to be atomic.
drop policy if exists push_subscriptions_select_own on public.push_subscriptions;
create policy push_subscriptions_select_own on public.push_subscriptions
  for select using (user_id = auth.uid());

drop policy if exists push_subscriptions_delete_own on public.push_subscriptions;
create policy push_subscriptions_delete_own on public.push_subscriptions
  for delete using (user_id = auth.uid());

-- ── The player's choice ────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists streak_reminders_enabled boolean not null default false;

comment on column public.profiles.streak_reminders_enabled is
  'Opt-in, default false. Browser permission alone is not consent to be messaged daily — this is the switch the player actually sees.';

-- ── Storing a subscription ─────────────────────────────────────────────────

create or replace function public.save_push_subscription(
  p_endpoint text,
  p_p256dh   text,
  p_auth     text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in.';
  end if;

  insert into push_subscriptions (user_id, endpoint, p256dh, auth)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth)
  -- Re-subscribing on the same device, or a second account on a shared
  -- browser, both reuse the endpoint. The newest owner wins and the failure
  -- count resets, because this is a live endpoint by definition.
  on conflict (endpoint) do update
    set user_id       = excluded.user_id,
        p256dh        = excluded.p256dh,
        auth          = excluded.auth,
        failure_count = 0;

  update profiles set streak_reminders_enabled = true where id = auth.uid();
end;
$$;

create or replace function public.disable_push_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;
  delete from push_subscriptions where user_id = auth.uid();
  update profiles set streak_reminders_enabled = false where id = auth.uid();
end;
$$;

revoke all on function public.save_push_subscription(text, text, text) from public, anon;
grant execute on function public.save_push_subscription(text, text, text) to authenticated;
revoke all on function public.disable_push_reminders() from public, anon;
grant execute on function public.disable_push_reminders() to authenticated;

-- ── Who actually needs a nudge ─────────────────────────────────────────────

/**
 * The players whose streak breaks today if they do nothing.
 *
 * Deliberately narrow. A reminder is only worth sending when there is
 * something real to lose:
 *   - they have a streak going (`streak_count > 0`) — nagging someone at zero
 *     to start a streak is advertising, not a reminder;
 *   - they have not played today, so the reminder is still actionable;
 *   - they were last active *yesterday*, meaning today is the day it breaks —
 *     a streak already broken two days ago is not urgent, it is over;
 *   - nothing has been sent to that device today, so a device cannot be
 *     messaged twice by two runs of the job.
 */
create or replace function public.streak_reminder_candidates()
returns table (
  o_endpoint     text,
  o_p256dh       text,
  o_auth         text,
  o_display_name text,
  o_streak       int,
  o_language     text
)
language sql
security definer
set search_path = public
as $$
  select s.endpoint, s.p256dh, s.auth,
         coalesce(p.display_name, ''), p.streak_count, p.preferred_language::text
  from push_subscriptions s
  join profiles p on p.id = s.user_id
  where p.streak_reminders_enabled
    and p.streak_count > 0
    and p.last_activity_date = current_date - 1
    and (s.last_sent_at is null or s.last_sent_at < current_date)
    and s.failure_count < 5;
$$;

-- Only the sender calls this. It returns other people's push endpoints, so no
-- client-facing role may execute it — the edge function authenticates with the
-- service role, which is the one role granted here.
revoke all on function public.streak_reminder_candidates() from public, anon, authenticated;
grant execute on function public.streak_reminder_candidates() to service_role;

/**
 * Records the outcome of one send.
 *
 * `p_gone` is for the 404/410 a push service returns once a subscription is
 * genuinely dead — those rows are deleted rather than retried forever.
 */
create or replace function public.record_push_result(p_endpoint text, p_ok boolean, p_gone boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_gone then
    delete from push_subscriptions where endpoint = p_endpoint;
  elsif p_ok then
    update push_subscriptions
       set last_sent_at = now(), failure_count = 0
     where endpoint = p_endpoint;
  else
    update push_subscriptions
       set failure_count = failure_count + 1
     where endpoint = p_endpoint;
  end if;
end;
$$;

revoke all on function public.record_push_result(text, boolean, boolean) from public, anon, authenticated;
grant execute on function public.record_push_result(text, boolean, boolean) to service_role;
