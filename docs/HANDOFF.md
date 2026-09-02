# ILM Hunt — session handoff

Written 2026-09-02, replacing the 2026-08-31 note. **Read this first if you are
picking up work cold.** Everything below was checked against the live database
(project `ziblpvwiqzpjnkqjwodl`) and `main` at `ef02c8f` on the day it was
written — re-check anything you are about to depend on rather than trusting the
numbers blind. Three earlier notes were wrong about a count within a day of
being written, which is the argument for checking. This one already caught one:
`daily_challenges` was 10 in the last note and is 12 now.

## The one fact that reframes everything

**Nobody has ever played this app.**

```
questions      5,220        profiles     1
categories        29        attempts     0
store_items       17        weekly_xp    0
achievements      13
daily_challenges  12
```

The `attempts` table is **empty**. Every question, category, store item,
achievement, challenge and rank tier is seeded and ready; one account exists,
the owner's, and it has never answered anything.

Keep that in front of you when deciding what to build. Four pull requests of
onboarding work have shipped since the last note and **every one of them was
verified by rendering it, never by playing it**. A screen that renders is not a
screen that works.

## Where things stand

| | |
|---|---|
| Questions | **5,220** — 29 categories × 9 tiers × 20 |
| Published | 5,220 |
| Explanations | 5,220 written and live, 0 missing, **413 characters average** |
| **Scholar approved** | **0** |
| **Attempts, ever** | **0** |
| Accounts | **1** — the owner, an admin |
| Active pg_cron jobs | 5 |
| `vault.secrets` | 0 of 2 set |
| Migrations | through **`0043`**, disk and database in step |
| Gates | `tsc --noEmit`, `build`, `test:engine`, `test:i18n`, `test:middleware` |

Production: <https://ilm-quiz.vercel.app>. Admin: `/admin`, or Profile →
Overview → the **Game master** card.

## The onboarding flow, as it now stands

```
/                    landing, the brand moment
/language            pick a language
/intro               three panels: what this is
/onboarding/sound    sound, volume and vibration
/onboarding/age      Step 1 of 3
/onboarding/avatar   Step 2 of 3
/onboarding/name     Step 3 of 3
/signup
/onboarding/how-it-works   the rules
/quiz/<first>/1      the first level
```

Four things about this order are decisions, not accidents, and each cost a
round to work out. **Do not reorder without reading these.**

- **Language comes before anything with prose on it.** `LanguageContext` opens
  at `"en"` and only moves for a stored preference or a signed in profile;
  there is no browser detection anywhere. A first time visitor has neither, so
  every stranger reads English. While `/intro` sat before the language choice,
  five of its six translations were unreachable at the one moment they were
  written for. `/language` is the only page in the app that needs no
  translation to work, because every option is written in its own language.
- **Sound is set early because of the audio device, not because of tidiness.**
  An AudioContext may not start outside a user gesture, so the tap that
  switches sound on is also the tap that opens the device. Near the top of
  onboarding, every screen after it can make a sound.
- **`/intro` and `/onboarding/how-it-works` must not converge.** The first
  answers *what is this*, for a stranger who has not signed up. The second
  answers *how do I play*, for a player who has. Nothing about the rules of a
  run belongs on `/intro`.
- **The sound screen is outside the "Step N of 3" numbering** because it sets
  device preferences, not profile fields. Numbering it would promise the player
  their answers follow them to another phone.

## Two product decisions that live only in code

Both would be undone by a well meaning session that had not read them. They are
commented at their call sites; they are here so you meet them first.

- **Never state the size of the question bank.** A total hands the player a
  denominator, and from then on every run is measured against finishing rather
  than against learning. It was removed from `/intro` and from `/quiz` (the
  heading line, a stat tile, and a per category progress label that read
  `0/180` and now reads as a percentage). Anyone who works the number out from
  nine levels and a subject count is welcome to it; the app must not hand it
  over. The subject count stays: it says how wide the app is, not where it
  stops.
- **Player facing counts are fine when they are about the player.** Their own
  answered totals, the per level count that opens the next level, a daily
  challenge size, a multiplayer room size. Admin pages keep every total.

