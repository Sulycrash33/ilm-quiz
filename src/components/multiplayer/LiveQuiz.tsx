"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useCallback } from "react"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumProgress } from "@/components/ui/premium-progress"

interface Question {
  id: string
  questionText: string
  choices: string[]
  timeLimit: number
}

interface Player {
  id: string
  userName: string
  score: number
  correctAnswers: number
  streak: number
}

interface LiveQuizProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  timeLimit: number
  players: Player[]
  currentUserId: string
  onAnswer: (selectedIndex: number, timeTaken: number) => void
  onNextQuestion: () => void
  isHost: boolean
  showResults: boolean
}

export function LiveQuiz({
  question,
  questionNumber,
  totalQuestions,
  timeLimit,
  players,
  currentUserId,
  onAnswer,
  onNextQuestion,
  isHost,
  showResults,
}: LiveQuizProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [showCorrect, setShowCorrect] = useState(false)

  useEffect(() => {
    setSelectedChoice(null)
    setTimeRemaining(timeLimit)
    setHasAnswered(false)
    setShowCorrect(false)
  }, [question.id, timeLimit])

  useEffect(() => {
    if (timeRemaining <= 0 || hasAnswered) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setHasAnswered(true)
          setShowCorrect(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, hasAnswered])

  const handleAnswer = useCallback(
    (index: number) => {
      if (hasAnswered) return
      setSelectedChoice(index)
      setHasAnswered(true)
      setShowCorrect(true)
      onAnswer(index, timeLimit - timeRemaining)
    },
    [hasAnswered, timeLimit, timeRemaining, onAnswer]
  )

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <PremiumBadge variant="primary" size="md">
            Question {questionNumber}/{totalQuestions}
          </PremiumBadge>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
            <span className={`font-bold text-lg ${timeRemaining <= 10 ? "text-error" : "text-on-surface"}`}>
              {timeRemaining}s
            </span>
          </div>
        </div>
        <PremiumBadge variant="warning" size="md">
          LIVE
        </PremiumBadge>
      </div>

      {/* Timer Bar */}
      <div className="mb-6">
        <PremiumProgress
          value={timeRemaining}
          max={timeLimit}
          size="md"
          variant={timeRemaining <= 10 ? "primary" : "secondary"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question & Choices */}
        <div className="lg:col-span-2">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-6"
          >
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6">
              {question.questionText}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.choices.map((choice, index) => {
                const isSelected = selectedChoice === index
                const isCorrect = showCorrect && index === 0 // Assuming correct index is 0 for demo

                return (
                  <motion.button
                    key={index}
                    whileHover={!hasAnswered ? { scale: 1.02 } : {}}
                    whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(index)}
                    disabled={hasAnswered}
                    className={`
                      p-4 rounded-xl border text-left transition-all
                      ${isSelected
                        ? "bg-primary/20 border-primary"
                        : isCorrect && showCorrect
                        ? "bg-green-500/20 border-green-500"
                        : "bg-surface-container-high border-white/5 hover:bg-surface-container-highest"
                      }
                      ${hasAnswered && !isSelected && !isCorrect ? "opacity-50" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold
                          ${isSelected
                            ? "bg-primary text-on-primary"
                            : isCorrect && showCorrect
                            ? "bg-green-500 text-white"
                            : "bg-surface-container-highest text-on-surface-variant"
                          }
                        `}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-on-surface">{choice}</span>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* Next Question Button (Host Only) */}
          {isHost && hasAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PremiumButton variant="primary" fullWidth onClick={onNextQuestion}>
                {questionNumber >= totalQuestions ? "See Results" : "Next Question"}
              </PremiumButton>
            </motion.div>
          )}
        </div>

        {/* Live Leaderboard */}
        <div>
          <PremiumCard className="p-4">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-3">
              LIVE LEADERBOARD
            </h3>
            <div className="space-y-2">
              {sortedPlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  layout
                  className={`
                    flex items-center justify-between p-2 rounded-lg
                    ${player.id === currentUserId
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-surface-container-high"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-6 text-center font-bold ${
                      index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-300" : index === 2 ? "text-amber-600" : "text-on-surface-variant"
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-sm text-on-surface truncate max-w-[100px]">
                      {player.userName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {player.streak >= 3 && (
                      <span className="text-xs text-tertiary">🔥{player.streak}</span>
                    )}
                    <span className="font-bold text-primary text-sm">
                      {player.score}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  )
}
