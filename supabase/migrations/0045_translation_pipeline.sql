-- ---------------------------------------------------------------------------
-- 0045 — Content translates itself.
-- ---------------------------------------------------------------------------
--
-- 0044 built the shelf; this fills it, and keeps filling it. The agreed
-- workflow is that the owner writes a question once, in English, and the five
-- other languages appear without anyone asking for them. Nothing here is
-- triggered by a player: a translation is produced when content is *written*,
-- not when a language is *selected*, so switching language is instant, works
-- offline, and costs nothing per view.
--
-- THE SHAPE
--
--   questions (insert or update)
--        │  trigger
--        ▼
--   translation_queue           one row per (question, target locale)
--        │  claimed in batches
--        ▼
--   edge function               calls the model, once per locale
--        │
--        ▼
--   question_translations       via the same validation the admin path uses
--
-- A queue rather than a direct call, for three reasons. The write that
-- enqueues must not wait on a model. A failed translation must be retryable
-- without re-saving the question. And 5,220 questions × 5 locales is 26,100
-- units of work, which has to be drained at a controlled rate rather than
-- attempted at once.

create type public.translation_status as enum ('queued', 'in_progress', 'done', 'failed');

create table if not exists public.translation_queue (
  question_id uuid not null references public.questions(id) on delete cascade,
  locale      public.app_language not null,
  status      public.translation_status not null default 'queued',

  -- Bounded retries. A question whose translation keeps failing validation is
  -- a question with something wrong in it, and retrying forever would burn
  -- model spend on the same failure every five minutes until someone noticed
  -- the bill.
  attempts    int not null default 0,
  last_error  text,

  claimed_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  primary key (question_id, locale),
  constraint translation_queue_not_english check (locale <> 'en')
);

create index if not exists translation_queue_pending_idx
  on public.translation_queue (status, updated_at)
  where status in ('queued', 'in_progress');

alter table public.translation_queue enable row level security;
revoke all on public.translation_queue from anon, authenticated;
-- No policy: the queue is machinery, not content. Admin visibility goes
-- through the summary function at the end of this file.

-- ---------------------------------------------------------------------------
-- One place that decides whether a translation is safe to publish
-- ---------------------------------------------------------------------------
--
-- Extracted from `admin_upsert_question_translation` (0044) so the automatic
-- path and the by-hand path cannot drift. Translations publish without review,
-- which is the owner's call and a reasonable one — but it means these checks
-- are the only thing standing between a bad translation and a player being
-- marked wrong for a right answer. They must be identical whoever writes.
--
-- Returns null when the translation is acceptable, or the reason it is not.

create or replace function public.translation_rejection_reason(
  p_question_id uuid,
  p_text        text,
  p_choices     jsonb
)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_q record;
begin
  select q.choices into v_q from public.questions q where q.id = p_question_id;
  if not found then return 'Question not found.'; end if;

  if p_choices is null or jsonb_typeof(p_choices) <> 'array' then
    return 'Choices must be an array.';
  end if;

  -- `correct_choice_index` indexes into the ENGLISH array. A translation with
  -- a different number of options silently repoints the correct answer at
  -- whatever now sits at that position.
  if jsonb_array_length(p_choices) <> jsonb_array_length(v_q.choices) then
    return format('Expected %s choices, got %s.',
                  jsonb_array_length(v_q.choices), jsonb_array_length(p_choices));
  end if;

  -- The fard/sunnah collapse. Two distinct rulings rendered with one word
  -- leaves the player no correct option to pick, and the app then teaches them
  -- that the right answer was wrong.
  if (select count(distinct value) from jsonb_array_elements_text(p_choices))
     <> jsonb_array_length(p_choices) then
    return 'Two or more translated choices are identical.';
  end if;

  if (select bool_or(btrim(value) = '') from jsonb_array_elements_text(p_choices)) then
    return 'A translated choice is empty.';
  end if;

  if btrim(coalesce(p_text, '')) = '' then
    return 'The translated question is empty.';
  end if;

  return null;
end;
$$;

comment on function public.translation_rejection_reason(uuid, text, jsonb) is
  'Null when a translation may be published, otherwise why not. The single gate for both the automatic and the by-hand write paths.';

-- ---------------------------------------------------------------------------
-- Enqueueing
-- ---------------------------------------------------------------------------

