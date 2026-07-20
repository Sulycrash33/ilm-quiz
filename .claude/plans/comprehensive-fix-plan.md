# ILM Hunt — Comprehensive Fix Plan

## Issue Inventory (12 confirmed issues)

| # | Issue | Severity | Files | Est. Effort |
|---|-------|----------|-------|-------------|
| 1 | 2× Points Lifeline XP mismatch | High | `src/app/(app)/quiz/actions.ts`, `src/components/game/QuizView.tsx` | S |
| 2 | Multiplayer migration not applied | High | `supabase/migrations/0003_multiplayer_quiz.sql` | S |
| 3 | quiz/page.tsx server import in client component | High | `src/app/(app)/quiz/page.tsx`, `src/lib/quiz-service.ts` | S |
| 4 | Category taxonomy split (hardcoded vs DB) | Medium | `src/lib/constants.ts`, `src/components/game/KnowledgeCategories.tsx`, `src/lib/quiz-service.ts` | M |
| 5 | Design token split (legacy vs premium) | Medium | `src/lib/design-tokens.ts`, 12+ component files, `tailwind.config.ts` | L |
| 6 | i18n: 3 untranslated languages | Low | `src/lib/i18n.ts` | L |
| 7 | Content bottleneck: 0 published questions | Medium | DB / content pipeline | M |
| 8 | Admin dashboard: hardcoded stats | Medium | `src/app/(app)/admin/page.tsx` | M |
| 9 | Admin questions: hardcoded data | Medium | `src/app/(app)/admin/questions/page.tsx` | M |
| 10 | Admin users: hardcoded data | Medium | `src/app/(app)/admin/users/page.tsx` | M |
| 11 | Admin categories: hardcoded data | Medium | `src/app/(app)/admin/categories/page.tsx` | M |
| 12 | Admin analytics: hardcoded data | Medium | `src/app/(app)/admin/analytics/page.tsx` | M |

---

## Phase 1 — Critical Bug Fixes (Issues 1–3)

Dependencies: None. All three are independent. Can be done in parallel.

### 1A. Fix 2× Points Lifeline XP Mismatch

**Problem**: Client doubles XP locally at `QuizView.tsx:86` but never tells the server. Server calculates XP without the multiplier. User pays 100 coins for the lifeline but only gets 1x XP credited server-side.

**Fix**:
1. `src/app/(app)/quiz/actions.ts` line 7 — Add `doublePoints?: boolean` to `SubmitOptions`:
   ```ts
   interface SubmitOptions { usedHint?: boolean; responseTimeMs?: number; doublePoints?: boolean; }
   ```
2. `src/app/(app)/quiz/actions.ts` line 44 — Apply multiplier after streak:
   ```ts
   const xpEarned = baseXp * multiplier * (opts.doublePoints ? 2 : 1);
   ```
3. `src/components/game/QuizView.tsx` line 84 — Pass `doublePoints` to server:
   ```ts
   const result = await submitAnswer(currentQuestion.id, answerIndex, { usedHint, responseTimeMs: Date.now() - questionStartedAt.current, doublePoints });
   ```
4. `src/components/game/QuizView.tsx` line 86 — Remove client-side doubling:
   ```ts
   const pointsEarned = result.correct ? result.xpEarned : 0;
   ```
   (Server now returns the correct doubled value.)

**Files touched**: `src/app/(app)/quiz/actions.ts`, `src/components/game/QuizView.tsx`

### 1B. Apply Multiplayer Migration

**Problem**: `0003_multiplayer_quiz.sql` exists but was never applied to the live DB. Tables `quiz_rooms`, `quiz_room_players`, `quiz_room_questions`, `quiz_room_answers` don't exist.

**Fix**: Run `supabase db push` or execute the migration SQL via Supabase SQL Editor.

**Files touched**: Database (no code changes)

### 1C. Fix Server-Only Import in Client Component

**Problem**: `src/app/(app)/quiz/page.tsx` is `"use client"` but imports `getCategoriesWithProgress` from `@/lib/quiz-service`, which imports `createClient` from `@/lib/supabase/server`. This breaks at runtime.

**Fix**:
1. Convert `src/app/(app)/quiz/page.tsx` to a **Server Component** (remove `"use client"`)
2. Replace the `useEffect`/`useState` pattern with direct async data fetching:
   ```tsx
   import { getCategoriesWithProgress } from "@/lib/quiz-service";
   
   export default async function KnowledgeCategoriesPage() {
     const categories = await getCategoriesWithProgress();
     // render directly
   }
   ```
3. Since framer-motion needs client components, extract the animated parts into a separate `"use client"` wrapper component.

