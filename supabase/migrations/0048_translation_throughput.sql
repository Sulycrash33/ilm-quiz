-- ---------------------------------------------------------------------------
-- 0048 — Turning the backfill from a month into a few days.
-- ---------------------------------------------------------------------------
--
-- 0046 set the batch to three and the tick to five minutes, and both numbers
-- were right for the worker as it then was: strictly sequential, one model call
-- at a time, roughly forty seconds each, inside a 110-second budget. Three fits
-- and four does not.
--
-- Measured, that is about 860 translations a day. The backfill is 5,220
-- published questions in five locales — 26,100 — so it is roughly thirty days
-- of unattended running. Nothing about that is broken; it is simply the
-- arithmetic of doing one thing at a time.
--
-- The worker now draws from its batch with a bounded pool of workers instead,
-- so the number of calls in flight is a dial rather than a consequence of the
-- batch size. That moves the ceiling from "how many fit end to end in 110
-- seconds" to "how many the model will take at once", and the three dials are
-- now independent:
--
--     cron cadence      here                    every 2 minutes
--     batch size        here, the `limit` body  12 per invocation
--     concurrency       TRANSLATE_CONCURRENCY   6 in flight
--
--     12 rows ÷ 6 in flight × ~40s  ≈  80s, inside the 110s budget
--     30 ticks/hour × 12            ≈  8,640/day
--     26,100 ÷ 8,640                ≈  3 days, not 30
--
-- ── Why this is safe to raise, which it was not before ────────────────────
-- Six calls at forty seconds each is about nine requests a minute, and the
-- runs do not overlap: a tick every 120 seconds against a run that finishes in
-- roughly 80.
--
-- The change that actually makes the dial safe, though, is in the worker: a
-- 429 or a 5xx now hands the claim back with its attempt refunded, exactly as
-- running out of wall clock does. Before that, pushing the rate up had a nasty
-- failure mode — `claim_translation_batch` spends an attempt when it hands a
-- row out, three attempts marks a row `failed`, and so three rate-limited
-- minutes could permanently drop perfectly good questions out of the backfill
-- for a fault that was entirely the scheduler's. Now over-driving the model
-- costs throughput and nothing else, and the next tick picks the same rows up.
--
-- If these numbers turn out to be wrong the way twenty was wrong, the response
-- is to measure and change them again. The worker reports `elapsedMs`,
-- `rateLimited` and `released` in its response for exactly that.

create or replace function public.cron_run_translations()
returns void
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  v_base text;
  v_key  text;
  v_pending int;
  v_headers jsonb;
begin
  select count(*) into v_pending
    from public.translation_queue
   where status = 'queued'
      or (status = 'in_progress' and claimed_at < now() - interval '10 minutes');

  -- Nothing to do: do not wake the function, and do not pay for the invocation.
  if v_pending = 0 then return; end if;

  select decrypted_secret into v_base from vault.decrypted_secrets where name = 'functions_base_url';
  select decrypted_secret into v_key  from vault.decrypted_secrets where name = 'service_role_key';

  if v_base is null or v_key is null then
    raise warning 'translations not run: set the functions_base_url and service_role_key vault secrets';
    return;
  end if;

  -- The key format decides the header. A legacy `service_role` key is a JWT and
  -- goes on Authorization; a newer `sb_secret_...` key is not, and the functions
  -- gateway rejects it there. Both wrong ways produce an identical 401.
  if v_key like 'eyJ%' then
    v_headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || v_key);
  else
    v_headers := jsonb_build_object('Content-Type','application/json','apikey', v_key);
  end if;

  perform net.http_post(
    url     := v_base || '/translate-questions',
    headers := v_headers,
    -- Twelve, against six in flight: two waves of roughly forty seconds inside
    -- the worker's own 110-second deadline. Anything the worker cannot reach
    -- before that deadline is handed back with its attempt refunded, so an
    -- over-large batch degrades into a smaller one rather than into failures.
    body    := jsonb_build_object('limit', 12),
    -- Longer than the worker's own 110s deadline, so pg_net records the
    -- worker's summary rather than timing out on a run that succeeded.
    timeout_milliseconds := 150000
  );
end;
$$;

revoke all on function public.cron_run_translations() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- The cadence
-- ---------------------------------------------------------------------------
--
-- Every two minutes rather than every five. The guard at the top of the
-- function means an empty queue still costs one cheap count and no invocation,
-- so a faster tick is only a faster tick while there is work.

select cron.schedule(
  'ilm-translations',
  '*/2 * * * *',
  $cron$ select public.cron_run_translations(); $cron$
);
