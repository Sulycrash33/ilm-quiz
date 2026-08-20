# ILM Hunt — session handoff

Written 2026-08-20. Read this first if you are picking up work on the question bank.

## Where we stopped

The app builds, deploys, and the core loop works. PRs #16, #17 and #18 are merged.
The next piece of work is **the question bank**, and it has not started.

## The decision that was made

The question bank is short of what the owner asked for, and we agreed how to fix it.

**What he asked for:** 25 categories x 9 difficulty tiers x **20 questions** = **180 per category**,
**4,500 in total**.

This was raised from 10 per tier to 20 on 2026-08-20, deliberately and with the trade-off
stated. The reason is not storage (see below) — it is **repetition**. A Hunt run is 10
questions and the ladder draws from the player's tier plus one either side, so at 10 per
bucket a player has only 30 questions in reach and starts seeing repeats on their third run
in a category. At 20 per bucket that becomes 60, or roughly six runs. Still not generous.

He was told that the real cost of doubling is not disk but scholar review — 4,500 unreviewed
questions are worse than 2,250 reviewed ones — and chose 20 anyway. That is his decision;
do not relitigate it.

**What actually exists** (verified against the live database, project `ziblpvwiqzpjnkqjwodl`):

| | |
|---|---|
| total rows in `questions` | 1,169 |
| authored for a specific tier (`seed_batch` set) | 896 |
| older rows whose tier was *estimated* from easy/medium/hard | 273 (`tier_is_estimated = true`) |
| buckets (category x tier) holding exactly 4 questions | **150 of 225** |
| thinnest / fullest bucket | 4 / 12 |
| short of 20-per-bucket (**the target**) | **3,331 questions** |
| short of 10-per-bucket (superseded) | 1,083 questions |

Every one of the 225 buckets has something in it, but most are shallow. Coverage was
chosen over depth in the first pass, and that trade was not clearly flagged to the owner
at the time. He has since been told plainly.

**Storage is not a constraint and must not be treated as one.** This was settled by
measurement, not estimation: a copy of the `questions` table with identical columns,
constraints and indexes was filled to each size and measured.

| questions | measured size | % of the 500 MB free plan |
|---|---|---|
| 1,169 (today) | 776 kB | 0.15% |
| 2,338 | 1.4 MB | 0.28% |
| **4,676** (~the 4,500 target) | **2.7 MB** | **0.53%** |
| 23,380 | 13 MB | 2.58% |

