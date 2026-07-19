"use client"

import { createClient } from "@/lib/supabase/client"
import type {
  QuizRoom,
  QuizRoomPlayer,
  QuizRoomQuestion,
  QuizRoomDB,
  QuizRoomPlayerDB,
  QuizRoomQuestionDB,
  CreateRoomInput,
  JoinRoomInput,
  SubmitAnswerInput,
} from "./multiplayer-types"

// Transform functions from DB to App types
function transformRoom(db: QuizRoomDB): QuizRoom {
  return {
    id: db.id,
    code: db.code,
    hostId: db.host_id,
    hostName: db.host_name,
    status: db.status,
    category: db.category,
    difficulty: db.difficulty,
    maxPlayers: db.max_players,
    currentPlayers: db.current_players,
    questionCount: db.question_count,
    currentQuestion: db.current_question,
    createdAt: db.created_at,
    startsAt: db.starts_at,
    finishedAt: db.finished_at,
  }
}

function transformPlayer(db: QuizRoomPlayerDB): QuizRoomPlayer {
  return {
    id: db.id,
    roomId: db.room_id,
    userId: db.user_id,
    userName: db.user_name,
    avatarUrl: db.avatar_url,
    score: db.score,
    correctAnswers: db.correct_answers,
    totalAnswers: db.total_answers,
    streak: db.streak,
    isReady: db.is_ready,
    isHost: db.is_host,
    joinedAt: db.joined_at,
  }
}

function transformQuestion(db: QuizRoomQuestionDB): QuizRoomQuestion {
  return {
    id: db.id,
    roomId: db.room_id,
    questionId: db.question_id,
    questionText: db.question_text,
    choices: Array.isArray(db.choices) ? (db.choices as string[]) : (Object.values(db.choices) as string[]),
    correctIndex: db.correct_index,
    timeLimit: db.time_limit,
    orderNum: db.order_num,
    startedAt: db.started_at,
  }
}

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
export async function createRoom(
  input: CreateRoomInput,
  hostId: string,
  hostName: string
): Promise<QuizRoom> {
  const supabase = createClient()
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

  if (roomError) {
    console.error("Error creating room:", roomError)
    throw new Error("Failed to create room")
  }

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

  if (playerError) {
    console.error("Error adding host:", playerError)
    throw new Error("Failed to add host to room")
  }

  return transformRoom(room as QuizRoomDB)
}

// Join an existing room
export async function joinRoom(
  input: JoinRoomInput,
  userId: string,
  userName: string
): Promise<QuizRoom> {
  const supabase = createClient()

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

  if (playerError) {
    console.error("Error adding player:", playerError)
    throw new Error("Failed to join room")
  }

  // Update player count
  await supabase
    .from("quiz_rooms")
    .update({ current_players: room.current_players + 1 })
    .eq("id", room.id)

  return transformRoom(room as QuizRoomDB)
}

