# ILM Hunt — session handoff

Written 2026-09-03, rewritten through 2026-09-05. **Read this first if you are
picking up work cold.** Every number below was checked against the live
database (project `ziblpvwiqzpjnkqjwodl`) with `main` at `5281d23` (PR #71,
merged) — re-check anything you are about to depend on rather than trusting
them blind. Four earlier notes were wrong about a count within a day of being
written, which is the whole argument for checking.

## The one fact that reframes everything

**Nobody has ever played this app.**

```
questions       10,466        profiles              1
categories          42        attempts              0
translations        69        scholar approved      0
```

The `attempts` table is **empty**. Every question, category, store item,
achievement, challenge and rank tier is seeded and ready; one account exists,
the owner's, and it has never answered anything.

Keep that in front of you when deciding what to build. **Thirteen pull requests
have shipped since anyone last suggested playing it**, six of them on
2026-09-05 alone. Everything in them was verified against the database and the
gates; **none of it has been clicked through by a person.** That is now the
single largest risk in this project, larger than any bug listed below.

## Where things stand

| | |
|---|---|
| Questions | **10,466** — 5,220 browsable + **5,246 arena**, see below |
| Published | **10,466** — the arena bank is published on arrival too |
| Explanations | **10,466** written and live, **0 missing** |
| Translations | **69** questions — quota-capped at ~20/day, see below |
| Hadith locales | `en` 391, `ar` 391, `fr` 391, `id` 278, `ha` 62, `ms` 0 — imported, never generated |
| **Scholar approved** | **0** |
| **Attempts, ever** | **0** |
| Accounts | **1** — the owner, an admin |
| Active pg_cron jobs | **6** |
| `vault.secrets` | **2 of 2 set** |
| Migrations | through **`0056`**, disk and database in step |
| Gates | `tsc --noEmit`, `build`, `test:engine`, `test:i18n`, `test:middleware` |

Production: <https://ilm-quiz.vercel.app>. Admin: `/admin`, or Profile →
Overview → the **Game master** card.

## The translation system, which is the newest and largest thing here

**Content translates itself.** A question written once in English appears in
Hausa, French, Arabic, Indonesian and Malay without anyone asking.

```
questions (insert or update)
     │  trigger, only when translatable text actually moved
translation_queue          one row per (question, target locale)
     │  claimed in batches of 3
edge function              translate-questions, calls the model per locale
     │
question_translations      through one shared validation gate
```

**Translation happens on write, not on language selection.** That is the whole
design: by the time a player taps Hausa the text is already in the database, so
switching is instant, works offline and costs nothing per view. A model call
per view would have been latency on every question and a bill that never ends.

- **`questions.language` is still not read by anything**, and must not be used
  to hold translations. It existed since the first migration with all six
  locales in it and nothing ever read it, which is why a Hausa player was
  always served English. Rows in `questions` would double the bank for every
  player and break the twenty-per-tier assumption `buildTierLadder` rests on.
  Keep it for questions that are genuinely language-native — the
  `arabic-language` category asks about Arabic grammar and cannot be
  translated without ceasing to be the question.
- **The fallback is per question, not per language.** A locale with three
  translated questions out of twenty shows those three translated and the rest
  in English. A partly translated bank is a working bank.
- **Translations publish without human review.** That is the owner's decision,
  made knowing the trade, and it is why the checks below are load-bearing.
- **A hand-edited translation is never re-queued and never overwritten.** It is
  skipped by the trigger, refused by the upsert, and preserved by the worker
  even if edited mid-batch. When the English moves it is flagged stale, not
  rewritten. Without this, "publish automatically and fix what reads wrong"
  loses every fix.

### The two checks that stop a player being marked wrong for a right answer

Both live in `translation_rejection_reason`, used by the automatic *and* the
by-hand path so they cannot drift, and re-checked on read.

1. **The number of options must match.** `correct_choice_index` points at a
   **slot**, not a string. A shorter or longer translated array repoints the
   correct answer at whatever now sits there.
2. **No two options may be identical.** Two distinct rulings rendered with one
   word — fard and sunnah, say — leaves the player nothing correct to pick, and
   the app then teaches them the right answer was wrong.

A refusal leaves that question English in that locale and puts the row on the
"needs a look" list at `/admin/translations`.

### Operating it

- `/admin/translations` — queue by language and status, "Queue every published
  question" (one set-based statement, safe to re-run), the refusal list, and an
  editor for any translation. Saving marks it `human`.
- **The backfill was queued** — all 26,100 rows went into `translation_queue`
  in one statement on 2026-09-03. As of 2026-09-05 it has drained **64 rows in
  two days**, and the queue stands at **26,036 queued, 0 in progress, 0
  failed**. That is not the concurrency dial working as designed; see the next
  point.
- **Real bottleneck, found after 0048/0049 shipped: the Gemini API key is out
  of quota.** `query_logs` on `translate-questions` shows the model itself
  returning `"You exceeded your current quota, please check your plan and
  billing details."` — an account-level billing/plan limit, not something any
  cron cadence, batch size or concurrency setting can fix from this codebase.
  Concurrency was raised to 6 (0048), measured as ~12/12 calls rate-limited on
  nearly every tick, dropped to **2** to see if it was a burst-limit problem,
  and the failures persisted identically at concurrency 2, almost
  instantaneously (~200ms per call) — proof it is quota exhaustion, not
  concurrency. **`TRANSLATE_CONCURRENCY` is currently 2, left there on the
  owner's instruction** rather than tuned further, because there is nothing
  left to tune without access to the Gemini account's billing page.
  `translate-questions` was redeployed as **v6** with
  `console.error("translate-questions: retryable, ...")` added so this shows
  up in `query_logs` immediately next time, instead of needing a fresh
  `net._http_response` investigation.
