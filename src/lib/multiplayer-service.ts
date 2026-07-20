"use client"

import { createClient } from "@/lib/supabase/client"
import { startMultiplayerQuiz, advanceQuestion } from "@/app/(app)/multiplayer/actions"
import { submitMultiplayerAnswer } from "@/app/(app)/multiplayer/answer-actions"
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

  if (roomError || !room) throw new Error("Failed to create room")

  // Add host as first player
  const { error: playerError } = await supabase
    .from("quiz_room_players")
    .insert({
      room_id: room.id,
      user_id: hostId,
      user_name: hostName,
      is_ready: true,
      is_host: true,
    })

  if (playerError) throw new Error("Failed to add host to room")

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
    .single()

  if (roomError || !room) throw new Error("Room not found")

  // Check if room is joinable
  if (room.status !== "waiting") throw new Error("Room is not accepting players")
  if (room.current_players >= room.max_players) throw new Error("Room is full")

  // Check if already in room
  const { data: existingPlayer } = await supabase
    .from("quiz_room_players")
    .select("id")
    .eq("room_id", room.id)
    .eq("user_id", userId)
    .single()

  if (existingPlayer) throw new Error("Already in this room")

  // Add player
  const { error: playerError } = await supabase
    .from("quiz_room_players")
    .insert({
      room_id: room.id,
      user_id: userId,
      user_name: userName,
    })

  if (playerError) throw new Error("Failed to join room")

  // Update player count
  await supabase
    .from("quiz_rooms")
    .update({ current_players: room.current_players + 1 })
    .eq("id", room.id)

  return transformRoom(room as QuizRoomDB)
}

// Start the quiz (host only) - uses server action
export async function startQuiz(roomId: string): Promise<void> {
  await startMultiplayerQuiz(roomId)
}

// Advance to the next question, or finish the quiz (host only) - uses server action
export async function nextQuestion(roomId: string): Promise<boolean> {
  return advanceQuestion(roomId)
}

// Submit an answer - uses server action
export async function submitAnswer(
  input: SubmitAnswerInput,
  userId: string
): Promise<{ isCorrect: boolean; pointsEarned: number }> {
  return submitMultiplayerAnswer(input)
}

// Get room state
export async function getRoomState(roomId: string): Promise<{
  room: QuizRoom
  players: QuizRoomPlayer[]
  questions: QuizRoomQuestion[]
}> {
  const supabase = createClient()

  const { data: room, error: roomError } = await supabase
    .from("quiz_rooms")
    .select("*")
    .eq("id", roomId)
    .single()

  if (roomError || !room) throw new Error("Room not found")

  const { data: players } = await supabase
    .from("quiz_room_players")
    .select("*")
    .eq("room_id", roomId)
    .order("joined_at")

  // IMPORTANT: read through quiz_room_questions_safe, never the base table -
  // the base table's correct_index column must never reach the browser.
  const { data: questions } = await supabase
    .from("quiz_room_questions_safe")
    .select("id, room_id, question_id, question_text, choices, time_limit, order_num, started_at")
    .eq("room_id", roomId)
    .order("order_num")

  return {
    room: transformRoom(room as QuizRoomDB),
    players: (players || []).map(transformPlayer),
    questions: (questions || []).map(transformQuestion),
  }
}

// Subscribe to room changes
export function subscribeToRoom(
  roomId: string,
  callbacks: {
    onRoomChange?: (room: QuizRoom) => void
    onPlayerChange?: (players: QuizRoomPlayer[]) => void
    onQuestionChange?: (questions: QuizRoomQuestion[]) => void
    onAnswerChange?: () => void
  }
) {
  const supabase = createClient()

  const roomSubscription = supabase
    .channel(`room:${roomId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "quiz_rooms", filter: `id=eq.${roomId}` },
      (payload) => {
        if (payload.eventType === "UPDATE" && callbacks.onRoomChange) {
          callbacks.onRoomChange(transformRoom(payload.new as QuizRoomDB))
        }
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "quiz_room_players", filter: `room_id=eq.${roomId}` },
      async () => {
        if (callbacks.onPlayerChange) {
          const { data } = await supabase
            .from("quiz_room_players")
            .select("*")
            .eq("room_id", roomId)
            .order("joined_at")
          callbacks.onPlayerChange((data || []).map(transformPlayer))
        }
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "quiz_room_questions", filter: `room_id=eq.${roomId}` },
      async () => {
        if (callbacks.onQuestionChange) {
          // Re-fetch through the safe view - never read correct_index here.
          const { data } = await supabase
            .from("quiz_room_questions_safe")
            .select("id, room_id, question_id, question_text, choices, time_limit, order_num, started_at")
            .eq("room_id", roomId)
            .order("order_num")
          callbacks.onQuestionChange((data || []).map(transformQuestion))
        }
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "quiz_room_answers", filter: `room_id=eq.${roomId}` },
      () => {
        callbacks.onAnswerChange?.()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(roomSubscription)
  }
}

// Leave room
export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  const supabase = createClient()

  // Get current player
  const { data: player } = await supabase
    .from("quiz_room_players")
    .select("*")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .single()

  if (!player) return

  // Delete player
  await supabase
    .from("quiz_room_players")
    .delete()
    .eq("room_id", roomId)
    .eq("user_id", userId)

  // Update player count
  const { data: room } = await supabase
    .from("quiz_rooms")
    .select("current_players, host_id")
    .eq("id", roomId)
    .single()

  if (room) {
    await supabase
      .from("quiz_rooms")
      .update({ current_players: Math.max(0, room.current_players - 1) })
      .eq("id", roomId)

    // If host left, assign new host or delete room
    if (room.host_id === userId) {
      const { data: remainingPlayers } = await supabase
        .from("quiz_room_players")
        .select("user_id")
        .eq("room_id", roomId)
        .order("joined_at")
        .limit(1)

      if (remainingPlayers && remainingPlayers.length > 0) {
        await supabase
          .from("quiz_rooms")
          .update({ host_id: remainingPlayers[0].user_id })
          .eq("id", roomId)

        await supabase
          .from("quiz_room_players")
          .update({ is_host: true })
          .eq("room_id", roomId)
          .eq("user_id", remainingPlayers[0].user_id)
      } else {
        await supabase
          .from("quiz_rooms")
          .delete()
          .eq("id", roomId)
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

// Get current room for user
export async function getCurrentRoom(userId: string): Promise<QuizRoom | null> {
  const supabase = createClient()

  const { data: player } = await supabase
    .from("quiz_room_players")
    .select("room_id")
    .eq("user_id", userId)
    .single()

  if (!player) return null

  const { data: room } = await supabase
    .from("quiz_rooms")
    .select("*")
    .eq("id", player.room_id)
    .single()

  if (!room) return null

  return transformRoom(room as QuizRoomDB)
}