**Files touched**: `src/app/(app)/quiz/page.tsx`, new `src/components/game/KnowledgeCategoriesGrid.tsx` (client wrapper for animations)

---

## Phase 2 — Design System Unification (Issues 4–5)

Dependencies: None. Independent of Phase 1. Can run in parallel with Phase 1.

### 2A. Unify Category Taxonomy

**Problem**: Home screen uses hardcoded `CATEGORIES` from `constants.ts` (10 categories with lucide icons + Tailwind classes). Quiz browser uses DB categories via `quiz-service.ts`. Users see different category lists.

**Design Decision**: Unify to **DB as single source of truth**. The DB `categories` table is the canonical list because:
- The review pipeline creates categories in the DB
- Categories need to be manageable by admins
- The `categories` table is already wired to the quiz browser

**Fix**:
1. Create a new server action `getHomeCategories` that fetches DB categories and maps them to include display metadata (icon emoji, color classes)
2. Update `src/components/game/KnowledgeCategories.tsx` to use DB categories instead of hardcoded `CATEGORIES`
3. Add a category metadata config (emoji + color) that supplements DB data. Options:
   - **Option A**: Add `color` and `icon_emoji` columns to the `categories` table via migration
   - **Option B**: Keep a small client-side metadata map keyed by category slug, used only for display styling
   - **Recommended: Option B** — avoids schema change, keeps display logic in code, DB stays authoritative for names/descriptions
4. Remove `CATEGORIES` array from `constants.ts` (the `QUESTIONS` map is already dead code since quiz loading uses DB)
5. Remove `CATEGORY_DETAILS` data from `constants.ts` (also dead code)

**Category display metadata map** (new file or inline in KnowledgeCategories):
```ts
const CATEGORY_STYLES: Record<string, { emoji: string; colorClass: string }> = {
  'holy-quran': { emoji: '📖', colorClass: 'bg-green-100 text-green-800' },
  'hadith-sciences': { emoji: '📜', colorClass: 'bg-blue-100 text-blue-800' },
  // ... etc for each known slug
  'default': { emoji: '📚', colorClass: 'bg-gray-100 text-gray-800' },
};
```

**Files touched**: `src/lib/constants.ts`, `src/components/game/KnowledgeCategories.tsx`, `src/app/(app)/quiz/page.tsx` (or its client wrapper)

### 2B. Unify Design Tokens (Legacy → Premium)

**Problem**: 12+ components reference `jade`, `lapis`, `amethyst`, `henna` color classes from `design-tokens.ts`, but these colors are NOT defined in `tailwind.config.ts`. The classes silently fail to render correct colors.

**Mapping** (from `design-tokens.ts` semantics to Premium system):

