"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { AchievementCard } from "@/components/game/AchievementCard"
import { PremiumProgress } from "@/components/ui/premium-progress"
import type { AchievementView } from "@/lib/profile-stats"

type Tab = "achievements" | "challenges"

interface TodayChallenge {
  categoryName: string
  questionCount: number
  rewardCoins: number
  rewardXp: number
  completed: boolean
}

export function AchievementsPageClient({
  achievements,
  todayChallenge,
}: {
  achievements: AchievementView[]
  todayChallenge: TodayChallenge | null
}) {
  const [activeTab, setActiveTab] = useState<Tab>("achievements")

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="min-h-screen px-5 py-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <Link href="/home">
          <PremiumButton variant="ghost" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </PremiumButton>
        </Link>
        <div className="text-center">
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">Achievements & Challenges</h1>
          <p className="text-on-surface-variant">Track your progress and earn rewards</p>
        </div>
        <div className="w-20" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-8">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="font-bold text-3xl text-primary">{unlockedCount}/{achievements.length}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">UNLOCKED</p>
          </div>
          <div>
            <p className="font-bold text-3xl text-secondary">{todayChallenge ? 1 : 0}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">ACTIVE CHALLENGES</p>
          </div>
        </div>
        <div className="mt-4">
          <PremiumProgress value={unlockedCount} max={Math.max(achievements.length, 1)} showLabel label="Overall Progress" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-2 mb-8">
        {(["achievements", "challenges"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-caps text-label-caps uppercase tracking-widest transition-all duration-200 ${
              activeTab === tab ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            {tab === "achievements" ? "🏆" : "⚡"}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </motion.div>

      {activeTab === "achievements" ? (
        achievements.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center">
            <p className="text-on-surface-variant">No achievements have been set up yet - check back soon.</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div key={achievement.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <AchievementCard
                  title={achievement.name}
                  description={achievement.description}
                  icon={achievement.icon}
                  progress={achievement.progress}
                  maxProgress={achievement.target}
                  reward=""
                  isUnlocked={achievement.unlocked}
                  unlockedAt={achievement.earnedAt ? new Date(achievement.earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : undefined}
                />
              </motion.div>
            ))}
          </motion.div>
        )
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {!todayChallenge ? (
            <div className="glass-card p-8 text-center">
              <p className="text-on-surface-variant">No daily challenge is available today - check back soon.</p>
            </div>
          ) : (
            <PremiumCard className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-tertiary/20 to-tertiary-container/20 flex items-center justify-center">
                    <span className="text-3xl">📅</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg">Today&apos;s Challenge</h3>
                    <p className="text-on-surface-variant">{todayChallenge.questionCount} questions · {todayChallenge.categoryName}</p>
                  </div>
                </div>
                {todayChallenge.completed && <PremiumBadge variant="success" size="sm">Completed</PremiumBadge>}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.98-3.12 3.19z" />
                  </svg>
                  <span className="font-bold text-tertiary">+{todayChallenge.rewardCoins} coins, +{todayChallenge.rewardXp} XP</span>
                </div>
                {!todayChallenge.completed && (
                  <Link href="/quiz">
                    <PremiumButton variant="primary" size="sm">Start Challenge</PremiumButton>
                  </Link>
                )}
              </div>
            </PremiumCard>
          )}
        </motion.div>
      )}
    </div>
  )
}
