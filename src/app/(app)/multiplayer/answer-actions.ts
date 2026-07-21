'use server';

import { createClient } from '@/lib/supabase/server';

interface SubmitAnswerInput {
  roomId: string;
  questionId: string;
  selectedIndex: number;
  timeTaken: number;
}

/** Grading, scoring, and the player-score update all happen inside a
 * SECURITY DEFINER Postgres function (submit_multiplayer_answer_rpc) - see
 * supabase/migrations. quiz_room_players.score/correct_answers/
 * total_answers/streak can no longer be written directly by a client call,
 * so this is the only path that can change them. */
export async function submitMultiplayerAnswer(
  input: SubmitAnswerInput,
): Promise<{ isCorrect: boolean; pointsEarned: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in.');

  const { data, error } = await supabase.rpc('submit_multiplayer_answer_rpc', {
    p_room_id: input.roomId,
    p_question_id: input.questionId,
    p_selected_index: input.selectedIndex,
    p_time_taken: input.timeTaken,
  });

  if (error) {
    // The unique constraint on (room_id, question_id, user_id) surfaces here
    // as a duplicate-key error if the client tries to answer twice.
    if (error.code === '23505') throw new Error('Already answered this question');
    throw new Error(error.message || 'Failed to submit answer');
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Failed to submit answer');

  return { isCorrect: row.is_correct, pointsEarned: row.points_earned };
}
