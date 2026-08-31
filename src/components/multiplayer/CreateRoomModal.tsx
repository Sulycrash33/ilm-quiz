"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumCard } from "@/components/ui/premium-card"
import { useLanguage } from "@/contexts/LanguageContext"

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateRoom: (config: {
    category: string
    difficulty: "easy" | "medium" | "hard"
    maxPlayers: number
    questionCount: number
  }) => void
  categories: { id: string; name: string; icon: string }[]
}

export function CreateRoomModal({ isOpen, onClose, onCreateRoom, categories }: CreateRoomModalProps) {
  const { t } = useLanguage()
  const difficultyLabels: Record<"easy" | "medium" | "hard", string> = { easy: t("easy"), medium: t("medium"), hard: t("hard") }
  const [category, setCategory] = useState(categories[0]?.id || "")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [questionCount, setQuestionCount] = useState(10)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md glass-card p-6"
      >
        <h2 className="font-headline-md text-headline-md text-on-surface mb-6">
          {t("createQuizRoomTitle")}
        </h2>

        {/* Category Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">{t("categoryLabel")}</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  category === cat.id
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-surface-container-high border-white/5 text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                <span className="text-xl block mb-1">{cat.icon}</span>
                <span className="text-xs">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">{t("difficultyLabel")}</label>
          <div className="grid grid-cols-3 gap-2">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`p-2 rounded-lg border text-center capitalize transition-all ${
                  difficulty === d
                    ? d === "easy"
                      ? "bg-success/20 border-success text-success"
                      : d === "medium"
                      ? "bg-warning/20 border-warning text-warning"
                      : "bg-danger/20 border-danger text-danger"
                    : "bg-surface-container-high border-white/5 text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                {difficultyLabels[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Max Players */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">{t("maxPlayersLabel")}</label>
          <div className="flex gap-2">
            {[2, 4, 6, 8].map((num) => (
              <button
                key={num}
                onClick={() => setMaxPlayers(num)}
                className={`flex-1 p-2 rounded-lg border text-center transition-all ${
                  maxPlayers === num
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-surface-container-high border-white/5 text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-on-surface mb-2">{t("questions")}</label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map((num) => (
              <button
                key={num}
                onClick={() => setQuestionCount(num)}
                className={`flex-1 p-2 rounded-lg border text-center transition-all ${
                  questionCount === num
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-surface-container-high border-white/5 text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <PremiumButton variant="secondary" fullWidth onClick={onClose}>
            {t("cancel")}
          </PremiumButton>
          <PremiumButton
            variant="primary"
            fullWidth
            onClick={() =>
              onCreateRoom({ category, difficulty, maxPlayers, questionCount })
            }
          >
            {t("createRoom")}
          </PremiumButton>
        </div>
      </motion.div>
    </div>
  )
}
