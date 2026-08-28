# ILM Hunt — session handoff

Written 2026-08-28, replacing the 2026-08-24 note. **Read this first if you are
picking up work cold.** Everything below was checked against the live database
(project `ziblpvwiqzpjnkqjwodl`) and `main` at `445ad89` on the day it was
written — re-check anything you are about to depend on rather than trusting the
numbers blind. The previous note was wrong about the account count within a day
of being written, which is the argument for checking.

## Where things stand

The question bank is finished and the admin console is real. What is left is
one large content project (explanations), one build (offline play), one
ten-minute credential task only the owner can do, and the three holes below.

| | |
|---|---|
| Questions | **5,220** — 29 categories × 9 tiers × 20 |
| Published | 5,220 |
| **Scholar approved** | **0** |
| Average explanation | **125 characters, ~20 words** |
| Accounts | **1** — the owner, an admin |
| Active pg_cron jobs | 5 |
| Migrations | through **`0033`**, disk and database in step |
| Gates | `tsc --noEmit`, `build`, `test:engine`, `test:i18n`, **`test:middleware`** |

Production: <https://ilm-quiz.vercel.app>. Admin: `/admin`, or Profile →
Overview → the **Game master** card.

## What changed since the last note

Five PRs, #36 through #40.

- **#36** — the admin console. It existed and was unreachable: nothing linked
  to `/admin`, `/admin/users` selected an `email` column that `profiles` does
  not have, and the page was read-only. Now: a door on the profile, a register
  with roles, suspend and delete, a paginated question console, economy tuning,
  an audit log, and dashboard numbers that are true.
- **#37** — the invalid Gemini model id, the auto-publish bypass, and a dead
  auth check whose allow-by-default list had four routes missing.
- **#38** — a regression #37 caused, live for minutes: see the warning below.
- **#39** — the explainer never mentioned the clock or lives; the sound switch
  was only on the profile; the countdown rebuilt its interval every tick.
- **#40** — the reveal now waits to be dismissed, the run is reviewed
  question by question, and a classic level run can be paused.

## The three warnings this codebase has earned

**A Next build warning does not fail the build.** #37 moved the middleware
matcher into a shared module so a test could import it. Next reads
`config.matcher` by *static analysis* and cannot follow an identifier; it
printed `⨯ Next.js can't recognize the exported config field` and **exited 0**.
With no matcher the middleware ran on every request, and because #37 had also
made it deny-by-default, every static asset — icons, the manifest, the service
worker, and `/_next/static/chunks/*.js` — was redirected to `/login` for
signed-out visitors. The login page could not hydrate. Nobody could sign in.

Two habits come out of that, and neither is optional:

- **Read the whole build log.** The check that missed this grepped for a fixed
  set of patterns that did not include the `⨯` glyph. A filtered log is not a
  read log.
- **A unit test that checks a value cannot tell you the framework used it.**
  `config.matcher` must be an inline literal; `npm run test:middleware` now
  reads `src/middleware.ts` and asserts exactly that, and both new checks were
  run against the broken file first to confirm they fail on it.

**Verify against a deployment, not against the code.** The only reason that
regression was caught in minutes was a live `curl` run *because* the previous
message had said the fix was "proved on paper, not in the wild". The paper was
the wrong half. Preview deployments sit behind Vercel SSO; the Vercel MCP's
`get_access_to_vercel_url` issues a share token that gets you past it.

**"X is missing" is a hypothesis, not a fact.** It was wrong again this
session, twice: the admin area existed and the owner was already an admin; the
explainer existed and simply never mentioned the clock. Six times running now,
the truth was a wire between two working halves.

## Known holes, disclosed rather than hidden

- **`submit_quiz_answer(p_double_points)` is client-supplied and validated
  against nothing.** Any caller can take 2× XP without owning the power-up.
  Fixing it means recording a lifeline spend against the question it was spent
  on: `spend_lifeline_rpc` charges and writes no ledger row at all, and
  `submit_quiz_answer` takes a `p_lifeline_used` argument its body never reads.
  The parameter for the join already exists and is dead.
- **A game mode is trustworthy; a run's difficulty is not.** A player can open
  Survival and answer tier-1 questions for 2×. Closing it means the server
  choosing a run's questions.
- **Multiplayer avatars never render.** They read
  `quiz_room_players.avatar_url`, which nothing writes. `join_room_rpc` also
  takes `p_user_name` from the client, so a player can enter a room under any
  name. Both are one migration on a subsystem that has still never been run:
  `quiz_rooms` and `study_circles` are at zero rows, always have been.
- **Signup is open.** `/auth/v1/settings` reports `disable_signup: false`.
  Accounts can be removed and suspended from `/admin/users`, but nothing stops
  the same address signing up again. Dashboard setting, not code.

## The traps that will cost you a day

- **Scholar approval is NOT `review_status`.** `scholar_approved` is a value of
  that enum, and `submit_quiz_answer` accepts **only** `published`. Marking
  reviewed questions with it would delete them from the playable bank one at a
  time, invisibly, in proportion to how much review got done. `source_type`
  cannot carry it either — its check constraint permits only `human` and
  `ai_drafted`. Migration 0033 gave it `questions.scholar_approved_at`, its own
  column, and the question stays `published` throughout.
- **PostgREST caps an unbounded select at 1,000 rows.** This has now bitten
  twice: the category grid (fixed in 0029) and the admin question console
  (fixed in 0033, where it hid 4,220 of 5,220). Count and slice in the
  database.
