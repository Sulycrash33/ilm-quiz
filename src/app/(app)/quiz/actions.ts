'use server';

import { createClient } from '@/lib/supabase/server';
import type { GradeResult } from '@/lib/types';

interface SubmitOptions { usedHint?: boolean; responseTimeMs?: number; doublePoints?: boolean; lifelineUsed?: string; }

/** Server-authoritative grading and reward calculation - delegated to a
 * SECURITY DEFINER Postgres function (submit_quiz_answer) so the actual
 * coin/XP mutation can't be replayed or forged by a direct client call;
 * see supabase/migrations for details. */
export async function submitAnswer(
  questionId: string,
  choiceIndex: number,
  opts: SubmitOptions = {},
): Promise<GradeResult & { streakMultiplier: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to answer.');
  if (!Number.isInteger(choiceIndex) || choiceIndex < 0) throw new Error('Invalid answer.');

  const { data, error } = await supabase.rpc('submit_quiz_answer', {
    p_question_id: questionId,
    p_choice_index: choiceIndex,
    p_used_hint: opts.usedHint ?? false,
    p_response_time_ms: opts.responseTimeMs ?? null,
    p_double_points: opts.doublePoints ?? false,
    p_lifeline_used: opts.lifelineUsed ?? null,
  });

  if (error) throw new Error(error.message || 'Could not submit your answer.');
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Could not submit your answer.');

  return {
    correct: row.correct,
    correctIndex: row.correct_index,
    explanation: row.explanation ?? '',
    citation: row.citation ?? '',
    xpEarned: row.xp_earned,
    streakMultiplier: row.streak_multiplier,
  };
}

export async function fiftyFifty(questionId: string): Promise<number[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in.');
  const { data: q, error } = await supabase
    .from('questions')
    .select('correct_choice_index, choices, review_status')
    .eq('id', questionId)
    .single();
  if (error || !q || q.review_status !== 'published') throw new Error('Question not found.');
  const total = ((q.choices ?? []) as string[]).length;
  const wrong: number[] = [];
  for (let i = 0; i < total; i += 1) if (i !== q.correct_choice_index) wrong.push(i);
  for (let i = wrong.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [wrong[i], wrong[j]] = [wrong[j], wrong[i]];
  }
  return wrong.slice(0, 2);
}
