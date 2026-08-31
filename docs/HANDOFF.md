# ILM Hunt — session handoff

Written 2026-08-31, replacing the 2026-08-30 note. **Read this first if you are
picking up work cold.** Everything below was checked against the live database
(project `ziblpvwiqzpjnkqjwodl`) and `main` at `688918c` on the day it was
written — re-check anything you are about to depend on rather than trusting the
numbers blind. Two earlier notes were wrong about a count within a day of being
written, which is the argument for checking.

## The one fact that reframes everything

**Nobody has ever played this app.**

```
questions      5,220        profiles     1
categories        29        attempts     0
store_items       17        weekly_xp    0
achievements      13
daily_challenges  10
```

Not "no human has reached tier 2", which is what the previous note said. The
`attempts` table is **empty**. Every question, category, store item,
achievement, challenge and rank tier is seeded and ready; one account exists,
the owner's, and it has never answered anything.

Keep that in front of you when deciding what to build. This app has far more
finished interface than it has players, and almost every feature idea that
arrives from outside assumes a populated product. A leaderboard currently ranks
one person with zero Barakah. A friends system would let that person befriend
nobody.

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

## What changed since the last note

Two pull requests, #52 and #53, both merged. No migrations: everything was
application code, so `0043` is still the head on disk and in the database.

**#52 — one vocabulary for colour, and a game you can feel.**

- `--accent` was gold in `globals.css` and slate in `tailwind.config.ts`;
  `--secondary-foreground` had drifted the same way. Both now hold the Tailwind
  value.
- Four keyframes were declared twice under the same names. `glow` was tertiary
  green in the config and brand gold in globals; globals loads later, so gold is
  what had always rendered and the green was dead from the day it was written.
- **163 raw Tailwind palette classes** sat beside the design tokens, giving the
  app three golds, two greens and two reds. Semantic tokens added and every
  usage migrated. Then `src/lib/design-tokens.ts` turned out to be the worst
  offender of all, claiming in its own doc comment to use the design system
  while being written in raw palette.
- Haptics (`src/lib/haptics.ts`), a real celebration on a won run, a level path
  with a visible next step, and the khatim.

**#53 — the Stitch screens, translated into the design system.**

- Achievement rarity, derived rather than stored.
- The hadith card, rendered for the first time.
- Barakah as the name for XP.
- **Nineteen player-facing strings** that had been silently English in five
  locales, plus a second i18n check to stop them coming back.

## The five warnings this codebase has earned

**A Next build warning does not fail the build.** #37 moved the middleware
matcher into a shared module so a test could import it. Next reads
`config.matcher` by *static analysis* and cannot follow an identifier; it
printed `⨯ Next.js can't recognize the exported config field` and **exited 0**.
With no matcher the middleware ran on every request, and because #37 had also
made it deny-by-default, every static asset was redirected to `/login` for
signed-out visitors. Nobody could sign in.

- **Read the whole build log.** The check that missed this grepped for a fixed
  set of patterns that did not include the `⨯` glyph. A filtered log is not a
  read log.
- **A unit test that checks a value cannot tell you the framework used it.**
  `npm run test:middleware` reads `src/middleware.ts` and asserts the matcher is
  an inline literal.

**Verify against a deployment, not against the code.** Preview deployments sit
behind Vercel SSO; the Vercel MCP's `get_access_to_vercel_url` issues a share
token that gets you past it.

**A share token is scoped to one deployment.** Reusing an older one silently
serves you Vercel's own login page, which returns **HTTP 200**. That produced a
clean-looking "no raw palette found" result from a **zero-byte** stylesheet.
Any verification that greps a fetched file must first assert the file is what
you think it is: check the HTML actually contains `ILM Hunt`, and that the CSS
is larger than a plausible floor, before believing a single grep.

**"X is missing" is a hypothesis, not a fact.** It was wrong five more times
this session, on top of the six the last note recorded. See the list below,
which is now long enough to be a rule rather than an anecdote.

**Measuring beats reasoning, repeatedly.** Every significant error this session
was caught by rendering, querying or grepping the built artefact, and none by
re-reading the source.

## The traps that will cost you a day

- **Scholar approval is NOT `review_status`.** `scholar_approved` is a value of
  that enum, and `submit_quiz_answer` accepts **only** `published`. Marking
  reviewed questions with it would delete them from the playable bank one at a
  time, invisibly. Migration 0033 gave it `questions.scholar_approved_at`, its
  own column, and the question stays `published` throughout.
- **PostgREST caps an unbounded select at 1,000 rows.** Bitten twice: the
  category grid (0029) and the admin question console (0033, where it hid 4,220
  of 5,220). Count and slice in the database.
