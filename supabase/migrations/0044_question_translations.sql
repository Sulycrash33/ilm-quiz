-- ---------------------------------------------------------------------------
-- 0044 — Questions in six languages.
-- ---------------------------------------------------------------------------
--
-- THE BUG THIS STARTS FROM
--
-- `questions.language` has existed since the first migration, typed as the
-- `app_language` enum with all six locales in it — and **nothing has ever read
-- it**. `getPublishedQuizQuestions` filters on `category_id` and
-- `review_status`; no query in the codebase mentions language at all. All
-- 5,220 rows are 'en', so a player who picks Hausa gets English questions and
-- always has.
--
-- That also made the obvious fix a trap. Inserting Hausa rows into `questions`
-- would have doubled the bank for *every* player and broken the twenty-per-tier
-- assumption `buildTierLadder` rests on, because nothing scopes a query by
-- language. The plumbing has to exist before the content does. This migration
-- is the plumbing.
--
-- WHY A SEPARATE TABLE AND NOT MORE ROWS IN `questions`
--
-- The `language` column implies one row per question per language, but then a
-- question and its translation are unrelated rows: nothing records that the
-- Hausa row *is* the English one, so there is no per-question fallback, no way
-- to tell a translation from an original, and every tier ladder needs language
-- scoping to avoid serving the same question twice in two languages.
--
-- Keyed on `(question_id, locale)` instead, there is exactly one canonical
-- question. A translation is an overlay on it. A missing translation falls back
-- to English for that row alone, so a partly translated bank is a bank that
-- works rather than one with holes in it.
--
-- `questions.language` keeps its meaning for questions that are genuinely
-- language-native — the Arabic-language category asks about Arabic grammar and
-- cannot be translated into Hausa without ceasing to be the question.

create table if not exists public.question_translations (
  question_id   uuid not null references public.questions(id) on delete cascade,
  locale        public.app_language not null,

  question_text text not null,
  choices       jsonb not null,
  explanation   text,

  -- 'machine' until a person edits it, 'human' forever after.
  --
  -- This is what stops the pipeline destroying the owner's work. The agreed
  -- workflow is that translations publish automatically and get corrected in
  -- the admin editor when something reads wrong — which only holds if a
  -- correction survives. A re-run must never overwrite a 'human' row; when the
  -- English moves underneath one, the row is reported as stale rather than
  -- silently rewritten.
  source        text not null default 'machine',
  edited_by     text,
  edited_at     timestamptz,

  -- A fingerprint of the English this was translated from, so "the source
  -- changed since this was translated" is answerable without keeping a copy of
  -- the English in every row.
  source_fingerprint text not null,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  primary key (question_id, locale),

  constraint question_translations_source_check
    check (source in ('machine', 'human')),

  -- English is not a translation of itself. Without this the same text could
  -- live in two places and disagree.
  constraint question_translations_not_english
    check (locale <> 'en'),

  -- A translation that drops or invents an option is not a translation of this
  -- question: `correct_choice_index` indexes into the English array, so a
  -- different length silently repoints the correct answer.
  constraint question_translations_choices_is_array
    check (jsonb_typeof(choices) = 'array')
);

comment on table public.question_translations is
  'One row per (question, non-English locale). An overlay on the canonical English question in public.questions; a missing row falls back to English for that question alone.';

create index if not exists question_translations_locale_idx
  on public.question_translations (locale);

-- ---------------------------------------------------------------------------
-- The fingerprint helper
-- ---------------------------------------------------------------------------

create or replace function public.question_fingerprint(
  p_text text, p_choices jsonb, p_explanation text
)
returns text
language sql
immutable
set search_path = public
as $$
  select md5(coalesce(p_text, '') || '|' ||
             coalesce(p_choices::text, '') || '|' ||
             coalesce(p_explanation, ''))
$$;

comment on function public.question_fingerprint(text, jsonb, text) is
  'Identifies the English source a translation was made from. A mismatch means the English moved and the translation is stale.';

