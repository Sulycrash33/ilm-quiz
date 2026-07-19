import { createClient } from '@/lib/supabase/server';
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
    .select('id, question_text, choices, difficulty')
    .eq('category_id', category.id)
    .eq('review_status', 'published')
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id as string,
    text: row.question_text as string,
    options: (row.choices ?? []) as string[],
    difficulty: labelDifficulty(row.difficulty),
    points: POINTS_BY_DIFFICULTY[row.difficulty as DbDifficulty] ?? 10,
    timeLimit: 30,
  }));
}

export async function getCategoriesWithProgress(): Promise<QuizCategory[]> {
  const supabase = await createClient();

  const { data: cats } = await supabase
    .from('categories')
    .select('id, slug, name, description, icon')
    .order('name');
  if (!cats) return [];

  const { data: published } = await supabase
    .from('questions')
    .select('category_id')
    .eq('review_status', 'published');

  const publishedByCat = new Map<string, number>();
  (published ?? []).forEach((q: any) => {
    publishedByCat.set(q.category_id, (publishedByCat.get(q.category_id) ?? 0) + 1);
  });

  const answeredByCat = new Map<string, Set<string>>();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: attempts } = await supabase
      .from('attempts')
      .select('question_id, questions(category_id)')
      .eq('user_id', user.id);
    (attempts ?? []).forEach((a: any) => {
      const catId = a.questions?.category_id;
      if (!catId) return;
      if (!answeredByCat.has(catId)) answeredByCat.set(catId, new Set());
      answeredByCat.get(catId)!.add(a.question_id);
    });
  }

  return cats.map((c: any) => ({
    id: c.id as string,
    slug: c.slug as string,
    name: c.name as string,
    description: c.description as string | null,
    icon: c.icon as string | null,
    publishedCount: publishedByCat.get(c.id) ?? 0,
    answeredCount: answeredByCat.get(c.id)?.size ?? 0,
  }));
}