## The five warnings this codebase has earned

**A Next build warning does not fail the build.** #37 moved the middleware
matcher into a shared module so a test could import it. Next reads
`config.matcher` by *static analysis* and cannot follow an identifier; it
printed `⨯ Next.js can't recognize the exported config field` and **exited 0**.
With no matcher the middleware ran on every request, and because #37 had also
made it deny-by-default, every static asset was redirected to `/login` for
signed-out visitors. Nobody could sign in.

- **Read the whole build log.** A filtered log is not a read log.
- **A unit test that checks a value cannot tell you the framework used it.**

**Verify against a deployment, not against the code.** Preview deployments sit
behind Vercel SSO; the Vercel MCP's `get_access_to_vercel_url` issues a share
token that gets you past it.

**A share token is scoped to one deployment.** Reusing an older one silently
serves you Vercel's own login page, which returns **HTTP 200**. That produced a
clean-looking "no raw palette found" result from a **zero-byte** stylesheet.
Any verification that greps a fetched file must first assert the file is what
you think it is.

**A signed-out check needs a control.** Proving `/intro` serves to a signed out
visitor means nothing unless you also prove you *are* signed out. Fetch `/home`
in the same session: it must return 307 to `/login`. Without that, a share
token that happened to carry a session would make any public route look public.

**Measuring beats reasoning, repeatedly.** Every significant error in the last
two sessions was caught by rendering, querying, measuring or grepping the built
artefact, and none by re-reading the source.

## The traps that will cost you a day

- **Scholar approval is NOT `review_status`.** `scholar_approved` is a value of
  that enum, and `submit_quiz_answer` accepts **only** `published`. Migration
  0033 gave it `questions.scholar_approved_at`, its own column.
- **PostgREST caps an unbounded select at 1,000 rows.** Bitten twice. Count in
  the database with `{ count: "exact", head: true }`.
- **`config.matcher` must be an inline literal.** See above.
- **A state updater must stay pure.** React may call it twice. Three bugs came
  from a side effect inside one. Cues belong in an effect keyed on the state.
- **Protection is opt-in, so a forgotten route goes *unreachable*, not
  unguarded.** `PUBLIC_PREFIXES` in `src/lib/auth-routes.ts` is the allow list
  and everything else demands a session. Adding `/intro` without listing it
  would have bounced every signed out visitor off the landing page's only call
  to action. Add the route and the assertion in `check-middleware` in the same
  edit.
- **Reading cookies opts a route out of static rendering permanently.**
  `@/lib/supabase/server` reads them. `/intro` needs no session, so it takes a
  plain anonymous client and caches: measured, that was 500ms per request
  against 5ms, on the first thing a stranger clicks.
- **An absolutely positioned child does not size its parent.** The intro hero
  measured 112px while painting 208px of pulse rings, so the column centred
  itself around a height 96px short of what it drew. That was 145px of dead air
  top and bottom. If a layout looks wrongly spaced, measure the boxes before
  adjusting padding.
- **`-50%` resolves against the element's own height, and flex stretches it.**
  The names backdrop was stretched to the viewport while its content was
  17,105px, so the "seamless" loop ran half a viewport and snapped back, and
  most of the ninety-nine names were never seen. `self-start` fixed it.
- **A duration is not a speed.** The names drift over one full copy of the
  list, about 8,550px, so 2657s is roughly 3.2px/s. Tune by measuring px/s on a
  running page, never by adjusting the seconds.
- **Adding a column to a `returns table` needs a `drop function` first.**
- **Tailwind emits a keyframe only if some `animate-*` utility is used.**
- **Tailwind's scanner is a regex over file bytes and does not know what a
  comment is.** Naming a palette class inside a comment ships that class.
- **The i18n guard has two shapes to catch, not one.** Text that starts a JSX
  node, and text that trails an interpolation. If you add a third check, run it
  against a deliberately broken file first.

## Dead code is still the most common bug in this repository