- **The quota now names itself, and it is 20 requests a day (2026-09-05).**
  v6 logged the 429 but sliced the body at 300 characters, and Google puts the
  prose first and the machine-readable part last — so every one of two days of
  log lines ended `* Quota ex`, cut off mid-word, exactly before the part that
  mattered. **v7** parses `error.details` and puts the summary in *front* of
  the raw body:

  ```
  quota=GenerateRequestsPerDayPerProjectPerModel-FreeTier limit=20 retryDelay=57s
  ```

  So it is a **free-tier cap of twenty requests per day**, not a per-minute
  throttle and not a burst limit — which is why no concurrency setting ever
  moved it. It matches the observed drain exactly: 30, 19 and 20 rows on the
  three days measured.

  The pattern is visible in the timestamps too, and was how this was found
  before the log was widened: successes cluster within *fifteen seconds* of
  **07:00 UTC** — midnight Pacific, when the daily free-tier allowance resets —
  run for eight to fourteen minutes until the twenty are spent, and then the
  key returns 429 for the rest of the day.

  At twenty a day the remaining ~26,000 rows take **about 3½ years.** The
  worker is not the problem and has not been for some time: 719 invocations
  in 24 hours, every one of them HTTP 200.
  **Next step is not code:** the account owner needs to enable billing on the
  Gemini API key at ai.google.dev or in the Google Cloud console. Nobody in
  this session has access to that account. Nothing else is tunable — and now
  there is a number to check it against, because the next 429 will say
  `limit=` whatever the new plan allows.
- **The refund has now been proven under sustained failure, not just argued
  for.** Across two days and on the order of 17,000 rate-limited calls, the
  queue shows `max(attempts) = 1` and **zero** rows `failed` out of 26,100.
  Not one question was burned out of the backfill by the quota. That is 0048's
  release-and-refund path doing exactly what it was built for.
- **The arithmetic below is what 0048 made *possible*, not what is
  happening.** It holds once the quota is fixed; until then it is fiction.

  | Dial | Where | Now |
  |---|---|---|
  | Cron cadence | `cron.job`, migration 0048 | every 2 minutes |
  | Batch size | `cron_run_translations` body | 12 per invocation |
  | Concurrency | `TRANSLATE_CONCURRENCY` env var | **2** in flight (was 6, see above) |

  At concurrency 6 the projection was 26,100 in about 3 days; at 2 it would be
  slower still, and none of it matters while the quota is exhausted. The
  worker reports `elapsedMs`, `rateLimited`, `released` and `concurrency` in
  its response, and the retryable path now logs to `query_logs` — read both
  before believing any throughput number, including this one.
- **What makes the dial safe to turn is the refund, not the arithmetic.**
  `claim_translation_batch` spends an attempt when it hands a row out and three
  attempts marks a row `failed`. So before 0048, over-driving the model could
  permanently drop good questions out of the backfill for a fault entirely of
  the scheduler's. A 429 or a 5xx now **releases the claim and refunds the
  attempt**, exactly as running out of wall clock does, so pushing the rate too
  high costs throughput and nothing else. A 400 or a 404 still counts — those
  are ours, and retrying them forever would hide them.
- `GEMINI_MODEL` is an edge function env var. **Model names get retired** —
  `gemini-2.0-flash` 404'd on the very first real batch — so change the
  variable, not the code.

## The five warnings this codebase has earned

**Testing the happy path is not testing.** `case when attempts >= 3 then
'failed' else 'queued' end` yields `text`, not the enum, so **every refused or
failed translation would have thrown** instead of being retried. The rejection
path caught it; the success path never would have.

**A number chosen before anything was measured is a guess.** A batch of 20 was
set before a translation had ever been timed. One takes ~40 seconds, so the
first real batch was killed by the edge function's wall clock partway through
its fifth item. Measure, then choose.

**A Next build warning does not fail the build.** #37 moved the middleware
matcher into a shared module so a test could import it. Next reads
`config.matcher` by *static analysis*, printed `⨯ Next.js can't recognize the
exported config field`, and **exited 0**. With no matcher the middleware ran on
every request and redirected every static asset to `/login`.

- **Read the whole build log.** A filtered log is not a read log.
- **A unit test that checks a value cannot tell you the framework used it.**

**Verify against a deployment, not against the code.** Preview deployments sit
behind Vercel SSO; the Vercel MCP's `get_access_to_vercel_url` issues a share
token. **A share token is scoped to one deployment** — reusing an older one
serves Vercel's own login page with **HTTP 200**.

**Assert the file is the file.** A stylesheet grep once returned a clean "no
raw palette found" from a **zero-byte** file. More recently the first
stylesheet grepped was simply the wrong one of two — 9KB with zero matches, and
the real one 100KB. Check size and a known marker before believing a grep.

**A signed-out check needs a control.** Proving `/intro` serves to a signed-out
visitor means nothing unless you also prove you *are* signed out. Fetch `/home`
in the same session: it must return 307 to `/login`.

## The traps that will cost you a day