- **`config.matcher` must be an inline literal.** See above.
- **A state updater must stay pure.** React may call it twice. Two bugs this
  session came from putting a side effect inside one — a double timeout, and a
  question appearing twice in the round review.
- **Adding a column to a `returns table` needs a `drop function` first.**
  `create or replace` refuses to change a return type. The mirror of migration
  0030's trap, where adding a parameter created an overload instead.

## Conventions that are load-bearing

- **SECURITY DEFINER RPCs** need `set search_path = public`, *and* both
  `revoke all ... from public, anon;` and `grant execute ... to authenticated;`
  Migration 0013 is the reference and explains why the revoke alone is not
  enough.
- **A multiplier, a price or a reward must never arrive as an argument** — from
  a *player*. The economy setters in 0033 take exactly those numbers, which is
  not a contradiction: they are the configuration surface, admin-only, bounded
  so a typo cannot mint a fortune, and audited with before and after. The 2×
  ceiling migration 0030 chose is enforced there too.
- **The audit log cannot be forged.** `admin_audit_log` has RLS on, a read
  policy for admins, and no insert policy at all. Rows arrive only through
  `log_admin_action`, which is granted to nobody and runs inside the other
  definer functions.
- **Verify migrations in a rolled-back transaction** before believing them,
  negative cases included. Everything in 0031–0033 was proven that way.
- **i18n has zero drift and a guard.** Add every new string to all six locales
  in the same edit, matching each locale's own vocabulary and diacritics.
  Admin pages are exempt and are English.
- **Motion respects `prefers-reduced-motion`.**
- **Never hand-retype SQL.** Read the staged `.sql` file and paste it exactly.

## Open items

1. **Richer explanations — held at the owner's instruction, and the big one.**
   At 125 characters average this is a content project across 5,220 questions,
   not a UI change. The persistent panel built in #40 will happily scroll; it
   has nothing to scroll yet. Whatever produces the new text must go through
   review rather than repeating the ai-drafted-and-published pattern.
2. **Scholar review — still zero.** Now actually possible: `/admin/questions`
   filters to "Awaiting review" and approves in place without unpublishing.
   Take one category end to end — Contemporary Issues is the riskiest and so
   the most informative — before committing to all 29.
3. **The "Next level" CTA.** The smallest change with the largest effect.
   Winning a level shows a `🔓 Level complete` banner and two buttons: **Play
   again** and **Exit**. `playAgain` only reseeds the same tier. The most
   engaged tester cleared tier 1 twice, unlocked tier 2, and never saw it —
   they ground 55 attempts against the same 20 questions. No human has ever
   answered a tier-2 question.
4. **Offline play — not started.** `public/sw.js` caches nothing on purpose.
   The service worker now registers for every player, so there is something for
   a cache to attach to. Do not bolt one on casually.
5. **Streak reminders — dormant.** `vault.secrets` is empty: 0 of the 2 secrets
   are set. `npm run vapid:keys`; walkthrough in `docs/RUNBOOK.md`.
6. **Timed-out questions in the round review deliberately withhold the
   answer.** The client only learns a correct answer from a graded submission,
   and an endpoint returning answers for arbitrary questions would be a lookup
   table for the whole bank. If the owner wants those answers shown, the clean
   route is recording a timeout as an attempt so the server grades it — that
   changes accuracy stats, so it is a decision, not a fix.
7. Agreed but unbuilt: bulk actions, Excel export, a read-only auditor role.

## Things a fresh session gets wrong

- **The bank is done.** If you find yourself authoring questions, stop.
- **The admin console is done and reachable.** Users, questions, economy, audit
  log, moderation, categories, analytics — all wired, all guarded.
- **Chests, the spin wheel, study circles, daily challenges, leagues and the
  streak freeze are all fully wired.** "Finish the reward system" is wasted
  work.
- **A level run is the whole tier — 20 questions**, not `HUNT_RULES.runLength`
  (10). `buildTierLadder` serves the whole bucket.
- **Achievements are awarded by the database**, in `award_achievements()`. The
  TypeScript evaluator survives only for progress bars.
- **There is one account.** The four others were deleted at the owner's
  request on 2026-08-27, through the admin console that was built to do it.

## Environment traps

- **`npm run build` and `npm run dev` share `.next`.** Stop dev first.
- **Headless Chrome has no outbound network here.** Verify against the Vercel
  preview instead; `get_access_to_vercel_url` gets you past the SSO gate.
- **A run's per-question timer is 25s at tier 1 rising to 45s at tier 9**,
  shorter than a browser automation round trip. The option letter lives in
  `aria-label`, not `innerText`.

## Before you claim anything is done

```bash
npx tsc --noEmit        # supabase/functions is excluded — it is Deno
npm run build           # read the WHOLE log; a warning still exits 0
npm run test:engine
npm run test:i18n
npm run test:middleware
```

Then verify against the deployment. The build passing is not the same as the
app working, and this codebase has now proven that twice.

## Working agreement

- Develop on `claude/ilm-hunt-continuation-ap2a40`, branched fresh from
  `origin/main`. Open a draft PR; the owner says "merge" when ready.
- Migrations are applied to the live database **and** written to
  `supabase/migrations/`. Keep the two in step.
- The repository is public. Never commit keys.

## Recent history

| PR | What |
|---|---|
| #40 | The reveal holds, the round is reviewed, a learner can pause |
| #39 | The clock explained, the sound switch reachable, the timer stutter fixed |
| #38 | Inlined the middleware matcher — the import had broken every static asset |
| #37 | Invalid model id, the auto-publish bypass, the dead auth check |
| #36 | The admin console: a door, a register, an audit trail, true numbers |
| #35 | The handoff before this one |
