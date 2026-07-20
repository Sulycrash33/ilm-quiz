"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"

export function RewardsPageClient({
  streakCount,
  longestStreak,
  streakFreezesAvailable,
  coins,
}: {
  streakCount: number
  longestStreak: number
  streakFreezesAvailable: number
  coins: number
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
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">Rewards Center</h1>
          <p className="text-on-surface-variant">Your real progress and streak status</p>
        </div>
        <div className="w-20" />
      </motion.div>

      {/* Real streak + coin data */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-8">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Your Streak</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="font-bold text-3xl text-primary">{streakCount}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">CURRENT STREAK</p>
          </div>
          <div>
            <p className="font-bold text-3xl text-secondary">{longestStreak}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">LONGEST STREAK</p>
          </div>
          <div>
            <p className="font-bold text-3xl text-tertiary">{streakFreezesAvailable}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">STREAK FREEZES</p>
          </div>
          <div>
            <p className="font-bold text-3xl text-primary-fixed">{coins.toLocaleString()}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">COINS</p>
          </div>
        </div>
      </motion.div>

      {/* Honest "coming soon" - no backing data model exists for these yet */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-8 text-center">
        <PremiumBadge variant="secondary" size="md" className="mb-4">Coming Soon</PremiumBadge>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Daily Login Rewards, Spin Wheel & Mystery Chests</h3>
        <p className="text-on-surface-variant max-w-xl mx-auto">
          These features aren&apos;t live yet - they need their own reward tracking behind the scenes before they can
          show real prizes instead of placeholders. Your streak and coins above are already real and update as you play.
        </p>
      </motion.div>
    </div>
  )
}