- **`config.matcher` must be an inline literal.** See above.
- **A state updater must stay pure.** React may call it twice. Three bugs have
  now come from a side effect inside one: a double timeout, a question appearing
  twice in the round review, and, avoided this session, a combo cue that would
  have fired twice per step. Cues belong in an effect keyed on the state, never
  inside the updater that produces it.
- **Adding a column to a `returns table` needs a `drop function` first.**
  `create or replace` refuses to change a return type.
- **Tailwind emits a keyframe only if some `animate-*` utility is used.** Four
  keyframes lived in both `tailwind.config.ts` and `globals.css`. Deleting the
  globals copies looked like the tidy fix and silently broke all four effects,
  because nothing writes `animate-glow` so the config copies were never emitted
  at all. The `.glow-effect` style classes in `globals.css` are the live
  consumers; the keyframes belong beside them.
- **Tailwind's scanner is a regex over file bytes and does not know what a
  comment is.** Naming a palette class inside a code comment puts that class
  back into the shipped stylesheet. The note in `constants.ts` explaining this
  re-emitted the two classes it was describing on its first draft.
- **The i18n guard has two shapes to catch, not one.** `check-i18n` originally
  anchored on `>` immediately before a capital letter, so it only saw text that
  *starts* a JSX node. It was blind to `{count} questions`, where English trails
  an expression, and to a bare `XP` beside a number, which is two characters
  with no lowercase and failed two filters at once. Nineteen strings were hiding
  there. Both shapes are checked now. If you add a third check, **run it against
  a deliberately broken file first and confirm it fails**, then confirm it
  passes once restored; that is how the second one was validated.

## Dead code is the most common bug in this repository

Five separate cases were found in two days, and the pattern is always the same:
something is built, styled, translated and then never wired up, so it looks
finished in the source and does not exist for the player.

| Thing | Fault |
|---|---|
| `StreakCounter` | imported by `home/page.tsx`, never rendered |
| `DailyHadith` | imported by `home/page.tsx`, never rendered |
| `IslamicPattern` | an empty div containing the comment "Placeholder for Islamic pattern", while five files applied the raw class by hand |
| `RARITY_STYLES` | five rarity tiers in `design-tokens.ts`, imported by nothing |
| `CATEGORIES`, `CATEGORY_DETAILS` | imported by nothing, but their classes still shipped in the stylesheet because Tailwind scans `src/lib` |
| `KnowledgeTree`, `RankBadge`, `FriendsList` | defined, never used, still there |

**Before building a screen, grep for whether it already exists and is simply not
rendered.** Three of this session's most visible wins were rendering something
that was already written.

The mirror of this is also true, and cost a wrong claim this session:
`categories` *looked* unrendered on the profile and was in fact feeding two
cards. Typecheck caught the wrong field name before the claim reached a commit.
Check both directions.

## Conventions that are load-bearing

- **SECURITY DEFINER RPCs** need `set search_path = public`, *and* both
  `revoke all ... from public, anon;` and `grant execute ... to authenticated;`
  Migration 0013 is the reference.
- **A multiplier, a price or a reward must never arrive as an argument** from a
  *player*. Migration 0034 exists because `p_double_points` was taken on trust.
  This is why the Stitch profile's artifacts, which grant "+15% XP GAIN", were
  not built: a real version needs a server-side ledger like lifelines got.
- **The audit log cannot be forged.** `admin_audit_log` has RLS on, a read
  policy for admins, and no insert policy at all.
- **Verify migrations in a rolled-back transaction** before believing them,
  negative cases included.
- **Colour goes through a token, never the raw palette.** There are zero raw
  Tailwind palette classes in the shipped stylesheet and it should stay that
  way. The semantic set is `success`, `warning`, `danger`, `info`, `special`,
  and `medal-gold` / `medal-silver` / `medal-bronze`. `success` and `danger` are
  deliberately aliases of colours the palette already had; a second green a few
  degrees from `tertiary` would recreate the problem they closed. **Medals are
  their own axis** because folding gold and bronze into `warning` made first and
  third place identical on a podium, twice, in two different components.
- **i18n has zero drift and two guards.** Add every new string to all six
  locales in the same edit, matching each locale's own vocabulary and diacritics.
  Never leave a word outside `t()` because it trails an interpolation. Admin
  pages are exempt and are English.
- **No dash is used as punctuation in player-facing copy.** Not em, not en, not
  a spaced hyphen, not a double hyphen. Check with a character-aware search for
  **letter-hyphen-letter**, `[a-zA-Z]-[a-zA-Z]`, not just spaced hyphens; expect
  transliterated names (`al-Ghazali`, `an-Naml`) and numeric verse ranges as
  legitimate hits.
