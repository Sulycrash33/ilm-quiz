"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"

const gameModes = [
  {
    id: "classic",
    name: "Classic Quiz",
    description: "Test your knowledge with standard multiple-choice questions",
    icon: "📝",
    color: "primary" as const,
    difficulty: "All Levels",
    xpMultiplier: "1x",
    available: true,
    href: "/quiz",
  },
  {
    id: "timed",
    name: "Speed Round",
    description: "Answer as many questions as you can before time runs out",
    icon: "⚡",
    color: "tertiary" as const,
    difficulty: "Intermediate",
    xpMultiplier: "1.5x",
    available: false,
  },
  {
    id: "survival",
    name: "Survival Mode",
    description: "Keep going until you get 3 wrong answers",
    icon: "🏆",
    color: "secondary" as const,
    difficulty: "Advanced",
    xpMultiplier: "2x",
    available: false,
  },
  {
    id: "practice",
    name: "Practice Mode",
    description: "Learn at your own pace with no pressure",
    icon: "🎯",
    color: "primary" as const,
    difficulty: "Beginner",
    xpMultiplier: "0.5x",
    available: false,
  },
  {
    id: "tournament",
    name: "Tournament",
    description: "Compete with other learners in real-time",
    icon: "👑",
    color: "warning" as const,
    difficulty: "Expert",
    xpMultiplier: "5x",
    available: true,
    href: "/multiplayer",
  },
]

export function GameModesPageClient({
  totalAttempts,
  accuracyPct,
  totalXp,
  todayChallenge,
}: {
  totalAttempts: number
  accuracyPct: number
  totalXp: number
  todayChallenge: { rewardCoins: number; rewardXp: number; completed: boolean } | null
}) {
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
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">Game Modes</h1>
          <p className="text-on-surface-variant">Choose your path to knowledge</p>
        </div>
        <div className="w-20" />
      </motion.div>

      {/* Daily Challenge feature card - real data */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-tertiary/10" />
        <div className="absolute top-0 right-0 w-64 h-64 mashrabiya-pattern rotate-12 opacity-30" />
        <div className="relative z-10">
          <PremiumBadge variant="warning" size="md" className="mb-4">TODAY&apos;S SPECIAL</PremiumBadge>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Daily Challenge</h2>
          {todayChallenge ? (
            <>
              <p className="text-on-surface-variant mb-4">
                {todayChallenge.completed ? "You've already completed today's challenge - come back tomorrow!" : "Complete today's special challenge for bonus rewards."}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.98-3.12 3.19z" />
                  </svg>
                  <span className="font-bold text-tertiary">+{todayChallenge.rewardCoins} coins, +{todayChallenge.rewardXp} XP</span>
                </div>
              </div>
              {!todayChallenge.completed && (
                <Link href="/quiz">
                  <PremiumButton variant="primary" size="lg">Start Daily Challenge</PremiumButton>
                </Link>
              )}
            </>
          ) : (
            <p className="text-on-surface-variant mb-4">No challenge is available today - check back soon.</p>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-6">All Game Modes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameModes.map((mode, index) => (
            <motion.div key={mode.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
              <PremiumCard hover={mode.available} className={`p-6 h-full ${!mode.available ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center">
                    <span className="text-3xl">{mode.icon}</span>
                  </div>
                  <PremiumBadge variant={mode.color} size="sm">{mode.difficulty}</PremiumBadge>
                </div>
                <h3 className="font-bold text-on-surface text-lg mb-2">{mode.name}</h3>
                <p className="text-on-surface-variant mb-4">{mode.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z" />
                    </svg>
                    <span className="font-bold text-primary">{mode.xpMultiplier} XP</span>
                  </div>
                  {mode.available && mode.href ? (
                    <Link href={mode.href}>
                      <PremiumButton variant="primary" size="sm">Play</PremiumButton>
                    </Link>
                  ) : (
                    <PremiumButton variant="secondary" size="sm" disabled>Coming Soon</PremiumButton>
                  )}
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Your Stats - real data */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12 glass-card p-6">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Your Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="font-bold text-3xl text-primary">{totalAttempts.toLocaleString()}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">QUESTIONS</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-3xl text-secondary">{totalAttempts > 0 ? `${accuracyPct}%` : "—"}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">ACCURACY</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-3xl text-primary-fixed">{totalXp.toLocaleString()}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">TOTAL XP</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