| Thing | Fault |
|---|---|
| `QuizCategoriesClient` | a stale duplicate of the live `QuizCategoriesGrid`, imported by nothing. Both were cleaned of the bank total so the leak cannot return through it |
| `StreakCounter` | no longer even imported. Fully unreferenced |
| `KnowledgeTree`, `RankBadge`, `FriendsList`, `KnowledgeCategories` | defined, never used |

`tick` was in this table until recently: it was defined in `sound.ts` and
called from nowhere, so the one cue whose own comment describes it repeating
had never played once. **Before building a screen, grep for whether it already
exists and is simply not rendered.**

## Sound and haptics

Both are synthesised or generated in code, nothing is loaded. Read
`src/lib/sound.ts` before touching audio; its note on why no dhikr is used as a
routine reward cue is a considered position, not a placeholder.

- **Cues**: `tap`, `correct`, `wrong`, `levelComplete`, `rankUp`, `comboUp`,
  `streak`, `tick`. Haptics mirror them except `tap`, which pairs with
  `select`.
- **Sound is off by default; haptics are on.** A vibration is private, a sound
  is not. Haptics switch themselves off under `prefers-reduced-motion`.
- **Volume runs through one master gain**, never a per call argument, so the
  balance the cue gains were given by ear survives every setting. Read fresh on
  every cue, so a slider drag is audible immediately.
- **`navigator.vibrate` does not exist on iOS Safari at all.** Roughly half the
  audience will never feel any haptic, which is why every haptic has a visible
  or audible counterpart.
- `/onboarding/sound` and the profile both carry the switches and the slider.

## Conventions that are load-bearing

- **SECURITY DEFINER RPCs** need `set search_path = public`, *and* both
  `revoke all ... from public, anon;` and `grant execute ... to authenticated;`
  Migration 0013 is the reference.
- **A multiplier, a price or a reward must never arrive as an argument** from a
  *player*. Migration 0034 exists because `p_double_points` was taken on trust.
- **The audit log cannot be forged.** `admin_audit_log` has RLS on, a read
  policy for admins, and no insert policy at all.
- **Verify migrations in a rolled-back transaction** before believing them.
- **Colour goes through a token, never the raw palette.** The semantic set is
  `success`, `warning`, `danger`, `info`, `special`, and `medal-gold` /
  `medal-silver` / `medal-bronze`. **Medals are their own axis.**
- **i18n has zero drift and two guards.** Add every new string to all six
  locales in the same edit. Admin pages are exempt and are English. Category
  names are English in the database and there is no translation layer over
  them, so do not render them where translated prose would be expected.
- **No dash is used as punctuation in player-facing copy.** Check with
  `[a-zA-Z]-[a-zA-Z]`, and expect transliterated names as legitimate hits.
- **Motion respects `prefers-reduced-motion`**, decorative loops included.
- **Entrances are CSS, not framer-motion.** A motion component renders its
  `initial` state into the HTML — `opacity: 0` — so the content is in the
  document and invisible until hydration. `settle-in`, `rise-in`, `delay-1`,
  `delay-2` are the vocabulary, and they stop under reduced motion.
- **Ornament goes through `<IslamicPattern>`**, and the shared onboarding
  background is `<OnboardingBackdrop>`: names, two glows, khatim lattice.
- **Never hand-retype SQL.** Read the staged `.sql` file and paste it exactly.

## Known holes, disclosed rather than hidden

- **Double points is real now.** 0034 adds `lifeline_spends`; the grader reads
  and *consumes* a row instead of believing an argument.
- **A run's difficulty is server-chosen.** 0035 records the tier band on the run.
- **A player enters a room as themselves.** 0036 to 0038.
- **Signup is still open.** Dashboard setting, owner only. Confirm at
  `/auth/v1/settings` before relying on the last known value.

## Open items

1. **Somebody needs to play the app.** Still the top item, still not a coding
   task. Zero attempts means no screen shipped in the last four days has ever
   rendered with real data behind it.
