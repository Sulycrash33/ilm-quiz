'use server';

import { createClient } from '@/lib/supabase/server';

interface SubmitAnswerInput {
  roomId: string;
  questionId: string;
  selectedIndex: number;
  timeTaken: number;
}

export async function submitMultiplayerAnswer(
  input: SubmitAnswerInput,
): Promise<{ isCorrect: boolean; pointsEarned: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in.');

  // Get the question (server-side only, correct_index never leaves server)
  const { data: question, error: qError } = await supabase
    .from('quiz_room_questions')
    .select('id, correct_index')
    .eq('id', input.questionId)
    .single();

  if (qError || !question) throw new Error('Question not found');

  const isCorrect = input.selectedIndex === question.correct_index;

  // Check if already answered
  const { data: existing } = await supabase
    .from('quiz_room_answers')
    .select('id')
    .eq('room_id', input.roomId)
    .eq('question_id', input.questionId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    throw new Error('Already answered this question');
  }

  // Insert answer
  const { error: answerError } = await supabase
    .from('quiz_room_answers')
    .insert({
      room_id: input.roomId,
      question_id: input.questionId,
      user_id: user.id,
      selected_index: input.selectedIndex,
      is_correct: isCorrect,
      time_taken: input.timeTaken,
    });

  if (answerError) throw new Error('Failed to submit answer');

  // Calculate points (time-based scoring)
  const pointsEarned = isCorrect ? Math.max(100 - input.timeTaken * 2, 10) : 0;

  // Update player score
  const { data: player } = await supabase
    .from('quiz_room_players')
    .select('score, correct_answers, total_answers, streak')
    .eq('room_id', input.roomId)
    .eq('user_id', user.id)
    .single();

  if (player) {
    const newStreak = isCorrect ? player.streak + 1 : 0;
    const streakBonus = isCorrect && newStreak >= 3 ? Math.floor(newStreak / 3) * 5 : 0;
    
    await supabase
      .from('quiz_room_players')
      .update({
        score: player.score + pointsEarned + streakBonus,
        correct_answers: player.correct_answers + (isCorrect ? 1 : 0),
        total_answers: player.total_answers + 1,
        streak: newStreak,
      })
      .eq('room_id', input.roomId)
      .eq('user_id', user.id);
  }

  return { isCorrect, pointsEarned };
}