- **Motion respects `prefers-reduced-motion`**, and that now includes the
  decorative loops (`pulse-effect`, `float-animation`, `glow-effect`,
  `loading-bar`), which never did until #52. Haptics switch themselves off under
  the same preference.
- **Ornament goes through `<IslamicPattern>`**, not the raw `.mashrabiya-*`
  class. The motif is a khatim, the eight-pointed star, built as the two
  overlapping squares the construction actually is, seamless across tiles. Its
  opacity was chosen by rendering three values over body copy and looking at
  them; do the same before changing it.
- **Never hand-retype SQL.** Read the staged `.sql` file and paste it exactly.

## Known holes, disclosed rather than hidden

Three of four are closed, in migrations 0034 to 0038, each verified in a
rolled-back transaction with the exploit itself as an assertion.

- **Double points is real now.** 0034 adds `lifeline_spends`, written only
  inside `spend_lifeline_rpc` after the charge succeeds; the grader reads and
  *consumes* a row instead of believing an argument. `p_double_points` and the
  long-dead `p_lifeline_used` were removed rather than ignored — a discarded
  parameter reads, to the next person, as a parameter that works.
- **A run's difficulty is server-chosen.** 0035 records on the run the tier band
  it was opened at, derived in the database from the player's own `total_xp`.
- **A player enters a room as themselves.** 0036 and 0037 stamp name and avatar
  from `profiles` by trigger on insert *and* update. 0038 revokes `execute` on
  the two trigger functions.
- **Signup is still open.** Dashboard setting, owner only. Could not be
  re-checked from this session's container (no anon key to hand), so treat the
  last known value as stale and confirm at `/auth/v1/settings` before relying on
  it.

The 0034 deploy-window shim was removed in 0039 and is gone; the note survives
only so nobody hunts for it in a diff.

## Open items

1. **Somebody needs to play the app.** This is the top item and it is not a
   coding task. Zero attempts means no screen built in the last two days has
   ever rendered with real data behind it, the explanations have never been read
   in a running game, and the entire retention surface is untested. It also
   means every "is this feature worth building" question currently has the same
   answer: not until there are players.
2. **Nothing merged in the last two days has been seen rendering.** Both #52 and
   #53 say so in their own merge commits. Everything was verified at the built
   and deployed stylesheet and bundle, which caught real bugs, but a stylesheet
   is not a screen. **Haptics specifically need a physical Android device**:
   iOS Safari does not implement `navigator.vibrate` at all, and no emulator or
   headless browser reproduces a vibration.
3. **Scholar review — still zero of 5,220.** `/admin/questions` filters to
   "Awaiting review" and approves in place without unpublishing. Take one
   category end to end; Contemporary Issues is the riskiest and so the most
   informative.
4. **Offline play — not started.** `public/sw.js` caches nothing on purpose. The
   service worker registers for every player, so there is something for a cache
   to attach to. Do not bolt one on casually.
5. **Streak reminders — dormant.** `vault.secrets` is empty: 0 of 2 secrets set.
   `npm run vapid:keys`; walkthrough in `docs/RUNBOOK.md`.
6. **The daily hadith is not daily.** `DAILY_HADITH` is a single hardcoded
   constant, so the card that now leads the home screen shows the same narration
   every day. Making it genuinely daily needs a set of verified narrations with
   real references. **This is content work for the owner or a scholar, not for a
   session**: no citation, hadith number or verse reference has ever been
   invented in this project, and a wrong one is worse than none.
7. **Timed-out questions in the round review deliberately withhold the answer.**
   The clean route, if the owner wants them shown, is recording a timeout as an
   attempt so the server grades it; that changes accuracy stats, so it is a
   decision, not a fix.
8. Agreed but unbuilt: bulk actions, Excel export, a read-only auditor role.

## Deliberately declined, with reasons

Recorded so a future session does not rediscover these and build them by
accident. None of these is a "todo".

- **A friends and social system.** Two Stitch mockups asked for a friends
  activity feed with reactions, and a seekers list with friend requests,
  online/studying presence, chat and mutual-friend suggestions. None of it
  exists: no feed table, no reactions, no social graph, and `FriendsList` is
  dead code. This is a schema, RLS, presence and moderation product, not a
  screen, on an app with **one account**. Declined twice.
- **The global leaderboard mockup.** Roughly everything in it already exists:
  podium, ranking list, the viewer's own rank card, Barakah naming, timeframe
  toggle. The only new idea is making the self-rank card sticky, which is worth
  about twenty minutes and worth nothing until there are enough players to
  scroll past.