-- ---------------------------------------------------------------------------
-- RLS, and the exposure this table deliberately does NOT repeat
-- ---------------------------------------------------------------------------
--
-- The SELECT policy on `questions` is `using (review_status = 'published')`
-- with no column restriction, which means `correct_choice_index` and
-- `explanation` are readable through PostgREST by anyone holding the anon key
-- — even though `quiz-service.ts` carefully declines to select them and says
-- in a comment that they "must never reach the browser before an answer is
-- submitted". The comment describes the application's intent; the policy does
-- not enforce it. That is a pre-existing hole, reported rather than widened
-- here, and it is not fixed in this migration because the admin pages read
-- those columns directly as `authenticated` and would break.
--
-- This table does not inherit the problem. Grants are per column: the text a
-- player must see to answer is readable, and the translated explanation is
-- not. `submit_quiz_answer` is SECURITY DEFINER, so the legitimate path — the
-- explanation arriving *after* an answer — still works.

alter table public.question_translations enable row level security;

revoke all on public.question_translations from anon, authenticated;

grant select (question_id, locale, question_text, choices)
  on public.question_translations to anon, authenticated;

create policy "Translations of published questions are viewable"
  on public.question_translations
  for select
  using (
    exists (
      select 1 from public.questions q
       where q.id = question_translations.question_id
         and q.review_status = 'published'
    )
  );

-- No insert, update or delete policy exists, by design. Every write goes
-- through a SECURITY DEFINER function below, the same shape `admin_audit_log`
-- uses to make its contents unforgeable.

-- ---------------------------------------------------------------------------
-- Writing a translation
-- ---------------------------------------------------------------------------