- **A PostgREST query builder is lazy and sends nothing until it is awaited.**
  `LanguageContext` built a `.update({ preferred_language })` and never awaited
  it, so *every* language a signed-in player chose was written to the browser
  and never to their profile — the profile row still read `en`, untouched since
  July, through many deliberate switches to Hausa. Worse, the restore path then
  let that stale profile **overrule** the device: pick Hausa, refresh, see
  Hausa for an instant, and watch the profile's `en` put it back. It read
  exactly like "the choice does not save". The profile now fills a gap rather
  than overruling — it applies only when the device has no stored choice — and
  a pick made while the profile lookup is still in flight is no longer
  clobbered when it lands.
- **A recovery path that exists is not a recovery path that can be reached.**
  `claim_translation_batch` has always reclaimed a claim abandoned for more
  than ten minutes, and the reclaim was correct. It was also unreachable:
  the picked rows were ordered `by updated_at` alone, and *claiming a row sets
  `updated_at`* — so an abandoned row instantly sorted behind every row the
  backfill had not yet touched. Measured on the live queue, one row abandoned
  for 25 hours had **16,807 rows ahead of it**, which at the current quota is
  about two years. Migration **0051** orders stale claims first. Nothing
  alerted, because the row was never lost — only last in a very long line, and
  a queue with a working recovery path and a starved one look identical from
  the outside. Check the *ordering* of a recovery path, not just its
  existence.
- **`correct_choice_index` is positional.** Anything that reorders, adds or
  drops a choice — a translation especially — mis-grades the question.
- **A `"use server"` module may only export async functions.** Exporting a
  `LOCALES` constant from one compiled cleanly and failed at page-data
  collection with "Failed to collect configuration for /admin/translations",
  which names the page, not the cause.
- **The key format decides the header.** A legacy `service_role` key is a JWT
  and goes on `Authorization: Bearer`; newer `sb_secret_...` keys are not JWTs
  and the functions gateway rejects them there — they must be sent as `apikey`.
  Supabase's own migration guide calls this out for `pg_net`. Both produce an
  identical-looking 401. `cron_run_translations` branches on the format.
- **Scholar approval is NOT `review_status`.** `scholar_approved` is a value of
  that enum, and `submit_quiz_answer` accepts **only** `published`. Migration
  0033 gave it `questions.scholar_approved_at`, its own column.
- **PostgREST caps an unbounded select at 1,000 rows.** Bitten twice. Count in
  the database with `{ count: "exact", head: true }`.
- **`config.matcher` must be an inline literal.**
- **A state updater must stay pure.** React may call it twice. Three bugs came
  from a side effect inside one. Cues belong in an effect keyed on the state.
- **Protection is opt-in, so a forgotten route goes *unreachable*, not
  unguarded.** `PUBLIC_PREFIXES` in `src/lib/auth-routes.ts` is the allow list.
  Add the route and the assertion in `check-middleware` in the same edit.
- **Reading cookies opts a route out of static rendering permanently.**
  `/intro` takes a plain anonymous client and caches: measured, 500ms per
  request against 5ms.
- **An absolutely positioned child does not size its parent.**
- **`-50%` resolves against the element's own height, and flex stretches it.**
- **A duration is not a speed.** Tune the names drift by measuring px/s.
- **Adding a column to a `returns table` needs a `drop function` first.**
- **Tailwind emits a keyframe only if some `animate-*` utility is used**, and
  its scanner is a regex over file bytes that **does not know what a comment
  is** — naming a palette class inside a comment ships that class.
- **The i18n guard has two shapes to catch**: text that starts a JSX node, and
  text that trails an interpolation.

## The security hole that was open, and how 0049 closed it

**Fixed in migration 0049.** The SELECT policy on `questions` was `using
(review_status = 'published')` with no column restriction, so
`correct_choice_index` and `explanation` were readable through PostgREST **by
anyone holding the anon key**, even though `quiz-service.ts` carefully
declined to select them and said so in a comment. The comment stated the
intent; the policy never enforced it. Every answer in the bank was
downloadable — not a theoretical finding, checked directly against the anon
key. `quiz_room_questions` (multiplayer) had the identical shape of the same
bug on `correct_index`, found while fixing the first one.

**Why it took more than a grant.** Four places read one of the two columns
directly as `authenticated` — the fifty-fifty lifeline, multiplayer's room
seeding, and two admin reads — because a server action built with
`@/lib/supabase/server` runs under the signed-in user's own JWT and is bound
by the same privileges as the browser. Each moved to a SECURITY DEFINER
function before the column lock landed: `fifty_fifty_choices` (returns two
wrong indices, never the correct one), `start_multiplayer_quiz_rpc` (the old
select-then-insert is now one atomic host-checked function),
`admin_questions_for_drafting`, `reviewer_pending_questions`.

**Why a column-level `REVOKE` alone would have done nothing.** Supabase's
default schema setup already grants table-level `SELECT` to `anon` and
`authenticated`, and Postgres checks column access as table-level-grant *OR*
column-level-grant — a per-column revoke on top of a standing table-level
grant changes nothing, which a dry run of this migration caught before it
shipped. The fix revokes table-level `SELECT` entirely and grants it back
column-by-column, naming everything except the two that stay locked.

`question_translations` and `translation_queue` never had this problem: their
grants were per-column from the start, and neither the translated explanation
nor the queue is among them.

Verified against the live database: `has_column_privilege` confirms `anon`
and `authenticated` can no longer select `correct_choice_index` or
`explanation` on `questions`, nor `correct_index` on `quiz_room_questions`,
while every other column — including the ones `quiz-service.ts` actually
reads — stays readable. All four new functions were exercised in a
**rolled-back** transaction first: the lifeline never returns the correct
index, a non-host is refused starting a room, a non-admin/non-reviewer is
refused both admin reads, and a host's call seeds the room and starts it.

