// Database types (snake_case matching Supabase schema)
export interface QuizRoomDB {
  id: string
  code: string
  host_id: string
  host_name: string
  status: "waiting" | "starting" | "in_progress" | "finished"
  category: string
  difficulty: "easy" | "medium" | "hard"
  max_players: number
  current_players: number
  question_count: number
  current_question: number
  created_at: string
  starts_at?: string
  finished_at?: string
}

export interface QuizRoomPlayerDB {
  id: string
  room_id: string
  user_id: string
  user_name: string
  avatar_id?: string | null
  score: number
  correct_answers: number
  total_answers: number
  streak: number
  is_ready: boolean
  is_host: boolean
  joined_at: string
}

// correct_index is optional here because rows read through
// `quiz_room_questions_safe` never include it - only the trusted server
// action in answer-actions.ts reads it, directly from the base table.
export interface QuizRoomQuestionDB {
  id: string
  room_id: string
  question_id: string
  question_text: string
  choices: string[] | Record<string, unknown>
  correct_index?: number
  time_limit: number
  order_num: number
  started_at?: string
}

export interface QuizRoomAnswerDB {
  id: string
  room_id: string
  question_id: string
  user_id: string
  selected_index: number
  is_correct: boolean
  time_taken: number
  answered_at: string
}

// App types (camelCase for frontend)
export interface QuizRoom {
  id: string
  code: string
  hostId: string
  hostName: string
  status: "waiting" | "starting" | "in_progress" | "finished"
  category: string
  difficulty: "easy" | "medium" | "hard"
  maxPlayers: number
  currentPlayers: number
  questionCount: number
  currentQuestion: number
  createdAt: string
  startsAt?: string
  finishedAt?: string
}

export interface QuizRoomPlayer {
  id: string
  roomId: string
  userId: string
  userName: string
  /** The avatar chosen in onboarding, e.g. "m-3" — an id, not a URL.
   * Stamped from the profile by trigger; see migration 0036. */
  avatarId?: string | null
  score: number
  correctAnswers: number
  totalAnswers: number
  streak: number
  isReady: boolean
  isHost: boolean
  joinedAt: string
}

// Client-facing shape. correctIndex is intentionally OPTIONAL - it must never
// be populated from a client-side fetch. Reads that power the UI (getRoomState,
// realtime refreshes) come from `quiz_room_questions_safe`, which does not
// expose this column at all. See
// supabase/migrations/0004_lock_down_room_question_answers.sql.
export interface QuizRoomQuestion {
  id: string
  roomId: string
  questionId: string
  questionText: string
  choices: string[]
  correctIndex?: number
  timeLimit: number
  orderNum: number
  startedAt?: string
}

export interface QuizRoomAnswer {
  id: string
  roomId: string
  questionId: string
  userId: string
  selectedIndex: number
  isCorrect: boolean
  timeTaken: number
  answeredAt: string
}

export interface QuizRoomState {
  room: QuizRoom
  players: QuizRoomPlayer[]
  currentQuestion: QuizRoomQuestion | null
  timeRemaining: number
  answers: QuizRoomAnswer[]
  leaderboard: QuizRoomPlayer[]
}

export interface CreateRoomInput {
  category: string
  difficulty: "easy" | "medium" | "hard"
  maxPlayers: number
  questionCount: number
}

export interface JoinRoomInput {
  roomCode: string
}

export interface SubmitAnswerInput {
  roomId: string
  questionId: string
  selectedIndex: number
  timeTaken: number
}

// Transform functions from DB to App types
export function transformRoom(db: QuizRoomDB): QuizRoom {
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

export function transformPlayer(db: QuizRoomPlayerDB): QuizRoomPlayer {
  return {
    id: db.id,
    roomId: db.room_id,
    userId: db.user_id,
    userName: db.user_name,
    avatarId: db.avatar_id,
    score: db.score,
    correctAnswers: db.correct_answers,
    totalAnswers: db.total_answers,
    streak: db.streak,
    isReady: db.is_ready,
    isHost: db.is_host,
    joinedAt: db.joined_at,
  }
}

export function transformQuestion(db: QuizRoomQuestionDB): QuizRoomQuestion {
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
