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
}

export interface QuizRoomPlayer {
  id: string
  roomId: string
  userId: string
  userName: string
  avatar?: string
  score: number
  correctAnswers: number
  totalAnswers: number
  streak: number
  isReady: boolean
  isHost: boolean
  joinedAt: string
}

export interface QuizRoomQuestion {
  id: string
  roomId: string
  questionId: string
  questionText: string
  choices: string[]
  correctIndex: number
  timeLimit: number
  order: number
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
