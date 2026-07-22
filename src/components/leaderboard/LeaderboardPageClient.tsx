"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { LeaderboardCard } from "@/components/game/LeaderboardCard"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { useLanguage } from "@/contexts/LanguageContext"

interface Entry {
  rank: number
  userId: string
  name: string
  xp: number
  streak: number
  isCurrentUser: boolean
}

type TimeFrame = "weekly" | "allTime"

export function LeaderboardPageClient({
  allTime,
  weekly,
  myAllTimeRank,
  myWeeklyRank,
}: {
  allTime: Entry[]
  weekly: Entry[]
  myAllTimeRank: Entry | null
  myWeeklyRank: Entry | null
}) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("allTime")
  const { t, dir } = useLanguage()
  const entries = timeFrame === "allTime" ? allTime : weekly
  const myRank = timeFrame === "allTime" ? myAllTimeRank : myWeeklyRank
  const podium = entries.slice(0, 3)

  return (
    <div dir={dir} className="min-h-screen px-5 py-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <Link href="/home">
          <PremiumButton variant="ghost" size="sm" className="mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("backToDashboard")}
          </PremiumButton>
        </Link>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">{t("communityLeaderboard")}</h1>
        <p className="text-on-surface-variant mt-2">{t("seeWhoIsLeading")}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex justify-center gap-2 mb-8">
        {(["allTime", "weekly"] as TimeFrame[]).map((frame) => (
          <button
            key={frame}
            onClick={() => setTimeFrame(frame)}
            className={`px-4 py-2 rounded-lg font-label-caps text-label-caps uppercase tracking-widest transition-all duration-200 ${
              timeFrame === frame ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            {frame === "allTime" ? t("allTimeShort") : t("thisWeekShort")}
          </button>
        ))}
      </motion.div>

      {entries.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center">
          <p className="text-on-surface-variant">
            {timeFrame === "weekly" ? t("noWeeklyXpYet") : t("noPlayersYet")}
          </p>
        </motion.div>
      ) : (
        <>
          {podium.length === 3 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center items-end gap-4 mb-12">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center border-4 border-gray-300 mx-auto mb-2">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <p className="font-bold text-on-surface text-sm">{podium[1].name.split(" ")[0]}</p>
                <p className="text-xs text-on-surface-variant">{podium[1].xp.toLocaleString()} XP</p>
                <div className="w-24 h-24 bg-gradient-to-b from-gray-300/20 to-transparent rounded-t-xl mt-2" />
              </div>

              <div className="text-center">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-4 border-yellow-400 mx-auto mb-2 shadow-[0_0_30px_rgba(255,200,0,0.5)]"
                >
                  <span className="text-4xl font-bold text-white">1</span>
                </motion.div>
                <p className="font-bold text-on-surface">{podium[0].name.split(" ")[0]}</p>
                <p className="text-sm text-on-surface-variant">{podium[0].xp.toLocaleString()} XP</p>
                <div className="w-28 h-32 bg-gradient-to-b from-yellow-400/20 to-transparent rounded-t-xl mt-2" />
              </div>

              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center border-4 border-amber-700 mx-auto mb-2">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <p className="font-bold text-on-surface text-sm">{podium[2].name.split(" ")[0]}</p>
                <p className="text-xs text-on-surface-variant">{podium[2].xp.toLocaleString()} XP</p>
                <div className="w-24 h-16 bg-gradient-to-b from-amber-700/20 to-transparent rounded-t-xl mt-2" />
              </div>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <LeaderboardCard
              entries={entries.map((e) => ({ rank: e.rank, name: e.name, xp: e.xp, streak: e.streak, isCurrentUser: e.isCurrentUser }))}
              title={timeFrame === "allTime" ? t("allTimeRankings") : t("weeklyRankings")}
            />
          </motion.div>
        </>
      )}

      {myRank && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 glass-card p-6 border border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center border-2 border-primary">
                <span className="text-xl font-bold text-primary">{myRank.rank}</span>
              </div>
              <div>
                <p className="font-bold text-on-surface">{t("yourRanking")}</p>
                <p className="text-sm text-on-surface-variant">{t("keepLearning")}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary text-xl">{myRank.xp.toLocaleString()} XP</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