Cost per row *falls* as the table grows (680 bytes at today's size, 578 at 23,000) because
index overhead amortises. What will eventually consume space is `attempts` — one row per
player per answer, currently 0 rows — not questions. Do not raise storage as a reason to
limit the question bank.

## How the remaining questions are to be written

1. **Original questions, generated from primary sources.** Do *not* lift existing question
   sets from quiz sites or apps and rephrase them. A curated question bank is a protected
   compilation, "rephrase to match our style" is derivative work, and it would import other
   people's errors. This was discussed and agreed with the owner.
2. **Sunni school of thought is the one hard condition.** Where the four schools agree, tag
   `madhab_tag = 'agreed'`. Where they differ, name the specific school. Never present one
   school's position as consensus.
3. **Contemporary fatwa is not ijma.** Most online claims of contemporary ijma are one
   council's position. Keep them distinguishable from classical consensus.
4. **Citations are the weakest part of what already exists.** Verifying them against real
   source text is the main reason web access was opened.

## Sources to use

- `quran.com` / `tanzil.net` — Quranic text, translations, tafsir
- `sunnah.com` — the nine major collections, with reference numbers and gradings
- `dorar.net` — hadith gradings; this is what makes the da'if question format possible
- `islamweb.net`, `dar-alifta.org` — fiqh across the four schools
- `shamela.ws`, `archive.org` — classical Arabic texts
- `en.wikipedia.org` — secular facts for the geography / science / history categories

Note: `islamqa.info` is widely cited but has a distinct orientation. For an app serving all
four madhahib, prefer sources that present the schools side by side.

## The da'if question format (owner's design)

Four real hadith are presented and the player picks **which one is weak**. The purpose is
not to teach the content of the weak narration — it is to teach that *gradings exist* and
that authenticity varies.

**Schema implication, not yet built:** grading and source reference have to hang off **each
choice**, not off the question, because all four choices are real narrations with real
sources. A migration is needed. Gradings to support: `sahih`, `hasan`, `da'if`, `mawdu'`.

A weak narration may never be the basis of a *ruling* question — only of a question about
the narration itself.

## Still blocking

~~**The category list.**~~ **Settled 2026-08-20.** The owner gave the final list and it is
recorded, ordered, and mapped tier by tier in `docs/CATEGORY_TIER_MAPS.md`. Authoring is no
longer blocked on it.

**29 categories x 9 tiers x 20 questions = 5,220**, up from the 25 x 180 = 4,500 above. The
owner's own list came to 26; he then accepted three additions — Usul al-Fiqh, Du'a & Dhikr,
and Preservation of the Qur'an (Jam' & Qira'at) — proposed because the sources sustain nine
genuine tiers in each. **Intimacy** was renamed **Marriage & Family Life** at his direction;
marital intimacy remains a strand within it.

Web access was also confirmed the same day. `sunnah.com` and `dorar.net` are both walled off
behind Cloudflare and a key requirement; `fawazahmed0/hadith-api` replaces them as the hadith
backbone. See `docs/SOURCES.md` for what was probed and what came back.

He also asked that once the scouting was done, we suggest categories of our own, based on
where the sources actually support nine tiers of genuine difficulty and where they do not.
**Done 2026-08-20.** Three were proposed and accepted (above). **Islamic Calendar was
considered and deliberately not proposed** — it is exactly the narrow category this
paragraph warns about, and it is better folded into Five Pillars and Sacred Geography than
stretched over nine tiers. Difficulty and obscurity are not the same thing, and a narrow
category reaches the top of the ladder only by becoming obscure.

## Environment

Web access was blocked when this was written. The owner created a new cloud environment
named **ILM full** with **Full** network access. Sessions must be started in that
environment, not in **Default**.

**First thing to do in a new session:** actually fetch something from `sunnah.com` and
`quran.com` and confirm real text comes back. If it is still blocked, say so plainly rather
than working around it.

## Outstanding items the owner has not actioned

- `RESEND_API_KEY` and `MODERATION_ALERT_EMAIL` are not set in Vercel
- No mentor has been approved yet at `/admin/moderation`
- All 1,169 questions are AI-drafted and **not scholar-reviewed**. They must pass
  `ai_drafted -> scholar_approved -> published` before any public launch. The citations are
  what most need checking.
- `profiles.high_score` is lifetime XP under a misleading name
- Prayer times are calculated with the ISNA method, hardcoded; the owner is in Nigeria and
  his local mosque may use a different calculation
- Authenticated routes are not covered by `scripts/check-mobile-overflow.mjs` — it cannot
  log in. A throwaway test account would let it cover them.

## Language: author in English, translate later

Decided 2026-08-20 by the owner: **the question bank is authored in English only.**
Translation happens afterwards, one language at a time, as its own phase. Do not author a
category in several languages at once, and do not hold up authoring for a translation.

This is not a demotion of Hausa. It is sequencing: 5,220 questions in one language, checked
once, then translated deliberately — rather than six partial banks that each need their own
scholar review.

**What is already true in the codebase** (checked, because two planning documents in this
repo disagree about it):

- `src/lib/i18n.ts` carries **complete UI translations for all six locales** — en, ha, fr,
  ar, id, ms — with real Hausa strings, not fallbacks ("Barka da zuwa", "Lokutan salla").
- `.claude/plans/comprehensive-fix-plan.md` and `.mimocode/plans/…` both claim Hausa, French
  and Arabic are untranslated or fall back to English. **Those claims are stale.** Believe
  `src/lib/i18n.ts`.
- `app_language` already defaults to `'en'` in the schema, so authoring in English needs no
  migration.

So the app's *interface* is already multilingual and stays that way. Only the *questions*
are English-first.

**What the sources allow, when translation does begin** (measured, see `docs/SOURCES.md`):

| | Hausa available |
|---|---|
| Qur'an via quran.com | **yes** — Abubakar Mahmoud Gumi (id 32), Abubakar Mahmood Jummi (id 115) |
| Qur'an via the fawazahmed0 mirror | **yes** — 4 editions, both translators, with and without transliteration |
| **Hadith via fawazahmed0 (our backbone)** | **no** — ar, bn, en, fr, id, ru, ta, tr, ur only |

Gumi's is the Hausa Qur'an most Nigerian players will recognise, so Qur'anic material can be
rendered into Hausa against a text they already know. **Hadith has no Hausa edition in any
source scouted.** When the Hausa phase starts, hadith text will have to be translated rather
than sourced — that is a scholar's job, not a mechanical one, and it should be planned as
such rather than discovered mid-phase.

## Standing preferences

- **Mobile first.** Most players will be on Android and iPhone. An `xs` breakpoint at 380px
  exists because Tailwind's smallest default (`sm`) is 640px wide and no phone reaches it in
  portrait. Check phone widths before desktop, always.
- Say plainly what was not done and why. The owner values that over polish.

---

# The question bank is to be rebuilt from zero

Added 2026-08-20 at the owner's instruction. This section overrides anything above that
implies topping up the existing bank.

## Wipe first

**Delete all existing questions and author 4,500 fresh ones.** Do not keep any of the
current 1,169. They were written to a 10-per-bucket target, 273 of them have a tier that was
*guessed* rather than authored, and mixing them into a fresh bank would leave exactly the
inconsistency this rebuild exists to remove.

The wipe is safe. All three tables that reference `questions` were checked and every one is
empty:

| referencing table | rows |
|---|---|
| `attempts` | 0 |
| `quiz_room_questions` | 0 |
| `user_question_schedule` | 0 |

Nobody has played yet, so nothing is lost. **Re-check these counts before deleting** — if
the owner has been testing, they may no longer be zero, and in that case ask him before
destroying anything.

## Three failure modes he explicitly asked to be protected against

He named these himself. They are the ways this job goes wrong, and none of them is prevented
by intending not to do them. Each needs a mechanism.

### 1. Repetition and near-duplicates

The risk is not exact duplicates — the loader already rejects those. It is **asking the same
thing in different words**, and **many questions sharing one answer** ("Abu Bakr" as the
answer to nine questions in The Companions).

Enforce it with a validator that runs after **every** category batch, not at the end:

- `create extension if not exists pg_trgm;` — it is available on this project but not yet
  installed. Then flag any pair within a category where
  `similarity(question_text_a, question_text_b) > 0.5`.
- Flag any correct answer appearing more than **twice** within a category.
- Flag repeated stems: more than four questions in a category opening "Who was the first",
  "How many", "In which year", and so on.
- Every question in a bucket must test a **distinct fact**. Twenty questions at Faqih level
  in Zakat must be twenty different rulings, not one ruling asked twenty ways.

Report the validator's output to the owner after each category. Do not report a category as
done until it comes back clean.

### 2. Drifting or thinning out partway through

4,500 is long enough that quality decays without structure. So:

- **Author one category at a time**, all 180 questions, all nine tiers, then stop and show
  him before starting the next.
- **Within a category, write the full tier spread together** — tier 1 and tier 9 of the same
  category authored in the same pass. The gradient is only real if the two ends are visible
  to each other. Never write all of tier 1 across every category and come back for tier 9
  later; that guarantees an inconsistent ladder.
- **Never pad to reach 20.** If a bucket genuinely cannot sustain twenty distinct questions
  at that level, say so and name the bucket. Do not fill it with trivia to make the number.
  The owner would far rather hear "Islamic Calendar tier 9 supports 12, not 20" than receive
  eight questions nobody can defend.

### 3. Ignoring the difficulty levels

The single most likely failure is 4,500 questions of roughly the same difficulty wearing
nine different tier labels. The tier must change **what kind of knowledge is required**, not
merely how obscure the fact is.

**Difficulty is not obscurity.** "Which sahabi had the fewest narrations" is obscure, not
hard. "Why do the Hanafis and Shafi'is differ on raising the hands, and what does each rely
on" is hard. Prefer the second at high tiers, always.

Working rubric — each tier demands a different *type* of knowing:

| tier | rank | what a question at this level requires |
|---|---|---|
| 1 | Mubtadi | a single everyday fact a practising child would know |
| 2 | Talib | basic maktab teaching; still single-fact recall |
| 3 | Hafiz | specific names, numbers, sequences — requires having actually studied |
| 4 | Faqih | a ruling **and its condition**, not just the ruling |
| 5 | Muhaddith | a narration together with its source or grading |
| 6 | Mufassir | context of revelation, or a distinction drawn in tafsir |
| 7 | Shaykh | comparing two positions, or knowing an exception to a general rule |
| 8 | Imam | where the schools differ **and why** |
| 9 | Mujaddid | synthesis — applying a principle to a case, or a chain of reasoning |

Check each finished bucket against this rubric before moving on. A tier-8 question that is
really a tier-3 fact with harder vocabulary must be rewritten, not relabelled.

## Verification after every category

Run and report:

```sql
select t.id as tier, count(q.id) as n
from public.rank_tiers t
left join public.questions q
  on q.tier = t.id and q.category_id = :category_id
group by t.id order by t.id;
```

Every tier must read exactly 20. Then run the duplicate checks above. Only then move on.
