"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState, useTransition, useEffect } from "react"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumCard } from "@/components/ui/premium-card"
import { claimDailyLogin, spinWheel, purchaseAndOpenChest } from "@/app/(app)/rewards/actions"

interface LoginReward {
  day_number: number
  coins: number
  xp: number
  is_special: boolean
}
interface ChestType {
  tier: string
  price_coins: number
  min_coins: number
  max_coins: number
  min_xp: number
  max_xp: number
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "now"
  const totalMinutes = Math.ceil(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

export function RewardsPageClient({
  streakCount,
  longestStreak,
  streakFreezesAvailable,
  coins: initialCoins,
  totalXp: initialXp,
  lastSpinAt,
  claimedToday: initialClaimedToday,
  currentDayNumber,
  loginRewards,
  chestTypes,
}: {
  streakCount: number
  longestStreak: number
  streakFreezesAvailable: number
  coins: number
  totalXp: number
  lastSpinAt: string | null
  claimedToday: boolean
  currentDayNumber: number
  loginRewards: LoginReward[]
  chestTypes: ChestType[]
}) {
  const [coins, setCoins] = useState(initialCoins)
  const [xp, setXp] = useState(initialXp)
  const [claimedToday, setClaimedToday] = useState(initialClaimedToday)
  const [message, setMessage] = useState<string | null>(null)
  const [spinAvailableAt, setSpinAvailableAt] = useState<string | null>(
    lastSpinAt ? new Date(new Date(lastSpinAt).getTime() + 4 * 60 * 60 * 1000).toISOString() : null
  )
  const [now, setNow] = useState(() => Date.now())
  const [isPending, startTransition] = useTransition()
  const [pendingAction, setPendingAction] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(interval)
  }, [])

  const spinReady = !spinAvailableAt || new Date(spinAvailableAt).getTime() <= now

  const handleClaim = () => {
    setPendingAction("claim")
    startTransition(async () => {
      const result = await claimDailyLogin()
      if (result.success) {
        setClaimedToday(true)
        setCoins((c) => c + (result.coinsAwarded ?? 0))
        setXp((x) => x + (result.xpAwarded ?? 0))
        setMessage(`Day ${result.dayNumber} claimed: +${result.coinsAwarded} coins, +${result.xpAwarded} XP`)
      } else if (result.alreadyClaimedToday) {
        setClaimedToday(true)
        setMessage("You've already claimed today's reward.")
      } else {
        setMessage(result.error ?? "Could not claim today's reward.")
      }
      setPendingAction(null)
    })
  }

  const handleSpin = () => {
    setPendingAction("spin")
    startTransition(async () => {
      const result = await spinWheel()
      if (result.success) {
        if (result.type === "coins") setCoins((c) => c + (result.value ?? 0))
        else setXp((x) => x + (result.value ?? 0))
        setSpinAvailableAt(new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString())
        setMessage(`You won ${result.label}!`)
      } else {
        if (result.nextAvailableAt) setSpinAvailableAt(result.nextAvailableAt)
        setMessage(result.error ?? "Could not spin right now.")
      }
      setPendingAction(null)
    })
  }

  const handleOpenChest = (tier: string) => {
    setPendingAction(`chest-${tier}`)
    startTransition(async () => {
      const result = await purchaseAndOpenChest(tier as "bronze" | "silver" | "gold" | "diamond")
      if (result.success) {
        const chest = chestTypes.find((c) => c.tier === tier)
        if (chest) setCoins((c) => c - chest.price_coins + (result.coinsAwarded ?? 0))
        setXp((x) => x + (result.xpAwarded ?? 0))
        setMessage(`Opened ${tier} chest: +${result.coinsAwarded} coins, +${result.xpAwarded} XP`)
      } else {
        setMessage(result.error ?? "Could not open that chest.")
      }
      setPendingAction(null)
    })
  }

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
          <p className="text-on-surface-variant">Real progress, real prizes</p>
        </div>
        <div className="flex items-center gap-2 bg-tertiary/10 px-4 py-2 rounded-full border border-tertiary/30">
          <span className="font-bold text-tertiary">{coins.toLocaleString()} coins</span>
        </div>
      </motion.div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center text-sm text-on-surface-variant">
          {message}
        </motion.div>
      )}

      {/* Streak stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-8">
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
            <p className="font-bold text-3xl text-primary-fixed">{xp.toLocaleString()}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">TOTAL XP</p>
          </div>
        </div>
      </motion.div>

      {/* Daily login rewards - real 7-day cycle */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 mb-8">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Daily Login Rewards</h2>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {loginRewards.map((r) => {
            const isPast = r.day_number < currentDayNumber || (r.day_number === currentDayNumber && claimedToday)
            const isToday = r.day_number === currentDayNumber && !claimedToday
            return (
              <div
                key={r.day_number}
                className={`rounded-lg p-2 text-center border ${
                  isPast
                    ? "bg-primary/20 border-primary/40"
                    : isToday
                      ? "bg-tertiary/20 border-tertiary/50 animate-pulse"
                      : "bg-surface-container-high border-white/5"
                }`}
              >
                <p className="text-xs text-on-surface-variant">Day {r.day_number}</p>
                <p className="text-sm font-bold text-on-surface">{r.coins}c</p>
                {isPast && <p className="text-xs text-primary">✓</p>}
              </div>
            )
          })}
        </div>
        <PremiumButton variant="primary" onClick={handleClaim} disabled={claimedToday || (isPending && pendingAction === "claim")}>
          {claimedToday ? "Claimed for Today" : isPending && pendingAction === "claim" ? "Claiming..." : `Claim Day ${currentDayNumber} Reward`}
        </PremiumButton>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Spin wheel - real, server-computed, cooldown-gated */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Free Spin</h2>
          <p className="text-on-surface-variant text-sm mb-4">One free spin every 4 hours for a real coin or XP prize.</p>
          <PremiumButton variant="primary" onClick={handleSpin} disabled={!spinReady || (isPending && pendingAction === "spin")}>
            {isPending && pendingAction === "spin"
              ? "Spinning..."
              : spinReady
                ? "Spin Now"
                : `Next spin in ${formatCountdown(new Date(spinAvailableAt!).getTime() - now)}`}
          </PremiumButton>
        </motion.div>

        {/* Mystery chests - real purchase + real reward roll */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Mystery Chests</h2>
          <div className="grid grid-cols-2 gap-3">
            {chestTypes.map((chest) => (
              <PremiumCard key={chest.tier} className="p-3 text-center">
                <p className="font-bold text-on-surface capitalize">{chest.tier}</p>
                <p className="text-xs text-on-surface-variant mb-2">
                  {chest.min_coins}-{chest.max_coins} coins
                </p>
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenChest(chest.tier)}
                  disabled={coins < chest.price_coins || (isPending && pendingAction === `chest-${chest.tier}`)}
                >
                  {isPending && pendingAction === `chest-${chest.tier}` ? "Opening..." : `${chest.price_coins} coins`}
                </PremiumButton>
              </PremiumCard>
            ))}
          </div>
        </motion.div>
      </div>

      <p className="text-xs text-on-surface-variant text-center">
        <PremiumBadge variant="secondary" size="sm" className="mr-2">Note</PremiumBadge>
        These are now real: claims, spins, and chest openings all persist to your account and can&apos;t be repeated by refreshing the page.
      </p>
    </div>
  )
}
