"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { LeaderboardCard } from "@/components/game/LeaderboardCard"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"

const mockLeaderboard = [
  { rank: 1, name: "Ahmed Al-Rashid", xp: 15420, streak: 45, isCurrentUser: false },
  { rank: 2, name: "Fatima Zahra", xp: 14890, streak: 38, isCurrentUser: false },
  { rank: 3, name: "Omar Ibn Khattab", xp: 13750, streak: 32, isCurrentUser: false },
  { rank: 4, name: "Aisha Bint Abu Bakr", xp: 12340, streak: 28, isCurrentUser: true },
  { rank: 5, name: "Ali Ibn Abi Talib", xp: 11890, streak: 25, isCurrentUser: false },
  { rank: 6, name: "Khadijah Bint Khuwaylid", xp: 10560, streak: 22, isCurrentUser: false },
  { rank: 7, name: "Yusuf Ibn Muhammad", xp: 9870, streak: 18, isCurrentUser: false },
  { rank: 8, name: "Maryam Bint Imran", xp: 9230, streak: 15, isCurrentUser: false },
]

type TimeFrame = "daily" | "weekly" | "monthly" | "allTime"

export default function LeaderboardPage() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("weekly")

  return (
    <div className="min-h-screen px-5 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Link href="/home">
          <PremiumButton variant="ghost" size="sm" className="mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </PremiumButton>
        </Link>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">
          Community Leaderboard
        </h1>
        <p className="text-on-surface-variant mt-2">
          See who is leading the quest for knowledge
        </p>
      </motion.div>

      {/* Time Frame Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center gap-2 mb-8"
      >
        {(["daily", "weekly", "monthly", "allTime"] as TimeFrame[]).map((frame) => (
          <button
            key={frame}
            onClick={() => setTimeFrame(frame)}
            className={`
              px-4 py-2 rounded-lg font-label-caps text-label-caps uppercase tracking-widest
              transition-all duration-200
              ${timeFrame === frame
                ? "bg-primary text-on-primary"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }
            `}
          >
            {frame === "allTime" ? "All Time" : frame}
          </button>
        ))}
      </motion.div>

      {/* Top 3 Podium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center items-end gap-4 mb-12"
      >
        {/* 2nd Place */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center border-4 border-gray-300 mx-auto mb-2">
            <span className="text-3xl font-bold text-white">2</span>
          </div>
          <p className="font-bold text-on-surface text-sm">{mockLeaderboard[1].name.split(" ")[0]}</p>
          <p className="text-xs text-on-surface-variant">{mockLeaderboard[1].xp.toLocaleString()} XP</p>
          <div className="w-24 h-24 bg-gradient-to-b from-gray-300/20 to-transparent rounded-t-xl mt-2" />
        </div>

        {/* 1st Place */}
        <div className="text-center">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-4 border-yellow-400 mx-auto mb-2 shadow-[0_0_30px_rgba(255,200,0,0.5)]"
          >
            <span className="text-4xl font-bold text-white">1</span>
          </motion.div>
          <p className="font-bold text-on-surface">{mockLeaderboard[0].name.split(" ")[0]}</p>
          <p className="text-sm text-on-surface-variant">{mockLeaderboard[0].xp.toLocaleString()} XP</p>
          <div className="w-28 h-32 bg-gradient-to-b from-yellow-400/20 to-transparent rounded-t-xl mt-2" />
        </div>

        {/* 3rd Place */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center border-4 border-amber-700 mx-auto mb-2">
            <span className="text-3xl font-bold text-white">3</span>
          </div>
          <p className="font-bold text-on-surface text-sm">{mockLeaderboard[2].name.split(" ")[0]}</p>
          <p className="text-xs text-on-surface-variant">{mockLeaderboard[2].xp.toLocaleString()} XP</p>
          <div className="w-24 h-16 bg-gradient-to-b from-amber-700/20 to-transparent rounded-t-xl mt-2" />
        </div>
      </motion.div>

      {/* Full Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <LeaderboardCard entries={mockLeaderboard} title={`${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Rankings`} />
      </motion.div>

      {/* Your Rank Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 glass-card p-6 border border-primary/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center border-2 border-primary">
              <span className="text-xl font-bold text-primary">4</span>
            </div>
            <div>
              <p className="font-bold text-on-surface">Your Ranking</p>
              <p className="text-sm text-on-surface-variant">Keep learning to climb higher!</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-primary text-xl">12,340 XP</p>
            <PremiumBadge variant="warning" size="sm">+230 this week</PremiumBadge>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
