"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { LeaderboardCard } from "@/components/game/LeaderboardCard"
import { PremiumAvatar } from "@/components/ui/premium-avatar"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { useLanguage } from "@/contexts/LanguageContext"

interface Entry {
  rank: number
  userId: string
  name: string
  /** The avatar chosen at onboarding. The leaderboard never selected it, so
   *  the one screen where players compare themselves showed no faces. */
  avatarId: string | null
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
    <div dir={dir} className="min-h-[100dvh] px-5 py-6 max-w-7xl mx-auto">
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
              <PodiumSlot
                entry={podium[1]}
                place={2}
                avatarClass="w-20 h-20 border-medal-silver bg-gradient-to-br from-medal-silver/40 to-medal-silver/25"
                badgeClass="bg-medal-silver text-on-medal-silver"
                nameClass="text-sm"
                plinthClass="w-24 h-24 bg-gradient-to-b from-medal-silver/20 to-transparent"
              />

              <PodiumSlot
                entry={podium[0]}
                place={1}
                float
                avatarClass="w-24 h-24 border-medal-gold bg-gradient-to-br from-medal-gold/40 to-medal-gold/25 shadow-[0_0_30px_rgba(242,201,76,0.5)]"
                badgeClass="bg-medal-gold text-on-medal-gold"
                nameClass=""
                plinthClass="w-28 h-32 bg-gradient-to-b from-medal-gold/20 to-transparent"
              />

              <PodiumSlot
                entry={podium[2]}
                place={3}
                avatarClass="w-20 h-20 border-medal-bronze bg-gradient-to-br from-medal-bronze/40 to-medal-bronze/25"
                badgeClass="bg-medal-bronze text-on-medal-bronze"
                nameClass="text-sm"
                plinthClass="w-24 h-16 bg-gradient-to-b from-medal-bronze/20 to-transparent"
              />
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <LeaderboardCard
              entries={entries.map((e) => ({
                rank: e.rank,
                name: e.name,
                avatarId: e.avatarId,
                xp: e.xp,
                streak: e.streak,
                isCurrentUser: e.isCurrentUser,
              }))}
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

/**
 * One place on the podium.
 *
 * The three slots used to be near-identical blocks of markup differing only in
 * size and colour, each showing a large "1", "2" or "3" where the player's face
 * should be. The leaderboard is the one screen in the game whose entire purpose
 * is comparing yourself to other people, and it was the screen with no people
 * on it. The avatar takes the circle; the placing moves to a badge, which is
 * also where a podium puts it in real life.
 */
function PodiumSlot({
  entry,
  place,
  float = false,
  avatarClass,
  badgeClass,
  nameClass,
  plinthClass,
}: {
  entry: Entry
  place: number
  float?: boolean
  avatarClass: string
  badgeClass: string
  nameClass: string
  plinthClass: string
}) {
  const circle = (
    <div className={`relative rounded-full border-4 mx-auto mb-2 overflow-visible ${avatarClass}`}>
      <PremiumAvatar
        avatarId={entry.avatarId}
        size="lg"
        className="!block h-full w-full [&>div]:h-full [&>div]:w-full [&>div]:shadow-none"
      />
      <span
        className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ring-2 ring-background ${badgeClass}`}
      >
        {place}
      </span>
    </div>
  )

  return (
    <div className="text-center">
      {float ? (
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          {circle}
        </motion.div>
      ) : (
        circle
      )}
      <p className={`font-bold text-on-surface ${nameClass}`}>{entry.name.split(" ")[0]}</p>
      <p className={`text-on-surface-variant ${nameClass ? "text-xs" : "text-sm"}`}>
        {entry.xp.toLocaleString()} XP
      </p>
      <div className={`rounded-t-xl mt-2 ${plinthClass}`} />
    </div>
  )
}