## Two product decisions that live only in code

- **Never state the size of the question bank.** A total hands the player a
  denominator, and from then on every run is measured against finishing rather
  than against learning. Removed from `/intro` and `/quiz`. The subject count
  stays: it says how wide the app is, not where it stops.
- **Player facing counts are fine when they are about the player.** Their own
  answered totals, the per level count that opens the next level, a daily
  challenge size. Admin pages keep every total.

## Two banks, and the pin that keeps them apart

There are now **two** question banks, and confusing them is the way to break
this app quietly.

| pool | rows | who serves it |
|---|---|---|
| `category` | 5,220 | the 29 browsable categories, level runs |
| `arena` | **5,246** | nothing yet — daily challenge, battle and the play modes, once flipped |

- **`questions.pool` is derived, never typed.** A trigger (`questions_sync_pool`,
  migration 0054) copies it from the question's category on insert and on any
  change of category. Filing a row under an `arena_*` category is what makes it
  an arena question; there is no field to forget and no flag to get wrong.
  That shape is a direct lesson from 0049 — a comment there said
  `correct_choice_index` was never selected, four call sites honoured it, the
  policy did not, and the answer key was readable for months. Intent repeated
  at call sites drifts. A derived column cannot.
- **The arena is now open (0056).** `ensure_daily_challenge` and
  `getModeQuestionPool` were flipped to `arena`, and
  `start_multiplayer_quiz_rpc` now draws from it too. **One pin stays pinned
  forever**: `getCategoriesWithProgress` must keep `pool = 'category'` or the
  thirteen arena categories appear on the player's grid. An earlier note here
  called all three "the switch" — that was wrong, and it is the one to get
  right.
- **Nobody picks a subject any more, anywhere but the categories.** The daily
  challenge, battle and the play modes all draw across the whole arena bank.
  Difficulty stays contextual and that is deliberate: the bank is even across
  nine tiers, so uniform-random would give every question an ~11% chance of
  being Expert and a five-question daily a ~44% chance of containing one, for
  a player who may have answered nothing. The daily takes a spread (it is
  shared, and stretch is the point), battle takes the room's difficulty, and
  the play modes keep the band `startGameRun` computes per player.
- `start_multiplayer_quiz_rpc` needs no pin — it filters by the room's own
  category, and rooms come from the pinned category list.
- **The 13 arena categories are organisational, not navigational.** They exist
  so a question has a home and an admin can tell fiqh from seerah. Slugs are
  prefixed `arena_` because several names are near-twins of browsable ones.
- **Arena questions are not queued for translation.** The trigger skips the
  pool. Verified after importing 5,246: the queue stayed at 26,100 with **zero**
  arena rows, rather than growing by 26,230 onto a backlog already 3.5 years
  deep at 20/day. One condition to remove when the Gemini plan is fixed.

### The arena bank itself

5,246 questions, 13 categories, tiers 1–9, every one with four choices and a
written explanation. Validated before import, on every row rather than a
sample: zero missing explanations, zero missing tiers, zero rows with other
than four choices, **zero with two identical choices**, zero duplicate question
texts, and bank numbers 1–5246 all present. The correct answer is balanced
across positions **1312/1312/1311/1311**, so there is no position to learn.

**One accepted gap:** Seerah stops at tier 2 — 78 questions where other
categories carry 297–540. Confirmed in the source document (every other
category has nine tier headings; Seerah has two), not a parsing artefact. The
owner chose to import as-is and top it up later.

It lives at `scripts/question-bank/arena/bank.json` and is imported by the
`import-arena-bank` edge function, which reads it from the repo **at a pinned
commit**. Revising questions is a diff and a re-run. Re-running is safe: each
row carries its bank number in `seed_batch` as `arena:00123`, the importer
inserts only what is missing and **never updates**, so a partial run resumes
and an admin's correction cannot be overwritten.

### Multiplayer battle was broken, and 0056 fixed it by accident

Worth knowing, because it says something about the state of this app. The
battle room stored a category id like `holy-quran`, and
`start_multiplayer_quiz_rpc` compared it to `questions.category_id::text` —
**a uuid**. Checked, not assumed: all six ids the create-room modal offered
match **zero** questions as a uuid, and five of the six do not match a
category slug either. So every battle would have inserted zero questions and
raised "No questions available for this category". **No battle could ever have
started.**

Nothing caught it because **no room has ever been created** — the same reason
nothing else here has been caught. 0056 removes the category filter entirely,
so the bug leaves with it.

**The daily challenge for a past date keeps its old category.** `category_id`
is nullable and is now written null; the fifteen stored before today still
name the category they drew from, and that history is worth keeping legible.

## The home screen, and what it stopped saying

Three things were removed or rewritten in one pass (`0053`), and the reasoning
matters more than the diff.

- **"Today's progress" is now overall progress.** The ring filled toward ten
  questions a day and reset at midnight, so the front door forgot a month of
  study every night, and ten a day was a target nobody agreed to. **The ring
  now shows progress toward the next rank.** That was the only honest option:
  a percentage of the bank would have handed the player a denominator, which
  is the one thing this app refuses to do — see "Never state the size of the
  question bank" above. Rank is a real total that only goes up and survives
  midnight, measured against the player's own next step rather than the end of
  the corpus. It reuses `rankProgress` so there is no second definition.
  Beside it: lifetime questions answered and lifetime accuracy, both unbounded
  counts about the player, which are explicitly fine.
