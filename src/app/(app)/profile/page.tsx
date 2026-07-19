"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumAvatar } from "@/components/ui/premium-avatar"
import { PremiumProgress } from "@/components/ui/premium-progress"
import { PremiumStat } from "@/components/ui/premium-stat"
import { AchievementCard } from "@/components/game/AchievementCard"
import { ActivityFeed } from "@/components/game/ActivityFeed"

const userData = {
  name: "Zainab Zawu",
  email: "zainab@ilmhunt.com",
  location: "Maiduguri, Nigeria",
  joinDate: "Jan 2024",
  avatar: "https://picsum.photos/seed/zainab/200",
  rank: "Talib",
  totalXp: 8420,
  streak: 7,
  globalRank: 47,
  accuracy: 87,
  coins: 1250,
  level: 12,
  xpToNextLevel: 1000,
  currentXp: 750,
}

const achievements = [
  { id: "1", title: "First Steps", description: "Completed first quiz", icon: "🌱", progress: 1, maxProgress: 1, reward: "+50 XP", isUnlocked: true, unlockedAt: "Jan 15, 2024" },
  { id: "2", title: "Streak Master", description: "7-day learning streak", icon: "🔥", progress: 7, maxProgress: 7, reward: "+100 XP", isUnlocked: true, unlockedAt: "Jan 20, 2024" },
  { id: "3", title: "Quran Scholar", description: "100 Quran questions correct", icon: "📖", progress: 100, maxProgress: 100, reward: "+500 XP", isUnlocked: true, unlockedAt: "Jan 25, 2024" },
  { id: "4", title: "Community Helper", description: "Helped 10 fellow learners", icon: "🤝", progress: 7, maxProgress: 10, reward: "+200 XP", isUnlocked: false },
  { id: "5", title: "Perfect Score", description: "100% accuracy in a quiz", icon: "💯", progress: 1, maxProgress: 1, reward: "+150 XP", isUnlocked: true, unlockedAt: "Jan 18, 2024" },
  { id: "6", title: "Knowledge Seeker", description: "Completed 5 categories", icon: "🎯", progress: 3, maxProgress: 5, reward: "+300 XP", isUnlocked: false },
]

const activities = [
  { id: "1", user: { name: "Ahmed", avatar: "https://picsum.photos/seed/ahmed/100" }, action: "completed", target: "Hadith Sciences quiz", timestamp: "2 hours ago", type: "quiz" as const },
  { id: "2", user: { name: "You", avatar: "https://picsum.photos/seed/zainab/100" }, action: "earned", target: "7-day streak", timestamp: "1 day ago", type: "streak" as const },
  { id: "3", user: { name: "Fatima", avatar: "https://picsum.photos/seed/fatima/100" }, action: "joined", target: "Quran Study Circle", timestamp: "2 days ago", type: "join" as const },
  { id: "4", user: { name: "Omar", avatar: "https://picsum.photos/seed/omar/100" }, action: "unlocked", target: "Perfect Score badge", timestamp: "3 days ago", type: "achievement" as const },
]

const stats = [
  { label: "Total XP", value: userData.totalXp.toLocaleString(), trend: "up" as const, trendValue: "+230 this week" },
  { label: "Day Streak", value: userData.streak, trend: "up" as const, trendValue: "Personal best!" },
  { label: "Global Rank", value: `#${userData.globalRank}`, trend: "up" as const, trendValue: "+5 positions" },
  { label: "Accuracy", value: `${userData.accuracy}%`, trend: "up" as const, trendValue: "+2% this week" },
]

