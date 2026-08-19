-- Label questions with the bulk load that inserted them, and add the loader.
--
-- WHY A NEW COLUMN
-- `source_type` is constrained to 'human' or 'ai_drafted' and answers a
-- different question: who wrote a question, not which load it arrived in.
-- Overloading it would have meant either widening a deliberate constraint or
-- making a new batch indistinguishable from the 273 rows already present.
--
-- `seed_batch` is null for anything hand-entered, and carries a batch name for
-- bulk loads, which makes a load exactly reversible:
--
--   delete from public.questions where seed_batch = 'tiers_v1';
--
-- That matters here because the content loaded under this batch is AI-drafted
-- and has NOT been through scholarly review. It must be cheap to remove
-- wholesale.
--
-- WHAT WAS LOADED
-- Batch 'tiers_v1' fills the nine-tier grid introduced in migration 0019.
-- Before it, 150 of the 225 (category, tier) buckets were empty and every tier
-- was a guess backfilled from the old easy/medium/hard band. After it, all 225
-- buckets hold at least four questions with a deliberately authored tier
-- (`tier_is_estimated = false`).
--
-- The loader deduplicates on exact question text, so re-running it is safe and
-- will not create copies. Note that it cannot catch a question that asks the
-- same thing in different words; some overlap with the pre-existing 273
-- remains, and those older rows still carry estimated tiers.

alter table public.questions
  add column if not exists seed_batch text;

comment on column public.questions.seed_batch is
  'Name of the bulk load that inserted this row; null for hand-entered content. Makes a batch exactly reversible.';

create index if not exists questions_seed_batch_idx
  on public.questions (seed_batch)
  where seed_batch is not null;

/**
 * Bulk-load questions for one category.
 *
 * Takes the category slug and a JSON array of items shaped:
 *
 *   { "t": 1-9, "q": text, "c": [4 choices], "a": index,
 *     "e": explanation, "r": citation, "m": madhab_tag }
 *
 * `difficulty` is derived from the tier rather than supplied, so the two
 * cannot drift apart: tiers 1-3 are easy, 4-6 medium, 7-9 hard.
 *
 * Deliberately not granted to `anon` or `authenticated`. This writes published
 * content and must only ever run as the owner.
 */
create or replace function public.seed_tiered_questions(p_slug text, p_items jsonb)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_cat uuid;
  v_n int;
begin
  select c.id into v_cat from public.categories c where c.slug = p_slug;
  if v_cat is null then
    raise exception 'unknown category slug: %', p_slug;
  end if;

  insert into public.questions (
    category_id, difficulty, tier, tier_is_estimated, language, madhab_tag,
    question_text, choices, correct_choice_index, explanation,
    citation_reference, source_type, review_status, seed_batch
  )
  select v_cat,
         (case when (x->>'t')::int <= 3 then 'easy'
               when (x->>'t')::int <= 6 then 'medium'
               else 'hard' end)::difficulty_level,
         (x->>'t')::smallint,
         false,
         'en'::app_language,
         coalesce(x->>'m', 'agreed')::madhab_tag,
         x->>'q',
         x->'c',
         (x->>'a')::smallint,
         x->>'e',
         x->>'r',
         'ai_drafted',
         'published'::review_status,
         'tiers_v1'
    from jsonb_array_elements(p_items) x
   where not exists (
     select 1 from public.questions q where q.question_text = x->>'q'
   );

  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

revoke execute on function public.seed_tiered_questions(text, jsonb) from public, anon, authenticated;
