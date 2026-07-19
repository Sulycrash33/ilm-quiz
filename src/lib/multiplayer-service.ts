"use client"

import { createClient } from "@/lib/supabase/client"
import type {
  QuizRoom,
  QuizRoomPlayer,
  QuizRoomQuestion,
  CreateRoomInput,
  JoinRoomInput,
  SubmitAnswerInput,
} from "./multiplayer-types"

const supabase = createClient()

// Generate a unique 6-character room code
function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Create a new quiz room
export async function createRoom(input: CreateRoomInput, hostId: string, hostName: string) {
  const roomCode = generateRoomCode()

  const { data: room, error: roomError } = await supabase
    .from("quiz_rooms")
    .insert({
      code: roomCode,
      host_id: hostId,
      host_name: hostName,
      status: "waiting",
      category: input.category,
      difficulty: input.difficulty,
      max_players: input.maxPlayers,
      current_players: 1,
      question_count: input.questionCount,
      current_question: 0,
    })
    .select()
    .single()

  if (roomError) throw roomError

  // Add host as first player
  const { error: playerError } = await supabase
    .from("quiz_room_players")
    .insert({
      room_id: room.id,
      user_id: hostId,
      user_name: hostName,
      score: 0,
      correct_answers: 0,
      total_answers: 0,
      streak: 0,
      is_ready: true,
      is_host: true,
    })

  if (playerError) throw playerError

  return room
}

// Join an existing room
export async function joinRoom(input: JoinRoomInput, userId: string, userName: string) {
  // Find room by code
  const { data: room, error: roomError } = await supabase
    .from("quiz_rooms")
    .select("*")
    .eq("code", input.roomCode.toUpperCase())
    .eq("status", "waiting")
    .single()

  if (roomError || !room) {
    throw new Error("Room not found or already started")
  }

  if (room.current_players >= room.max_players) {
    throw new Error("Room is full")
  }

  // Check if already in room
  const { data: existing } = await supabase
    .from("quiz_room_players")
    .select("id")
    .eq("room_id", room.id)
    .eq("user_id", userId)
    .single()

  if (existing) {
    throw new Error("You are already in this room")
  }

  // Add player
  const { error: playerError } = await supabase
    .from("quiz_room_players")
    .insert({
      room_id: room.id,
      user_id: userId,
      user_name: userName,
      score: 0,
      correct_answers: 0,
      total_answers: 0,
      streak: 0,
      is_ready: false,
      is_host: false,
    })

  if (playerError) throw playerError

  // Update player count
  await supabase
    .from("quiz_rooms")
    .update({ current_players: room.current_players + 1 })
    .eq("id", room.id)

  return room
}

// Start the quiz (host only)
export async function startQuiz(roomId: string) {
  // Get room details
  const { data: room, error: roomError } = await supabase
    .from("quiz_rooms")
    .select("*")
    .eq("id", roomId)
    .single()

  if (roomError || !room) throw new Error("Room not found")

  // Get questions for the category
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id, question_text, choices, correct_choice_index")
    .eq("category_id", room.category)
    .eq("difficulty", room.difficulty)
    .eq("review_status", "published")
    .limit(room.question_count)

  if (questionsError || !questions || questions.length === 0) {
    throw new Error("No questions available for this category")
  }

  // Shuffle and insert questions
  const shuffled = questions.sort(() => Math.random() - 0.5)
  const roomQuestions = shuffled.map((q, i) => ({
    room_id: roomId,
    question_id: q.id,
    question_text: q.question_text,
    choices: q.choices,
    correct_index: q.correct_choice_index,
    time_limit: 30,
    order: i + 1,
  }))

  const { error: insertError } = await supabase
    .from("quiz_room_questions")
    .insert(roomQuestions)

  if (insertError) throw insertError

  // Update room status
  const startsAt = new Date(Date.now() + 5000).toISOString() // 5 second countdown
  await supabase
    .from("quiz_rooms")
    .update({
      status: "starting",
      current_question: 1,
      starts_at: startsAt,
    })
    .eq("id", roomId)
}