create or replace function public.enqueue_question_translations(p_question_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  -- Every locale except English, minus the ones a person has taken ownership
  -- of. A hand-edited translation is never re-drafted: the upsert would refuse
  -- it anyway, so queueing it would mean retrying a guaranteed failure on a
  -- schedule. It is reported as stale through `admin_question_translations`
  -- instead, which is where a person will actually look.
  insert into public.translation_queue as q (question_id, locale, status, attempts, last_error, updated_at)
  select p_question_id, l, 'queued', 0, null, now()
    from unnest(enum_range(null::public.app_language)) l
   where l <> 'en'
     and not exists (
       select 1 from public.question_translations t
        where t.question_id = p_question_id and t.locale = l and t.source = 'human'
     )
  on conflict (question_id, locale) do update
     set status = 'queued', attempts = 0, last_error = null, updated_at = now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.questions_enqueue_translations_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only when the translatable text actually moved. Without this guard, any
  -- update at all — a review status change, a scholar approval, the
  -- `updated_at` touch — would re-translate the whole question into five
  -- languages and pay for it.
  if tg_op = 'INSERT'
     or new.question_text is distinct from old.question_text
     or new.choices      is distinct from old.choices
     or new.explanation  is distinct from old.explanation
  then
    perform public.enqueue_question_translations(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists questions_enqueue_translations on public.questions;
create trigger questions_enqueue_translations
  after insert or update on public.questions
  for each row execute function public.questions_enqueue_translations_trigger();

-- ---------------------------------------------------------------------------
-- The worker's two calls
-- ---------------------------------------------------------------------------

create or replace function public.claim_translation_batch(p_limit int default 20)
returns table (
  o_question_id uuid,
  o_locale      public.app_language,
  o_text        text,
  o_choices     jsonb,
  o_explanation text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with picked as (
    select q.question_id, q.locale
      from public.translation_queue q
     where q.status = 'queued'
        -- A row claimed but never completed is a worker that died mid-flight.
        -- Ten minutes is comfortably longer than a batch takes and short
        -- enough that a crash costs one cron tick, not a day.
        or (q.status = 'in_progress' and q.claimed_at < now() - interval '10 minutes')
     order by q.updated_at
     limit greatest(1, least(coalesce(p_limit, 20), 100))
     -- Two overlapping cron ticks must not translate the same row twice and
     -- pay twice.
     for update skip locked
  ),
  claimed as (
    update public.translation_queue t
       set status = 'in_progress', claimed_at = now(), updated_at = now(),
           attempts = t.attempts + 1
      from picked p
     where t.question_id = p.question_id and t.locale = p.locale
     returning t.question_id, t.locale
  )
  select c.question_id, c.locale, qs.question_text, qs.choices, qs.explanation
    from claimed c
    join public.questions qs on qs.id = c.question_id;
end;
$$;

create or replace function public.complete_translation(
  p_question_id uuid,
  p_locale      public.app_language,
  p_text        text,
  p_choices     jsonb,
  p_explanation text default null,
  p_error       text default null
)
returns table (o_success boolean, o_error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reason text;
  v_human boolean;
  v_q record;
begin
  -- The model itself failed or was unreachable.
  if p_error is not null then
    update public.translation_queue
       -- The cast is load-bearing. Without it the CASE yields `text`, the
       -- assignment to an enum column raises, and every refused or failed
       -- translation throws instead of being retried. Caught by testing the
       -- rejection path rather than only the happy one.
       set status = (case when attempts >= 3 then 'failed' else 'queued' end)::public.translation_status,
           last_error = p_error, updated_at = now(), claimed_at = null
     where question_id = p_question_id and locale = p_locale;
    return query select false, p_error;
    return;
  end if;

  select exists (
    select 1 from public.question_translations t
     where t.question_id = p_question_id and t.locale = p_locale and t.source = 'human'
  ) into v_human;

  -- A person edited this while the batch was in flight. Their text wins, and
  -- the queue row is finished rather than retried.
  if v_human then
    update public.translation_queue
       set status = 'done', last_error = 'Kept the hand-edited translation.',
           updated_at = now(), claimed_at = null
     where question_id = p_question_id and locale = p_locale;
    return query select true, null::text;
    return;
  end if;

  v_reason := public.translation_rejection_reason(p_question_id, p_text, p_choices);

  if v_reason is not null then
    -- Refused. The question stays English in this locale, which is a working
    -- fallback, and the row lands on the "needs a look" list.
    update public.translation_queue
       -- The cast is load-bearing. Without it the CASE yields `text`, the
       -- assignment to an enum column raises, and every refused or failed
       -- translation throws instead of being retried. Caught by testing the
       -- rejection path rather than only the happy one.
       set status = (case when attempts >= 3 then 'failed' else 'queued' end)::public.translation_status,
           last_error = v_reason, updated_at = now(), claimed_at = null
     where question_id = p_question_id and locale = p_locale;
    return query select false, v_reason;
    return;
  end if;

  select q.question_text, q.choices, q.explanation into v_q
    from public.questions q where q.id = p_question_id;

  insert into public.question_translations as t (
    question_id, locale, question_text, choices, explanation,
    source, source_fingerprint, updated_at
  )
  values (
    p_question_id, p_locale, p_text, p_choices, p_explanation,
    'machine',
    public.question_fingerprint(v_q.question_text, v_q.choices, v_q.explanation),
    now()
  )
  on conflict (question_id, locale) do update
     set question_text = excluded.question_text,
         choices       = excluded.choices,
         explanation   = excluded.explanation,
         source        = 'machine',
         source_fingerprint = excluded.source_fingerprint,
         updated_at    = now()
   where t.source <> 'human';

  update public.translation_queue
     set status = 'done', last_error = null, updated_at = now(), claimed_at = null
   where question_id = p_question_id and locale = p_locale;

  return query select true, null::text;
end;
$$;

revoke all on function public.claim_translation_batch(int) from public, anon, authenticated;
revoke all on function public.complete_translation(uuid, public.app_language, text, jsonb, text, text) from public, anon, authenticated;
grant execute on function public.claim_translation_batch(int) to service_role;
grant execute on function public.complete_translation(uuid, public.app_language, text, jsonb, text, text) to service_role;

-- ---------------------------------------------------------------------------
-- Admin: fill the queue, and see what it is doing
-- ---------------------------------------------------------------------------

create or replace function public.admin_enqueue_all_translations()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
begin
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then
    raise exception 'Admins only.';
  end if;

  -- One statement, not a loop over 5,220 questions calling a function that
  -- inserts five rows each. The loop was 26,100 round trips inside one
  -- transaction and would have timed out over HTTP long before it finished.
  insert into public.translation_queue as q (question_id, locale, status, attempts, last_error, updated_at)
  select qs.id, l, 'queued', 0, null, now()
    from public.questions qs
   cross join unnest(enum_range(null::public.app_language)) l
   where qs.review_status = 'published'
     and l <> 'en'
     and not exists (
       select 1 from public.question_translations t
        where t.question_id = qs.id and t.locale = l and t.source = 'human'
     )
  on conflict (question_id, locale) do update
     set status = 'queued', attempts = 0, last_error = null, updated_at = now();

  get diagnostics v_total = row_count;
  return v_total;
end;
$$;

revoke all on function public.admin_enqueue_all_translations() from public, anon;
grant execute on function public.admin_enqueue_all_translations() to authenticated;

create or replace function public.admin_translation_progress()
returns table (o_locale public.app_language, o_status public.translation_status, o_count bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'reviewer')
  ) then
    raise exception 'Admins only.';
  end if;

  return query
    select q.locale, q.status, count(*)
      from public.translation_queue q
     group by q.locale, q.status
     order by q.locale, q.status;
end;
$$;

revoke all on function public.admin_translation_progress() from public, anon;
grant execute on function public.admin_translation_progress() to authenticated;


-- ---------------------------------------------------------------------------
-- The schedule
-- ---------------------------------------------------------------------------
--
-- Same shape as `cron_send_streak_reminders` in 0027, and it reads the same
-- two vault secrets. `functions_base_url` is set; `service_role_key` is the
-- one thing still missing, and setting it also wakes the streak reminders that
-- have been dormant since 0027 for exactly this reason. Until it is set this
-- job raises a warning and does nothing, which is the honest failure: a queue
-- that fills and never drains is visible on the admin page, where a silent
-- no-op would not be.
--
-- Every five minutes rather than daily. 26,100 units of backfill at twenty a
-- batch is a long grind, and new content should appear in the other five
-- languages while the person who wrote it is still at their desk.

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
begin
  select count(*) into v_pending
    from public.translation_queue
   where status = 'queued'
      or (status = 'in_progress' and claimed_at < now() - interval '10 minutes');

  -- Nothing to do: do not wake the function, and do not pay for the invocation.
  if v_pending = 0 then return; end if;

  select decrypted_secret into v_base
    from vault.decrypted_secrets where name = 'functions_base_url';
  select decrypted_secret into v_key
    from vault.decrypted_secrets where name = 'service_role_key';

  if v_base is null or v_key is null then
    raise warning 'translations not run: set the functions_base_url and service_role_key vault secrets';
    return;
  end if;

  perform net.http_post(
    url     := v_base || '/translate-questions',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'Authorization', 'Bearer ' || v_key
               ),
    body    := jsonb_build_object('limit', 20)
  );
end;
$$;

revoke all on function public.cron_run_translations() from public, anon, authenticated;

select cron.unschedule('ilm-translations') where exists (
  select 1 from cron.job where jobname = 'ilm-translations'
);
select cron.schedule('ilm-translations', '*/5 * * * *', $job$ select public.cron_run_translations(); $job$);

-- The "needs a look" list, through a function for the same reason the progress
-- summary is: `translation_queue` grants nothing to `authenticated` and has no
-- select policy, so a direct read returns nothing even for an admin.
create or replace function public.admin_translation_failures(p_limit int default 50)
returns table (
  o_question_id uuid,
  o_locale public.app_language,
  o_question_text text,
  o_last_error text,
  o_attempts int
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','reviewer')
  ) then
    raise exception 'Admins only.';
  end if;

  return query
    select q.question_id, q.locale, qs.question_text, q.last_error, q.attempts
      from public.translation_queue q
      join public.questions qs on qs.id = q.question_id
     where q.status = 'failed'
     order by q.updated_at desc
     limit greatest(1, least(coalesce(p_limit, 50), 200));
end;
$$;

revoke all on function public.admin_translation_failures(int) from public, anon;
grant execute on function public.admin_translation_failures(int) to authenticated;
