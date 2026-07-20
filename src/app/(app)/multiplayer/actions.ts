'use server';

import { createClient } from '@/lib/supabase/server';

export async function startMultiplayerQuiz(roomId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in.');

  // Get room details
  const { data: room, error: roomError } = await supabase
    .from('quiz_rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (roomError || !room) throw new Error('Room not found');
  if (room.host_id !== user.id) throw new Error('Only the host can start the quiz.');

  // Get questions for the category (server-side only, correct answers never leave server)
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, question_text, choices, correct_choice_index')
    .eq('category_id', room.category)
    .eq('difficulty', room.difficulty)
    .eq('review_status', 'published')
    .limit(room.question_count);

  if (questionsError || !questions || questions.length === 0) {
    throw new Error('No questions available for this category');
  }

  // Shuffle and insert questions (correct_index stored server-side only)
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  const roomQuestions = shuffled.map((q, i) => ({
    room_id: roomId,
    question_id: q.id,
    question_text: q.question_text,
    choices: q.choices,
    correct_index: q.correct_choice_index,
    time_limit: 30,
    order_num: i + 1,
  }));

  const { error: insertError } = await supabase
    .from('quiz_room_questions')
    .insert(roomQuestions);

  if (insertError) {
    console.error('Error inserting questions:', insertError);
    throw new Error('Failed to insert questions');
  }

  // Update room status with countdown
  const startsAt = new Date(Date.now() + 5000).toISOString();
  await supabase
    .from('quiz_rooms')
    .update({
      status: 'starting',
      current_question: 1,
      starts_at: startsAt,
    })
    .eq('id', roomId);
}
