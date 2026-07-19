"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { AchievementCard } from "@/components/game/AchievementCard"
import { PremiumProgress } from "@/components/ui/premium-progress"

const achievements = [
  { id: "1", title: "First Steps", description: "Complete your first quiz", icon: "🌱", progress: 1, maxProgress: 1, reward: "+50 XP", isUnlocked: true, unlockedAt: "Jan 15, 2024" },
  { id: "2", title: "Streak Master", description: "Maintain a 7-day learning streak", icon: "🔥", progress: 7, maxProgress: 7, reward: "+100 XP", isUnlocked: true, unlockedAt: "Jan 20, 2024" },
  { id: "3", title: "Quran Scholar", description: "Answer 100 Quran questions correctly", icon: "📖", progress: 100, maxProgress: 100, reward: "+500 XP", isUnlocked: true, unlockedAt: "Jan 25, 2024" },
  { id: "4", title: "Community Helper", description: "Help 10 fellow learners", icon: "🤝", progress: 7, maxProgress: 10, reward: "+200 XP", isUnlocked: false },
  { id: "5", title: "Perfect Score", description: "Achieve 100% accuracy in a quiz", icon: "💯", progress: 1, maxProgress: 1, reward: "+150 XP", isUnlocked: true, unlockedAt: "Jan 18, 2024" },
  { id: "6", title: "Knowledge Seeker", description: "Complete 5 categories", icon: "🎯", progress: 3, maxProgress: 5, reward: "+300 XP", isUnlocked: false },
  { id: "7", title: "Speed Demon", description: "Complete a quiz in under 2 minutes", icon: "⚡", progress: 0, maxProgress: 1, reward: "+250 XP", isUnlocked: false },
  { id: "8", title: "Night Owl", description: "Study past midnight", icon: "🦉", progress: 0, maxProgress: 1, reward: "+100 XP", isUnlocked: false },
  { id: "9", title: "Social Butterfly", description: "Join 3 study circles", icon: "🦋", progress: 1, maxProgress: 3, reward: "+150 XP", isUnlocked: false },
  { id: "10", title: "Collector", description: "Earn 10 different achievements", icon: "🏆", progress: 5, maxProgress: 10, reward: "+1000 XP", isUnlocked: false },
  { id: "11", title: "Scholar", description: "Reach level 20", icon: "🎓", progress: 12, maxProgress: 20, reward: "+750 XP", isUnlocked: false },
  { id: "12", title: "Legend", description: "Reach the top 10 global leaderboard", icon: "👑", progress: 0, maxProgress: 1, reward: "+5000 XP", isUnlocked: false },
]

const challenges = [
  { id: "1", title: "Weekly Challenge", description: "Complete 50 questions this week", icon: "📅", progress: 35, maxProgress: 50, reward: "+500 XP", isUnlocked: false, timeLeft: "3 days" },
  { id: "2", title: "Month Master", description: "Study every day this month", icon: "🗓️", progress: 15, maxProgress: 30, reward: "+1000 XP", isUnlocked: false, timeLeft: "15 days" },
  { id: "3", title: "Quiz Marathon", description: "Complete 10 quizzes in a row", icon: "🏃", progress: 6, maxProgress: 10, reward: "+750 XP", isUnlocked: false, timeLeft: "5 days" },
]

type Tab = "achievements" | "challenges"

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("achievements")

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length
  const totalXP = achievements.filter((a) => a.isUnlocked).length * 150

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
            Achievements & Challenges
          </h1>
          <p className="text-on-surface-variant">Track your progress and earn rewards</p>
        </div>
        <div className="w-20" />
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-8"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-bold text-3xl text-primary">{unlockedCount}/{achievements.length}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">
              UNLOCKED
            </p>
          </div>
          <div>
            <p className="font-bold text-3xl text-tertiary">{totalXP}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">
              XP EARNED
            </p>
          </div>
          <div>
            <p className="font-bold text-3xl text-secondary">{challenges.length}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">
              ACTIVE CHALLENGES
            </p>
          </div>
        </div>
        <div className="mt-4">
          <PremiumProgress value={unlockedCount} max={achievements.length} showLabel label="Overall Progress" />
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-8"
      >
        {(["achievements", "challenges"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              font-label-caps text-label-caps uppercase tracking-widest
              transition-all duration-200
              ${activeTab === tab
                ? "bg-primary text-on-primary"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }
            `}
          >
            {tab === "achievements" ? "🏆" : "⚡"}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      {activeTab === "achievements" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <AchievementCard {...achievement} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PremiumCard className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-tertiary/20 to-tertiary-container/20 flex items-center justify-center">
                      <span className="text-3xl">{challenge.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface text-lg">{challenge.title}</h3>
                      <p className="text-on-surface-variant">{challenge.description}</p>
                    </div>
                  </div>
                  <PremiumBadge variant="warning" size="sm">
                    {challenge.timeLeft} left
                  </PremiumBadge>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface-variant">Progress</span>
                    <span className="text-on-surface font-bold">{challenge.progress}/{challenge.maxProgress}</span>
                  </div>
                  <PremiumProgress value={challenge.progress} max={challenge.maxProgress} size="lg" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.98-3.12 3.19z" />
                    </svg>
                    <span className="font-bold text-tertiary">{challenge.reward}</span>
                  </div>
                  <PremiumButton variant="primary" size="sm">
                    {challenge.progress >= challenge.maxProgress ? "Claim Reward" : "Continue"}
                  </PremiumButton>
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