2. **Nothing has been felt on a physical device.** Haptics need a real Android
   phone: iOS Safari has no `navigator.vibrate`, and no emulator reproduces a
   vibration. The sound cues have been verified at the audio graph — with sound
   off all five previews synthesise nothing, and each cue produces exactly the
   voices its definition specifies — but nobody has heard them in a run.
3. **Scholar review — still zero of 5,220.** `/admin/questions` filters to
   "Awaiting review". Contemporary Issues is the riskiest and so the most
   informative.
4. **Offline play — not started.** `public/sw.js` caches nothing on purpose.
5. **Streak reminders — dormant.** `vault.secrets` is empty. `npm run
   vapid:keys`; walkthrough in `docs/RUNBOOK.md`.
6. **The daily hadith is not daily.** `DAILY_HADITH` is one hardcoded constant.
   Making it genuinely daily needs verified narrations with real references.
   **This is content work for the owner or a scholar, not for a session**: no
   citation has ever been invented in this project, and a wrong one is worse
   than none.
7. **Timed-out questions in the round review withhold the answer.** Showing
   them cleanly means recording a timeout as an attempt, which changes accuracy
   stats. A decision, not a fix.
8. **No browser language detection.** One `navigator.language` fallback would
   mean an Arabic phone opens in Arabic before anyone taps. Agreed as worth
   doing, not yet done.
9. **RTL arrow direction.** Forward and back arrows point the same physical way
   in Arabic across the whole app. One pass, app wide, or leave it consistent.
10. **Rank names are Latin inside Arabic text.** `RANKS` titles are data, and
    `/intro` and how-it-works both render them as they are.
11. Agreed but unbuilt: bulk actions, Excel export, a read-only auditor role.

## Deliberately declined, with reasons

Recorded so a future session does not rediscover these and build them by
accident. None of these is a todo.

- **A friends and social system.** Two Stitch mockups asked for it. No feed
  table, no reactions, no social graph. This is a schema, RLS, presence and
  moderation product, not a screen, on an app with **one account**. Declined
  twice.
- **The global leaderboard mockup.** Roughly everything in it already exists.
- **Artifacts as an economy.** The mockup's "+15% XP GAIN" is exactly what
  migration 0034 exists to prevent.
- **Secret achievements.** Blurred `??? ???` entries that can never unlock
  would be a lie on the screen.
- **The knowledge tree's winding path.** Alternating absolute offsets are
  precisely what breaks in Arabic RTL.
- **Barakah as a second currency.** Adopted as the *name* for XP instead.

## About the Stitch mockups

They are built on an **inverted palette**: `primary` is emerald `#4edea3` where
this app is gold `#f0cd6d`. Every `text-primary` in those files means *green*.
Translate them: read each class as a role, not a colour.

They also carry, in every file, things that must not come across: AI-generated
stock photos on `googleusercontent` URLs that will rot, the Material Symbols
icon font beside this app's lucide, hardcoded English, absolute left/right
positioning that breaks in RTL, and at least once a redefinition of
`mashrabiya-overlay` in that orphan green. One mockup's own toggle handler
checked a class its markup never set, so the first tap turned a switch "on"
again instead of off. Read them for intent, never for code.

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
- **Headless Chrome has no outbound network here, but localhost works.** Serving
  `npm start` and driving Chromium at `http://localhost:3000` is the cheapest
  real verification available, and it is how the audio graph, the switch
  geometry and the layout boxes were all measured.
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
- Migrations are applied to the live database **and** written to
  `supabase/migrations/`. Keep the two in step.
- The repository is public. Never commit keys.

## Recent history

| PR | What |
|---|---|
| #58 | The intro earns its place, and the language comes first |
| #57 | An intro that says what this is, and a bank whose size stays a mystery |
| #56 | A screen to set the sound, and the cues it was missing |
| #55 | One backdrop for every onboarding screen, and a drift that actually loops |
| #54 | The handoff before this one |
| #53 | The Stitch screens, translated into the design system |
| #52 | One vocabulary for colour, a game you can feel, and a real khatim |
| #51 | The first explanations, written and staged |
| #43 | The "Next level" CTA, and three security holes |
| #38 | Inlined the middleware matcher — the import had broken every static asset |
