-- ---------------------------------------------------------------------------
-- 0047 — The daily hadith becomes daily, and becomes translatable.
-- ---------------------------------------------------------------------------
--
-- `DAILY_HADITH` was a single hardcoded English constant in `constants.ts`. It
-- showed the same narration every day, and it did not move when the player
-- chose a language, because it never went through the string table or the
-- translation pipeline. Selecting Hausa translated the whole home screen
-- around it and left the one piece of actual religious content in English.
--
-- ── Why this is an importer and not a translator ──────────────────────────
-- Every other piece of content in this app is machine-translated into the five
-- non-English locales and published without human review. A hadith is not
-- eligible for that, and the difference is not a matter of degree.
--
-- A question is the app's own words about Islam. A narration is a claim about
-- what the Prophet ﷺ said, carrying a chain and a grading, and published
-- translations of Bukhari and Muslim already exist and are what people cite.
-- Asking a model to produce Hausa for one would be manufacturing a religious
-- text that nobody has authenticated and attaching a real reference number to
-- it. The pipeline's own guard — that a mistranslation must not change which
-- answer is correct — has no equivalent here: there is nothing to check the
-- output against.
--
-- So this schema deliberately has no queue, no trigger and no worker. Text
-- arrives through `/admin/hadiths`, typed or pasted from a published edition,
-- and a locale with nothing entered stays English rather than being filled in
-- by a machine.
--
-- ── Locale-aware from the first migration ─────────────────────────────────
-- `questions.language` existed from day one holding all six locales, and
-- nothing ever read it, which is why a Hausa player was served English for a
-- year. The lesson taken from that was not "add a language column"; it was
-- that translations belong in their own table, keyed by locale, with the
-- English row no more special than the others. That is the shape here from the
-- start rather than as a later repair.

-- ---------------------------------------------------------------------------
-- The narrations
-- ---------------------------------------------------------------------------

