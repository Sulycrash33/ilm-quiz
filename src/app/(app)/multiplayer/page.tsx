"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
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
} from "@/lib/multiplayer-service"

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
  const [players, setPlayers] = useState<any[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [isHost, setIsHost] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentUserId] = useState("user-" + Math.random().toString(36).substr(2, 9))
  const [currentUserName] = useState("Player-" + Math.floor(Math.random() * 1000))

  // For demo purposes - simulate multiplayer locally
  const [demoPlayers, setDemoPlayers] = useState([
    { id: currentUserId, userName: currentUserName, score: 0, correctAnswers: 0, totalAnswers: 0, streak: 0, isReady: true, isHost: true },
  ])

  const handleCreateRoom = async (config: { category: string; difficulty: "easy" | "medium" | "hard"; maxPlayers: number; questionCount: number }) => {
    // For demo, create a mock room
    const mockRoomCode = Math.random().toString(36).substr(2, 6).toUpperCase()
    setRoomCode(mockRoomCode)
    setRoomId("demo-room-" + Date.now())
    setIsHost(true)
    setTotalQuestions(config.questionCount)
    setViewState("lobby")
  }

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return
    // For demo, join the room
    setRoomCode(joinCode.toUpperCase())
    setRoomId("demo-room-" + Date.now())
    setIsHost(false)
    setViewState("lobby")
  }

  const handleStartQuiz = async () => {
    // For demo, simulate starting the quiz
    setViewState("countdown")
    setTimeout(() => {
      setCurrentQuestion({
        id: "q1",
        questionText: "What is the first pillar of Islam?",
        choices: ["Salah (Prayer)", "Shahada (Faith)", "Zakat (Charity)", "Sawm (Fasting)"],
        timeLimit: 30,
      })
      setQuestionNumber(1)
      setViewState("quiz")
    }, 3000)
  }

  const handleAnswer = (selectedIndex: number, timeTaken: number) => {
    // For demo, simulate answer
    const isCorrect = selectedIndex === 1 // Shahada is correct
    const pointsEarned = isCorrect ? Math.max(100 - timeTaken * 2, 10) : 0

    setDemoPlayers((prev) =>
      prev.map((p) =>
        p.id === currentUserId
          ? {
              ...p,
              score: p.score + pointsEarned,
              correctAnswers: p.correctAnswers + (isCorrect ? 1 : 0),
              totalAnswers: p.totalAnswers + 1,
              streak: isCorrect ? p.streak + 1 : 0,
            }
          : p
      )
    )
  }

  const handleNextQuestion = () => {
    if (questionNumber >= totalQuestions) {
      setShowResults(true)
      setViewState("results")
      return
    }

    // Demo: cycle through questions
    const demoQuestions = [
      { id: "q1", questionText: "What is the first pillar of Islam?", choices: ["Salah (Prayer)", "Shahada (Faith)", "Zakat (Charity)", "Sawm (Fasting)"], timeLimit: 30 },
      { id: "q2", questionText: "How many times a day do Muslims pray?", choices: ["3", "4", "5", "6"], timeLimit: 30 },
      { id: "q3", questionText: "What is the holy book of Islam?", choices: ["Torah", "Bible", "Quran", "Injil"], timeLimit: 30 },
      { id: "q4", questionText: "What is the meaning of 'Islam'?", choices: ["Peace", "Submission to God", "Knowledge", "Faith"], timeLimit: 30 },
      { id: "q5", questionText: "Who was the last prophet of Islam?", choices: ["Musa", "Isa", "Ibrahim", "Muhammad"], timeLimit: 30 },
    ]

    const nextQ = demoQuestions[questionNumber % demoQuestions.length]
    setCurrentQuestion(nextQ)
    setQuestionNumber((prev) => prev + 1)
  }

  const handleLeave = () => {
    setViewState("home")
    setRoomId(null)
    setRoomCode("")
    setPlayers([])
    setCurrentQuestion(null)
    setQuestionNumber(0)
    setShowResults(false)
    setDemoPlayers([
      { id: currentUserId, userName: currentUserName, score: 0, correctAnswers: 0, totalAnswers: 0, streak: 0, isReady: true, isHost: true },
    ])
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
          <PremiumCard hover className="p-6 cursor-pointer" onClick={() => setViewState("creating")}>
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
                className="flex-1 px-4 py-3 bg-surface-container-high rounded-lg border border-white/5 text-on-surface font-mono text-center text-lg tracking-widest placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={6}
              />
              <PremiumButton
                variant="primary"
                onClick={handleJoinRoom}
                disabled={joinCode.length < 6}
              >
                Join
              </PremiumButton>
            </div>
          </PremiumCard>

          {/* Quick Play */}
          <PremiumCard hover className="p-6 cursor-pointer" onClick={() => {
            setRoomCode("QUICK")
            setIsHost(true)
            setTotalQuestions(5)
            setViewState("lobby")
          }}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-tertiary/20 to-tertiary-container/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-lg">Quick Play</h3>
                <p className="text-on-surface-variant">Start a solo practice quiz</p>
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
          players={demoPlayers}
          currentUserId={currentUserId}
          isHost={isHost}
          onStart={handleStartQuiz}
          onLeave={handleLeave}
          onToggleReady={() => {}}
          isReady={true}
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
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1] }}
            transition={{ duration: 0.5 }}
            className="text-8xl font-bold text-primary mb-4"
          >
            3
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1] }}
            transition={{ duration: 0.5, delay: 1 }}
            className="text-8xl font-bold text-secondary mb-4"
          >
            2
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1] }}
            transition={{ duration: 0.5, delay: 2 }}
            className="text-8xl font-bold text-tertiary mb-4"
          >
            1
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="text-2xl text-on-surface font-bold"
          >
            GO!
          </motion.p>
        </motion.div>
      )}

      {/* Quiz */}
      {viewState === "quiz" && currentQuestion && (
        <LiveQuiz
          question={currentQuestion}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          timeLimit={currentQuestion.timeLimit}
          players={demoPlayers}
          currentUserId={currentUserId}
          onAnswer={handleAnswer}
          onNextQuestion={handleNextQuestion}
          isHost={isHost}
          showResults={showResults}
        />
      )}

      {/* Results */}
      {viewState === "results" && (
        <QuizResults
          players={demoPlayers}
          currentUserId={currentUserId}
          onPlayAgain={() => {
            setDemoPlayers((prev) =>
              prev.map((p) => ({ ...p, score: 0, correctAnswers: 0, totalAnswers: 0, streak: 0 }))
            )
            setQuestionNumber(0)
            setShowResults(false)
            setViewState("lobby")
          }}
          onLeave={handleLeave}
        />
      )}
    </div>
  )
}
