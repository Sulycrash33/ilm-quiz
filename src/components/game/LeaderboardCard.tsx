"use client"

import { motion } from "framer-motion"
import { PremiumAvatar } from "@/components/ui/premium-avatar"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { useLanguage } from "@/contexts/LanguageContext"

interface LeaderboardEntry {
  rank: number
  name: string
  /** Legacy remote URL. Kept because multiplayer still passes one. */
  avatar?: string
  /** The onboarding avatar id, e.g. "m-3" — what profiles actually store. */
  avatarId?: string | null
  xp: number
  streak: number
  isCurrentUser?: boolean
}

interface LeaderboardCardProps {
  entries: LeaderboardEntry[]
  title?: string
  showStreak?: boolean
}

export function LeaderboardCard({
  entries,
  title,
  showStreak = true,
}: LeaderboardCardProps) {
  const { t } = useLanguage()
  const cardTitle = title ?? t("globalLeaderboard")
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-2xl">🥇</span>
      case 2:
        return <span className="text-2xl">🥈</span>
      case 3:
        return <span className="text-2xl">🥉</span>
      default:
        return (
          <span className="font-bold text-on-surface-variant">#{rank}</span>
        )
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 border-yellow-500/30"
      case 2:
        return "bg-gray-300/10 border-gray-300/30"
      case 3:
        return "bg-amber-700/10 border-amber-700/30"
      default:
        return "bg-surface-container border-white/5"
    }
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline-md text-headline-md text-on-surface">
          {cardTitle}
        </h3>
        <PremiumBadge variant="tertiary">{t("liveBadge")}</PremiumBadge>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className={`
              p-4 rounded-xl border
              ${getRankColor(entry.rank)}
              ${entry.isCurrentUser ? "ring-2 ring-primary" : ""}
              transition-all duration-200
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>
                <PremiumAvatar src={entry.avatar} avatarId={entry.avatarId} size="md" />
                <div>
                  <p className="font-bold text-on-surface">{entry.name}</p>
                  {showStreak && (
                    <p className="text-sm text-on-surface-variant flex items-center gap-1">
                      <span className="text-tertiary">🔥</span>
                      {entry.streak} {t("dayStreakSuffix")}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{entry.xp.toLocaleString()} XP</p>
                {entry.rank <= 3 && (
                  <PremiumBadge variant={entry.rank === 1 ? "warning" : "primary"} size="sm">
                    {entry.rank === 1 ? t("championBadge") : entry.rank === 2 ? t("runnerUpBadge") : t("thirdPlaceBadge")}
                  </PremiumBadge>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