create table if not exists public.hadiths (
  id          uuid primary key default gen_random_uuid(),
  -- The stable identity of the narration, independent of any wording:
  -- 'bukhari:6029'. Unique, so importing the same hadith twice is refused by
  -- the database rather than quietly producing two entries that then take two
  -- days of the rotation between them.
  reference   text not null unique,
  -- Rotation order. Ties break on `id` so the order is total and the same
  -- hadith therefore falls on the same date for every player, on every device.
  position    integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.hadiths is
  'One row per narration. The text lives in hadith_translations, English included.';

create index if not exists hadiths_rotation_idx
  on public.hadiths (position, id) where is_active;

-- ---------------------------------------------------------------------------
-- The text, one row per language
-- ---------------------------------------------------------------------------
--
-- `attribution` is per locale and not derived from `reference`, because the
-- name of the collection is itself translated — "Sahih al-Bukhari 6029" is
-- صحيح البخاري ٦٠٢٩ to an Arabic reader. Deriving it in code would have meant
-- a Latin-script citation sitting under an Arabic quotation, which is the
-- `RANKS` problem the handoff already lists as open.

create table if not exists public.hadith_translations (
  hadith_id   uuid not null references public.hadiths(id) on delete cascade,
  locale      public.app_language not null,
  text        text not null check (length(btrim(text)) > 0),
  attribution text not null check (length(btrim(attribution)) > 0),
  updated_at  timestamptz not null default now(),
  primary key (hadith_id, locale)
);

comment on table public.hadith_translations is
  'Hadith text per locale. Entered by hand from a published edition; never machine-generated. A missing locale falls back to English on read.';

-- ---------------------------------------------------------------------------
-- Reading it
-- ---------------------------------------------------------------------------
--
-- Both tables are world-readable, and unlike `questions` that is a considered
-- position rather than an oversight: a hadith card is meant to be read by
-- anyone who opens the app, and there is no answer key here to leak.

alter table public.hadiths enable row level security;
alter table public.hadith_translations enable row level security;

drop policy if exists "Active hadiths are viewable by everyone" on public.hadiths;
create policy "Active hadiths are viewable by everyone"
  on public.hadiths for select
  using (is_active);

drop policy if exists "Admins can view every hadith" on public.hadiths;
create policy "Admins can view every hadith"
  on public.hadiths for select
  using (exists (
    select 1 from public.profiles p
     where p.id = auth.uid() and p.role in ('admin', 'reviewer')
  ));

drop policy if exists "Hadith text is viewable by everyone" on public.hadith_translations;
create policy "Hadith text is viewable by everyone"
  on public.hadith_translations for select
  using (exists (
    select 1 from public.hadiths h
     where h.id = hadith_id and (h.is_active or exists (
       select 1 from public.profiles p
        where p.id = auth.uid() and p.role in ('admin', 'reviewer')
     ))
  ));

-- Writes go through the admin functions below and nowhere else. No insert,
-- update or delete policy exists on either table, so even an admin's browser
-- session cannot write to them directly.

-- ---------------------------------------------------------------------------
-- The hadith of the day
-- ---------------------------------------------------------------------------
--
-- A function of the date, the same for every player, exactly as the spin
-- wheel's prize is. Migration 0008 took the randomness out of the rewards on
-- the grounds that an unknown return for a known price is a gamble; the same
-- reasoning applies more plainly here. Two players comparing notes on today's
-- hadith should be reading the same one, and a rotation nobody can predict is
-- not a calendar.
--
-- It returns EVERY locale of the chosen narration in one call, not the
-- caller's locale. That is the same decision the translation system rests on:
-- by the time the player taps Hausa the Hausa is already in the browser, so
-- switching language re-renders and does not re-fetch. One round trip per
-- home-screen load, no round trip per language change.

create or replace function public.daily_hadith()
returns table (
  o_reference   text,
  o_locale      public.app_language,
  o_text        text,
  o_attribution text
)
language sql
stable
security definer
set search_path = public
as $$
  with active as (
    select h.id, h.reference, row_number() over (order by h.position, h.id) - 1 as idx
      from public.hadiths h
     where h.is_active
  ),
  chosen as (
    select a.id, a.reference
      from active a
     where (select count(*) from active) > 0
       and a.idx = (current_date - date '1970-01-01') % (select count(*) from active)
  )
  select c.reference, ht.locale, ht.text, ht.attribution
    from chosen c
    join public.hadith_translations ht on ht.hadith_id = c.id;
$$;

comment on function public.daily_hadith() is
  'Every locale of today''s narration. Chosen by date, so it is the same for every player. Returns no rows when nothing is active, which the card treats as "show nothing".';

revoke all on function public.daily_hadith() from public;
grant execute on function public.daily_hadith() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Importing, from the admin console
-- ---------------------------------------------------------------------------

create or replace function public.admin_list_hadiths()
returns table (
  o_id          uuid,
  o_reference   text,
  o_position    integer,
  o_is_active   boolean,
  o_locales     text[],
  o_english     text
)
language plpgsql
stable
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
    select h.id,
           h.reference,
           h.position,
           h.is_active,
           coalesce(array_agg(ht.locale::text order by ht.locale)
                    filter (where ht.locale is not null), '{}'),
           max(ht.text) filter (where ht.locale = 'en')
      from public.hadiths h
      left join public.hadith_translations ht on ht.hadith_id = h.id
     group by h.id, h.reference, h.position, h.is_active
     order by h.position, h.id;
end;
$$;

revoke all on function public.admin_list_hadiths() from public, anon;
grant execute on function public.admin_list_hadiths() to authenticated;

create or replace function public.admin_hadith_translations(p_hadith_id uuid)
returns table (o_locale public.app_language, o_text text, o_attribution text)
language plpgsql
stable
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
    select ht.locale, ht.text, ht.attribution
      from public.hadith_translations ht
     where ht.hadith_id = p_hadith_id
     order by ht.locale;
end;
$$;

revoke all on function public.admin_hadith_translations(uuid) from public, anon;
grant execute on function public.admin_hadith_translations(uuid) to authenticated;

-- Upserts one narration and whatever locales were supplied with it.
--
-- `p_texts` arrives as {"en": {"text": "...", "attribution": "..."}, ...}. A
-- locale absent from the object is left exactly as it was rather than deleted,
-- so saving the Hausa tab cannot wipe the French someone entered an hour ago.
-- Removing a locale is `admin_delete_hadith_locale`, which says so.
create or replace function public.admin_upsert_hadith(
  p_reference text,
  p_texts     jsonb,
  p_id        uuid default null,
  p_position  integer default null,
  p_is_active boolean default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_locale text;
  v_entry jsonb;
begin
  if not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ) then
    raise exception 'Admins only.';
  end if;

  if coalesce(btrim(p_reference), '') = '' then
    raise exception 'A hadith needs a reference.';
  end if;

  if p_id is null then
    insert into public.hadiths (reference, position, is_active)
    values (btrim(p_reference), coalesce(p_position, 0), coalesce(p_is_active, true))
    returning id into v_id;
  else
    update public.hadiths
       set reference  = btrim(p_reference),
           position   = coalesce(p_position, position),
           is_active  = coalesce(p_is_active, is_active),
           updated_at = now()
     where id = p_id
     returning id into v_id;
    if v_id is null then
      raise exception 'No such hadith.';
    end if;
  end if;

  for v_locale, v_entry in select * from jsonb_each(coalesce(p_texts, '{}'::jsonb))
  loop
    -- An empty box in the form means "I have nothing for this language", not
    -- "store an empty quotation". The read falls back to English for it.
    if coalesce(btrim(v_entry->>'text'), '') = '' then
      continue;
    end if;

    insert into public.hadith_translations (hadith_id, locale, text, attribution)
    values (
      v_id,
      v_locale::public.app_language,
      btrim(v_entry->>'text'),
      coalesce(nullif(btrim(v_entry->>'attribution'), ''), btrim(p_reference))
    )
    on conflict (hadith_id, locale) do update
      set text        = excluded.text,
          attribution = excluded.attribution,
          updated_at  = now();
  end loop;

  return v_id;
end;
$$;

revoke all on function public.admin_upsert_hadith(text, jsonb, uuid, integer, boolean) from public, anon;
grant execute on function public.admin_upsert_hadith(text, jsonb, uuid, integer, boolean) to authenticated;

create or replace function public.admin_delete_hadith_locale(
  p_hadith_id uuid,
  p_locale    public.app_language
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ) then
    raise exception 'Admins only.';
  end if;

  if p_locale = 'en' then
    raise exception 'English is the fallback every other locale reads through. Deactivate the hadith instead.';
  end if;

  delete from public.hadith_translations
   where hadith_id = p_hadith_id and locale = p_locale;
end;
$$;

revoke all on function public.admin_delete_hadith_locale(uuid, public.app_language) from public, anon;
grant execute on function public.admin_delete_hadith_locale(uuid, public.app_language) to authenticated;

-- ---------------------------------------------------------------------------
-- Seed
-- ---------------------------------------------------------------------------
--
-- Exactly the narration the hardcoded constant carried, and only in English.
-- Its five other locales are left empty on purpose: this migration is not the
-- place to invent a Hausa rendering of Bukhari, and an empty locale reads as
-- English rather than as a blank card. The rest arrive through the importer.

insert into public.hadiths (reference, position, is_active)
values ('bukhari:6029', 0, true)
on conflict (reference) do nothing;

insert into public.hadith_translations (hadith_id, locale, text, attribution)
select h.id, 'en',
       'The best among you are those who have the best manners and character.',
       'Sahih al-Bukhari 6029'
  from public.hadiths h
 where h.reference = 'bukhari:6029'
on conflict (hadith_id, locale) do nothing;
