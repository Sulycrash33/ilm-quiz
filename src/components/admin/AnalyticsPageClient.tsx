"use client"

import { motion } from "framer-motion"
import { PremiumCard } from "@/components/ui/premium-card"

interface AnalyticsPageClientProps {
  stats: {
    totalAttempts: number
    accuracy: number
  }
  categoryStats: {
    id: string
    name: string
    questions: { count: number }[]
  }[]
}

export function AnalyticsPageClient({ stats, categoryStats }: AnalyticsPageClientProps) {
  return (
    <div className="min-h-[100dvh] px-5 py-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-2">
          Analytics
        </h1>
        <p className="text-on-surface-variant">
          Platform performance metrics
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Quizzes", value: stats.totalAttempts.toLocaleString(), icon: "📝" },
          { label: "Accuracy Rate", value: `${stats.accuracy}%`, icon: "🎯" },
          { label: "Categories", value: categoryStats.length.toString(), icon: "📚" },
          { label: "Questions", value: categoryStats.reduce((sum, c) => sum + (c.questions?.[0]?.count ?? 0), 0).toString(), icon: "❓" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PremiumCard className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="font-bold text-2xl text-primary">{stat.value}</p>
                  <p className="text-sm text-on-surface-variant">{stat.label}</p>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      {/* Category Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Category Performance</h2>
        <div className="glass-card p-6">
          {categoryStats.length === 0 ? (
            <p className="text-on-surface-variant text-center py-4">No category data yet.</p>
          ) : (
            <div className="space-y-4">
              {categoryStats.map((category) => {
                const questionCount = category.questions?.[0]?.count ?? 0
                const maxQuestions = Math.max(...categoryStats.map(c => c.questions?.[0]?.count ?? 0))
                const percentage = maxQuestions > 0 ? Math.round((questionCount / maxQuestions) * 100) : 0

                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-on-surface">{category.name}</span>
                      <span className="text-sm text-on-surface-variant">{questionCount} questions</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary-fixed-dim rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