- **`useLifetimeStats` counts, it does not select.** `useTodayStats` fetches a
  day's rows and counts them in JavaScript; doing that for a lifetime walks
  straight into the 1,000-row PostgREST cap this repo has hit twice. Both
  numbers come back as `count`/`head: true`, so no rows cross the wire.
- **The "Continue learning" card is gone.** It duplicated the Learning tab in
  the bottom bar, which is on screen at all times and goes to the same place;
  on a cold start it said "Pick a category", which is what the tab says.
- **The "Daily mission" card is gone from home, and became the price of the
  daily reward.** It stated a task with no reward attached while the reward it
  belonged to sat lower down paying out for nothing.

## The daily login reward now has a condition

**`claim_daily_login_rpc` used to pay for opening the app.** On an education
app that rewards launching an icon, and it competed with the thing the app
exists to make attractive. `0053` gates it: answer `daily_task_questions()`
questions today — currently **5** — and then claim.

- **The wheel is the unconditional one, deliberately.** It is a gift, it costs
  nothing and asks nothing, and 0008 already removed the gamble from it. Two
  unconditional gifts on one screen made the daily claim indistinguishable
  from it. Now they say different things.
- **The number is a function, not a literal.** `daily_task_questions()` returns
  5; the owner asked for "five or four or three" and nobody has watched a real
  player yet. One line, one place, no redeploy.
- **Progress counts any attempt**, from any room — a level run, the daily
  challenge, multiplayer. Tying it to one specific set would tell a player who
  answered forty questions elsewhere that they had done nothing.
- **The gate is checked after the already-claimed check**, on purpose: someone
  who claimed this morning is told they already claimed, which is true and
  final, rather than sent to study for a reward they cannot collect twice.
- **`daily_task_progress()` exists so the screen never counts for itself.** The
  bar and the button read the same threshold and the same count as the gate; a
  bar reading 5/5 beside a button that refuses would be worse than no bar.
- The button is disabled in the UI and **that is decoration** — the rule from
  0034 holds, a reward a client can ask for is one it can help itself to.

Verified in a rolled-back transaction against the live database, impersonating
the account: 0 answered refused, 4 answered refused, the fifth opened it and
paid 40 coins, a second claim was refused as *already claimed* rather than as
locked, and `daily_task_progress()` agreed at every step. Nothing was kept.

## The reward system, and why it is not a gamble

Migration 0008 removed the randomness from the chests **and** the wheel on
loot-box grounds — paying a set price for an unknown return is structurally
gacha, and this is a children's Islamic education app. Read that file before
adding any randomness back.

