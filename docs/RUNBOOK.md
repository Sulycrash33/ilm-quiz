# Question bank runbook

**If you are a fresh session and the instruction was "continue on this project" — this is
the file. Read it first, then act. You do not need to ask what to do next; the database
tells you.**

Written 2026-08-20. The owner has delegated the question bank. Lead it: make the routine
calls yourself, and only stop for him where this file says to stop.

## Where everything is

| | |
|---|---|
| repo | `Sulycrash33/ilm-quiz`, branch `claude/hadith-quran-api-verify-egazgf` |
| Supabase project | **`ziblpvwiqzpjnkqjwodl`** (name: ilm-quiz) — reached with the `mcp__Supabase__*` tools |
| what to write | `docs/CATEGORY_TIER_MAPS.md` — 29 categories, 261 tier definitions |
| where text comes from | `docs/SOURCES.md` |
| standing context | `docs/HANDOFF.md` |

**There is no `.env.local` in a fresh clone**, so Node scripts cannot reach the database.
The Supabase MCP tools are the execution path. Do not waste a turn trying to build a
`psql` connection.

## State lives in the database, not in a file

Do not keep a progress file — it goes stale and then lies. **Ask the database where you
are.** `scripts/question-bank/status.sql` answers it in one query; run it at the start of
every session:

```
mcp__Supabase__execute_sql(project_id="ziblpvwiqzpjnkqjwodl",
                           query=<contents of scripts/question-bank/status.sql>)
```

It returns every category with how many of its 180 questions exist and which tiers are
short. **The first category showing fewer than 180 is the one you are working on.** That is
the whole of the resume logic.

## The invariants

These do not change and are not yours to relitigate. They came from the owner.

1. **Original questions only.** Never lift or rephrase an existing question set. `opentdb`
   and `the-trivia-api` are live and prohibited; so is any quiz app's bank.
2. **Sunni is the hard condition.** Where the four schools agree, `madhab_tag = 'agreed'`.
   Where they differ, name the school. Never present one school's view as consensus.
3. **Contemporary fatwa is not ijma'.** Keep it distinguishable from classical consensus.
4. **English only** (`language = 'en'`). Translation is a separate later phase.
5. **Never pad to reach 20.** If a bucket cannot sustain twenty distinct questions, report
   it short with its number. The owner would rather hear "Tajwid tier 9 supports 12" than
   receive eight questions nobody can defend.
6. **Difficulty is not obscurity.** Every question must match its line in
   `docs/CATEGORY_TIER_MAPS.md`. A tier-8 question that is a tier-3 fact in harder
   vocabulary gets rewritten, not relabelled.
7. **A weak narration may never ground a ruling question** — only a question about the
   narration itself.
8. Everything written is `review_status = 'ai_drafted'`. Nothing is `published` without a
   scholar. Set `source_type = 'ai_drafted'` (a CHECK constraint allows only 'human' or 'ai_drafted') and `tier_is_estimated = false`.

## The loop — one category at a time

Author **one category completely** — all 9 tiers, all 180 questions — then stop and report
before starting the next. Within a category, **write the full tier spread together**: tier 1
and tier 9 in the same pass, so the gradient is real.

**Step 1 — pick up where the DB says.** Run `status.sql`. Take the first incomplete
category, in the `sort_order` given below.

**Step 2 — reread that category's nine tier lines** in `docs/CATEGORY_TIER_MAPS.md`. Write
to those lines, not to the generic rubric.

**Step 3 — gather source text first, then write.** Pull from the sources in
`docs/SOURCES.md`. For hadith, use the fawazahmed0 mirror and pull whole editions once
rather than per-hadith. Every question needs a real `citation_reference` — this is the
weakest part of what existed before, and the reason web access was opened.

**Step 4 — insert.** Use `scripts/question-bank/insert-template.sql` as the shape. Insert in
batches of one tier (20 rows) so a failure costs one tier, not the category.

**Step 5 — validate. Every category, not at the end.** Run
`scripts/question-bank/validate.sql` with the category slug. It checks all four things the
owner asked to be protected against:

- every tier reads exactly 20;
- no two questions in the category exceed 0.5 trigram similarity;
- no correct answer appears more than twice;
- no question stem ("Who was the first", "How many", "In which year") appears more than four
  times.

**Do not report a category done until the validator comes back clean.** Fix and re-run.

**Step 6 — report to the owner**: the tier counts, the validator output, and any bucket you
had to report short. Then stop and wait before the next category.

## If you run out of context mid-category

Nothing is lost. Rows already inserted are in the database, and `status.sql` will show the
partial tier counts. A new session reads this file, runs `status.sql`, and continues from
the first short tier. **Do not delete partial work to start a category cleanly** — fill the
gap instead.

## Two things that are NOT done yet

**1. The wipe and the category rebuild.** Verified 2026-08-20: `attempts`,
`quiz_room_questions` and `user_question_schedule` are all **0 rows**, so the wipe is safe —
**but re-verify immediately before running it**, because the owner may have been testing
since. `scripts/question-bank/00-wipe-and-reseed-categories.sql` does both, and it is
destructive: it deletes all 1,169 existing questions and replaces the 25 existing categories
with the 29 below.

The existing categories are **not** a subset of the new list. 17 are reused, 12 are new, and
8 retire because their content is absorbed elsewhere:

| retired slug | absorbed into |
|---|---|
| `salah`, `zakat_charity`, `hajj_umrah`, `ramadan_fasting` | `five_pillars` |
| `angels_unseen` | `aqeedah` |
| `muslim_scholars`, `islam_world` | `islamic_history` |
| `islamic_calendar` | `five_pillars` and `sacred_places` |

