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
| Migrations | through **`0043`**, disk and database in step |
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

Three of the four are closed, in migrations 0034 to 0038. Each was verified in
a rolled-back transaction against the live database, negative cases first — the
exploit itself is an assertion in every one of them.

- **Double points is real now.** `submit_quiz_answer` took
  `p_double_points boolean` from the caller and doubled the award on trust; a
  single crafted call took 2x XP forever. Migration 0034 adds
  `lifeline_spends`, written only inside `spend_lifeline_rpc` after the charge
  succeeds, and the grader reads and *consumes* a row from it instead of
  believing an argument. One purchase pays once. `p_double_points` and the
  long-dead `p_lifeline_used` are removed rather than ignored — a discarded
  parameter reads, to the next person, as a parameter that works, which is
  exactly how this one survived.
- **A run's difficulty is server-chosen.** 0030 made the *mode* trustworthy and
  left the run id a bearer token for the multiplier alone: open Survival, then
  answer tier-1 questions for 2x. Migration 0035 records on the run the tier
  band it was opened at, derived in the database from the player's own
  `total_xp` against `rank_tiers`, and pays the mode multiplier only inside it.
  Outside the band is not refused — that would break the classic hunt and the
  level path, which have no run at all — it simply pays the ordinary rate.
  `/play/[mode]` now draws its pool from that same band via `game_run_band`,
  so the questions offered and the questions paid for are one set rather than
  two copies of the rank thresholds agreeing.
- **A player enters a room as themselves.** `join_room_rpc` took the display
  name from the client, `createRoom` inserted the host's row with a
  client-chosen name, and `quiz_rooms.host_name` was client-written too —
  three doors, one room. Migrations 0036 and 0037 stamp the name and avatar
  from `profiles` by trigger on insert *and* update, so no caller can name
  itself through any of them. `p_user_name` is gone from the RPC.
  `avatar_url` — never written by anything, which is why every face in a lobby
  was the generic silhouette — is now `avatar_id`, holding what onboarding
  actually stores, and `PremiumAvatar` receives it. 0038 revokes `execute` on
  the two trigger functions, which the advisor caught as reachable by `anon`.
- **Signup is still open.** Re-checked against `/auth/v1/settings` on
  2026-08-29: `disable_signup: false`. Dashboard setting, owner only. Accounts
  can be removed and suspended from `/admin/users`, but nothing stops the same
  address signing up again.

### The shim is gone

Migration 0034 left a deploy-window shim — the old seven-argument
`submit_quiz_answer`, still resolving and delegating to the real one — so the
client deployed at the moment the migration landed kept answering instead of
failing with `PGRST202`. It discarded the two arguments that were the
vulnerability, so it never earned anyone a doubled point.

**Migration 0039 removed it**, once `fe1cf88` was live on production and calling
the four-argument signature. Verified against the live API: the old call now
returns `PGRST202`, and the surviving signature is the one four-argument
SECURITY DEFINER function, which `anon` is refused on. There is nothing left to
remove here — the note is kept only so the next reader knows the shim existed
and why, rather than finding its absence in a diff.

`spend_lifeline_rpc` never needed a shim: its two new parameters default to
null, so an old one-argument call still resolves and simply writes no ledger
row — which means the lifeline it buys earns nothing. Failing closed is the
point. A one-argument overload beside it would have made that call *ambiguous*
and broken it outright, which is the 0030 trap wearing the opposite face.

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

1. **Richer explanations — the pipeline is built, and the first level is
   drafted and waiting.** The problem was never only the 125 character average.
   Most of the existing explanations restate the correct answer in different
   words, so a player who answered correctly learns nothing and one who
   answered wrongly is told the right answer a second time.

   Migration 0042 adds `questions.explanation_draft`, which nothing
   player-facing reads: `submit_quiz_answer` returns `explanation` and does not
   know the column exists. A draft reaches a player only when a person presses
   publish at `/admin/explanations`, one question at a time, and there is
   deliberately no publish-all. Publishing keeps scholar approval, for the
   reason 0041 gives.

   **Contemporary Issues tier 1, all 20 questions, is staged and waiting for
   review.** Those twenty were composed directly and staged through
   `admin_stage_explanation`, with no model call and no `GEMINI_API_KEY`. That
   is worth knowing: `src/ai/flows/draft-explanations.ts` exists and mirrors
   the question-drafting flow, but the staging column does not care what wrote
   a draft, so the project is not blocked on an API key.

   They average 628 characters against a first guess of 350 to 600. The guess
   was wrong and the prompt now says 450 to 700, because forcing them shorter
   cost the sentence explaining why a wrong choice was tempting.

   Five tier 9 questions from the same category are staged too, deliberately
   sampling the hard end rather than adding more of the easy one. The register
   holds there, but writing them turned up the content problem below.

   `admin_explanation_progress()` reports how far this has got. Note the trap it
   was written to avoid: `explanation.lt.300` as a PostgREST filter compares
   text lexicographically rather than by length, and would put a confident
   meaningless number on the dashboard.

2. **Scholar review — still zero.** Now actually possible: `/admin/questions`
   filters to "Awaiting review" and approves in place without unpublishing.
   Take one category end to end — Contemporary Issues is the riskiest and so
   the most informative — before committing to all 29.
3. **The "Next level" CTA — built.** The summary now offers the next level as
   its primary action, and the server decides whether to. Winning a run is not
   clearing a level: `getCategoryLevels` unlocks the next tier only once every
   published question in this one has been answered correctly, and a run can be
   won with one dropped. So `getLevelOutcome` asks, and the banner says what is
   true — the next level is open, how many of the tier are still unanswered, or
   that this was the last level. The old banner told *every* winner the next
   level was unlocked. Still true and still worth watching: no human has ever
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

## A content problem found while writing explanations

**Sixteen published questions refer to a question the player may never have
seen.** They open with phrases like "Extending that spaceflight derivation",
"This gig-economy derivation echoes an idea already established earlier in this
category", or "Continuing that AI-authorship derivation".

`buildTierLadder` shuffles the tier bucket on every run, so any of these can be
served **first**, with nothing before it. Measured against the live bank:

| shape | questions | categories | tiers |
|---|---|---|---|
| refers to a prior derivation | 10 | 4 | 1 to 9 |
| opens by continuing a chain | 3 | 3 | 4 to 9 |
| refers to earlier in this category | 2 | 2 | 6 to 9 |
| refers to a previous conclusion | 1 | 1 | 6 |
| **total** | **16** | **8** | **1 to 9** |

Sixteen of 5,220 is small, and none of them is wrong: each has a correct answer
that a strong reader can reach. But a player meeting one cold is being asked to
continue an argument nobody has made to them yet.

**This has deliberately not been fixed.** Repairing it means rewriting question
text, and the rule above is that a fresh session which finds itself authoring
questions should stop. The new explanations for the five tier 9 ones mitigate
it as far as an explanation can, by restating the chain before naming the gap
in it, but that arrives only after the answer has been given.

Three ways out, for whoever decides:

1. Rewrite the sixteen to stand alone. Most need one clause of context.
2. Leave them and accept that a shuffled run sometimes asks a question out of
   order.
3. Give a question an optional prerequisite and have `buildTierLadder` order
   those few deterministically, which is more machinery than sixteen questions
   are probably worth.

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

- Develop on `claude/ilm-hunt-quiz-continuation-bu3fh7`, branched fresh from
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