create or replace function public.admin_upsert_question_translation(
  p_question_id uuid,
  p_locale      public.app_language,
  p_text        text,
  p_choices     jsonb,
  p_explanation text default null,
  p_source      text default 'machine'
)
returns table (o_success boolean, o_error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_is_admin boolean;
  v_q record;
  v_existing record;
begin
  select exists (
    select 1 from public.profiles p
     where p.id = v_actor and p.role = 'admin'
  ) into v_is_admin;

  if not v_is_admin then
    return query select false, 'Admins only.'::text;
    return;
  end if;

  if p_locale = 'en' then
    return query select false, 'English is the source, not a translation.'::text;
    return;
  end if;

  if p_source not in ('machine', 'human') then
    return query select false, 'Unknown source.'::text;
    return;
  end if;

  select q.question_text, q.choices, q.explanation
    into v_q
    from public.questions q
   where q.id = p_question_id;

  if not found then
    return query select false, 'Question not found.'::text;
    return;
  end if;

  -- The check that matters. `correct_choice_index` points into the English
  -- array, so a translation with a different number of options repoints the
  -- correct answer at whatever now sits there — a player picking correctly
  -- would be marked wrong, in an app that teaches religion.
  if jsonb_array_length(p_choices) <> jsonb_array_length(v_q.choices) then
    return query select false,
      format('Expected %s choices, got %s.',
             jsonb_array_length(v_q.choices), jsonb_array_length(p_choices))::text;
    return;
  end if;

  -- Two options that mean the same thing make a question unanswerable. This is
  -- the fard/sunnah collapse: a translation that renders two distinct rulings
  -- with one word leaves the player no correct choice to pick.
  if (select count(distinct value) from jsonb_array_elements_text(p_choices))
     <> jsonb_array_length(p_choices) then
    return query select false, 'Two or more translated choices are identical.'::text;
    return;
  end if;

  if (select bool_or(btrim(value) = '') from jsonb_array_elements_text(p_choices)) then
    return query select false, 'A translated choice is empty.'::text;
    return;
  end if;

  if btrim(coalesce(p_text, '')) = '' then
    return query select false, 'The translated question is empty.'::text;
    return;
  end if;

  select source into v_existing
    from public.question_translations
   where question_id = p_question_id and locale = p_locale;

  -- A machine pass never overwrites a person's correction.
  if found and v_existing.source = 'human' and p_source = 'machine' then
    return query select false, 'This translation was edited by hand; not overwriting.'::text;
    return;
  end if;

  insert into public.question_translations as t (
    question_id, locale, question_text, choices, explanation,
    source, edited_by, edited_at, source_fingerprint, updated_at
  )
  values (
    p_question_id, p_locale, p_text, p_choices, p_explanation,
    p_source,
    case when p_source = 'human' then v_actor::text end,
    case when p_source = 'human' then now() end,
    public.question_fingerprint(v_q.question_text, v_q.choices, v_q.explanation),
    now()
  )
  on conflict (question_id, locale) do update
     set question_text = excluded.question_text,
         choices       = excluded.choices,
         explanation   = excluded.explanation,
         source        = excluded.source,
         edited_by     = coalesce(excluded.edited_by, t.edited_by),
         edited_at     = coalesce(excluded.edited_at, t.edited_at),
         source_fingerprint = excluded.source_fingerprint,
         updated_at    = now();

  return query select true, null::text;
end;
$$;

revoke all on function public.admin_upsert_question_translation(uuid, public.app_language, text, jsonb, text, text) from public, anon;
grant execute on function public.admin_upsert_question_translation(uuid, public.app_language, text, jsonb, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Reading translations for the admin editor
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER because the column grants above deliberately keep
-- `explanation` away from `authenticated`, and an admin editing a translation
-- has to see the one they are editing.

create or replace function public.admin_question_translations(p_question_id uuid)
returns table (
  o_locale       public.app_language,
  o_question_text text,
  o_choices      jsonb,
  o_explanation  text,
  o_source       text,
  o_is_stale     boolean,
  o_updated_at   timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean;
  v_current text;
begin
  select exists (
    select 1 from public.profiles p
     where p.id = auth.uid() and p.role in ('admin', 'reviewer')
  ) into v_is_admin;

  if not v_is_admin then
    raise exception 'Admins only.';
  end if;

  select public.question_fingerprint(q.question_text, q.choices, q.explanation)
    into v_current
    from public.questions q
   where q.id = p_question_id;

  return query
    select t.locale, t.question_text, t.choices, t.explanation, t.source,
           (t.source_fingerprint is distinct from v_current),
           t.updated_at
      from public.question_translations t
     where t.question_id = p_question_id
     order by t.locale;
end;
$$;

revoke all on function public.admin_question_translations(uuid) from public, anon;
grant execute on function public.admin_question_translations(uuid) to authenticated;


-- ---------------------------------------------------------------------------
-- submit_quiz_answer: the explanation arrives in the player's language
-- ---------------------------------------------------------------------------
--
-- Recreated whole from 0035 rather than patched, matching how 0035 itself
-- recreated it from 0034: there is one place XP is decided and it should read
-- as one piece. The XP arithmetic, the lifeline consumption, the streak walk
-- and the run-band test are byte-identical to 0035 — this function was
-- extracted from that file programmatically, not retyped. The only change is
-- the explanation lookup near the end.
--
-- The signature is untouched, so nothing that calls this has to change.
create or replace function public.submit_quiz_answer(
  p_question_id     uuid,
  p_choice_index    integer,
  p_response_time_ms integer default null,
  p_run_id          uuid default null
)
returns table(o_correct boolean, o_correct_index integer, o_explanation text,
              o_citation text, o_xp_earned integer, o_streak_multiplier integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_question record;
  v_streak int := 0;
  v_correct boolean;
  v_multiplier int;
  v_base_xp int;
  v_xp int;
  v_mode_num int := 1;
  v_mode_den int := 1;
  v_double boolean := false;
  v_used_hint boolean := false;
  v_tier int;
  v_locale public.app_language;
  v_explanation text;
  rec record;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to answer.';
  end if;
  if p_choice_index is null or p_choice_index < 0 then
    raise exception 'Invalid answer.';
  end if;

  select q.id, q.choices, q.correct_choice_index, q.explanation,
         q.citation_reference, q.difficulty, q.tier, q.review_status
    into v_question
    from public.questions q
   where q.id = p_question_id;

  if not found then raise exception 'Question not found.'; end if;
  if v_question.review_status <> 'published' then
    raise exception 'This question is not available.';
  end if;

  if p_choice_index >= jsonb_array_length(v_question.choices) then
    raise exception 'Invalid answer.';
  end if;

  v_tier := least(greatest(coalesce(v_question.tier, 1), 1), 9);

  if p_run_id is not null then
    -- The run must be the caller's, still open, AND opened for questions of
    -- this difficulty. A run with no band recorded — one opened before this
    -- migration — still pays, so a run in flight during the deploy is not
    -- silently devalued mid-game.
    select r.xp_numerator, r.xp_denominator
      into v_mode_num, v_mode_den
      from public.game_runs g
      join public.game_mode_rules r on r.mode = g.mode
     where g.id = p_run_id
       and g.user_id = v_user_id
       and g.ended_at is null
       and (g.tier_min is null or v_tier between g.tier_min and g.tier_max);

    if not found then
      v_mode_num := 1;
      v_mode_den := 1;
    end if;
  end if;

  select exists (
    select 1 from public.lifeline_spends s
     where s.user_id = v_user_id
       and s.question_id = p_question_id
       and s.lifeline_id = 'ask-imam'
  ) into v_used_hint;

  update public.lifeline_spends s
     set consumed_at = now()
   where s.user_id = v_user_id
     and s.question_id = p_question_id
     and s.lifeline_id = 'double-points'
     and s.consumed_at is null
  returning true into v_double;

  v_double := coalesce(v_double, false);

  for rec in
    select a.is_correct
      from public.attempts a
     where a.user_id = v_user_id
     order by a.created_at desc
     limit 20
  loop
    exit when not rec.is_correct;
    v_streak := v_streak + 1;
  end loop;

  v_correct := (p_choice_index = v_question.correct_choice_index);
  if v_correct then
    v_multiplier := least(floor(v_streak / 3)::int + 1, 3);
  else
    v_multiplier := 1;
  end if;

  if not v_correct then
    v_base_xp := 0;
  else
    v_base_xp := round((20 + 5 * v_tier) / 3.0);
  end if;

  v_xp := v_base_xp * v_multiplier * (case when v_double then 2 else 1 end);
  v_xp := round((v_xp * v_mode_num)::numeric / v_mode_den);

  insert into public.attempts (
    user_id, question_id, is_correct, xp_earned, response_time_ms, used_ask_the_imam_hint
  )
  values (
    v_user_id, v_question.id, v_correct, v_xp, p_response_time_ms, v_used_hint
  );

  update public.profiles p
     set coins      = coalesce(p.coins, 0) + v_xp,
         total_xp   = coalesce(p.total_xp, 0) + v_xp,
         high_score = greatest(coalesce(p.high_score, 0), coalesce(p.total_xp, 0) + v_xp)
   where p.id = v_user_id;

  -- The explanation, in the language the player chose.
  --
  -- No new parameter: this function already knows who is calling, so it reads
  -- their `preferred_language` itself rather than trusting a locale passed up
  -- from the client. That also means every existing caller keeps working
  -- unchanged and the signature does not move.
  --
  -- Falls back to the English explanation per question, not per language: a
  -- Hausa player whose current question has no Hausa row still gets a real
  -- explanation instead of a blank panel.
  select p.preferred_language into v_locale
    from public.profiles p where p.id = v_user_id;

  v_explanation := v_question.explanation;

  if v_locale is not null and v_locale <> 'en' then
    select coalesce(nullif(btrim(t.explanation), ''), v_question.explanation)
      into v_explanation
      from public.question_translations t
     where t.question_id = p_question_id
       and t.locale = v_locale;

    v_explanation := coalesce(v_explanation, v_question.explanation);
  end if;

  return query
    select v_correct,
           v_question.correct_choice_index::int,
           v_explanation,
           v_question.citation_reference,
           v_xp,
           v_multiplier;
end;
$$;
