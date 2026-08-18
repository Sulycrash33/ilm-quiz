/**
 * Generates supabase/seed.sql from the authored question bank.
 *
 *   npm run seed:build
 *
 * The emitted SQL targets the LIVE schema, which was inspected directly rather
 * than assumed. Three details it gets right that a hand-written seed got wrong:
 *
 *  1. Category slugs use UNDERSCORES (`five_pillars`), matching the database.
 *     The hyphenated ids in the legacy CATEGORIES array in src/lib/constants.ts
 *     (`five-pillars`) do NOT match, and seeding with them creates a duplicate
 *     set of categories sitting alongside the real ones.
 *  2. `difficulty`, `language`, `madhab_tag` and `review_status` are ENUM types
 *     (difficulty_level, app_language, madhab_tag, review_status), so values
 *     need explicit casts.
 *  3. `categories.sort_order` is NOT NULL with no default and must be supplied.
 *
 * Everything is inserted as 'ai_drafted', never 'published'. See the note in
 * the generated file's header for why.
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CATEGORIES } from './categories';
import { validateBank, placeChoices, type SeedQuestion } from './types';
import { QURAN_QUESTIONS } from './questions-quran';
import { HADITH_SEERAH_QUESTIONS } from './questions-hadith-seerah';
import { WORSHIP_QUESTIONS } from './questions-worship';
import { BELIEF_QUESTIONS } from './questions-belief';
import { CULTURE_QUESTIONS } from './questions-culture';
import { TOPUP_QUESTIONS } from './questions-topup';

const BANK: SeedQuestion[] = [
  ...QURAN_QUESTIONS,
  ...HADITH_SEERAH_QUESTIONS,
  ...WORSHIP_QUESTIONS,
  ...BELIEF_QUESTIONS,
  ...CULTURE_QUESTIONS,
  ...TOPUP_QUESTIONS,
];

/** Postgres string literal: double any embedded single quote. */
function lit(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function build(): string {
  const issues = validateBank(BANK, CATEGORIES);
  if (issues.length > 0) {
    console.error(`\n${issues.length} problem(s) in the question bank:\n`);
    issues.forEach((i) => console.error(`  [${i.index}] ${i.problem}\n      ${i.question}`));
    process.exit(1);
  }

  const byCategory = new Map<string, number>();
  BANK.forEach((q) => byCategory.set(q.category, (byCategory.get(q.category) ?? 0) + 1));

  const lines: string[] = [];

  lines.push(`-- Seed: knowledge categories and the question bank.
--
-- GENERATED FILE — do not edit by hand.
-- Source: scripts/seed-content/*.ts    Rebuild: npm run seed:build
--
-- ${BANK.length} questions across ${byCategory.size} categories.
--
-- REVIEW STATUS
-- Everything here is inserted as 'ai_drafted', never 'published'. This project
-- takes an explicit position, stated in src/ai/flows/draft-questions.ts and
-- enforced by the RLS in migration 0001: no machine-generated Islamic content
-- reaches users without a qualified human scholar approving it. This bank was
-- written by an AI assistant, so that position applies to it in full. The rows
-- land in the existing /admin/review queue and are invisible in the app until
-- a reviewer approves them. That is the gate working, not a bug.
--
-- Every question carries a citation for the reviewer to check. Fiqh entries are
-- limited to rulings agreed across the four Sunni schools and tagged 'agreed';
-- non-fiqh entries are tagged 'na'.
--
-- SCHEMA NOTES
-- Category slugs use underscores, matching the live database. The hyphenated
-- ids in the legacy CATEGORIES array in src/lib/constants.ts do not match and
-- must not be used for seeding — doing so creates a duplicate category set.
-- difficulty / language / madhab_tag / review_status are enum types and are
-- cast explicitly. categories.sort_order is NOT NULL with no default.
--
-- Safe to run repeatedly: categories match on slug, questions on question_text.

-- ---------------------------------------------------------------------------
-- 1. Categories
-- ---------------------------------------------------------------------------`);

  lines.push(`
insert into public.categories (slug, name, description, icon, sort_order)
select v.slug, v.name, v.description, v.icon, v.sort_order
from (values`);

  const catRows = CATEGORIES.map(
    (c) =>
      `  (${lit(c.slug)}, ${lit(c.name)}, ${lit(c.description)}, ${lit(c.icon)}, ${c.sortOrder}::smallint)`,
  );
  lines.push(catRows.join(',\n'));
  lines.push(`) as v(slug, name, description, icon, sort_order)
where not exists (select 1 from public.categories c where c.slug = v.slug);

-- Refresh the descriptions and icons of categories that already existed, so the
-- ten live ones pick up copy without being duplicated or re-ordered.
update public.categories c
   set description = v.description,
       icon        = v.icon
from (values`);

  const catUpdates = CATEGORIES.map(
    (c) => `  (${lit(c.slug)}, ${lit(c.description)}, ${lit(c.icon)})`,
  );
  lines.push(catUpdates.join(',\n'));
  lines.push(`) as v(slug, description, icon)
where c.slug = v.slug
  and (c.description is distinct from v.description or c.icon is distinct from v.icon);

-- ---------------------------------------------------------------------------
-- 2. Questions
-- ---------------------------------------------------------------------------

with seed(cat_slug, difficulty, question_text, choices, correct_choice_index, explanation, citation_reference, madhab_tag) as (
  values`);

  const questionRows = BANK.map((q) => {
    const { choices, correctIndex } = placeChoices(q);
    const choicesJson = JSON.stringify(choices);
    return [
      `  (${lit(q.category)}, ${lit(q.difficulty)}, ${lit(q.q)},`,
      `   ${lit(choicesJson)}, ${correctIndex},`,
      `   ${lit(q.why)},`,
      `   ${lit(q.cite)}, ${lit(q.madhab ?? 'na')})`,
    ].join('\n');
  });

  lines.push(questionRows.join(',\n\n'));

  lines.push(`
)
insert into public.questions (
  category_id, difficulty, language, madhab_tag,
  question_text, choices, correct_choice_index,
  explanation, citation_reference, source_type, review_status
)
select
  c.id,
  s.difficulty::difficulty_level,
  'en'::app_language,
  s.madhab_tag::madhab_tag,
  s.question_text,
  s.choices::jsonb,
  s.correct_choice_index::smallint,
  s.explanation,
  s.citation_reference,
  'ai_drafted',
  'ai_drafted'::review_status
from seed s
join public.categories c on c.slug = s.cat_slug
where not exists (
  select 1 from public.questions q where q.question_text = s.question_text
);

-- ---------------------------------------------------------------------------
-- Publishing, once reviewed
-- ---------------------------------------------------------------------------
-- The intended route is the app: sign in as a reviewer or admin, open
-- /admin/review, and approve questions there. That records who reviewed each
-- one and when, which is the point of the workflow.
--
-- To publish a batch that a reviewer has already checked offline, this is the
-- statement — deliberately commented out so running this file cannot publish
-- anything by accident:
--
--   update public.questions
--      set review_status = 'published'::review_status,
--          reviewed_at   = now()
--    where review_status = 'ai_drafted'::review_status
--      and language = 'en'::app_language;`);

  return `${lines.join('\n')}\n`;
}

const sql = build();
const target = join(process.cwd(), 'supabase', 'seed.sql');
writeFileSync(target, sql, 'utf8');

const counts = new Map<string, number>();
BANK.forEach((q) => counts.set(q.category, (counts.get(q.category) ?? 0) + 1));
const difficulties = new Map<string, number>();
BANK.forEach((q) => difficulties.set(q.difficulty, (difficulties.get(q.difficulty) ?? 0) + 1));

console.log(`Wrote ${target}`);
console.log(`  ${BANK.length} questions, ${CATEGORIES.length} categories`);
console.log(
  `  difficulty: ${[...difficulties.entries()].map(([d, n]) => `${d} ${n}`).join(', ')}`,
);
// A full run is HUNT_RULES.runLength (10); anything below that can only
// offer a shortened, repetitive run.
const thin = CATEGORIES.filter((c) => (counts.get(c.slug) ?? 0) < 10);
if (thin.length > 0) {
  console.log(
    `  note: ${thin.length} categor${thin.length === 1 ? 'y has' : 'ies have'} fewer than a full 10-question run: ${thin
      .map((c) => `${c.slug}(${counts.get(c.slug) ?? 0})`)
      .join(', ')}`,
  );
}