type Tab = "overview" | "achievements" | "statistics" | "activity"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview")

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg> },
    { id: "achievements", label: "Achievements", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" /></svg> },
    { id: "statistics", label: "Statistics", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" /></svg> },
    { id: "activity", label: "Activity", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 9V3.5L18.5 9M6 2c-1.11 0-2 .89-2 2v16c0 1.11.89 2 2 2h12c1.11 0 2-.89 2-2V8l-6-6H6z" /></svg> },
  ]

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
        <div className="flex gap-2">
          <PremiumButton variant="secondary" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </PremiumButton>
          <PremiumButton variant="secondary" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </PremiumButton>
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8 mb-8"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="relative">
            <PremiumAvatar src={userData.avatar} size="xl" ring ringColor="primary" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute -top-2 -right-2"
            >
              <PremiumBadge variant="warning" size="sm">
                LVL {userData.level}
              </PremiumBadge>
            </motion.div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
              <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">
                {userData.name}
              </h1>
              <PremiumButton variant="ghost" size="sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </PremiumButton>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start mb-4 text-on-surface-variant">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                {userData.location}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                </svg>
                Joined {userData.joinDate}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => (
                <PremiumStat key={index} {...stat} />
              ))}
            </div>

            {/* Level Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-on-surface-variant">Progress to Level {userData.level + 1}</span>
                <span className="font-bold text-on-surface">{userData.currentXp}/{userData.xpToNextLevel} XP</span>
              </div>
              <PremiumProgress value={userData.currentXp} max={userData.xpToNextLevel} size="lg" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-8 overflow-x-auto pb-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              font-label-caps text-label-caps uppercase tracking-widest
              transition-all duration-200 whitespace-nowrap
              ${activeTab === tab.id
                ? "bg-primary text-on-primary"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <PremiumCard className="p-6">
              <h3 className="font-headline-md text-headline-md text-primary mb-4">Learning Progress</h3>
              <div className="space-y-4">
                {[
                  { name: "Holy Quran", progress: 85, questions: 156 },
                  { name: "Hadith Sciences", progress: 72, questions: 98 },
                  { name: "Five Pillars", progress: 100, questions: 45 },
                  { name: "Islamic History", progress: 45, questions: 67 },
                ].map((category, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-on-surface">{category.name}</span>
                      <span className="text-on-surface-variant">{category.questions} questions</span>
                    </div>
                    <PremiumProgress value={category.progress} size="sm" />
                  </div>
                ))}
              </div>
            </PremiumCard>

            <PremiumCard className="p-6">
              <h3 className="font-headline-md text-headline-md text-primary mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                {achievements.filter(a => a.isUnlocked).slice(0, 3).map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-surface-container-high/50 rounded-lg">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-on-surface">{achievement.title}</p>
                      <p className="text-sm text-on-surface-variant">{achievement.description}</p>
                    </div>
                    <PremiumBadge variant="success" size="sm">{achievement.unlockedAt}</PremiumBadge>
                  </div>
                ))}
              </div>
            </PremiumCard>
          </motion.div>
        )}

        {activeTab === "achievements" && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {achievements.map((achievement, index) => (
              <AchievementCard key={achievement.id} {...achievement} />
            ))}
          </motion.div>
        )}

        {activeTab === "statistics" && (
          <motion.div
            key="statistics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <PremiumCard className="p-6">
              <h3 className="font-headline-md text-headline-md text-primary mb-4">Category Performance</h3>
              <div className="space-y-4">
                {[
                  { name: "Holy Quran", progress: 85, questions: 156 },
                  { name: "Hadith Sciences", progress: 72, questions: 98 },
                  { name: "Five Pillars", progress: 100, questions: 45 },
                  { name: "Islamic History", progress: 45, questions: 67 },
                ].map((category, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-on-surface">{category.name}</span>
                      <span className="text-on-surface-variant">{category.progress}% mastery</span>
                    </div>
                    <PremiumProgress value={category.progress} size="sm" />
                  </div>
                ))}
              </div>
            </PremiumCard>

            <PremiumCard className="p-6">
              <h3 className="font-headline-md text-headline-md text-primary mb-4">Learning Streaks</h3>
              <div className="text-center mb-6">
                <p className="font-bold text-5xl text-primary mb-2">{userData.streak}</p>
                <p className="text-on-surface-variant">Current Streak</p>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-6">
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`h-10 rounded-lg ${i < userData.streak ? "bg-primary/60" : "bg-surface-container-highest"}`}
                  />
                ))}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Longest Streak</span>
                  <span className="font-bold text-on-surface">12 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Total Active Days</span>
                  <span className="font-bold text-on-surface">28 days</span>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ActivityFeed activities={activities} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
