# ILM Hunt — session handoff

Written 2026-08-24, replacing the 2026-08-22 note. **Read this first if you are
picking up work cold.** Everything below was verified against the live database
(project `ziblpvwiqzpjnkqjwodl`) and `main` at commit `c801060` on the day it
was written — re-check anything you are about to depend on rather than trusting
the numbers blind.

## Where things stand

The question bank is finished and every category is now reachable. The app has
had a pass for how it *feels* to play, and the three game modes that used to be
cards with nothing behind them are built. What is left is one build (offline
play), one ten-minute credential task only the owner can do, and one long human
process (scholar review).

| | |
|---|---|
| Questions | **5,220** — 29 categories × 9 tiers × 20 |
| Published | 5,220 (all of them) |
| `source_type = 'ai_drafted'` | 5,220 |
| **`scholar_approved`** | **0** |
| Accounts in the database | **2** |
| Active pg_cron jobs | 5 |
| Migrations | through `0030` |

## The lesson this codebase keeps teaching

Almost nothing found in the last session was a missing feature. It was wiring
between two halves that already worked:

- The avatar was chosen at onboarding, stored, and drawn by no screen at all.
- The category grid was complete and counted wrong, so 23 of 29 categories
  rendered "Coming soon" over a finished bank.
- The daily challenge existed every day and the card announced "No challenge
  today" while its own request was still in flight.
- The store worked and its own footnote told players it did not.
- Rank-ups fired correctly and showed a pill in the corner of a card.

Treat "X is missing" as a hypothesis to test, not a fact. Four separate times
the guess was wrong, and each time the truth was a small fix rather than a
feature.

## The three things still open

### 1. Offline play — not started, and it is the real remaining build

Cache the app shell and a tier's questions so a run survives losing signal, and
queue answers to submit on reconnect.

`public/sw.js` still **caches nothing on purpose** — it handles push and
notification clicks only. Do not bolt a cache onto it casually; a half-built
cache serving a stale question bank is invisible in development and infuriating
in the field.

One prerequisite is now cleared: the service worker **registers on load for
every player** (`src/lib/service-worker.ts`, mounted from the app layout). It
used to register only inside the push-permission flow, which is gated behind a
VAPID key that has never been set — so before this it was never registered on
any device, and there was nothing for a cache to attach to.

### 2. Streak reminders are built but dormant — needs VAPID keys

Unchanged. All the code shipped in PR #29; the cron job runs daily at 17:00 UTC
and does nothing because **0 of the 2 required Vault secrets are set**. This is
a credential the owner must create, not a bug.

```bash
npm run vapid:keys      # prints a pair; nothing is written to disk
```