- **Artifacts as an economy.** The mockup's "+15% XP GAIN" is exactly what
  migration 0034 exists to prevent. Buildable, but only server-side with a
  ledger.
- **Secret achievements.** None of the thirteen is secret. Blurred `??? ???`
  entries that can never unlock would be a lie on the screen. Real ones need a
  hidden flag and some content.
- **The knowledge tree's winding path.** The level path already has the
  substance. The remaining idea is a left/right stagger, which needs per-node
  connector geometry to avoid looking broken, and alternating absolute offsets
  are precisely what breaks in Arabic RTL.
- **Barakah as a second currency.** Adopted as the *name* for XP instead. The
  app already has XP and coins, and this repo has a note about a coins counter
  drifting from the real balance; a third currency is more drift, not more game.
  The column stays `total_xp` and only the label moved, in each locale's own
  form: Barakah, Berkah, Albarka, بركة. **If ranking players by "barakah" ever
  sits wrong,** it is one label in six locales and cheap to reverse.

## About the Stitch mockups

Seven were supplied. They are built on an **inverted palette**: `primary` is
emerald `#4edea3` and `tertiary` is gold, which is the exact opposite of this
app. Surfaces match, the two brand roles are swapped. Every `text-primary` in
those files means *green*.

Pasting one in would render it inverted and reintroduce raw palette colours next
to the tokens. Translate them: read each class as a role, not a colour. The
orphan green `#4edea3` found in the old `mashrabiya-overlay` shows an earlier
export had already leaked in once.

They also carry, in every file, things that must not come across: AI-generated
stock photos on `googleusercontent` URLs that will rot, the Material Symbols
icon font beside this app's lucide, hardcoded English, and absolute left/right
positioning that breaks in RTL.

## A content problem, still unfixed

**Sixteen published questions refer to a question the player may never have
seen**, opening with phrases like "Extending that spaceflight derivation".
`buildTierLadder` shuffles the tier bucket, so any of them can be served first
with nothing before it. All sixteen carry a rewritten explanation that mitigates
it as far as an explanation can, but that arrives after the answer.

Three ways out, for whoever decides: rewrite the sixteen to stand alone; accept
it; or give a question an optional prerequisite and order those few
deterministically. Untouched because repairing it means rewriting question text,
and the rule is that a session which finds itself authoring questions stops.

## Things a fresh session gets wrong

- **The bank is done.** If you find yourself authoring questions, stop.
- **The admin console is done and reachable.** Users, questions, economy, audit
  log, moderation, categories, analytics.
- **Chests, the spin wheel, study circles, daily challenges, leagues and the
  streak freeze are all fully wired.** "Finish the reward system" is wasted work.
  Study circles in particular are *ahead* of the Stitch mockup: shared weekly
  goal, streak weeks, a contributions board, join and leave.
- **The combo already escalates and the floating +XP already exists.** Both were
  assumed missing this session and both were already well built.
- **The fonts load correctly.** `next/font` emits the real unhashed family
  names here, so Tailwind's literal `'Inter'` matches. This was investigated,
  the reasoning for a bug was sound, and the conclusion was false.
- **The sound system is finished and thoughtful**, synthesised rather than
  loaded, with a considered position on why no dhikr is used as a routine reward
  cue. Read `src/lib/sound.ts` before touching audio.
- **A level run is the whole tier — 20 questions**, not `HUNT_RULES.runLength`.
- **Achievements are awarded by the database**, in `award_achievements()`.
- **There is one account**, and it has never answered a question.

## Environment traps

- **`npm run build` and `npm run dev` share `.next`.** Stop dev first.
- **Headless Chrome has no outbound network here.** Verify against the Vercel
  preview with `curl` instead, and read the share-token warning above.
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
npm run test:i18n       # 26 checks, including the two hardcoded-English shapes
npm run test:middleware
```

Two build warnings are expected and pre-existing: `@opentelemetry` via genkit,
and `metadataBase` not being set. Neither is a `⨯`.

Then verify against the deployment, with a **fresh** share token and the sanity
guards described above. The build passing is not the same as the app working,
and this codebase has now proven that three times.

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
| #53 | The Stitch screens, translated into the design system |
| #52 | One vocabulary for colour, a game you can feel, and a real khatim |
| #51 | The handoff before this one |
| #50 | Length follows the question |
| #49 | The first explanations, written and staged |
| #48 | The explanations pipeline: staging, review, progress |
| #46 | The admin pages became editable |
| #43 | The "Next level" CTA, and three security holes |
| #38 | Inlined the middleware matcher — the import had broken every static asset |
| #36 | The admin console: a door, a register, an audit trail, true numbers |
