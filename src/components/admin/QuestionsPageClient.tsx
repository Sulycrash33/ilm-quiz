"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"

interface Question {
  id: string
  question_text: string
  difficulty: string
  review_status: string
  choices: string[]
  correct_choice_index: number
  explanation: string | null
  created_at: string
  categories: { name: string } | null
}

interface QuestionsPageClientProps {
  questions: Question[]
}

export function QuestionsPageClient({ questions }: QuestionsPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || q.review_status === filterStatus
    return matchesSearch && matchesStatus
  })

  const statusColors: Record<string, string> = {
    published: "bg-emerald-400/10 text-emerald-400",
    ai_drafted: "bg-blue-400/10 text-blue-400",
    rejected: "bg-red-400/10 text-red-400",
  }

  return (
    <div className="min-h-screen px-5 py-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-2">
          Question Bank
        </h1>
        <p className="text-on-surface-variant">
          {questions.length} total questions
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-surface-container border border-white/10 rounded-lg text-on-surface placeholder:text-on-surface-variant/50"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-surface-container border border-white/10 rounded-lg text-on-surface"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="ai_drafted">AI Drafted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <PremiumCard className="p-8 text-center">
            <p className="text-on-surface-variant">No questions found.</p>
          </PremiumCard>
        ) : (
          filteredQuestions.map((question) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PremiumCard className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-on-surface mb-2">{question.question_text}</h3>
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <span>{question.categories?.name ?? "Unknown Category"}</span>
                      <span>•</span>
                      <span className="capitalize">{question.difficulty}</span>
                      <span>•</span>
                      <span>{question.choices?.length ?? 0} choices</span>
                    </div>
                  </div>
                  <PremiumBadge className={statusColors[question.review_status] ?? "bg-gray-400/10 text-gray-400"}>
                    {question.review_status}
                  </PremiumBadge>
                </div>
              </PremiumCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
