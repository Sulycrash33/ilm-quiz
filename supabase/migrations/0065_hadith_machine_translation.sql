-- ---------------------------------------------------------------------------
-- 0065 — Machine translation is allowed for hadith, at the owner's request.
-- ---------------------------------------------------------------------------
--
-- 0047 forbade this, at length and for good reasons, and those reasons have
-- not changed. Repeating them here so that nobody reading this file has to go
-- and find them: a question is the app's own words about Islam, but a
-- narration is a claim about what the Prophet ﷺ said, carrying a chain and a
-- grading; published translations of Bukhari and Muslim already exist and are
-- what people cite; and the guard the question pipeline relies on — that a
-- mistranslation must not change which answer is correct — has no equivalent
-- here, because there is nothing to check the output against.
--
-- The owner has read that and decided to turn it on anyway, for testing, on
-- 2026-09-10, with one account in existence and nobody else using the app:
-- *"allow machine translation just for testing sake — when I want it stopped
-- I will let you know."* That is their call to make. This migration is the
-- narrowest thing that does what was asked.
--
-- ── The one rule that is not negotiable ───────────────────────────────────
-- **A machine may only write a locale that is empty.** The owner's own framing
-- — "the machine translation will affect only those not translated" — is also
-- the safety property, so it is enforced in the database rather than in the
-- worker: `complete_hadith_translation` inserts with `on conflict do nothing`.
-- No published edition, no hand-typed row, and no earlier machine row can be
-- overwritten by this path. There is no update statement in this file.
--
-- ── Why `is_machine` survives, when the rest of the ceremony did not ──────
-- The owner asked, reasonably, whether a single tester needs flags and
-- markers. They do not need most of it: there is no queue table here, no
-- trigger, no cron, and no badge on the card. What is kept is one boolean,
-- because "when I want it stopped I will let you know" has to be actionable,
-- and without it there is no way to tell a model's Hausa from the 62 rows a
-- person typed. With it, stopping is one line:
--
--     delete from public.hadith_translations where is_machine;
--
-- and the imported editions are untouchable by that statement.
-- ---------------------------------------------------------------------------

alter table public.hadith_translations
  add column if not exists is_machine boolean not null default false;

comment on column public.hadith_translations.is_machine is
  'True when this row was written by a model rather than imported from a published edition or typed at /admin/hadiths. See 0065. Delete where this is true to undo every machine translation.';

comment on table public.hadith_translations is
  'Hadith text per locale. Imported from a published edition or typed by hand; a model may fill a locale that is empty (see 0065, is_machine) but may never overwrite one. A missing locale falls back to English on read.';

-- ---------------------------------------------------------------------------
-- What is missing, and therefore what may be written.
--
-- Enumerates (hadith, locale) pairs that have no row at all, in the order the
-- daily rotation walks the collection. English is excluded as a target: it is
-- the source, and it is present for all 386 active narrations.
--
-- `p_reference` narrows to one narration, and it is here because without it
-- the feature could not be tested at all. On the day this was built there were
-- 324 Hausa gaps and the hadith actually on screen was the **209th** of them;
-- on a key capped at twenty calls a day, reaching it by walking the list would
-- have taken a fortnight. Testing a translation you cannot look at is not
-- testing it.
-- ---------------------------------------------------------------------------
create or replace function public.hadith_translation_candidates(
  p_limit     integer default 10,
  p_locale    public.app_language default null,
  p_reference text default null
)
returns table (
  o_hadith_id   uuid,
  o_locale      public.app_language,
  o_source_text text,
  o_reference   text
)
language sql
stable
security definer
set search_path = public
as $$
  select h.id, l.locale, en.text, h.reference
    from public.hadiths h
    join public.hadith_translations en
      on en.hadith_id = h.id and en.locale = 'en'
    cross join unnest(enum_range(null::public.app_language)) as l(locale)
   where h.is_active
     and l.locale <> 'en'
     and (p_locale is null or l.locale = p_locale)
     and (p_reference is null or h.reference = p_reference)
     and not exists (
       select 1
         from public.hadith_translations t
        where t.hadith_id = h.id
          and t.locale = l.locale
     )
   order by h.position, h.id, l.locale
   limit greatest(coalesce(p_limit, 10), 0);
$$;

comment on function public.hadith_translation_candidates(integer, public.app_language, text) is
  'Hadith/locale pairs with no text at all. The only thing a machine is permitted to fill. p_reference targets one narration, which is how the hadith actually on screen today can be reached without walking the whole collection. See 0065.';

-- ---------------------------------------------------------------------------
-- Write one, or refuse.
--
-- Returns true only when a row was actually inserted. Every refusal is silent
-- to the caller beyond that false, because there is nothing for a worker to do
-- about any of them: a locale that filled up while the batch was in flight is
-- a success for the person who filled it, and a model that returned nothing
-- useful should simply be tried again another day.
--
-- The attribution is **copied from the English row, never translated**. It
-- carries the reference number — "Sahih al-Bukhari 6469" — and a model that
-- paraphrases a citation while translating the text around it would attach a
-- narration to the wrong number, which is the one error here that could not be
-- spotted by reading the result.
-- ---------------------------------------------------------------------------
create or replace function public.complete_hadith_translation(
  p_hadith_id uuid,
  p_locale    public.app_language,
  p_text      text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attribution text;
begin
  -- English is the source. Nothing may write over it through this path.
  if p_locale is null or p_locale = 'en' then
    return false;
  end if;

  -- A model that returns a sentence fragment, an apology or an empty string
  -- must not become a hadith. Twenty characters is far below the shortest real
  -- narration in the table and well above any of those.
  if p_text is null or length(btrim(p_text)) < 20 then
    return false;
  end if;

  select en.attribution into v_attribution
    from public.hadith_translations en
   where en.hadith_id = p_hadith_id
     and en.locale = 'en';

  if v_attribution is null then
    return false;
  end if;

  -- The whole safety property, in one clause. Not an update, not an upsert.
  insert into public.hadith_translations (hadith_id, locale, text, attribution, is_machine)
  values (p_hadith_id, p_locale, btrim(p_text), v_attribution, true)
  on conflict (hadith_id, locale) do nothing;

  return found;
end;
$$;

comment on function public.complete_hadith_translation(uuid, public.app_language, text) is
  'Fills an empty hadith locale with model output and marks it is_machine. Refuses English, short text, and any locale that already has a row. See 0065.';

-- Neither function is for a browser. The worker runs as the service role.
revoke all on function public.hadith_translation_candidates(integer, public.app_language, text) from public, anon, authenticated;
revoke all on function public.complete_hadith_translation(uuid, public.app_language, text) from public, anon, authenticated;
grant execute on function public.hadith_translation_candidates(integer, public.app_language, text) to service_role;
grant execute on function public.complete_hadith_translation(uuid, public.app_language, text) to service_role;
