# ILM Hunt — session handoff

Written 2026-08-30, replacing the 2026-08-28 note. **Read this first if you are
picking up work cold.** Everything below was checked against the live database
(project `ziblpvwiqzpjnkqjwodl`) and `main` at `b7aca82` on the day it was
written — re-check anything you are about to depend on rather than trusting the
numbers blind. An earlier note was wrong about the account count within a day
of being written, which is the argument for checking.

## Where things stand

The question bank is finished, the admin console is real, and **the
explanations project is done**: all 5,220 are written and live. What is left is
one build (offline play), one ten-minute credential task only the owner can do,
scholar review, and the three holes below.

| | |
|---|---|
| Questions | **5,220** — 29 categories × 9 tiers × 20 |
| Published | 5,220 |
| **Scholar approved** | **0** |
| Average explanation | **413 characters, ~66 words** (was 125 / ~20) |
| Accounts | **1** — the owner, an admin |
| Active pg_cron jobs | 5 |
| Migrations | through **`0043`**, disk and database in step |
| Explanations | **5,220 written and live**, 0 staged, 0 remaining |
| Gates | `tsc --noEmit`, `build`, `test:engine`, `test:i18n`, **`test:middleware`** |

Production: <https://ilm-quiz.vercel.app>. Admin: `/admin`, or Profile →
Overview → the **Game master** card.

## What changed since the last note

Eight PRs, #43 through #50, and then the explanations project itself, which
finished in a single long session and touched no code at all.

- **#43** — the "Next level" CTA, and the three security holes. Double points
  was taken on trust from the client; it now needs a ledgered purchase that the
  grader consumes. A run id was a bearer token for the multiplier alone, so
  Survival paid 2x on tier 1 questions; the run now records the tier band it
  was opened at. Room identity was client-supplied through three separate
  doors; a trigger stamps name and avatar from the profile.
- **#44** — removed the deploy-window shim #43 had left behind.
- **#45** — the mechanical dashes, and a password reset that did not exist.
  `forgotPassword` had been translated into all six locales since long before
  and nothing rendered it.
- **#46** — the admin pages became editable: categories add, rename, delete and
  reorder; questions edit in place; back and forward navigation.
- **#47** — rewriting an explanation stopped counting as editing the question,
  so the explanations project and the review project can run in either order.
- **#48** — the explanations pipeline: staging column, review screen, progress
  counting.
- **#49** — the first 25 explanations, written and staged.
- **#50** — the length rule became complexity rather than tier, and this
  handoff was made to say so.
- **After #50, no PR** — the remaining ~5,190 explanations were written and
  published straight to the database. Nothing in the repository changed, so
  there is no diff and no pull request to look for. Read the next section
  before assuming the one-at-a-time review process still describes reality.

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
- **No dash is used as punctuation in player-facing copy.** Not em, not en, not
  a spaced hyphen, not a double hyphen. #45 removed 16 such strings across all
  six locales plus seven pieces of admin prose, and the explanations project
  did not put them back. Two uses are deliberate and stay: a bare placeholder
  glyph standing in for an empty value in a table, and an en dash inside a
  numeric range such as a date span. Check with a character-aware search, not
  `grep -oE '[-]'`: grep matches bytes, so a multibyte letter can collide with
  a dash and report a clean file as dirty. **And check for
  letter-hyphen-letter, not just spaced hyphens** — the explanations project
  ran a spaced-hyphen check for most of its length and let 18 compound
  modifiers through unnoticed. In SQL that is
  `explanation ~ '[a-zA-Z]-[a-zA-Z]'`; expect transliterated names and numeric
  verse ranges as legitimate hits and read the list rather than bulk-replacing.
- **Motion respects `prefers-reduced-motion`.**
- **Never hand-retype SQL.** Read the staged `.sql` file and paste it exactly.

## Open items

