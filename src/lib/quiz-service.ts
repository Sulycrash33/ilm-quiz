import { createClient } from '@/lib/supabase/server';
import { timeLimitForTier, clampTier, TIER_MIN, TIER_MAX } from '@/lib/hunt-engine';
import type { QuizQuestion } from '@/lib/types';

/**
 * Server-only data access for the quiz. These functions replace the hardcoded
 * QUESTIONS / CATEGORY_DETAILS maps that used to live in `constants.ts`.
 * They only ever return PUBLISHED content, and question fetches never include
 * the correct answer (see `QuizQuestion`). Import only from Server Components
 * or Server Actions.
 */

type DbDifficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_LABEL: Record<DbDifficulty, 'Beginner' | 'Intermediate' | 'Advanced'> = {
  easy: 'Beginner',
  medium: 'Intermediate',
  hard: 'Advanced',
};

export const POINTS_BY_DIFFICULTY: Record<DbDifficulty, number> = {
  easy: 10,
  medium: 15,
  hard: 20,
};

export function labelDifficulty(d: string): 'Beginner' | 'Intermediate' | 'Advanced' {
  return DIFFICULTY_LABEL[d as DbDifficulty] ?? 'Intermediate';
}

export interface QuizCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  publishedCount: number;
  answeredCount: number;
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('id, slug, name, description, icon')
    .eq('slug', slug)
    .single();
  return data;
}

export async function getPublishedQuizQuestions(slug: string): Promise<QuizQuestion[]> {
  const supabase = await createClient();
  const category = await getCategoryBySlug(slug);
  if (!category) return [];

  const { data, error } = await supabase
    .from('questions')
    // NOTE: correct_choice_index / explanation / citation are intentionally NOT
    // selected here — they must never reach the browser before an answer is
    // submitted. Grading happens server-side in submitAnswer().
    .select('id, question_text, choices, difficulty, tier')
    .eq('category_id', category.id)
    .eq('review_status', 'published')
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data.map((row: any) => {
    const tier = clampTier(row.tier ?? 1);
    return {
      id: row.id as string,
      text: row.question_text as string,
      options: (row.choices ?? []) as string[],
      difficulty: labelDifficulty(row.difficulty),
      tier,
      points: POINTS_BY_DIFFICULTY[row.difficulty as DbDifficulty] ?? 10,
      // The clock follows the tier, not the old three-way band: 25s at
      // Mubtadi rising to 45s at Mujaddid. It used to be a flat 30 for every
      // question regardless of difficulty.
      timeLimit: timeLimitForTier(tier),
    };
  });
}

export async function getCategoriesWithProgress(): Promise<QuizCategory[]> {
  const supabase = await createClient();

  const { data: cats } = await supabase
    .from('categories')
    .select('id, slug, name, description, icon')
    // The curriculum order, not the alphabet. `sort_order` has always held a
    // deliberate sequence — creed, then the names of Allah, then the pillars,
    // then the Qur'an and the seerah, out through law and character to the
    // contemporary questions last — and this grid ignored it, so a seeker met
    // twenty-nine categories in an order that told them nothing about where to
    // begin. It is NOT NULL, so every category has a place in it.
    .order('sort_order');
  if (!cats) return [];

  // Both tallies are counted in the database — see migration 0029. Counting
  // them here instead meant fetching one row per published question, and
  // PostgREST stops at 1,000 of them: with 5,220 questions, twenty-three of
  // the twenty-nine categories came back as zero and rendered "Coming soon"
  // over a bank that was complete. The answered tally had the same ceiling
  // waiting for the first player to pass a thousand answers.
  const { data: progress } = await supabase.rpc('category_progress');

  const progressByCat = new Map<string, { published: number; answered: number }>();
  (progress ?? []).forEach((p: any) => {
    progressByCat.set(p.category_id, {
      published: p.published_count ?? 0,
      answered: p.answered_count ?? 0,
    });
  });

  return cats.map((c: any) => ({
    id: c.id as string,
    slug: c.slug as string,
    name: c.name as string,
    description: c.description as string | null,
    icon: c.icon as string | null,
    publishedCount: progressByCat.get(c.id)?.published ?? 0,
    answeredCount: progressByCat.get(c.id)?.answered ?? 0,
  }));
}

/** Published questions from exactly one tier of a category — the level-run's
 * question pool, as opposed to `getPublishedQuizQuestions`'s whole-category,
 * every-tier pool used by the adaptive Hunt. */
