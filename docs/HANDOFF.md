# ILM Hunt — session handoff

Written 2026-08-22, replacing the 2026-08-20 note. **Read this first if you are
picking up work cold.** Everything below was verified against the live database
(project `ziblpvwiqzpjnkqjwodl`) and `main` at commit `48bb2d1` on the day it
was written — re-check anything you are about to depend on rather than trusting
the numbers blind.

## Where things stand

The question bank is **finished**. The retention and progression gaps found in
the August audit are **closed**. What is left is one build (offline play), one
ten-minute credential task that only the owner can do, and one long human
process (scholar review).

| | |
|---|---|
| Questions | **5,220** — 29 categories × 9 tiers × 20 |
| Published | 5,220 (all of them) |
| `source_type = 'ai_drafted'` | 5,220 |
| **`scholar_approved`** | **0** |
| Accounts in the database | **1** |
| Active pg_cron jobs | 5 |
| Migrations | through `0028` |

## The three things still open

### 1. Offline play — not started, and it is the real remaining build

Cache the app shell and a tier's questions so a run survives losing signal, and
queue answers to submit on reconnect. Deliberately sequenced last: it is the
largest piece and it is worth more once there are players to keep.

`public/sw.js` exists but **caches nothing on purpose** — it handles push and
notification clicks only. Do not bolt a cache onto it casually. A half-built
cache serving a stale question bank is invisible in development and infuriating
in the field.

### 2. Streak reminders are built but dormant — needs VAPID keys

All the code shipped in PR #29. The cron job runs daily at 17:00 UTC and
currently does nothing, by design, because **0 of the 2 required Vault secrets
are set**. This is not a bug to fix; it is a credential the owner must create.

```bash
npm run vapid:keys      # prints a pair; nothing is written to disk
```

Public key → Vercel (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`). Private key → Supabase
function secrets. Plus two Vault secrets so cron can reach the edge function.
Full walkthrough in `docs/RUNBOOK.md` under "Streak reminders".

Until then the profile toggle honestly reads "Reminders aren't set up on this
server yet" rather than failing silently.

### 3. Scholar review — zero of 5,220

This is the one item that is a **credibility risk rather than a feature gap**.
Every question is AI-drafted with a verified citation, and not one has been read
by a scholar. `review_status` and `source_type` record this honestly, so nothing
is being misrepresented — but an Islamic knowledge app whose entire bank is
unreviewed is a liability if it grows.

Do not attempt all 29 categories. Take **one** end to end — Contemporary Issues
is the riskiest and therefore the most informative — to find out what review
actually costs before committing.

## Things a fresh session gets wrong

- **The bank is done.** Do not start rebuilding it. If you find yourself
  authoring questions, stop and re-read this file.
- **Chests, the spin wheel, study circles and daily challenges are fully wired**
  with seeded prize tables. An earlier session claimed they were half-built.
  That was wrong, and the correction matters because "finish the reward system"
  is wasted work.
- **A level run is the whole tier — 20 questions, not `HUNT_RULES.runLength`
  (10).** That was a real bug, fixed in PR #26. `buildTierLadder` serves the
  whole bucket.
- **Achievements are awarded by the database**, in `award_achievements()`
  (migration 0023), called after every graded answer. The TypeScript evaluator
  in `profile-stats.ts` survives only for progress bars and cannot grant
  anything. Do not re-add awarding logic to TypeScript.
- **Only one account exists.** Multiplayer, leagues, study circles and the forum
  have never been exercised by two people at once. Leagues can now close weeks
  for the first time (migration 0024) but have never had a cohort to rank.
  Creating a second test account is the cheapest way to learn something real.

## Conventions that are load-bearing

- **SECURITY DEFINER RPCs** need `set search_path = public`, *and* both
  `revoke all ... from public, anon;` and `grant execute ... to authenticated;`
  — Postgres grants EXECUTE to PUBLIC and Supabase's defaults grant to `anon`
  separately. Migration 0013 is the reference. Migration 0028 closed seven
  trigger functions that had been left open by exactly this oversight.
- **Verify migrations live in a rolled-back transaction** before believing them.
  `begin; ... ;` through the Supabase MCP rolls back if you never commit — every
  RPC in 0023–0028 was proven this way.
- **i18n has zero drift and a guard that enforces it.** `npm run test:i18n`
  checks key parity across all six locales, empty values, interpolation
  placeholders, and hardcoded English JSX outside admin. Add every new string to
  all six locales in the same edit.
- **Never hand-retype SQL into the database.** Read the staged `.sql` file and
  paste its exact content.

## Before you claim anything is done

```bash
npx tsc --noEmit        # supabase/functions is excluded — it is Deno
npm run build
npm run test:engine
npm run test:i18n
```

## Recent history

| PR | What |
|---|---|
| #30 | Took seven trigger functions off the public API |
| #29 | Live achievements, the scheduler, the nine-tier explainer, streak reminders |
| #28 | Game sound, off by default, no dhikr as a reward cue |
| #27 | Players can reset their own progress |
| #26 | A level run serves the whole tier, not 10 questions |

The August 2026 audit that produced this list of gaps was published as a build
ledger artifact; ask the owner for the link if you need the reasoning behind the
priorities rather than just the outcomes.