Public key → Vercel (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`). Private key → Supabase
function secrets. Plus two Vault secrets so cron can reach the edge function.
Full walkthrough in `docs/RUNBOOK.md` under "Streak reminders".

### 3. Scholar review — zero of 5,220

Unchanged, and still the one item that is a **credibility risk rather than a
feature gap**. Take **one** category end to end — Contemporary Issues is the
riskiest and therefore the most informative — to find out what review actually
costs before committing to all 29.

## Known holes, disclosed rather than hidden

- **`submit_quiz_answer(p_double_points)` is client-supplied and validated
  against nothing.** Any caller can set it and take 2× XP without owning the
  power-up. It predates the game modes. Fixing it means tracking a lifeline
  spend against the question it was spent on, which is a change to the lifeline
  flow. Migration 0030 bounded rather than widened it: mode multipliers come
  from a four-row table topping out at 2×, so the compounded exposure is 4×.
- **A game mode is trustworthy; a run's difficulty is not.** A player can open
  Survival and answer easy questions for 2×. Closing that means the server
  choosing a run's questions, which is a larger change.
- **Multiplayer avatars never render.** They read
  `quiz_room_players.avatar_url`, which nothing in the codebase writes. The
  clean fix is joining to `profiles` on read, but there is no foreign key from
  `user_id` to `profiles`, so PostgREST cannot embed it — it needs a migration,
  on a subsystem that has never once been run.

## Things a fresh session gets wrong

- **The bank is done.** Do not start rebuilding it. If you find yourself
  authoring questions, stop and re-read this file.
- **Chests, the spin wheel, study circles, daily challenges, leagues and the
  streak freeze are all fully wired.** The streak freeze is on the rewards
  page; daily challenges are materialised at 00:05 by `ilm-daily-challenge`.
  "Finish the reward system" is wasted work.
- **A level run is the whole tier — 20 questions, not `HUNT_RULES.runLength`
  (10).** Fixed in PR #26. `buildTierLadder` serves the whole bucket.
- **Achievements are awarded by the database**, in `award_achievements()`
  (migration 0023), called after every graded answer. The TypeScript evaluator
  in `profile-stats.ts` survives only for progress bars and cannot grant
  anything.
- **There are two accounts now.** The owner, and `claude.tester@ilmhunt.test`
  (password `IlmHuntTest!2026`) — a real second player at Talib with genuine
  attempts. It is what finally let leagues rank an actual cohort for the first
  time. Delete it whenever it stops being useful.

## Conventions that are load-bearing

- **SECURITY DEFINER RPCs** need `set search_path = public`, *and* both
  `revoke all ... from public, anon;` and `grant execute ... to authenticated;`
  — Postgres grants EXECUTE to PUBLIC and Supabase's defaults grant to `anon`
  separately. Migration 0013 is the reference.
- **A multiplier, a price or a reward must never arrive as an argument.**
  Migration 0006 fixed a store that took the price from the caller; migration
  0030 put game modes on a server-created row for exactly the same reason. If
  the client can name the number, it is not a number you can trust.
- **Adding a parameter to an existing function is not a replacement.** A
  defaulted seventh parameter on `submit_quiz_answer` creates an *overload*,
  and every existing six-argument call then fails as "function is not unique".
  Drop the old signature explicitly.
- **Verify migrations live in a rolled-back transaction** before believing them.
  `begin; ... ;` through the Supabase MCP rolls back if you never commit. Every
  RPC in 0023–0030 was proven this way, including the negative cases — a closed
  run and a foreign run must grant no bonus, and both were tested.
- **i18n has zero drift and a guard that enforces it.** `npm run test:i18n`
  checks key parity across all six locales, empty values, interpolation
  placeholders, and hardcoded English JSX outside admin. Add every new string to
  all six locales in the same edit, matching the vocabulary that locale already
  uses and the house register — these state things plainly ("Hunt complete",
  not "Hunt complete!").
- **Never hand-retype SQL into the database.** Read the staged `.sql` file and
  paste its exact content.
- **Motion respects `prefers-reduced-motion`.** Every animation added in PR #33
  is skipped under it; keep that true.

## Environment traps that cost real time

- **`npm run build` and `npm run dev` share `.next`.** Running the build while
  dev is live breaks the dev server every time — it serves `Internal Server
  Error` until you stop it, `rm -rf .next`, and restart. Stop dev first.
- **Headless Chrome has no outbound network here.** Browser-testing against
  Supabase needs a small reverse proxy on localhost that the page talks to
  instead, with `NEXT_PUBLIC_SUPABASE_URL` pointed at it. Note that
  `NEXT_PUBLIC_*` is inlined at build time.
- **A run's per-question timer is ~20s**, which is shorter than a browser
  automation round trip. Answering a question from a script needs the click and
  the read in a single evaluation. The option letter lives in `aria-label`, not
  `innerText`.

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
| #34 | Speed Round, Survival and Practice built, with server-owned XP multipliers |
| #33 | The avatar finally drawn, the fold reclaimed, answers that move, rank-up given room, honest loading states, mock data deleted |
| #32 | All 29 categories shown — a 1,000-row cap had hidden 23 of them |
| #31 | The handoff doc before this one |
| #30 | Took seven trigger functions off the public API |
| #29 | Live achievements, the scheduler, the nine-tier explainer, streak reminders |