export async function getPublishedQuizQuestionsForTier(slug: string, tier: number): Promise<QuizQuestion[]> {
  const supabase = await createClient();
  const category = await getCategoryBySlug(slug);
  if (!category) return [];
  const wantedTier = clampTier(tier);

  const { data, error } = await supabase
    .from('questions')
    .select('id, question_text, choices, difficulty, tier')
    .eq('category_id', category.id)
    .eq('tier', wantedTier)
    .eq('review_status', 'published')
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data.map((row: any) => {
    const t = clampTier(row.tier ?? wantedTier);
    return {
      id: row.id as string,
      text: row.question_text as string,
      options: (row.choices ?? []) as string[],
      difficulty: labelDifficulty(row.difficulty),
      tier: t,
      points: POINTS_BY_DIFFICULTY[row.difficulty as DbDifficulty] ?? 10,
      timeLimit: timeLimitForTier(t),
    };
  });
}

/**
 * A pool for the mode runs, drawn from every category rather than one.
 *
 * Speed Round, Survival and Practice are not about a subject — they are about
 * how you play — so confining them to a category would make them a slower way
 * of doing what the level path already does. The pool is centred on the
 * player's own tier band so a Mubtadi is not handed Mujaddid questions in
 * Survival, where a wrong answer is expensive.
 *
 * Capped well under PostgREST's 1,000-row ceiling on purpose: the category
 * grid spent a release counting to 1,000 and reporting it as the whole bank,
 * and an unbounded select here would be the same mistake in a new place. A
 * cap of 300 is far more than the longest realistic run.
 */
export async function getModeQuestionPool(centreTier: number, limit = 300): Promise<QuizQuestion[]> {
  const supabase = await createClient();
  const tier = clampTier(centreTier);
  const low = clampTier(tier - 1);
  const high = clampTier(tier + 1);

  const { data, error } = await supabase
    .from('questions')
    .select('id, question_text, choices, difficulty, tier')
    .eq('review_status', 'published')
    .gte('tier', low)
    .lte('tier', high)
    .limit(limit);

  if (error || !data) return [];

  return data.map((row: any) => {
    const t = clampTier(row.tier ?? tier);
    return {
      id: row.id as string,
      text: row.question_text as string,
      options: (row.choices ?? []) as string[],
      difficulty: labelDifficulty(row.difficulty),
      tier: t,
      points: POINTS_BY_DIFFICULTY[row.difficulty as DbDifficulty] ?? 10,
      timeLimit: timeLimitForTier(t),
    };
  });
}

export interface CategoryLevel {
  tier: number;
  publishedCount: number;
  /** Distinct published questions in this tier the player has ever answered
   * correctly — the level is "complete" once this reaches publishedCount. */
  correctCount: number;
  completed: boolean;
  /** Whether the player may play this level yet. Tier 1 always is; tier N+1
   * requires tier N complete. */
  unlocked: boolean;
}

/**
 * The nine-level adventure path for one category.
 *
 * A level is "complete" once every published question in that tier has been
 * answered correctly at least once (checked against `attempts`, the
 * server-graded record — never against anything the client self-reports).
 * The next level is unlocked only once the one before it is complete.
 *
 * A tier with zero published questions can't be completed, but it also must
 * not permanently wall off every level after it while content is still being
 * reviewed — so an empty tier counts as "satisfied" for unlock purposes
 * (nothing to finish) while still showing honestly as not completed.
 */
export async function getCategoryLevels(slug: string): Promise<CategoryLevel[]> {
  const supabase = await createClient();
  const category = await getCategoryBySlug(slug);
  if (!category) return [];

  const { data: qs } = await supabase
    .from('questions')
    .select('id, tier')
    .eq('category_id', category.id)
    .eq('review_status', 'published');

  const idsByTier = new Map<number, string[]>();
  for (let t = TIER_MIN; t <= TIER_MAX; t += 1) idsByTier.set(t, []);
  (qs ?? []).forEach((q: any) => {
    idsByTier.get(clampTier(q.tier ?? TIER_MIN))!.push(q.id as string);
  });

  const correctIds = new Set<string>();
  const allIds = (qs ?? []).map((q: any) => q.id as string);
  if (allIds.length > 0) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: attempts } = await supabase
        .from('attempts')
        .select('question_id')
        .eq('user_id', user.id)
        .eq('is_correct', true)
        .in('question_id', allIds);
      (attempts ?? []).forEach((a: any) => correctIds.add(a.question_id as string));
    }
  }

  const levels: CategoryLevel[] = [];
  let previousSatisfied = true; // level 1 is always open
  for (let t = TIER_MIN; t <= TIER_MAX; t += 1) {
    const ids = idsByTier.get(t)!;
    const publishedCount = ids.length;
    const correctCount = ids.filter((id) => correctIds.has(id)).length;
    const completed = publishedCount > 0 && correctCount >= publishedCount;

    levels.push({ tier: t, publishedCount, correctCount, completed, unlocked: previousSatisfied });
    previousSatisfied = completed || publishedCount === 0;
  }
  return levels;
}