| Legacy Token | Semantic Role | Premium Replacement |
|-------------|--------------|-------------------|
| `jade` / `jade-soft` | Success / positive / easy difficulty | `primary` (green #4edea3) or explicit `green-400` |
| `lapis` / `lapis-soft` | Info / blue / rare rarity | `secondary` (blue #b4c5ff) |
| `amethyst` / `amethyst-soft` | Premium / purple / epic rarity | `tertiary` (gold #e9c349) or `purple-400` |
| `henna` / `henna-soft` | Danger / hard difficulty / legendary | `error` (#ffb4ab) or `tertiary` |
| `primary` / `primary/10` | Already Premium | Keep as-is |

**Approach**: Incremental migration, component by component. This is safer than big-bang.

**Order** (most visible → least visible):
1. `QuizView.tsx` — DIFFICULTY_STYLES (replace `text-jade` → `text-green-400`, `border-jade/30` → `border-green-400/30`, `text-henna` → `text-red-400`, `bg-jade-soft` → `bg-green-400/10`)
2. `StreakCounter.tsx` — `getStreakStyle` (replace jade → green, henna → red)
3. `DailyHadith.tsx` — jade card
4. `DailyProgressCard.tsx` — jade accuracy
5. `ChallengeCard.tsx` — lapis/amethyst
6. `RewardCenter.tsx` — amethyst/jade
7. `StoreItemCard.tsx` — lapis/amethyst/jade
8. `SpinWheel.tsx` — jade
9. `DailyLoginRewards.tsx` — jade
10. `LeaderboardItem.tsx` — henna
11. `CategoryDetailClient.tsx` — jade/lapis/amethyst
12. `BundleCard.tsx` — jade
13. `GameModes.tsx` — lapis
14. `QuestionReviewCard.tsx` — jade
15. `GenerateForm.tsx` — jade

**Specific replacements in each component**: Replace all `text-jade` → `text-green-400`, `bg-jade-soft` → `bg-green-400/10`, `border-jade/30` → `border-green-400/30`, `text-lapis` → `text-blue-400`, `bg-lapis-soft` → `bg-blue-400/10`, `border-lapis/30` → `border-blue-400/30`, `text-amethyst` → `text-purple-400`, `bg-amethyst-soft` → `bg-purple-400/10`, `border-amethyst/30` → `border-purple-400/30`, `text-henna` → `text-amber-500`, `bg-henna-soft` → `bg-amber-500/10`, `border-henna/30` → `border-amber-500/30`.

**After all components migrated**:
1. Delete `src/lib/design-tokens.ts`
2. Update `DIFFICULTY_STYLES` and `getStreakStyle` — move inline or create Premium-native equivalents
3. Remove `DIFFICULTY_STYLES` import from `QuizView.tsx` (replace with inline Tailwind classes or a simple utility)

**Files touched**: `src/lib/design-tokens.ts`, 15 component files (listed above)

---

## Phase 3 — Admin Panel Audit & Fix (Issues 8–12)

Dependencies: Phase 2A should be done first (category unification affects admin categories page). Otherwise independent.

### 3A. Admin Dashboard — Wire to Real Data

**Current**: All stats (12,847 users, 2,341 active, etc.) are hardcoded arrays.

**Fix**:
1. Convert `src/app/(app)/admin/page.tsx` from client to server component (or create server action)
2. Add server-side queries:
   - `profiles` table: count total users, count users active today (where `last_active` > today)
   - `questions` table: count total, count published
   - `attempts` table: count quizzes taken today
3. Query `categories` table for top categories with published count
4. Replace hardcoded `recentActivity` with query to `attempts` join `profiles` join `questions`, ordered by `created_at` desc, limit 5
5. System status: add a simple DB ping function, call Supabase health endpoint

**Files touched**: `src/app/(app)/admin/page.tsx`, new `src/app/(app)/admin/actions.ts` (server actions for admin queries)

### 3B. Admin Questions — Wire to Real Data

**Current**: 8 hardcoded questions in `initialQuestions` array.

**Fix**:
1. Create a server action `getAdminQuestions()` that queries `questions` table with category join
2. Convert page to server component or use server action in useEffect
3. Wire publish/reject/delete to actual DB operations (reuse `approveQuestion`/`rejectQuestion` from `review/actions.ts`)
4. Add pagination (Supabase offset/limit)

**Files touched**: `src/app/(app)/admin/questions/page.tsx`

### 3C. Admin Users — Wire to Real Data

**Current**: 8 hardcoded users in `initialUsers` array.

**Fix**:
1. Create a server action `getAdminUsers()` that queries `profiles` table
2. Wire role change to `profiles.update()` 
3. Wire suspend/activate to a `status` field on profiles (add column if needed, or use `is_suspended` boolean)
4. Add pagination

**Files touched**: `src/app/(app)/admin/users/page.tsx`, possibly `supabase/migrations/0004_admin_user_status.sql`

### 3D. Admin Categories — Wire to Real Data

**Current**: 8 hardcoded categories in `initialCategories` array.

**Fix**:
1. Create a server action `getAdminCategories()` that queries `categories` table + published question count
2. Wire create/edit/delete to actual DB operations
3. Status management (active/draft/archived) — add `status` column to categories if not present

**Files touched**: `src/app/(app)/admin/categories/page.tsx`

### 3E. Admin Analytics — Wire to Real Data

**Current**: All charts (user growth, quiz performance, retention, geographic) are hardcoded.

**Fix**:
1. Create server actions for analytics:
   - `getUserGrowthData()`: group profiles by `created_at` month
   - `getQuizPerformanceData()`: group attempts by category, compute accuracy
   - `getRetentionData()`: cohort analysis (users active N days after signup)
   - `getGeographicData()`: group profiles by region/country (if field exists)
   - `getTopUsers()`: order profiles by `total_xp` desc, limit 10
2. Replace hardcoded arrays with real queries
3. Add date range filtering (7d / 30d / all time)

**Files touched**: `src/app/(app)/admin/analytics/page.tsx`

---

## Phase 4 — Content & i18n (Issues 6–7)

Dependencies: Phase 2A (category unification) should be done first.

### 4A. Seed Initial Questions

**Problem**: 0 published questions in DB. App shows "Coming Soon" for every category.

**Approach**: Use the existing AI pipeline to generate initial content.

**Fix**:
1. Ensure the `categories` table has rows matching the known category slugs
2. Use the admin review page (or a script) to call `generateDraftQuestions` for each category with `autoPublish: true`
3. Alternatively, create a seed script `supabase/seed.sql` that inserts 5-10 published questions per category
4. Document the content creation workflow in a `CONTENT.md` file

**Recommended**: Create a proper seed script with 50-100 questions across categories so the app is usable immediately, then use the AI pipeline for ongoing content expansion.

**Files touched**: `supabase/seed.sql` (new), documentation

### 4B. i18n: Complete Missing Translations

**Problem**: Hausa (ha), French (fr), Arabic (ar) all fall back to English.

**Approach**: Provide actual translations for all 3 languages.

**Fix**:
1. Create `haTranslations`, `frTranslations`, `arTranslations` objects in `src/lib/i18n.ts`
2. Each must implement the full `Translations` interface (201 keys)
3. Update the `translations` export:
   ```ts
   ha: haTranslations,
   fr: frTranslations,
   ar: arTranslations,
   ```
4. For Arabic, consider RTL layout implications (add `dir="rtl"` to `<html>` when locale is `ar`)
5. Add a `dir` utility: `export function getDirection(locale: Locale): 'ltr' | 'rtl' { return locale === 'ar' ? 'rtl' : 'ltr'; }`

**Files touched**: `src/lib/i18n.ts`, `src/contexts/LanguageContext.tsx` (RTL support)

---

## Execution Order & Parallelism

```
Phase 1 (Critical Bugs)          Phase 2 (Design System)          Phase 3 (Admin)           Phase 4 (Content/i18n)
├─ 1A: XP Lifeline Fix           ├─ 2A: Category Unification      ├─ 3A: Dashboard          ├─ 4A: Seed Questions
├─ 1B: Multiplayer Migration     └─ 2B: Token Migration           ├─ 3B: Questions          └─ 4B: i18n Translations
└─ 1C: Server Import Fix                     │                      ├─ 3C: Users
     │                                       │                      ├─ 3D: Categories
     │                    ┌──────────────────┘                      └─ 3E: Analytics
     │                    │                                         │
     └────────────────────┼─────────────────────────────────────────┘
                          │
              Phase 2A must complete before Phase 3D
              Phase 2A must complete before Phase 4A
```

**Parallelizable groups**:
- Phase 1A, 1B, 1C can all run simultaneously
- Phase 2A, 2B can run simultaneously (independent)
- Phase 3A-3E can all run simultaneously
- Phase 4A, 4B can run simultaneously

---

## Verification Checklist

### Phase 1
- [ ] 1A: Use 2× Points lifeline, confirm server returns doubled XP, confirm coins deducted match
- [ ] 1A: Verify normal (non-2x) answers still work correctly
- [ ] 1B: Run `supabase db push`, confirm `quiz_rooms` table exists
- [ ] 1B: Navigate to multiplayer, create a room — verify no "relation does not exist" error
- [ ] 1C: Navigate to `/quiz`, confirm categories load (not crash)
- [ ] 1C: Verify all category cards render with correct names and icons

### Phase 2
- [ ] 2A: Home screen and `/quiz` page show identical category lists
- [ ] 2A: Categories without DB entries show "Coming Soon" correctly
- [ ] 2B: Quiz difficulty badges render with visible colors (not invisible)
- [ ] 2B: Daily Hadith card shows green border/background
- [ ] 2B: Streak counter flame changes color with streak level
- [ ] 2B: Challenge cards show correct lapis/amethyst colors
- [ ] 2B: No `text-jade`, `text-lapis`, `text-amethyst`, `text-henna` remain in any `.tsx` file

### Phase 3
- [ ] 3A: Dashboard shows real user count, not "12,847"
- [ ] 3A: Recent activity shows real attempts, not hardcoded "Ahmed completed..."
- [ ] 3B: Question bank shows real questions from DB (initially empty until 4A)
- [ ] 3B: Publish/Reject buttons update DB and re-fetch
- [ ] 3C: User list shows real profiles
- [ ] 3D: Category list shows DB categories
- [ ] 3E: Analytics charts show real data (or "No data yet" when empty)

### Phase 4
- [ ] 4A: At least one category shows questions when starting a quiz
- [ ] 4A: Quiz flow works end-to-end: select category → answer questions → see results
- [ ] 4B: Switch language to Hausa, verify translated UI strings
- [ ] 4B: Switch language to French, verify translated UI strings
- [ ] 4B: Switch language to Arabic, verify RTL layout works

---

## Design Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Category unification | DB as single source | DB is already wired to quiz flow; hardcoded data is stale |
| Category display metadata | Client-side map (Option B) | Avoids schema migration; display-only data belongs in code |
| Token migration | Incremental, component-by-component | Reduces risk; each component can be verified individually |
| Admin panel | Server components + server actions | Follows Next.js patterns; eliminates hardcoded mock data |
| Content seeding | Seed script + AI pipeline | Immediate usability via seed; long-term via AI pipeline |
| i18n completeness | Provide full translations | Partial translations create worse UX than no translation |
