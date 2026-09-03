# ILM Hunt — session handoff

Written 2026-09-03, replacing the 2026-09-02 note. **Read this first if you are
picking up work cold.** Everything below was checked against the live database
(project `ziblpvwiqzpjnkqjwodl`) and `main` at `4f05824` on the day it was
written — re-check anything you are about to depend on rather than trusting the
numbers blind. Four earlier notes were wrong about a count within a day of
being written, which is the argument for checking.

## The one fact that reframes everything

**Nobody has ever played this app.**

```
questions        5,220        profiles              1
categories          29        attempts              0
translations         5        scholar approved      0
```

The `attempts` table is **empty**. Every question, category, store item,
achievement, challenge and rank tier is seeded and ready; one account exists,
the owner's, and it has never answered anything.

Keep that in front of you when deciding what to build. Seven pull requests have
shipped since anyone last suggested playing it.

## Where things stand

| | |
|---|---|
| Questions | **5,220** — 29 categories × 9 tiers × 20 |
| Published | 5,220 |
| Explanations | 5,220 written and live, 0 missing |
| Translations | **5** — one question, in all five non-English locales |
| **Scholar approved** | **0** |
| **Attempts, ever** | **0** |
| Accounts | **1** — the owner, an admin |
| Active pg_cron jobs | **6** |
| `vault.secrets` | **2 of 2 set** |
| Migrations | through **`0049`**, disk and database in step |
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
- **The backfill has NOT been queued.** Only one question is translated.
- **Throughput was raised in 0048 and the arithmetic changed shape.** It was
  ~3 per 5-minute tick, ≈860/day, ≈30 days for the full 26,100 — the ceiling of
  a strictly sequential worker inside a 110-second budget at ~40s a call.
  The worker now draws its batch through a **bounded pool**, so the calls in
  flight are a dial rather than a consequence of the batch size. Three dials,
  all turnable without touching the worker's code:

  | Dial | Where | Now |
  |---|---|---|
  | Cron cadence | `cron.job`, migration 0048 | every 2 minutes |
  | Batch size | `cron_run_translations` body | 12 per invocation |
  | Concurrency | `TRANSLATE_CONCURRENCY` env var | 6 in flight |

  12 ÷ 6 × ~40s ≈ 80s, inside the 110s deadline; 30 ticks/hour × 12 ≈
  **8,640/day**, so 26,100 is about **3 days**, not 30. **These are projections
  from one measurement, not observations** — the backfill has still never been
  queued, so nothing has run at this setting. The worker reports `elapsedMs`,
  `rateLimited`, `released` and `concurrency` in its response; read them from a
  real run before believing the table above.
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
   task. Zero attempts means no screen shipped in the last week has ever
   rendered with real data behind it.
2. ~~The answer-key exposure.~~ **Fixed in 0049** — see the section above.
3. **The translation backfill was queued and is running.** All 26,100 rows
   went into `translation_queue` in one statement; the worker is draining it
   unattended at the 0048 settings. Read a few Hausa samples once it has run
   for a while — especially fiqh, where the fard/sunnah distinction the guard
   exists for actually bites — rather than assuming the automatic checks
   caught everything.
4. **Scholar review — still zero of 5,220.** `/admin/questions` filters to
   "Awaiting review". Contemporary Issues is the riskiest and so the most
   informative.
5. **The daily hadith needs content, not code.** Built in 0048's sibling
   `0047`: `hadiths` + `hadith_translations`, locale-aware from the first
   migration, a `daily_hadith()` that picks by date so every player sees the
   same narration on the same day, and an importer at `/admin/hadiths`.
   **There is exactly one hadith in the table**, in English only — the one the
   hardcoded constant carried — so the rotation is one day long and every
   locale falls back to English. It is an **importer and deliberately not a
   translator**: there is no "translate this" button and its absence is the
   feature. A narration is a claim about what the Prophet ﷺ said, published
   translations of Bukhari and Muslim exist and are what people cite, and the
   pipeline's guard — that a mistranslation must not change which answer is
   correct — has no counterpart here, because there is nothing to check the
   output against.
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
- The repository is public. Never commit keys.
- **Ask for the error, not the editor.** Screenshots of a SQL editor have
  twice put more on screen than the error needed.

## Recent history

| PR | What |
|---|---|
| this one | The language that would not stay, a hadith that is actually daily, and a backfill that is days rather than a month |
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
