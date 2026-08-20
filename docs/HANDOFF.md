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

**The category list.** The owner is rearranging it — cutting some categories and adding
others. Do not author depth into categories that may be about to be deleted. Wait for the
final list.

He also asked that once the scouting is done, we suggest categories of our own, based on
where the sources actually support nine tiers of genuine difficulty and where they do not.
Narrow categories (e.g. Islamic Calendar) will struggle at the top tiers, where the risk is
drifting from difficulty into obscure trivia. Those two things are not the same.

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

## Standing preferences

- **Mobile first.** Most players will be on Android and iPhone. An `xs` breakpoint at 380px
  exists because Tailwind's smallest default (`sm`) is 640px wide and no phone reaches it in
  portrait. Check phone widths before desktop, always.
- Say plainly what was not done and why. The owner values that over polish.