// Start the quiz (host only)
export async function startQuiz(roomId: string): Promise<void> {
  const supabase = createClient()

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
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  const roomQuestions = shuffled.map((q, i) => ({
    room_id: roomId,
    question_id: q.id,
    question_text: q.question_text,
    choices: q.choices,
    correct_index: q.correct_choice_index,
    time_limit: 30,
    order_num: i + 1,
  }))

  const { error: insertError } = await supabase
    .from("quiz_room_questions")
    .insert(roomQuestions)

  if (insertError) {
    console.error("Error inserting questions:", insertError)
    throw new Error("Failed to insert questions")
  }

  // Update room status with countdown
  const startsAt = new Date(Date.now() + 5000).toISOString()
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
export async function submitAnswer(
  input: SubmitAnswerInput,
  userId: string
): Promise<{ isCorrect: boolean; pointsEarned: number }> {
  const supabase = createClient()

  // Get the question
  const { data: question, error: qError } = await supabase
    .from("quiz_room_questions")
    .select("id, correct_index")
    .eq("id", input.questionId)
    .single()

  if (qError || !question) throw new Error("Question not found")

  const isCorrect = input.selectedIndex === question.correct_index

  // Check if already answered
  const { data: existing } = await supabase
    .from("quiz_room_answers")
    .select("id")
    .eq("room_id", input.roomId)
    .eq("question_id", input.questionId)
    .eq("user_id", userId)
    .single()

  if (existing) {
    throw new Error("Already answered this question")
  }

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

  if (answerError) {
    console.error("Error submitting answer:", answerError)
    throw new Error("Failed to submit answer")
  }

  // Calculate points
  const pointsEarned = isCorrect ? Math.max(100 - input.timeTaken * 2, 10) : 0

  // Update player score
  const { data: player } = await supabase
    .from("quiz_room_players")
    .select("score, correct_answers, total_answers, streak")
    .eq("room_id", input.roomId)
    .eq("user_id", userId)
    .single()

  if (player) {
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

  return { isCorrect, pointsEarned }
}

// Move to next question
export async function nextQuestion(roomId: string): Promise<boolean> {
  const supabase = createClient()

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
      .update({
        status: "finished",
        finished_at: new Date().toISOString(),
      })
      .eq("id", roomId)
    return true
  } else {
    await supabase
      .from("quiz_rooms")
      .update({ current_question: room.current_question + 1 })
      .eq("id", roomId)
    return false
  }
}

// Get room state
export async function getRoomState(roomId: string) {
  const supabase = createClient()

  const { data: roomDB } = await supabase
    .from("quiz_rooms")
    .select("*")
    .eq("id", roomId)
    .single()

  const { data: playersDB } = await supabase
    .from("quiz_room_players")
    .select("*")
    .eq("room_id", roomId)
    .order("score", { ascending: false })

  const { data: questionDB } = await supabase
    .from("quiz_room_questions")
    .select("*")
    .eq("room_id", roomId)
    .eq("order_num", roomDB?.current_question || 1)
    .single()

  return {
    room: roomDB ? transformRoom(roomDB as QuizRoomDB) : null,
    players: (playersDB || []).map((p) => transformPlayer(p as QuizRoomPlayerDB)),
    currentQuestion: questionDB ? transformQuestion(questionDB as QuizRoomQuestionDB) : null,
  }
}

// Subscribe to room updates (real-time)
export function subscribeToRoom(
  roomId: string,
  callback: (table: string, payload: any) => void
) {
  const supabase = createClient()

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
      (payload) => callback("quiz_rooms", payload)
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "quiz_room_players",
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => callback("quiz_room_players", payload)
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "quiz_room_answers",
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => callback("quiz_room_answers", payload)
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "quiz_room_questions",
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => callback("quiz_room_questions", payload)
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Leave room
export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  const supabase = createClient()

  await supabase
    .from("quiz_room_players")
    .delete()
    .eq("room_id", roomId)
    .eq("user_id", userId)

  const { data: room } = await supabase
    .from("quiz_rooms")
    .select("current_players, host_id")
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

      // If host left, assign new host
      if (room.host_id === userId) {
        const { data: nextHost } = await supabase
          .from("quiz_room_players")
          .select("user_id")
          .eq("room_id", roomId)
          .order("joined_at", { ascending: true })
          .limit(1)
          .single()

        if (nextHost) {
          await supabase
            .from("quiz_rooms")
            .update({ host_id: nextHost.user_id })
            .eq("id", roomId)

          await supabase
            .from("quiz_room_players")
            .update({ is_host: true })
            .eq("room_id", roomId)
            .eq("user_id", nextHost.user_id)
        }
      }
    }
  }
}

// Toggle ready status
export async function toggleReady(roomId: string, userId: string): Promise<void> {
  const supabase = createClient()

  const { data: player } = await supabase
    .from("quiz_room_players")
    .select("is_ready")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .single()

  if (player) {
    await supabase
      .from("quiz_room_players")
      .update({ is_ready: !player.is_ready })
      .eq("room_id", roomId)
      .eq("user_id", userId)
  }
}

// Get current user's room (if any)
export async function getCurrentRoom(userId: string) {
  const supabase = createClient()

  const { data: player } = await supabase
    .from("quiz_room_players")
    .select("room_id, quiz_rooms(*)")
    .eq("user_id", userId)
    .single()

  return player?.quiz_rooms || null
}