- **The spin wheel turns now** (#60), but it decides nothing. `spin_wheel_rpc`
  chooses and awards before the animation starts; the wheel is handed the index
  it must stop on, so what lands under the pointer is by construction the
  reward already written to the profile. It is the reveal, not the gamble.
- **The prize is a function of the date**, the same for every player. The
  `weight` column on `spin_rewards` is **dead data**.
- **The cooldown is 24 hours.** The copy said "every 4 hours" in all six
  languages for a long time while the RPC refused anything inside 24 — the
  countdown ran to zero and the server said come back later. One
  `SPIN_COOLDOWN_MS` constant now.

## The onboarding flow

```
/  →  /language  →  /intro  →  /onboarding/sound  →  age  →  avatar  →  name
   →  /signup  →  /onboarding/how-it-works  →  /quiz/<first>/1
```

Four things about this order are decisions, not accidents. **Do not reorder
without reading these.**

- **Language comes before anything with prose on it.** `LanguageContext` opens
  at `"en"` and there is no browser detection anywhere, so a first-time visitor
  reads English. While `/intro` sat before the language choice, five of its six
  translations were unreachable at the one moment they were written for.
  `/language` is the only page that needs no translation, because every option
  is written in its own language.
- **Sound is set early because of the audio device.** An AudioContext may not
  start outside a user gesture, so the tap that switches sound on is also the
  tap that opens the device.
- **`/intro` and `/onboarding/how-it-works` must not converge.** The first
  answers *what is this*, for a stranger. The second answers *how do I play*,
  for a player who has signed up.
- **The sound screen is outside the "Step N of 3" numbering** because it sets
  device preferences, not profile fields.

## Look and feel

- **One backdrop for the whole app.** `AppBackdrop` — two glows and an even
  khatim field. `OnboardingBackdrop` is that plus the drifting names of Allah,
  which stay in onboarding alone: they are the wrong company for a scoreboard
  and a shop, and a 17,000px moving layer competes with question text.
- **Every box carries the khatim**, because `.glass-card` does. One CSS rule,
  not twenty-four call sites. It is a background layer with the alpha baked
  into the SVG stroke, not a `::before` — cards here hang badges and rings
  outside their own bounds, and the `overflow: hidden` an overlay needs would
  have clipped them.
- **Colour goes through a token, never the raw palette.** `success`, `warning`,
  `danger`, `info`, `special`, and `medal-gold` / `-silver` / `-bronze`.
  **Medals are their own axis.**
- **Entrances are CSS, not framer-motion.** A motion component renders its
  `initial` state into the HTML — `opacity: 0` — so content is in the document
  and invisible until hydration. `settle-in`, `rise-in`, `delay-1`, `delay-2`.
- **Motion respects `prefers-reduced-motion`**, decorative loops included. The
  spin wheel does not spin at all under it; it is already on the answer.
- **No dash is used as punctuation in player-facing copy.** Check with
  `[a-zA-Z]-[a-zA-Z]`, and expect transliterated names as legitimate hits.

## i18n

- **Six locales: en, ms, id, ha, fr, ar**, in that order in `i18n.ts`.
- **Zero drift, two guards.** Add every new string to all six in the same edit.
- **Admin pages are exempt and are English.**
- **Category names are English in the database** with no translation layer, so
  do not render them where translated prose would be expected.
- **The prayer strip** goes through keys. Five of the six labels are Arabic
  proper nouns and stay as they are in Latin-script locales; **Sunrise was the
  only common noun** and was English everywhere, which is why it read as a bug.
  Arabic now gets الفجر الشروق الظهر العصر المغرب العشاء.
- **Hausa, Malay and Indonesian have established local forms for the five
  prayers** (Hausa: Asuba, Azahar, La'asar, Magariba, Isha'i). Left alone
  deliberately — a content decision for the owner, still open.

## Sound and haptics

Both are synthesised in code, nothing is loaded. Read `src/lib/sound.ts` before
touching audio; its note on why no dhikr is used as a routine reward cue is a
considered position.

- **Cues**: `tap`, `correct`, `wrong`, `levelComplete`, `rankUp`, `comboUp`,
  `streak`, `tick`. `tick` now also drives the spin wheel, one per segment.
- **Sound is off by default; haptics are on.** A vibration is private.
- **Volume runs through one master gain**, read fresh on every cue.
- **`navigator.vibrate` does not exist on iOS Safari at all.** Roughly half the
  audience will never feel a haptic, which is why each has a visible or audible
  counterpart.

## Conventions that are load-bearing

- **SECURITY DEFINER RPCs** need `set search_path = public`, *and* both
  `revoke all ... from public, anon;` and `grant execute ... to authenticated;`
  Migration 0013 is the reference.
- **A multiplier, a price or a reward must never arrive as an argument** from a
  *player*. Migration 0034 exists because `p_double_points` was taken on trust.
- **The audit log cannot be forged.** `admin_audit_log` has RLS on, a read
  policy for admins, and no insert policy at all.
- **Verify migrations in a rolled-back transaction** before believing them.
  Raising an exception at the end of a `do $$` block is a clean way to run a
  whole scenario and keep nothing.
- **Never hand-retype SQL.** Read the staged `.sql` file and paste it exactly.
  `submit_quiz_answer` was extracted from 0035 programmatically and patched
  database-side from its own stored source rather than retyped.
- Migrations go to the live database **and** `supabase/migrations/`.

## Dead code is still the most common bug in this repository

| Thing | Fault |
|---|---|
| `QuizCategoriesClient` | a stale duplicate of the live `QuizCategoriesGrid`, imported by nothing |
| `StreakCounter` | no longer even imported |
| `KnowledgeTree`, `RankBadge`, `FriendsList`, `KnowledgeCategories` | defined, never used |
| `.glass-card-hover` | referenced nowhere, so Tailwind drops it from the output entirely |
| `spin_rewards.weight` | dead since 0008 removed the weighted roll |

**Before building a screen, grep for whether it already exists and is simply
not rendered.**

## Open items

1. **Somebody needs to play the app.** Still the top item, still not a coding
   task, and now by a wider margin than ever. Zero attempts means **no screen
   shipped in the last two weeks has ever rendered with real data behind it**,
   and 2026-09-05 alone changed the home screen, the daily reward, the daily
   challenge, battle and all three play modes. Every one of those was verified
   against the database and the five gates; not one was clicked.
   The highest-value hour anybody could spend on this project is signing in,
   answering five questions, claiming the daily reward, and starting a battle.
2. ~~The answer-key exposure.~~ **Fixed in 0049** — see the section above.
3. **The translation backfill is capped at twenty rows a day by the Gemini
   free tier, and the cap now names itself.** As of 2026-09-05 the 429 reads
   `quota=GenerateRequestsPerDayPerProjectPerModel-FreeTier limit=20`, so this
   is settled: a daily free-tier request cap, resetting at 07:00 UTC, not a
   per-minute throttle and not anything a dial here can reach. **26,036 still
   queued, 69 done, zero failed** (re-checked 2026-09-05 evening). The arena
   bank's 5,246 questions are deliberately **not** in that queue — 0054's
   trigger skips the pool — so this number is the browsable bank only. At this rate the backfill finishes in
   about three and a half years. See "The translation system" above.
   **This is the actual next thing to unblock**: someone with access to the
   Gemini/Google Cloud billing needs to enable a paid plan; nothing further is
   tunable from `cron_run_translations` or `TRANSLATE_CONCURRENCY`. Once it's flowing, read a few Hausa samples —
   especially fiqh, where the fard/sunnah distinction the guard exists for
   actually bites — rather than assuming the automatic checks caught
   everything.
4. **Scholar review — still zero, now of 10,466.** `/admin/questions` filters to
   "Awaiting review". Contemporary Issues is the riskiest and so the most
   informative.
5. **The daily hadith rotation is 391 narrations long, English only.** Built
   in `0047`: `hadiths` + `hadith_translations`, locale-aware from the first
   migration, a `daily_hadith()` that picks by date so every player sees the
   same narration on the same day, and an importer at `/admin/hadiths`. `0050`
   filled it: the `0047` seed plus 390 more — 40 Hadith Nawawi and 40 Hadith
   Qudsi in full, and Bukhari's Belief, Knowledge and Ar-Riqaq (heart-
   softening) books in full — fetched from fawazahmed0/hadith-api, a mirror of
   published English translations, spot-checked against the well-known text
   of Bukhari 1 before trusting the rest. It is an **importer and deliberately
   not a translator**: there is no "translate this" button and its absence is
   the feature. A narration is a claim about what the Prophet ﷺ said,
   published translations of Bukhari and Muslim exist and are what people
   cite, and the pipeline's guard — that a mistranslation must not change
   which answer is correct — has no counterpart here, because there is
   nothing to check the output against.

   **Arabic, French and most of Indonesian are now filled**, and they were
   filled the way 0047 allows — from published editions, not from a model.
   `supabase/functions/import-hadith-editions` fetches ara-/fra-/ind- editions
   from the same pinned fawazahmed0 tag the English came from and inserts
   them; it calls no model, only inserts, and ignores conflicts, so English and
   anything typed by hand are beyond its reach and re-running is a no-op.

   | locale | of 391 | where it comes from |
   |---|---|---|
   | `en` | 391 | 0050 |
   | `ar` | **391** | the narration in the language it was narrated in |
   | `fr` | **391** | fra- editions of Bukhari, Nawawi, Qudsi |
   | `id` | **278** | ind-bukhari only; 31 entries have no text, and there is no Indonesian Nawawi or Qudsi |
   | `ha` | **62** | hadeethenc.com, matched by Arabic text — see below |
   | `ms` | 0 | no published Malay edition in this source |

   **Hausa came from a second publisher**, because the edition source above
   has none. hadeethenc.com (the Encyclopedia of Translated Prophetic Hadiths)
   renders a curated corpus into 72 languages, Hausa among them, human
   translated with the Arabic original beside each entry. It keys entries by
   its own ids and cites sources by collection alone — "Bukhari ne ya rawaito
   shi", no number — so there is nothing to join on. What made a join possible
   is that Arabic was already imported for all 391: **the match is on the text,
   not on a number.**

   Both Arabic sides normalised, compared as 5-word shingles, accepted only at
   overlap ≥ 0.70 with ≥ 10 shared shingles, rejected whenever the runner-up
   came within 80% of the best, and cross-checked against the encyclopedia's
   own attribution. Of 391: 127 matched strongly, 14 fell to ambiguity, 1 to
   attribution, 50 were too weak — **62 survived.** Three were then read end to
   end against the English rather than trusted from a score. The map lives in
   `import-hadith-editions` so it can be reviewed in a diff.

   Caveat worth knowing: the encyclopedia records a narration in its own
   wording, often the prophetic saying without the full chain Bukhari prints,
   so a Hausa card can read shorter than the English beside it. Same narration,
   not a sentence-for-sentence rendering.

   **Malay is still 0, and 329 narrations still fall back to English in Hausa.**
   That is the designed behaviour, not a gap to paper over: the fallback is per
   narration and per locale. Closing it means more published text or an admin
   typing at `/admin/hadiths` — never a model. The same is true of the 113
   Indonesian gaps.

   Matching by hadith number was **checked rather than assumed**: every entry
   carries the collection's own book/hadith reference beside the number, and
   across the 7,563 narrations common to the eng-, ara-, fra- and ind-bukhari
   editions that reference disagrees with the English in **zero** cases.
