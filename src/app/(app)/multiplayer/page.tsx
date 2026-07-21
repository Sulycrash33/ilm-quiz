"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { CreateRoomModal } from "@/components/multiplayer/CreateRoomModal"
import { RoomLobby } from "@/components/multiplayer/RoomLobby"
import { LiveQuiz } from "@/components/multiplayer/LiveQuiz"
import { QuizResults } from "@/components/multiplayer/QuizResults"
import {
  createRoom,
  joinRoom,
  startQuiz,
  submitAnswer,
  nextQuestion,
  getRoomState,
  subscribeToRoom,
  leaveRoom,
  toggleReady,
} from "@/lib/multiplayer-service"
import type { QuizRoom, QuizRoomPlayer, QuizRoomQuestion } from "@/lib/multiplayer-types"
import { createClient } from "@/lib/supabase/client"

const categories = [
  { id: "holy-quran", name: "Quran", icon: "📖" },
  { id: "hadith-sciences", name: "Hadith", icon: "📜" },
  { id: "five-pillars", name: "Five Pillars", icon: "🕌" },
  { id: "islamic-history", name: "History", icon: "🏛️" },
  { id: "arabic-language", name: "Arabic", icon: "🔤" },
  { id: "fiqh", name: "Fiqh", icon: "⚖️" },
]

type ViewState = "home" | "creating" | "joining" | "lobby" | "countdown" | "quiz" | "results"

