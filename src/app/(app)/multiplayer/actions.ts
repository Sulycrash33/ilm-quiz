'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Seeds and starts a multiplayer room, via `start_multiplayer_quiz_rpc`
 * (migration 0049).
 *
 * This used to select `correct_choice_index` from `questions` as the
 * signed-in host, then insert it into `quiz_room_questions.correct_index`
 * from here — a select against the same two columns `quiz-service.ts` has
 * always avoided, just for a different table. It is now one function: the
 * host check, the question selection and the write all happen server-side in
 * a single call, which also closes a small race the old two-step version
 * had (two rapid calls could each pass the host check and both seed the
 * room).
 */
export async function startMultiplayerQuiz(roomId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in.');

  const { error } = await supabase.rpc('start_multiplayer_quiz_rpc', {
    p_room_id: roomId,
  });

  if (error) throw new Error(error.message || 'Could not start the quiz.');
}

/**
 * Host-only: advance the room to the next question, or finish the quiz if
 * the current question was the last one. Returns true when the quiz has
 * finished, false if there's another question to show.
 */
export async function advanceQuestion(roomId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in.');

  const { data: room, error: roomError } = await supabase
    .from('quiz_rooms')
    .select('host_id, current_question, question_count')
    .eq('id', roomId)
    .single();

  if (roomError || !room) throw new Error('Room not found');
  if (room.host_id !== user.id) throw new Error('Only the host can advance the quiz.');

  const nextQuestionNum = room.current_question + 1;

  if (nextQuestionNum > room.question_count) {
    const { error } = await supabase
      .from('quiz_rooms')
      .update({ status: 'finished', finished_at: new Date().toISOString() })
      .eq('id', roomId);
    if (error) throw new Error('Failed to finish the quiz.');
    return true;
  }

  const { error: roomUpdateError } = await supabase
    .from('quiz_rooms')
    .update({ current_question: nextQuestionNum })
    .eq('id', roomId);
  if (roomUpdateError) throw new Error('Failed to advance to the next question.');

  // Reset the new question's timer reference point so time-limit countdowns
  // on the client start from when it actually became active.
  const { error: questionUpdateError } = await supabase
    .from('quiz_room_questions')
    .update({ started_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('order_num', nextQuestionNum);
  if (questionUpdateError) throw new Error('Failed to start the next question.');

  return false;
}
