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
9. **Vary where the answer sits.** The app serves `choices` in stored order — nothing
   shuffles them for the player. Aim for a roughly even spread across indexes 0-3 within a
   category, and let `validate.sql`'s `answer_index_skew` check confirm it before you call
   the category done. This one bit me: the first five categories were authored straight off
   the insert template, whose example puts the answer at index 1, and they came out ~90% at
   index 1 — a player who always pressed the second button would have scored about 89%
   without knowing a thing. Fixed across all 920 rows by a deterministic rotation keyed on
   `hashtext(id::text) % 4`, rotating `choices` and `choice_meta` together and recomputing
   the index. Safe only because no choice in the bank refers to another by position; check
   that again before ever repeating it.

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
had to report short. **Then start the next category without waiting.**

> **Standing instruction, 2026-08-20, from the owner: do not stop for permission between
> tiers or between categories.** This supersedes the handoff's "stop and show him before
> starting the next". Report what you finished and keep going. The four items under *Stop and
> ask the owner only for these* below are still the only reasons to halt.

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

## Two failures the tooling now prevents

**A failed pre-flight used to still write its file.** `emit.check()` printed `PROBLEMS:` and
returned `False`, and every authoring script then called `emit.build()` regardless. Nothing
enforced the check — it worked only because I happened to re-run after reading the output. It
now raises `SystemExit(1)`, so a failed check can never produce output.

**Staging files must be namespaced per category.** They were named by tier (`t1.sql`…`t9.sql`),
which meant Hadith Sciences and Tajwid both wanted `t1.sql`. Worse, the cross-tier duplicate
loader globs `t*.sql`, so it silently fed one category's stems into another's check and produced
a page of phantom collisions. Staging files now live in `cat/<slug>/<tier>.sql` and the loader is
pointed at one category's directory. Write tier files under the category slug, never at the root.

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
- **Trigram similarity ignores word order.** Two questions differing only in the arrangement
  of the same words score **1.000** — "What does naskh al-hukm duna al-tilawa describe?"
  against "What does naskh al-tilawa duna al-hukm describe?" were flagged as identical. Where
  a subject has paired terms that are mirror images of each other, ask about them in genuinely
  different shapes rather than swapping the order.
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

### Added while authoring Hadith Sciences

- **An insert can land twice, silently.** Three `execute_sql` batches each landed twice —
  tier 5 read **35 rows for 20 questions**. Nothing errored. Migration
  `unique_question_text_per_category` now puts a unique index on
  `(category_id, question_text)` so a repeated batch fails loudly instead. **Still check the
  tier count after every batch**; the index catches exact repeats, not a half-landed batch.
- **Check for near-duplicates across the whole category before inserting, not within a tier.**
  A per-tier pre-flight passed cleanly and the category-wide validator then flagged five
  near-duplicate pairs and three over-used stems — every one of them a *cross-tier* collision
  ("What does the grade munkar indicate?" in tier 3 against "What does the grade shadh
  indicate?" in the same tier; "Which statement about the five conditions is accurate?" in
  tier 4 against "Which statement about the six collections is accurate?" in tier 2). Load the
  category's existing stems and compare against them while drafting.
- **Authoring naturally puts the correct answer first every time.** Twenty questions written in
  a sitting will have all twenty answers at index 0, because that is the order you think in.
  The app serves choices in stored order — nothing shuffles them. Apply a deterministic
  rotation before emitting SQL (`emit.rebalance` in the scratchpad tooling) rather than
  hand-tuning positions, which turns into whack-a-mole against the skew check.
- **Do not parse SQL literals with a regex.** `'((?:[^']|'')*)'` is ambiguous on rows
  containing `''` and mis-aligns its capture groups, which will hand you a defect report about
  the wrong choices in the wrong rows. Write a real character scanner.
- **Corpus text needs a quality filter before it reaches a player.** The translations carry
  leading stray parentheses, OCR artifacts (`9saw`, `waived meaning`), mid-sentence
  truncations, and cross-reference fragments that are not standalone narrations. Filter on all
  of these, and reject any text ending in `(ﷺ)` — in this corpus that reliably marks a cut-off
  sentence. Beware over-filtering too: the Abu Dawud translation routinely omits a final full
  stop on complete sentences, so "no terminal punctuation" alone is not a defect.

