'use server';

import { createClient } from '@/lib/supabase/server';
import type { GradeResult } from '@/lib/types';
import { pointsForDifficulty, streakMultiplier } from '@/lib/gamification';

interface SubmitOptions {
  usedHint?: boolean;
  responseTimeMs?: number;
}

/**
 * The only place where quiz rewards are decided. The browser submits a choice,
 * but never decides XP, coins, streak multipliers, or the answer key.
 */
export async function submitAnswer(
  questionId: string,
  choiceIndex: number,
  opts: SubmitOptions = {},
): Promise<GradeResult & { streakMultiplier: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to answer.');
  if (!Number.isInteger(choiceIndex) || choiceIndex < 0) throw new Error('Invalid answer.');

  const { data: q, error } = await supabase
    .from('questions')
    .select('id, choices, correct_choice_index, explanation, citation_reference, difficulty, review_status')
    .eq('id', questionId)
    .single();

  if (error || !q) throw new Error('Question not found.');
  if (q.review_status !== 'published') throw new Error('This question is not available.');
  if (choiceIndex >= ((q.choices ?? []) as unknown[]).length) throw new Error('Invalid answer.');

  const correct = choiceIndex === q.correct_choice_index;
  const { data: profile } = await supabase
    .from('profiles')
    .select('coins, total_xp, high_score')
    .eq('id', user.id)
    .single();

  const currentStreak = 0;
  const multiplier = correct ? streakMultiplier(currentStreak) : 1;
  const baseXp = correct ? pointsForDifficulty(q.difficulty as string) : 0;
  const xpEarned = baseXp * multiplier;

  const { error: attemptError } = await supabase.from('attempts').insert({
    user_id: user.id,
    question_id: q.id,
    is_correct: correct,
    xp_earned: xpEarned,
    response_time_ms: opts.responseTimeMs ?? null,
    used_ask_the_imam_hint: opts.usedHint ?? false,
  });
  if (attemptError) throw new Error('Could not save your attempt. Please try again.');

  if (profile) {
    const nextCoins = Number(profile.coins ?? 0) + xpEarned;
    const nextXp = Number(profile.total_xp ?? 0) + xpEarned;
    const nextHighScore = Math.max(Number(profile.high_score ?? 0), nextXp);
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ coins: nextCoins, total_xp: nextXp, high_score: nextHighScore })
      .eq('id', user.id);
    if (profileError) throw new Error('Answer saved, but reward sync failed. Refresh before playing again.');
  }

  return {
    correct,
    correctIndex: q.correct_choice_index as number,
    explanation: (q.explanation as string) ?? '',
    citation: (q.citation_reference as string) ?? '',
    xpEarned,
    streakMultiplier: multiplier,
  };
}

export async function fiftyFifty(questionId: string): Promise<number[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
