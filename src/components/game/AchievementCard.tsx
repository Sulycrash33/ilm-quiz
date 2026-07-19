"use client"

import { motion } from "framer-motion"
import { PremiumBadge } from "@/components/ui/premium-badge"

interface AchievementCardProps {
  title: string
  description: string
  icon: string
  progress: number
  maxProgress: number
  reward: string
  isUnlocked: boolean
  unlockedAt?: string
}

export function AchievementCard({
  title,
  description,
  icon,
  progress,
  maxProgress,
  reward,
  isUnlocked,
  unlockedAt,
}: AchievementCardProps) {
  const percentage = Math.min((progress / maxProgress) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isUnlocked ? { scale: 1.02 } : {}}
      className={`
        glass-card p-6 relative overflow-hidden
        ${isUnlocked ? "border border-primary/30" : ""}
      `}
    >
      {/* Unlocked Glow */}
      {isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            animate={isUnlocked ? { rotate: [0, -10, 10, 0] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className={`
              w-16 h-16 rounded-xl
              flex items-center justify-center
              ${isUnlocked
                ? "bg-gradient-to-br from-tertiary/20 to-tertiary-container/20"
                : "bg-surface-container-highest"
              }
            `}
          >
            <span className="text-3xl">{icon}</span>
          </motion.div>
          {isUnlocked && (
            <PremiumBadge variant="success" size="sm">
              UNLOCKED
            </PremiumBadge>
          )}
        </div>

        {/* Info */}
        <h4 className="font-bold text-on-surface mb-1">{title}</h4>
        <p className="text-sm text-on-surface-variant mb-4">{description}</p>

        {/* Progress */}
        {!isUnlocked && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-on-surface-variant">Progress</span>
              <span className="text-on-surface">{progress}/{maxProgress}</span>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary to-primary-fixed-dim rounded-full"
              />
            </div>
          </div>
        )}

        {/* Reward */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.98-3.12 3.19z" />
            </svg>
            <span className="font-bold text-tertiary">{reward}</span>
          </div>
          {unlockedAt && (
            <span className="text-xs text-on-surface-variant">
              {unlockedAt}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