### Added while authoring Quran Commentary

- **The pre-flight now computes the validator's own number.** It used to score stems by 4-gram
  Jaccard while `validate.sql` used pg_trgm, so pairs passed locally and failed in the database —
  three did, including the *same quotation* used as the subject of two questions in different
  tiers. `scripts/question-bank/trgm.py` is now a faithful port of pg_trgm `similarity()`, and
  `emit.check` uses it at the validator's threshold of 0.5.

  The algorithm, confirmed against `show_trgm()` on the live database: lower-case, split on every
  non-alphanumeric character, pad each word with **two leading spaces and one trailing**, take
  sliding windows of 3, collapse to a **set**, then `|A n B| / (|A| + |B| - |A n B|)`.

  Two details that matter for this project's text: Postgres treats **U+FDFA (ﷺ) as a word
  character** — it hashes the multibyte trigrams, which is why `show_trgm` prints them as hex —
  while **curly quotes and em dashes are separators**. Python's `str.isalnum()` agrees on all
  three, so the port needs no special-casing; `trgm.py`'s self-test pins this down. Verified
  end-to-end against all 16,110 pairs in one finished category: same count above threshold, same
  maximum, same sum.

  **Keep the threshold in `emit.check` in step with `validate.sql`.** Run the database check
  anyway when a category is done — it also covers tier counts, answer repeats, stem repeats and
  answer-position skew, which the pre-flight only partly duplicates.
- **Watch for one source item reused as the subject of two questions.** Not the same wording — the
  same *thing*. Ibn 'Abbas's "I am among those firmly grounded in its ta'wil" anchored a tier-5
  question and a tier-8 question. Keep a list of the specific narrations, quotations and incidents
  already used as subjects, not just the stems already written.
- **Mirror-image question pairs remain the most common self-inflicted flag.** "If X means A, then…"
  beside "If X means B, then…" is the same trap as the parallel constructions in Allah's Names.
  Where a subject has two symmetrical branches, put one of them in a different shape — a citation
  question, or a "which side does this support" question.

### Added while authoring Islamic Ethics (Akhlaq)

- **Never hand-retype or reconstruct an INSERT from memory or a terminal preview — read the
  file and paste its exact content.** All 9 tiers passed `emit.check()` and every generated
  `.sql` file parsed to a clean 5/5/5/5 `correct_choice_index` split. But after inserting, the
  live database's `answer_index_skew` check flagged index 1 used 116 times out of 180. The
  authoring and validation were never broken; the corruption happened at the insert step itself
  — the `VALUES` clause was being retyped into the tool call from a `sed`/terminal preview of the
  file rather than from the file's own content, which silently desynced the shuffled `choices`
  array from its `correct_choice_index` in several rows per tier. Only the one tier that had been
  pasted verbatim from the start came out correct.

  The fix, and the standing rule going forward: use **Read** to load a staging `.sql` file in
  full, then pass that exact text, unmodified, as the query. Never compose the query by hand from
  a preview, a summary, or recollection of what the file contains. Verify immediately after each
  insert with a per-tier `group by correct_choice_index` count — cheap enough to run every time,
  and it would have caught this on the first tier instead of after all nine.

### Added while authoring Companions (Sahaba)

