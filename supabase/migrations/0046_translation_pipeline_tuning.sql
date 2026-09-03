-- ---------------------------------------------------------------------------
-- 0046 — What running the pipeline for real taught it.
-- ---------------------------------------------------------------------------
--
-- 0045 was tested against the database: the queue, the claim, the validation
-- and the retry path were all verified before it shipped. What it was never
-- tested against was the model, because there was no API key yet. The first
-- real batch found two things no amount of reading the code would have.
--
-- 1. THE BATCH SIZE WAS A GUESS, AND IT WAS WRONG.
--    Twenty per invocation was chosen before anything had been timed. Measured,
--    one translation takes roughly forty seconds, so the first real batch of
--    five was killed by the edge function's wall clock partway through its
--    fifth item. The HTTP response never arrived and that row stayed `claimed`
--    until the ten-minute reclaim swept it up — the design degraded correctly,
--    but it degraded on every single run.
--
--    Three fits comfortably. The cron tick every five minutes is what supplies
--    throughput, not the batch size.
--
-- 2. THE KEY FORMAT DECIDES THE HEADER.
--    The legacy `service_role` key is a JWT and goes on `Authorization:
--    Bearer`. The newer `sb_secret_...` keys are not JWTs, and Supabase's own
--    migration guide is explicit that the functions gateway rejects them
--    there — they must be sent as `apikey` instead, which it calls out
--    specifically for pg_net. A project holding the newer key would have got
--    an identical-looking 401 to the one a wrong key gives.
--
--    Branching on the format means either key works with nothing else changing.

-- ---------------------------------------------------------------------------
-- Handing back a claim without spending a retry
-- ---------------------------------------------------------------------------
--
-- `claim_translation_batch` increments `attempts` when it hands a row out. A
-- row the worker ran out of time to reach would therefore burn one of its three
-- attempts having never been sent to the model at all, and three unlucky
-- batches would mark it `failed` for a fault entirely of the scheduler's.

create or replace function public.release_translation_claim(
  p_question_id uuid,
  p_locale public.app_language
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.translation_queue
     set status = 'queued',
         attempts = greatest(0, attempts - 1),
         claimed_at = null,
         updated_at = now()
   where question_id = p_question_id
     and locale = p_locale
     and status = 'in_progress';
end;
$$;

comment on function public.release_translation_claim(uuid, public.app_language) is
  'Returns an unprocessed claim to the queue and refunds the attempt that claiming spent. For rows a worker could not reach before its deadline.';

revoke all on function public.release_translation_claim(uuid, public.app_language) from public, anon, authenticated;
grant execute on function public.release_translation_claim(uuid, public.app_language) to service_role;

-- ---------------------------------------------------------------------------
-- The schedule, retuned
-- ---------------------------------------------------------------------------

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

  -- See the note at the top: a JWT goes on Authorization, a secret key on
  -- apikey, and sending either on the wrong one is a silent 401.
  if v_key like 'eyJ%' then
    v_headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || v_key);
  else
    v_headers := jsonb_build_object('Content-Type','application/json','apikey', v_key);
  end if;

  perform net.http_post(
    url     := v_base || '/translate-questions',
    headers := v_headers,
    body    := jsonb_build_object('limit', 3),
    -- Longer than the worker's own 110s deadline, so pg_net records the
    -- worker's summary rather than timing out on a run that succeeded.
    timeout_milliseconds := 150000
  );
end;
$$;

revoke all on function public.cron_run_translations() from public, anon, authenticated;
