-- Fire the streak reminders once a day.
--
-- The database decides who needs a nudge (`streak_reminder_candidates`, 0026)
-- but it cannot deliver one: Web Push needs an ES256-signed VAPID JWT and a
-- body encrypted to each subscription's own key. That work lives in the
-- `send-streak-reminders` edge function. This is the clock that calls it.

create extension if not exists pg_net;

/**
 * Calls the sender.
 *
 * Both the URL and the service-role key come from Vault rather than being
 * written into this migration. A service-role key committed to a repository is
 * a full-database credential in version control forever, and hardcoding the
 * project URL would make this migration wrong the moment it is applied to a
 * staging project.
 *
 * Set them once per environment:
 *
 *   select vault.create_secret('https://<ref>.supabase.co/functions/v1',
 *                              'functions_base_url');
 *   select vault.create_secret('<service-role-key>', 'service_role_key');
 *
 * Until both exist the job runs and does nothing but log why, which is the
 * right failure: a missing secret should be visible in `cron.job_run_details`,
 * not a silent daily no-op.
 */
create or replace function public.cron_send_streak_reminders()
returns void
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  v_url text;
  v_key text;
begin
  select decrypted_secret into v_url
  from vault.decrypted_secrets where name = 'functions_base_url';

  select decrypted_secret into v_key
  from vault.decrypted_secrets where name = 'service_role_key';

  if v_url is null or v_key is null then
    raise warning 'streak reminders not sent: set the functions_base_url and service_role_key vault secrets';
    return;
  end if;

  -- Fire and forget. pg_net queues the request and returns immediately, so a
  -- slow push service can never hold a cron worker open; the function's own
  -- response is recorded in `net._http_response` if it is ever needed.
  perform net.http_post(
    url     := v_url || '/send-streak-reminders',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := '{}'::jsonb
  );
end;
$$;

revoke all on function public.cron_send_streak_reminders() from public, anon, authenticated;

-- 17:00 UTC — early evening across West Africa and the Gulf, which is where
-- this app's players are. A reminder has to arrive while there is still a day
-- left to act on it; one at midnight is a notification about a streak that has
-- already broken.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'ilm-streak-reminders') then
    perform cron.unschedule('ilm-streak-reminders');
  end if;
end;
$$;

select cron.schedule('ilm-streak-reminders', '0 17 * * *', $job$ select public.cron_send_streak_reminders(); $job$);