**2. The da'if per-choice migration.** `choices` is `jsonb` holding a plain array of strings,
and `choices: string[]` is typed in six places across the app including multiplayer's
`LiveQuiz`. **Do not reshape `choices` into objects — it breaks the UI.** Add a nullable
`choice_meta jsonb` column instead, aligned by index, holding `{grading, reference}` per
choice; only da'if questions populate it, and every existing reader keeps working.
`scripts/question-bank/01-choice-meta-migration.sql` is written but **not applied**. Apply it
before authoring Hadith Sciences tier 5, which is where the format lives.

## The 29 categories, in authoring order

Author in this order. `sort_order` matches.

| # | slug | name | status |
|---|---|---|---|
| 1 | `aqeedah` | Creed (Aqeedah) | reused |
| 2 | `allah_names` | Allah's Names & Attributes | new |
| 3 | `five_pillars` | Five Pillars | reused |
| 4 | `quran` | Holy Quran | reused |
| 5 | `prophetic_biography` | Prophetic Biography | reused |
| 6 | `hadith` | Hadith Sciences | reused |
| 7 | `tafsir` | Quran Commentary | new |
| 8 | `quran_sciences` | Preservation of the Qur'an | reused |
| 9 | `tajwid` | Tajwid | new |
| 10 | `arabic_language` | Arabic Language | reused |
| 11 | `usul_fiqh` | Usul al-Fiqh | new |
| 12 | `fiqh` | Islamic Law (Fiqh) | reused |
| 13 | `ethics` | Islamic Ethics (Akhlaq) | reused |
| 14 | `dua_dhikr` | Du'a & Dhikr | reused |
| 15 | `tazkiyah` | Sufism & Spirituality | reused |
| 16 | `akhirah` | Afterlife (Akhirah) | new |
| 17 | `companions` | Companions (Sahaba) | reused |
| 18 | `ahl_al_bayt` | Ahl al-Bayt | new |
| 19 | `stories_of_prophets` | Other Prophets | reused |
| 20 | `miracles_signs` | Miracles & Signs | new |
| 21 | `women_in_islam` | Women in Islam | new |
| 22 | `islamic_history` | Islamic History | reused |
| 23 | `sacred_places` | Sacred Geography | reused |
| 24 | `arts_culture` | Islamic Arts & Culture | new |
| 25 | `science_in_islam` | Science in Islam | new |
| 26 | `islamic_finance` | Islamic Finance | new |
| 27 | `family_life` | Marriage & Family Life | reused |
| 28 | `interfaith` | Interfaith Relations | new |
| 29 | `contemporary_issues` | Contemporary Issues | reused |

## Stop and ask the owner only for these

Everything else, decide yourself and tell him what you decided.

- **Before running the wipe** — it is destructive and irreversible.
- **A bucket that cannot sustain 20 questions** — report the number, do not pad.
- **Anything that would change the category list, the tier maps, or the invariants above.**
- **A question touching contested ground** you cannot resolve within the Sunni condition.

## Report honestly

Say plainly what was not done and why. The owner values that over polish, and has said so.
If a category came out weaker than the others, say which and why. If a citation could not be
verified against real source text, say so rather than shipping it quietly.

## Things the schema will reject — learned the hard way

Checked against the live database while authoring Five Pillars. Each of these cost a failed
insert; none of them is guessable from the column list.

- **`source_type` is CHECK-constrained to `'human'` or `'ai_drafted'`.** Not `'ai'`.
- **`daily_challenges` references `categories` and blocks a category delete.** It also holds
  `question_ids` as a bare `uuid[]` with **no foreign key**, so wiping questions leaves it
  pointing at rows that no longer exist and the database will not warn you. It is
  regenerated daily; delete its rows as part of any wipe.
- **Six tables reference `categories`**, not the three the handoff names (those three
  reference *questions*). `mentor_questions`, `hunt_runs` and `forum_topics` are
  `ON DELETE SET NULL` and safe; `questions`, `daily_challenges` and `study_circles` block.
- **The stem cap is category-wide, not per tier.** Across all 180 questions only four may
  share an opening three words. `"What is the"` is exhausted almost immediately — plan
  varied openings from the first tier, because retrofitting them later means rewriting
  questions that were otherwise fine.
- **Budget your question *frames*, not just your facts.** This is the single biggest time
  sink in authoring. The near-duplicate check compares whole question strings, so four
  questions built on one frame — "Which classification applies to Surah X?", "How many verses
  does Surah Y have?", "Applied to an attribute, what does Z mean?" — flag against *each
  other* even though every fact is different. **Cap any one frame at two uses per category**
  and vary the verb as well as the subject. It costs nothing while drafting and is expensive
  to repair afterwards.
- **Categories with a dominant shared noun collide hardest.** In Holy Quran nearly every
  question contains "Quran" or "surah", so short questions sit above 0.5 similarity on the
  shared words alone. Write longer, more specific stems there, and prefer frames that name
  something distinctive ("Between al-Isra and Maryam, which surah stands?") over generic ones
  ("Which surah is eighteenth?").
- **Watch the answer cap while drafting too.** In a category about one subject the same
  answer recurs naturally — "Al-Fatihah", "Al-Baqarah", "Sahih", "Hanafi" — and three uses
  trips it. When an answer is about to repeat a third time, recast the question so it tests
  the fact from the other end.
- **Near-duplicate flags usually mean the questions are genuinely redundant.** Three
  questions asking the rak'ah count of three different prayers tripped it. The right fix was
  to replace two with different facts, not to reword them until the checker stopped
  complaining. Rewording to defeat the validator defeats the point of having it.
