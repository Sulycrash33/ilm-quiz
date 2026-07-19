'use server';

import { createClient } from '@/lib/supabase/server';
import type { GradeResult } from '@/lib/types';

const POINTS: Record<string, number> = { easy: 10, medium: 15, hard: 20 };

interface SubmitOptions {
  usedHint?: boolean;
  responseTimeMs?: number;
}

/**
 * Grades a single answer on the server. The correct index lives only in the
 * database and is compared here — it is never sent to the browser beforehand,
 * so a player cannot read the answer key from devtools. Also records the
 * attempt (used for progress + leaderboards).
 */
export async function submitAnswer(
  questionId: string,
  choiceIndex: number,
  opts: SubmitOptions = {}
): Promise<GradeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to answer.');

  const { data: q, error } = await supabase
    .from('questions')
    .select('id, correct_choice_index, explanation, citation_reference, difficulty, review_status')
    .eq('id', questionId)
    .single();

  if (error || !q) throw new Error('Question not found.');
  if (q.review_status !== 'published') throw new Error('This question is not available.');

  const correct = choiceIndex === q.correct_choice_index;
  const xpEarned = correct ? POINTS[q.difficulty as string] ?? 10 : 0;

  await supabase.from('attempts').insert({
    user_id: user.id,
    question_id: q.id,
    is_correct: correct,
    xp_earned: xpEarned,
    response_time_ms: opts.responseTimeMs ?? null,
    used_ask_the_imam_hint: opts.usedHint ?? false,
  });

  return {
    correct,
    correctIndex: q.correct_choice_index as number,
    explanation: (q.explanation as string) ?? '',
    citation: (q.citation_reference as string) ?? '',
    xpEarned,
  };
}

/**
 * 50/50 lifeline. Returns the indices of two WRONG options to remove. Computed
 * on the server so the correct answer is never inferable from what's returned
 * (the client only learns "these two are wrong", not which of the rest is right).
 */
export async function fiftyFifty(questionId: string): Promise<number[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in.');

  const { data: q, error } = await supabase
    .from('questions')
    .select('correct_choice_index, choices')
    .eq('id', questionId)
    .single();
  if (error || !q) throw new Error('Question not found.');

  const total = ((q.choices ?? []) as string[]).length;
  const wrong: number[] = [];
  for (let i = 0; i < total; i++) if (i !== q.correct_choice_index) wrong.push(i);

  for (let i = wrong.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wrong[i], wrong[j]] = [wrong[j], wrong[i]];
  }
  return wrong.slice(0, 2);
}
