"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumModal } from "@/components/ui/premium-modal"

interface Question {
  id: string
  text: string
  category: string
  difficulty: "easy" | "medium" | "hard"
  language: string
  status: "published" | "ai_drafted" | "rejected"
  choices: string[]
  correctIndex: number
  explanation: string
  createdAt: string
}

const initialQuestions: Question[] = [
  { id: "1", text: "What is the first pillar of Islam?", category: "Five Pillars", difficulty: "easy", language: "en", status: "published", choices: ["Salah", "Shahada", "Zakat", "Sawm"], correctIndex: 1, explanation: "The Shahada (declaration of faith) is the first pillar of Islam.", createdAt: "2 hours ago" },
  { id: "2", text: "Which Surah is known as the heart of the Quran?", category: "Holy Quran", difficulty: "medium", language: "en", status: "published", choices: ["Al-Fatiha", "Yasin", "Ar-Rahman", "Al-Kahf"], correctIndex: 1, explanation: "Surah Yasin is often referred to as the heart of the Quran.", createdAt: "4 hours ago" },
  { id: "3", text: "In which month was the Quran first revealed?", category: "Holy Quran", difficulty: "easy", language: "en", status: "published", choices: ["Muharram", "Ramadan", "Shawwal", "Dhul Qi'dah"], correctIndex: 1, explanation: "The Quran was first revealed in the month of Ramadan.", createdAt: "6 hours ago" },
  { id: "4", text: "What is the meaning of 'Bismillah'?", category: "Arabic Language", difficulty: "easy", language: "en", status: "ai_drafted", choices: ["In the name of Allah", "Praise be to Allah", "Allah is greatest", "There is no god but Allah"], correctIndex: 0, explanation: "Bismillah means 'In the name of Allah'.", createdAt: "8 hours ago" },
  { id: "5", text: "Who was the first Caliph of Islam?", category: "Islamic History", difficulty: "medium", language: "en", status: "published", choices: ["Umar ibn Al-Khattab", "Uthman ibn Affan", "Abu Bakr As-Siddiq", "Ali ibn Abi Talib"], correctIndex: 2, explanation: "Abu Bakr As-Siddiq was the first Caliph of Islam.", createdAt: "1 day ago" },
  { id: "6", text: "How many times a day are Muslims required to pray?", category: "Five Pillars", difficulty: "easy", language: "en", status: "published", choices: ["3", "4", "5", "6"], correctIndex: 2, explanation: "Muslims are required to pray 5 times a day.", createdAt: "1 day ago" },
  { id: "7", text: "What is the name of the angel who revealed the Quran to Prophet Muhammad?", category: "Islamic History", difficulty: "medium", language: "en", status: "ai_drafted", choices: ["Mika'il", "Israfil", "Jibril", "Azrael"], correctIndex: 2, explanation: "Angel Jibril (Gabriel) revealed the Quran to Prophet Muhammad.", createdAt: "2 days ago" },
  { id: "8", text: "What percentage of wealth is required for Zakat?", category: "Five Pillars", difficulty: "medium", language: "en", status: "rejected", choices: ["2.5%", "5%", "10%", "20%"], correctIndex: 0, explanation: "Zakat requires 2.5% of wealth above the nisab threshold.", createdAt: "3 days ago" },
]

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const categories = [...new Set(questions.map(q => q.category))]

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || q.category === filterCategory
    const matchesDifficulty = filterDifficulty === "all" || q.difficulty === filterDifficulty
    const matchesStatus = filterStatus === "all" || q.status === filterStatus
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus
  })

  const handleStatusChange = (questionId: string, newStatus: Question["status"]) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, status: newStatus } : q))
  }

  const handleDelete = (questionId: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      setQuestions(prev => prev.filter(q => q.id !== questionId))
    }
  }

  const getStatusBadge = (status: Question["status"]) => {
    switch (status) {
      case "published": return <PremiumBadge variant="success" size="sm">PUBLISHED</PremiumBadge>
      case "ai_drafted": return <PremiumBadge variant="warning" size="sm">DRAFT</PremiumBadge>
      case "rejected": return <PremiumBadge variant="danger" size="sm">REJECTED</PremiumBadge>
    }
  }

  const getDifficultyBadge = (difficulty: Question["difficulty"]) => {
    switch (difficulty) {
      case "easy": return <PremiumBadge variant="success" size="sm">EASY</PremiumBadge>
      case "medium": return <PremiumBadge variant="warning" size="sm">MEDIUM</PremiumBadge>
      case "hard": return <PremiumBadge variant="danger" size="sm">HARD</PremiumBadge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">
            Question Bank
          </h1>
          <p className="text-on-surface-variant mt-1">
            Search, filter, and manage all questions
          </p>
        </div>
        <PremiumButton variant="primary" href="/admin/review">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Generate Questions
        </PremiumButton>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-4"
      >
        <PremiumCard className="p-4 text-center">
          <p className="font-bold text-2xl text-primary">{questions.length}</p>
          <p className="text-sm text-on-surface-variant">Total Questions</p>
        </PremiumCard>
        <PremiumCard className="p-4 text-center">
          <p className="font-bold text-2xl text-green-400">{questions.filter(q => q.status === "published").length}</p>
          <p className="text-sm text-on-surface-variant">Published</p>
        </PremiumCard>
        <PremiumCard className="p-4 text-center">
          <p className="font-bold text-2xl text-tertiary">{questions.filter(q => q.status === "ai_drafted").length}</p>
          <p className="text-sm text-on-surface-variant">Drafts</p>
        </PremiumCard>
        <PremiumCard className="p-4 text-center">
          <p className="font-bold text-2xl text-error">{questions.filter(q => q.status === "rejected").length}</p>
          <p className="text-sm text-on-surface-variant">Rejected</p>
        </PremiumCard>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-4"
      >
        <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-lg border border-white/5 flex-1 min-w-[200px]">
          <svg className="w-4 h-4 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-on-surface placeholder:text-on-surface-variant/50 flex-1"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-surface-container-high rounded-lg border border-white/5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="px-4 py-2 bg-surface-container-high rounded-lg border border-white/5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-surface-container-high rounded-lg border border-white/5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="ai_drafted">Draft</option>
          <option value="rejected">Rejected</option>
        </select>
      </motion.div>

      {/* Questions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <AnimatePresence>
          {filteredQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.03 }}
            >
              <PremiumCard className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(question.status)}
                      {getDifficultyBadge(question.difficulty)}
                      <PremiumBadge variant="secondary" size="sm">{question.category}</PremiumBadge>
                      <PremiumBadge variant="secondary" size="sm">{question.language.toUpperCase()}</PremiumBadge>
                    </div>
                    <p className="font-bold text-on-surface mb-2">{question.text}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {question.choices.map((choice, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded-lg ${
                            i === question.correctIndex
                              ? "bg-primary/10 text-primary border border-primary/30"
                              : "bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          {i === question.correctIndex && <span className="mr-1">✓</span>}
                          {choice}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <PremiumButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedQuestion(question)
                        setIsModalOpen(true)
                      }}
                    >
                      View
                    </PremiumButton>
                    {question.status === "ai_drafted" && (
                      <PremiumButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(question.id, "published")}
                      >
                        <span className="text-green-400">Publish</span>
                      </PremiumButton>
                    )}
                    {question.status === "published" && (
                      <PremiumButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(question.id, "rejected")}
                      >
                        <span className="text-error">Reject</span>
                      </PremiumButton>
                    )}
                    <PremiumButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(question.id)}
                    >
                      <svg className="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </PremiumButton>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Question Detail Modal */}
      <PremiumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Question Details"
        size="lg"
      >
        {selectedQuestion && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {getStatusBadge(selectedQuestion.status)}
              {getDifficultyBadge(selectedQuestion.difficulty)}
              <PremiumBadge variant="secondary" size="sm">{selectedQuestion.category}</PremiumBadge>
            </div>
            <div className="p-4 bg-surface-container-high rounded-lg">
              <p className="font-bold text-on-surface text-lg">{selectedQuestion.text}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-on-surface-variant">Answer Choices:</p>
              {selectedQuestion.choices.map((choice, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg ${
                    i === selectedQuestion.correctIndex
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-surface-container-high"
                  }`}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                  {choice}
                  {i === selectedQuestion.correctIndex && (
                    <span className="ml-2 text-primary">(Correct)</span>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 bg-surface-container-high rounded-lg">
              <p className="text-sm font-medium text-on-surface-variant mb-1">Explanation:</p>
              <p className="text-on-surface">{selectedQuestion.explanation}</p>
            </div>
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Created: {selectedQuestion.createdAt}</span>
              <span>Language: {selectedQuestion.language.toUpperCase()}</span>
            </div>
            <div className="flex gap-3 pt-4">
              <PremiumButton variant="secondary" fullWidth onClick={() => setIsModalOpen(false)}>
                Close
              </PremiumButton>
              {selectedQuestion.status !== "published" && (
                <PremiumButton
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    handleStatusChange(selectedQuestion.id, "published")
                    setIsModalOpen(false)
                  }}
                >
                  Publish
                </PremiumButton>
              )}
            </div>
          </div>
        )}
      </PremiumModal>
    </div>
  )
}