export default function MultiplayerPage() {
  const [viewState, setViewState] = useState<ViewState>("home")
  const [roomCode, setRoomCode] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [roomId, setRoomId] = useState<string | null>(null)
  const [room, setRoom] = useState<QuizRoom | null>(null)
  const [players, setPlayers] = useState<QuizRoomPlayer[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<QuizRoomQuestion | null>(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [isHost, setIsHost] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserName, setCurrentUserName] = useState<string>("")
  const [countdown, setCountdown] = useState(3)
  const [timeRemaining, setTimeRemaining] = useState(30)
  const [hasAnswered, setHasAnswered] = useState(false)

  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Get current user on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUserId(data.user.id)
        // Get user's display name
        supabase
          .from("profiles")
          .select("display_name")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => {
            setCurrentUserName(profile?.display_name || data.user!.email?.split("@")[0] || "Player")
          })
      }
    })
  }, [])

  // Keep the latest fetched questions around so the room-status callback
  // (which fires independently of the questions callback) can look up the
  // active question without an extra round trip.
  const questionsRef = useRef<QuizRoomQuestion[]>([])
  const viewStateRef = useRef<ViewState>("home")
  useEffect(() => {
    viewStateRef.current = viewState
  }, [viewState])

  const applyActiveQuestion = useCallback((updatedRoom: QuizRoom) => {
    if (updatedRoom.status !== "in_progress") return
    const active = questionsRef.current.find((q) => q.orderNum === updatedRoom.currentQuestion)
    if (!active) return
    setCurrentQuestion(active)
    setQuestionNumber(updatedRoom.currentQuestion)
    setTotalQuestions(updatedRoom.questionCount)
    setTimeRemaining(active.timeLimit)
    setHasAnswered(false)
  }, [])

  // Subscribe to room updates
  useEffect(() => {
    if (!roomId) return

    const unsubscribe = subscribeToRoom(roomId, {
      onRoomChange: (updatedRoom) => {
        setRoom(updatedRoom)

        if (updatedRoom.status === "starting" && viewStateRef.current === "lobby") {
          setViewState("countdown")
          startCountdown()
        }

        if (updatedRoom.status === "finished") {
          setShowResults(true)
          setViewState("results")
        }

        applyActiveQuestion(updatedRoom)
      },
      onPlayerChange: (updatedPlayers) => {
        setPlayers(updatedPlayers)
      },
      onQuestionChange: (updatedQuestions) => {
        questionsRef.current = updatedQuestions
        if (room) applyActiveQuestion(room)
      },
    })

    unsubscribeRef.current = unsubscribe

    return () => {
      unsubscribe()
    }
  }, [roomId, applyActiveQuestion])

  const startCountdown = useCallback(() => {
    setCountdown(3)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setViewState("quiz")
          // Safety net: if the realtime INSERT for quiz_room_questions was
          // missed (backgrounded tab, dropped socket, etc.), fetch directly.
          if (roomId) {
            getRoomState(roomId).then((state) => {
              questionsRef.current = state.questions
              applyActiveQuestion(state.room)
            })
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [roomId, applyActiveQuestion])

  const handleCreateRoom = async (config: { category: string; difficulty: "easy" | "medium" | "hard"; maxPlayers: number; questionCount: number }) => {
    if (!currentUserId || !currentUserName) {
      alert("Please wait while we load your profile...")
      return
    }

    try {
      const newRoom = await createRoom(config, currentUserId, currentUserName)
      setRoomId(newRoom.id)
      setRoom(newRoom)
      setRoomCode(newRoom.code)
      setIsHost(true)
      setTotalQuestions(config.questionCount)
      setViewState("lobby")

      // Refresh players
      const state = await getRoomState(newRoom.id)
      setPlayers(state.players)
    } catch (error) {
      console.error("Error creating room:", error)
      alert("Failed to create room. Please try again.")
    }
  }

  const handleJoinRoom = async () => {
    if (!joinCode.trim() || !currentUserId || !currentUserName) return

    try {
      const joinedRoom = await joinRoom({ roomCode: joinCode.toUpperCase() }, currentUserId, currentUserName)
      setRoomId(joinedRoom.id)
      setRoom(joinedRoom)
      setRoomCode(joinedRoom.code)
      setIsHost(false)
      setViewState("lobby")

      // Refresh players
      const state = await getRoomState(joinedRoom.id)
      setPlayers(state.players)
    } catch (error) {
      console.error("Error joining room:", error)
      alert(error instanceof Error ? error.message : "Failed to join room. Please try again.")
    }
  }

  const handleStartQuiz = async () => {
    if (!roomId || !isHost) return

    try {
      await startQuiz(roomId)
    } catch (error) {
      console.error("Error starting quiz:", error)
      alert("Failed to start quiz. Please try again.")
    }
  }

  const handleAnswer = async (selectedIndex: number, timeTaken: number) => {
    if (!roomId || !currentQuestion || hasAnswered) return

    try {
      setHasAnswered(true)
      await submitAnswer(
        {
          roomId,
          questionId: currentQuestion.id,
          selectedIndex,
          timeTaken,
        },
        currentUserId!
      )
    } catch (error) {
      console.error("Error submitting answer:", error)
      setHasAnswered(false)
    }
  }

  const handleNextQuestion = async () => {
    if (!roomId || !isHost) return

    try {
      const finished = await nextQuestion(roomId)
      if (finished) {
        setShowResults(true)
        setViewState("results")
      }
    } catch (error) {
      console.error("Error moving to next question:", error)
    }
  }

  const handleLeave = async () => {
    if (roomId && currentUserId) {
      try {
        await leaveRoom(roomId, currentUserId)
      } catch (error) {
        console.error("Error leaving room:", error)
      }
    }

    unsubscribeRef.current?.()
    setViewState("home")
    setRoomId(null)
    setRoomCode("")
    setRoom(null)
    setPlayers([])
    setCurrentQuestion(null)
    setQuestionNumber(0)
    setShowResults(false)
  }

  const handleToggleReady = async () => {
    if (!roomId || !currentUserId) return

    try {
      await toggleReady(roomId, currentUserId)
    } catch (error) {
      console.error("Error toggling ready:", error)
    }
  }

  const handlePlayAgain = async () => {
    if (!roomId || !isHost) return

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc("restart_room_rpc", { p_room_id: roomId })
      if (error) throw error

      setShowResults(false)
      setViewState("lobby")
    } catch (error) {
      console.error("Error resetting game:", error)
    }
  }

  return (
    <div className="min-h-screen px-5 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <Link href="/home">
          <PremiumButton variant="ghost" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </PremiumButton>
        </Link>
        <div className="text-center">
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">
            Multiplayer Quiz
          </h1>
          <p className="text-on-surface-variant">Compete with friends in real-time</p>
        </div>
        <div className="w-20" />
      </motion.div>

      {/* Home State */}
      {viewState === "home" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto space-y-6"
        >
          {/* Create Room */}
          <PremiumCard hover className="p-6" onClick={() => setViewState("creating")}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-lg">Create Room</h3>
                <p className="text-on-surface-variant">Host a quiz for your friends</p>
              </div>
            </div>
          </PremiumCard>

          {/* Join Room */}
          <PremiumCard className="p-6">
            <h3 className="font-bold text-on-surface text-lg mb-4">Join Room</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter room code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 bg-surface-container-high rounded-lg border border-white/5 text-on-surface font-mono text-center text-lg tracking-widest placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                maxLength={6}
              />
              <PremiumButton
                variant="primary"
                onClick={handleJoinRoom}
                disabled={joinCode.length < 6 || !currentUserId}
              >
                Join
              </PremiumButton>
            </div>
          </PremiumCard>

          {/* Instructions */}
          <PremiumCard className="p-6">
            <h3 className="font-bold text-on-surface text-lg mb-4">How to Play</h3>
            <div className="space-y-3 text-on-surface-variant">
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">1.</span>
                <p>Create a room or join with a code from a friend</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">2.</span>
                <p>Wait for all players to ready up</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">3.</span>
                <p>Answer questions as fast as you can for bonus points</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">4.</span>
                <p>Build streaks for extra points!</p>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      )}

      {/* Creating Room Modal */}
      <CreateRoomModal
        isOpen={viewState === "creating"}
        onClose={() => setViewState("home")}
        onCreateRoom={handleCreateRoom}
        categories={categories}
      />

      {/* Lobby */}
      {viewState === "lobby" && (
        <RoomLobby
          roomCode={roomCode}
          players={players.map((p) => ({
            id: p.userId,
            userName: p.userName,
            avatar: p.avatarUrl,
            isHost: p.isHost,
            isReady: p.isReady,
            score: p.score,
          }))}
          currentUserId={currentUserId || ""}
          isHost={isHost}
          onStart={handleStartQuiz}
          onLeave={handleLeave}
          onToggleReady={handleToggleReady}
          isReady={players.find((p) => p.userId === currentUserId)?.isReady || false}
        />
      )}

      {/* Countdown */}
      {viewState === "countdown" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[60vh]"
        >
          <motion.div
            key={countdown}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
            transition={{ duration: 0.5 }}
            className="text-8xl font-bold text-primary mb-4"
          >
            {countdown}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl text-on-surface-variant"
          >
            Get ready...
          </motion.p>
        </motion.div>
      )}

      {/* Quiz */}
      {viewState === "quiz" && currentQuestion && (
        <LiveQuiz
          question={{
            id: currentQuestion.id,
            questionText: currentQuestion.questionText,
            choices: currentQuestion.choices,
            timeLimit: currentQuestion.timeLimit,
          }}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          timeLimit={currentQuestion.timeLimit}
          players={players.map((p) => ({
            id: p.userId,
            userName: p.userName,
            score: p.score,
            correctAnswers: p.correctAnswers,
            streak: p.streak,
          }))}
          currentUserId={currentUserId || ""}
          onAnswer={handleAnswer}
          onNextQuestion={handleNextQuestion}
          isHost={isHost}
          showResults={showResults}
        />
      )}

      {/* Results */}
      {viewState === "results" && (
        <QuizResults
          players={players.map((p) => ({
            id: p.userId,
            userName: p.userName,
            avatar: p.avatarUrl,
            score: p.score,
            correctAnswers: p.correctAnswers,
            totalAnswers: p.totalAnswers,
            streak: p.streak,
          }))}
          currentUserId={currentUserId || ""}
          onPlayAgain={handlePlayAgain}
          onLeave={handleLeave}
        />
      )}
    </div>
  )
}