// Submit an answer
export async function submitAnswer(input: SubmitAnswerInput, userId: string) {
  // Get the question
  const { data: question, error: qError } = await supabase
    .from("quiz_room_questions")
    .select("correct_index")
    .eq("id", input.questionId)
    .single()

  if (qError || !question) throw new Error("Question not found")

  const isCorrect = input.selectedIndex === question.correct_index

  // Insert answer
  const { error: answerError } = await supabase
    .from("quiz_room_answers")
    .insert({
      room_id: input.roomId,
      question_id: input.questionId,
      user_id: userId,
      selected_index: input.selectedIndex,
      is_correct: isCorrect,
      time_taken: input.timeTaken,
    })

  if (answerError) throw answerError

  // Update player score
  const { data: player } = await supabase
    .from("quiz_room_players")
    .select("score, correct_answers, total_answers, streak")
    .eq("room_id", input.roomId)
    .eq("user_id", userId)
    .single()

  if (player) {
    const pointsEarned = isCorrect ? Math.max(100 - input.timeTaken * 2, 10) : 0
    const newStreak = isCorrect ? player.streak + 1 : 0
    const streakBonus = newStreak >= 3 ? (newStreak - 2) * 25 : 0

    await supabase
      .from("quiz_room_players")
      .update({
        score: player.score + pointsEarned + streakBonus,
        correct_answers: player.correct_answers + (isCorrect ? 1 : 0),
        total_answers: player.total_answers + 1,
        streak: newStreak,
      })
      .eq("room_id", input.roomId)
      .eq("user_id", userId)
  }

  return { isCorrect, pointsEarned: isCorrect ? Math.max(100 - input.timeTaken * 2, 10) : 0 }
}

// Move to next question
export async function nextQuestion(roomId: string) {
  const { data: room } = await supabase
    .from("quiz_rooms")
    .select("current_question, question_count")
    .eq("id", roomId)
    .single()

  if (!room) throw new Error("Room not found")

  if (room.current_question >= room.question_count) {
    // Quiz finished
    await supabase
      .from("quiz_rooms")
      .update({ status: "finished" })
      .eq("id", roomId)
  } else {
    await supabase
      .from("quiz_rooms")
      .update({ current_question: room.current_question + 1 })
      .eq("id", roomId)
  }
}

// Get room state
export async function getRoomState(roomId: string) {
  const { data: room } = await supabase
    .from("quiz_rooms")
    .select("*")
    .eq("id", roomId)
    .single()

  const { data: players } = await supabase
    .from("quiz_room_players")
    .select("*")
    .eq("room_id", roomId)
    .order("score", { ascending: false })

  const { data: currentQuestion } = await supabase
    .from("quiz_room_questions")
    .select("*")
    .eq("room_id", roomId)
    .eq("order", room?.current_question || 1)
    .single()

  return { room, players: players || [], currentQuestion }
}

// Subscribe to room updates
export function subscribeToRoom(roomId: string, callback: (payload: any) => void) {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "quiz_rooms",
        filter: `id=eq.${roomId}`,
      },
      callback
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "quiz_room_players",
        filter: `room_id=eq.${roomId}`,
      },
      callback
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "quiz_room_answers",
        filter: `room_id=eq.${roomId}`,
      },
      callback
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Leave room
export async function leaveRoom(roomId: string, userId: string) {
  await supabase
    .from("quiz_room_players")
    .delete()
    .eq("room_id", roomId)
    .eq("user_id", userId)

  const { data: room } = await supabase
    .from("quiz_rooms")
    .select("current_players")
    .eq("id", roomId)
    .single()

  if (room) {
    if (room.current_players <= 1) {
      // Delete room if empty
      await supabase.from("quiz_rooms").delete().eq("id", roomId)
    } else {
      await supabase
        .from("quiz_rooms")
        .update({ current_players: room.current_players - 1 })
        .eq("id", roomId)
    }
  }
}