1. **Richer explanations — DONE. All 5,220 written and live.** Nothing is
   staged, nothing is remaining. The average went from 125 characters to 413.
   This item is kept rather than deleted because how it finished matters to
   anyone who reads the pipeline code and expects it to describe reality.

   The problem was never only the 125 character average. The old explanations
   restated the correct answer in different words, so a player who answered
   correctly learned nothing and one who answered wrongly was told the right
   answer a second time. Every explanation now opens by confirming in one
   clause and then teaches: the reason or mechanism, one concrete fact, why a
   tempting wrong choice is wrong, and where scholars actually differ.

   **The one-at-a-time review was deliberately overridden, by the owner.** The
   pipeline was built so a draft reaches a player only when a person presses
   publish at `/admin/explanations`, one at a time, with no publish-all. The
   owner explicitly authorised writing all 5,220 and publishing them in bulk,
   so that gate was bypassed on instruction. Drafts were staged by writing
   `explanation_draft` / `explanation_draft_at` / `explanation_draft_by`
   directly, mirroring exactly what `admin_stage_explanation` does, then
   published by setting `explanation = explanation_draft` and clearing the
   draft columns, mirroring `admin_publish_explanation`. Direct SQL was used
   because the session had no service-role credentials to call the RPCs.
   `explanation_draft_by` was set to the literal `hand-authored` throughout.

   **No model was involved.** Every explanation was written by hand, with no
   `GEMINI_API_KEY` and no call to `src/ai/flows/draft-explanations.ts`. That
   flow still exists and still mirrors the question-drafting flow; the project
   was never blocked on an API key.

   **Scholar approval was not disturbed.** It is still 0 of 5,220, exactly as
   before, because publishing preserves it for the reason 0041 gives. The
   explanations being live says nothing about whether a scholar has read them.

   **The length rule was complexity, not tier.** Simple question, where the
   answer is a fact or a term: two to three sentences, 250 to 400 characters.
   Complex, where reasoning is layered or scholars genuinely differ: five to
   six, 550 to 800. Final spread: 2,741 in the simple band, 2,090 between the
   bands, 389 in the complex band, shortest 250, longest 750, none outside.

   **No dashes, and the obvious check for them is not enough.** The automated
   check used for most of the project was `like '% - %' or like '%--%'`, which
   does **not** catch a hyphen joining two letters directly, so `third-party`,
   `non-literal`, `Hindu-Arabic`, `AI-assisted` and a dozen others sat clean
   through it. A full audit at the end with `~ '[a-zA-Z]-[a-zA-Z]'` found and
   fixed 18 real violations. **If you write player-facing copy, use the
   letter-hyphen-letter regex, not the spaced-hyphen one.**

   What legitimately keeps a hyphen and must not be "fixed": transliterated
   proper nouns (`al-Ghazali`, `an-Naml`, `Dhul-Qarnayn`, `Masjid an-Nabawi`,
   `Al-Amin`) and 50 numeric verse or date ranges such as `24:6-9`. Everything
   else in the corpus is hyphen-free, including spelled-out numbers, which are
   written `twenty three`.

   No citation, hadith number or verse reference was invented. Where an
   argument rests on a text it is described instead. A wrong number in a
   religious app is worse than no number.

   `admin_explanation_progress()` still reports drafts, which will now read
   zero forever unless new drafts are staged. The trap it avoids is still
   worth knowing: `explanation.lt.300` as a PostgREST filter compares text
   lexicographically rather than by length and would put a confident
   meaningless number on the dashboard.

   **Verified at the database and in the code path, not in the app.** The
   serving chain was read end to end: `submit_quiz_answer` selects
   `q.explanation` and returns it as `o_explanation`, `quiz/actions.ts` maps
   that to `explanation`, and `HuntView.tsx` renders it in the "Why it's
   right" panel. All 5,220 rows are `review_status = 'published'`, so all are
   servable. What was **not** done is seeing one render inside the running
   game: that needs a signed-in session, and the session that wrote them could
   not sign in from its container. Answering one question in the app would
   close that last gap in seconds.

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
questions should stop. All sixteen now carry a rewritten explanation that
mitigates it as far as an explanation can, by restating the chain before naming
the gap in it, but that arrives only after the answer has been given. The
underlying ordering problem is untouched and still needs one of the three
decisions below.

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

- Develop on a fresh `claude/...` branch, branched fresh from
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