- **A tier built around "the same fact, once per person" (four caliphs' full names, four
  Companions' kunyas, four death-dates) collides with itself even when no wording is literally
  copy-pasted.** `emit.check()`'s trigram similarity doesn't care that the *subject* differs —
  "What was Abu Bakr's family relationship to the Prophet (ﷺ)?" and the same sentence with
  "'Umar" swapped in share enough trigrams to trip the >0.5 threshold. Filling in a template four
  times is the failure mode, not a typo. The fix is to break the parallel structure itself:
  vary which noun phrase leads the sentence, fold two facts into one combined question instead of
  two near-identical ones, or ask for a specific pairing/contrast across all four instead of the
  same question four times. This came up repeatedly — tier 1's four "full name" and four "family
  relationship" questions, tier 2's four "how did X become caliph" questions — and cost more
  rounds of fixing than any other single pattern this category produced.
- **The database's `answer_repeated` check (same correct-answer text used more than twice) can
  pass `emit.check()` clean and still fail once inserted, for the same reason as the point above:**
  four different "how is this hadith graded?" questions whose correct answer was all, word for
  word, "Sahih, carrying the standing authenticity of material within Sahih al-Bukhari itself."
  `emit.check()` only compares within one tier's batch against `existing`-loaded stems; it does
  not itself flag a repeated *answer* text the way `validate.sql`'s database check does. Vary the
  phrasing of a recurring correct answer (e.g. "graded sahih, since inclusion in Sahih al-Bukhari
  itself confers that standing" vs "sahih — the same standing authenticity as other Bukhari
  material") whenever the same underlying fact will be the correct choice more than twice in a
  category, and always run the full-category `answer_repeated` query — not just `tier_count`,
  `near_duplicate`, `answer_index_skew` and `stem_repeated` — since this bug produced zero
  warnings anywhere except that one specific database check.
- **For the hardest, non-partisan tier (differing historians on the Fitna), naming specific
  scholars for specific positions and explicitly flagging what is *not* confirmed (Ibn
  Taymiyyah's own personal stance on fana' al-nar-style leniency was left ambiguous by design;
  'A'ishah's reported regret over the Camel was hedged as "widely reported, not independently
  verified to a single isnad") kept the tier factual without requiring this project to adjudicate
  between Companions — exactly the instruction the tier map gives for this bucket.

### Added while authoring Ahl al-Bayt

- Both bug patterns above recurred here (per-person-template collision in tiers 1-3; the
  answer_repeated-passes-`emit.check()`-but-fails-the-database-check trap was watched for and
  avoided this time by varying answer phrasing up front rather than discovered post-insert).
- **Verify a sensitive scope/fiqh premise against real sources before drafting a whole tier
  around it — don't assume a disagreement exists just because it would make a plausible tier.**
  The planned premise for a zakat-scope tier ("Sunni schools dispute whether the Prophet's ﷺ
  wives are covered by the zakat-prohibition rule") was checked with research before any rows
  were written and turned out to be false — Ibn Kathir treats the wives' inclusion as settled,
  not disputed, and no school argues otherwise. The tier was rebuilt around the real, verified
  dispute found in that same research pass (the Banu Hashim/Banu al-Muttalib zakat-boundary
  question, where the Shafi'i school genuinely diverges from the Hanafi/Maliki/jumhur majority).
  Checking the premise *before* writing 20 rows around it is cheaper than discovering later that
  the whole tier rests on an invented disagreement.

### Added while authoring Miracles & Signs

- Both the per-person-template collision and the answer_repeated trap were watched for from the
  start this category (varied stems and answer phrasing up front); neither recurred as a post-insert
  surprise. Other Prophets and Other Prophets alone needed a post-insert fix this segment (see above);
  this category validated clean on every tier's first `emit.check()` pass or after one round of
  category-wide stem-cap fixes.
- **Not every claimed "interpretive debate" is a real classical one — check before presenting a
  contrast as though both sides carried equal scholarly weight.** Research for this category's
  tier 6 explicitly flagged that Sulayman's wind-sign (34:12) has no genuine classical mufassir
  minority reading it figuratively, unlike the moon-splitting (54:1)'s real, named majority/minority
  split (Ibn Kathir et al. vs Rashid Rida et al.). The temptation, drafting a "literal vs
  figurative" tier, is to manufacture a parallel debate for every verse covered. Presenting 34:12's
  literal reading as carrying the same weight of division as 54:1's would overstate the sources.
  The fix was to draft 34:12 as a *contrast* case — "here is a claimed debate that isn't real,
  unlike this one" — which taught the tier's actual lesson more precisely than two parallel "real
  debate" cases would have.
- **A weak hadith-isnad and a modern empirical misattribution are two different kinds of caution —
  don't collapse them into one "this is false" bucket.** The spider-web-at-Thawr story is a
  hadith-grading problem (a weak/unauthenticated chain). The "NASA photographed the moon-splitting
  crack" claim is not a hadith at all — it's a modern claim conflating an ordinary lunar geological
  feature with Qur'an 54:1, and NASA has denied it. Both are popular-but-wrong, but a reader who
  treats them identically (as if both were isnad problems, or both were empirical-fact problems)
  will misdiagnose the next claim they encounter. Tier 5 and tier 9 both drew this distinction
  explicitly rather than lumping the two together as one flavor of "debunked miracle story."
- This category's tier map carries the project's most explicit sourcing rule of any category so
  far: weak material may ground a question *about the narration itself*, never a ruling question.
  Every tier-5 row citing a weak or unauthenticated claim (the pebbles narration, the spider-web
  story, the shadowless-Prophet claim) was phrased as "what is this claim's actual grading/status,"
  never as "this happened" — worth flagging as the concrete pattern to imitate whenever a future
  category's tier map singles out a similar weak-material risk.

### Added while authoring Women in Islam

- **"Authentic but widely decontextualized" is a third bucket, distinct from both "sound ruling"
  and "weak/fabricated."** Bukhari 304 ("deficient in intelligence and religion") and the
  "crooked rib" hadith (Bukhari 3331/5186, Muslim 1468) are both genuinely sahih — the problem
  with each is that a popular reading quotes an opening clause in isolation and draws a
  blanket-inferiority conclusion the hadith's own internal wording (304 explicitly ties its two
  clauses to the testimony ratio and to missed prayer/fasting during menses) or its classical
  commentary (the rib hadith's actual point, per commentators, is a caution against harsh
  treatment) does not support. Tier 5's fix was to always pair the hadith with its own internal
  explanation or its commentators' actual reading, rather than either asserting the popular
  misreading or — worse — treating the hadith's genuine authenticity as itself suspect. Don't
  conflate "commonly misquoted" with "weak"; they call for different fixes.
- **A single hadith can carry a real, unsettled grading dispute (hasan gharib, contested by later
  scholars) *and* a settled non-literal reading, at the same time — these are two separate
  questions, and a quiz item should keep them separate.** The wife-prostration saying (Tirmidhi
  1159) is graded hasan gharib by at-Tirmidhi himself, with later muhaddithun genuinely split on
  whether corroborating routes raise it to sahih or whether the chain stays weak — that is an
  open grading question. Separately, and regardless of how that grading question resolves, every
  source reads the saying as rhetorical hyperbole, not literal permission for prostration (which
  is categorically forbidden). Tier 5 phrased this as "authentic-but-contested-grading and
  rhetorical," not collapsing the grading dispute and the literal/figurative question into one
  verdict.
- **When a quote's specific attribution to a named individual is itself disputed across sources
  (not just its isnad-strength), say so explicitly rather than picking the more dramatic
  attribution.** Research for tier 6 flagged that the "Allah heard her from above the seven
  heavens" line (on Khawlah bint Tha'labah's zihar case, Surah al-Mujadilah) is attributed in
  different sources to *either* 'A'ishah or 'Umar, with the report itself sitting in tafsir
  literature (Ibn Abi Hatim, al-Bayhaqi) rather than at Bukhari/Muslim's isnad-strength level.
  The tier was written to flag this attribution as unresolved ("reported, variably, as...") rather
  than asserting one name as the confirmed speaker — the same discipline as grading a hadith, just
  applied to a report's speaker instead of its chain.
- **A genuine four-madhab fiqh disagreement (tier 8: wali, khul', testimony) is not a "weak vs
  sound hadith" dispute, even when named hadith are central to it.** The wali question turns on
  two schools reading the same broadly-authenticated hadith corpus differently (usul-level
  interpretation, plus one chain-strength sub-dispute over the stronger "her marriage is invalid"
  wording) — not on one side citing sound material and the other citing fabrications. Framing it
  that way would misrepresent mainstream, still-practiced Sunni fiqh as a soundness dispute it
  isn't. The same care applies to khul's talaq-vs-faskh classification and to testimony's
  domain-specific 2:282-vs-childbirth/breastfeeding carve-out: name each school's actual evidence,
  and don't flatten "the schools differ" into "one school is right and the others are weak."