6. **Nothing has been felt on a physical device.** Haptics need a real Android
   phone; no emulator reproduces a vibration.
7. **Offline play — not started.** `public/sw.js` caches nothing on purpose.
8. **Streak reminders.** The two vault secrets that kept them dormant since
   0027 are now set, so `ilm-streak-reminders` will fire at 17:00 UTC. Whether
   a push actually sends still depends on the VAPID keys, which have not been
   verified — check before assuming either way.
9. **Timed-out questions in the round review withhold the answer.** Showing
   them cleanly means recording a timeout as an attempt, which changes accuracy
   stats. A decision, not a fix.
10. **No browser language detection.** One `navigator.language` fallback would
    mean an Arabic phone opens in Arabic before anyone taps. Agreed, not done.
11. **RTL arrow direction.** Forward and back arrows point the same physical
    way in Arabic across the whole app. One pass, app wide, or leave it.
12. **Rank names are Latin inside Arabic text.** `RANKS` titles are data.
13. Agreed but unbuilt: bulk actions, Excel export, a read-only auditor role.

## Deliberately declined, with reasons

Recorded so a future session does not rediscover these and build them by
accident. None of these is a todo.

- **A friends and social system.** No feed table, no reactions, no social
  graph. This is a schema, RLS, presence and moderation product, not a screen,
  on an app with **one account**. Declined twice.
- **The global leaderboard mockup.** Roughly everything in it already exists.
- **Artifacts as an economy.** The mockup's "+15% XP GAIN" is exactly what
  migration 0034 exists to prevent.
- **Secret achievements.** Blurred `??? ???` entries that can never unlock
  would be a lie on the screen.
- **The knowledge tree's winding path.** Alternating absolute offsets are
  precisely what breaks in Arabic RTL.
- **Barakah as a second currency.** Adopted as the *name* for XP instead.
- **Chrome-style runtime translation.** Discussed at length and rejected: a
  model call per view is latency, an endless bill and no offline, and the app
  *grades* the player on the text. Pre-translation into the database was built
  instead.

## About the Stitch mockups

They are built on an **inverted palette**: `primary` is emerald `#4edea3` where
this app is gold `#f0cd6d`. Every `text-primary` in those files means *green*.
Read each class as a role, not a colour.

They also carry AI-generated stock photos on `googleusercontent` URLs that will
rot, the Material Symbols icon font beside this app's lucide, hardcoded
English, and absolute left/right positioning that breaks in RTL. Read them for
intent, never for code.

## A content problem, still unfixed

**Sixteen published questions refer to a question the player may never have
seen**, opening with phrases like "Extending that spaceflight derivation".
`buildTierLadder` shuffles the tier bucket, so any of them can be served first.
All sixteen carry a rewritten explanation that mitigates it as far as an
explanation can, but that arrives after the answer.

Three ways out: rewrite the sixteen to stand alone; accept it; or give a
question an optional prerequisite. Untouched because repairing it means
rewriting question text, and the rule is that a session which finds itself
authoring questions stops.

## Things a fresh session gets wrong

- **The bank is done.** If you find yourself authoring questions, stop.
- **The admin console is done and reachable.**
- **Chests, the spin wheel, study circles, daily challenges, leagues and the
  streak freeze are all fully wired.** "Finish the reward system" is wasted work.
- **The combo already escalates and the floating +XP already exists.**
- **The fonts load correctly.** Investigated, reasoning sound, conclusion false.
- **The sound system is finished**, including a calibration screen, a volume
  control and eight cues.
- **A level run is the whole tier — 20 questions**, not `HUNT_RULES.runLength`.
- **Achievements are awarded by the database**, in `award_achievements()`.
- **There is one account**, and it has never answered a question.

## Environment traps

- **`npm run build` and `npm run dev` share `.next`.** Stop dev first.
- **`NEXT_PUBLIC_*` is inlined at build time.** Writing `.env.local` after a
  build does nothing until you rebuild.
- **A fresh container has no `node_modules` and no `.env.local`.** `npm ci`,
  then write `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` or
  the build fails prerendering `/intro` with "supabaseUrl is required".
- **Headless Chrome has no outbound network here, but localhost works.** The
  Playwright chromium at `/opt/pw-browsers` is the one that exists; there is no
  `chromium` on PATH.
- **A run's per-question timer is 25s at tier 1 rising to 45s at tier 9**,
  shorter than a browser automation round trip. The option letter lives in
  `aria-label`, not `innerText`.
- **`npm run lint` does not exist as a useful gate.** Use `tsc --noEmit` and
  `npm run build`, which runs ESLint.

## Before you claim anything is done

```bash
npx tsc --noEmit        # supabase/functions is excluded — it is Deno
npm run build           # read the WHOLE log; a warning still exits 0
npm run test:engine
npm run test:i18n
npm run test:middleware
```

Two build warnings are expected and pre-existing: `@opentelemetry` via genkit,
and `metadataBase` not being set. Neither is a `⨯`.

Then verify against the deployment, with a **fresh** share token, the file
sanity guards, and the signed-out control described above.

## Working agreement

- Develop on a fresh `claude/...` branch, branched from `origin/main`. Open a
  draft PR; the owner says "merge" when ready.
- Squash merge, matching the existing history: a title ending in `(#N)`.
- **The repository is public — and that now exposes the answer key.**
  It was private earlier on 2026-09-05 (the API reported `"private": true` and
  raw URLs 404'd, including for `README.md`), and the owner made it public so
  the arena importer could fetch the bank. Both states have been true in one
  day, so **check rather than assume**.
  What that costs, stated plainly: `scripts/question-bank/arena/bank.json`
  holds all 5,246 arena questions **with their correct answers and
  explanations**, and anyone can now download it. Migration 0049 exists
  precisely to stop the answer key leaking through the anon key; a public repo
  reaches the same end by another road. Making the repo private again once the
  import is settled would close it — the importer only needs the raw URL at the
  moment it runs. Never commit keys regardless.
- **Ask for the error, not the editor.** Screenshots of a SQL editor have
  twice put more on screen than the error needed.

## Recent history

| PR | What |
|---|---|
| #71 | The arena opens: daily, battle and the play modes stop asking for a subject — and multiplayer, which could never have started a quiz, works |
| #70 | Two banks — 5,246 arena questions imported, nothing serving them yet |
| #69 | The daily reward asks for a day of study, and the home screen remembers |
| #68 | Sixty-two narrations reach Hausa, and the rest honestly do not |
| #67 | The daily hadith speaks Arabic, French and Indonesian |
| #66 | The quota names itself (20/day, free tier), and a reclaim that was never reached |
| #65 | The handoff before this one |
| #64 | The language that would not stay, a hadith that is actually daily, and a backfill that turned out to be quota-blocked rather than slow |
| #62 | What running the translation pipeline for real taught it |
| #61 | Content translates itself, and Sunrise is a word again |
| #60 | A wheel that turns, a countdown that moves, and the khatim on every box |
| #59 | The handoff before this one |
| #58 | The intro earns its place, and the language comes first |
| #57 | An intro that says what this is, and a bank whose size stays a mystery |
| #56 | A screen to set the sound, and the cues it was missing |
| #55 | One backdrop for every onboarding screen, and a drift that actually loops |
| #52 | One vocabulary for colour, a game you can feel, and a real khatim |
| #43 | The "Next level" CTA, and three security holes |
| #38 | Inlined the middleware matcher — the import had broken every static asset |
