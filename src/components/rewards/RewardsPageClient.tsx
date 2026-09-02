"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState, useTransition, useEffect } from "react"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumCard } from "@/components/ui/premium-card"
import {
  claimDailyLogin,
  spinWheel,
  purchaseAndOpenChest,
  type SpinResult,
} from "@/app/(app)/rewards/actions"
import { SpinWheel, type SpinSegment } from "@/components/rewards/SpinWheel"
import { useLanguage } from "@/contexts/LanguageContext"
import type { Translations } from "@/lib/i18n"

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

/**
 * How long the wheel actually stays locked, in milliseconds.
 *
 * **Twenty-four hours, not four.** This file used to say four in two places and
 * the copy said "every 4 hours" in all six languages, while `spin_wheel_rpc`
 * has refused anything inside twenty-four hours since migration 0008 — which
 * describes the wheel as a "once-a-day cadence" and means it. So the countdown
 * ran to zero, invited the player to spin, and the server answered "Come back
 * later for today's gift." The promise was wrong, not the cooldown; the copy
 * moved to match the database rather than the other way round.
 *
 * One constant, because the two places that had the number disagreed with the
 * server independently and would have drifted again.
 */
const SPIN_COOLDOWN_MS = 24 * 60 * 60 * 1000

const CHEST_NAME_KEYS: Record<string, keyof Translations> = {
  bronze: "chestBronze",
  silver: "chestSilver",
  gold: "chestGold",
  diamond: "chestDiamond",
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
  spinRewards,
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
  spinRewards: SpinSegment[]
}) {
  const { t, dir } = useLanguage()
  const [coins, setCoins] = useState(initialCoins)
  const [xp, setXp] = useState(initialXp)
  const [claimedToday, setClaimedToday] = useState(initialClaimedToday)
  const [message, setMessage] = useState<string | null>(null)
  const [spinAvailableAt, setSpinAvailableAt] = useState<string | null>(
    lastSpinAt ? new Date(new Date(lastSpinAt).getTime() + SPIN_COOLDOWN_MS).toISOString() : null
  )
  const [now, setNow] = useState(() => Date.now())
  const [isPending, startTransition] = useTransition()
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  /** The segment the wheel is travelling to, or null when it is at rest. */
  const [spinTarget, setSpinTarget] = useState<number | null>(null)
  /** The awarded prize, held back until the wheel stops so it is not spoiled. */
  const [pendingSpin, setPendingSpin] = useState<SpinResult | null>(null)
  /** Bumped once per spin so an identical target still starts the wheel. */
  const [spinToken, setSpinToken] = useState(0)

  /**
   * Once a second, not once every thirty.
   *
   * At a thirty-second interval the countdown below sat on the same
   * "4h 0m" for half a minute at a time, which reads as a frozen screen
   * rather than a wait — there was no way to tell a running timer from a
   * hung one. A seconds field only helps if something moves it.
   */
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  /**
   * `floor`, not `ceil`, and always a seconds field.
   *
   * The old version rounded up to whole minutes, so a wait of twelve seconds
   * displayed as "1m" and stayed there — the last minute of every countdown
   * was a full minute of a number that never changed, immediately before the
   * button was supposed to come alive. Seconds are zero-padded so the width
   * does not jitter as they count down.
   */
  const formatCountdown = (ms: number): string => {
    if (ms <= 0) return t("countdownNow")
    const total = Math.floor(ms / 1000)
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const seconds = total % 60
    const pad = (n: number) => String(n).padStart(2, "0")
    return hours > 0 ? `${hours}h ${pad(minutes)}m ${pad(seconds)}s` : `${minutes}m ${pad(seconds)}s`
  }

  const spinReady = !spinAvailableAt || new Date(spinAvailableAt).getTime() <= now

  const handleClaim = () => {
    setPendingAction("claim")
    startTransition(async () => {
      const result = await claimDailyLogin()
      if (result.success) {
        setClaimedToday(true)
        setCoins((c) => c + (result.coinsAwarded ?? 0))
        setXp((x) => x + (result.xpAwarded ?? 0))
        setMessage(t("claimSuccessMsg", { day: result.dayNumber ?? "", coins: result.coinsAwarded ?? 0, xp: result.xpAwarded ?? 0 }))
      } else if (result.alreadyClaimedToday) {
        setClaimedToday(true)
        setMessage(t("alreadyClaimedMsg"))
      } else {
        setMessage(result.error ?? t("claimErrorMsg"))
      }
      setPendingAction(null)
    })
  }

  /**
   * The prize is awarded before the wheel moves, and revealed after it stops.
   *
   * `spin_wheel_rpc` picks, awards and records in one call, so by the time the
   * animation starts the coins are already on the profile. That ordering is
   * deliberate and not reversible: the server cannot be asked to "confirm"
   * afterwards without opening a window where a player who closes the tab
   * mid-spin has been shown a prize they were never paid.
   *
   * What it costs is that the totals in the header would give the answer away
   * four seconds early, so the balance updates are held in `pendingSpin` and
   * applied by `handleSpinSettled` when the wheel comes to rest. Nothing is at
   * risk in that gap — the money is already banked; only the reveal is
   * waiting.
   */
  const handleSpin = () => {
    setPendingAction("spin")
    setMessage(null)
    startTransition(async () => {
      const result = await spinWheel()
      if (result.success) {
        // Matched on type and value rather than on the label, because the
        // label is English text from the database and the segment captions are
        // built from the numbers so they can be translated.
        const index = spinRewards.findIndex(
          (r) => r.type === result.type && r.value === result.value,
        )
        setPendingSpin(result)
        // A prize the wheel has no segment for cannot be landed on. It should
        // not happen — both come from `spin_rewards` — but a silent no-op that
        // leaves the player watching a still wheel forever is the worse
        // failure, so the reveal skips straight to the sentence.
        if (index === -1) {
          setSpinTarget(null)
          applySpinResult(result)
        } else {
          setSpinTarget(index)
          setSpinToken((n) => n + 1)
        }
      } else {
        if (result.nextAvailableAt) setSpinAvailableAt(result.nextAvailableAt)
        setMessage(result.error ?? t("spinErrorMsg"))
        setPendingAction(null)
      }
    })
  }

  const applySpinResult = (result: SpinResult) => {
    if (result.type === "coins") setCoins((c) => c + (result.value ?? 0))
    else setXp((x) => x + (result.value ?? 0))
    setSpinAvailableAt(new Date(Date.now() + SPIN_COOLDOWN_MS).toISOString())
    setMessage(t("spinWonMsg", { label: result.label ?? "" }))
    setPendingSpin(null)
    setPendingAction(null)
  }

  const handleSpinSettled = () => {
    if (pendingSpin) applySpinResult(pendingSpin)
  }

  const handleOpenChest = (tier: string) => {
    setPendingAction(`chest-${tier}`)
    startTransition(async () => {
      const result = await purchaseAndOpenChest(tier as "bronze" | "silver" | "gold" | "diamond")
      if (result.success) {
        const chest = chestTypes.find((c) => c.tier === tier)
        if (chest) setCoins((c) => c - chest.price_coins + (result.coinsAwarded ?? 0))
        setXp((x) => x + (result.xpAwarded ?? 0))
        setMessage(t("chestOpenedMsg", { tier: CHEST_NAME_KEYS[tier] ? t(CHEST_NAME_KEYS[tier]) : tier, coins: result.coinsAwarded ?? 0, xp: result.xpAwarded ?? 0 }))
      } else {
        setMessage(result.error ?? t("chestErrorMsg"))
      }
      setPendingAction(null)
    })
  }

  return (
    <div dir={dir} className="min-h-[100dvh] px-5 py-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <Link href="/home">
          <PremiumButton variant="ghost" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("back")}
          </PremiumButton>
        </Link>
        <div className="text-center">
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">{t("rewardsCenter")}</h1>
          <p className="text-on-surface-variant">{t("realProgressRealPrizes")}</p>
        </div>
        <div className="flex items-center gap-2 bg-tertiary/10 px-4 py-2 rounded-full border border-tertiary/30">
          <span className="font-bold text-tertiary">{coins.toLocaleString()} {t("coinsWord").toLowerCase()}</span>
        </div>
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          // The wheel itself is hidden from assistive technology, so this is
          // the only place a screen reader learns what was won. It has to
          // announce on change rather than only on focus.
          role="status"
          aria-live="polite"
          className="mb-6 text-center text-sm text-on-surface-variant"
        >
          {message}
        </motion.div>
      )}

      {/* Streak stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="font-bold text-3xl text-primary">{streakCount}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">{t("currentStreak").toUpperCase()}</p>
          </div>
          <div>
            <p className="font-bold text-3xl text-secondary">{longestStreak}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">{t("longestStreak").toUpperCase()}</p>
          </div>
          <div>
            <p className="font-bold text-3xl text-tertiary">{streakFreezesAvailable}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">{t("streakFreezesLabel")}</p>
          </div>
          <div>
            <p className="font-bold text-3xl text-primary-fixed">{xp.toLocaleString()}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">{t("totalXp").toUpperCase()}</p>
          </div>
        </div>
      </motion.div>

      {/* Daily login rewards - real 7-day cycle */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 mb-8">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-4">{t("dailyLoginRewards")}</h2>
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
                <p className="text-xs text-on-surface-variant">{t("dayLabel", { day: r.day_number })}</p>
                <p className="text-sm font-bold text-on-surface">{r.coins}c</p>
                {isPast && <p className="text-xs text-primary">✓</p>}
              </div>
            )
          })}
        </div>
        <PremiumButton variant="primary" onClick={handleClaim} disabled={claimedToday || (isPending && pendingAction === "claim")}>
          {claimedToday ? t("claimedForToday") : isPending && pendingAction === "claim" ? t("claimingLabel") : t("claimDayReward", { day: currentDayNumber })}
        </PremiumButton>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Spin wheel - real, server-computed, cooldown-gated */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-4">{t("freeSpinTitle")}</h2>
          <p className="text-on-surface-variant text-sm mb-4">{t("freeSpinDesc")}</p>

          <SpinWheel
            segments={spinRewards}
            targetIndex={spinTarget}
            spinToken={spinToken}
            onSettled={handleSpinSettled}
          />

          <PremiumButton
            variant="primary"
            onClick={handleSpin}
            disabled={!spinReady || pendingAction === "spin"}
          >
            {pendingAction === "spin"
              ? t("spinningLabel")
              : spinReady
                ? t("spinNowLabel")
                : t("nextSpinIn", { time: formatCountdown(new Date(spinAvailableAt!).getTime() - now) })}
          </PremiumButton>
        </motion.div>

        {/* Mystery chests - real purchase + real reward roll */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-4">{t("mysteryChests")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {chestTypes.map((chest) => (
              <PremiumCard key={chest.tier} className="p-3 text-center">
                <p className="font-bold text-on-surface">{CHEST_NAME_KEYS[chest.tier] ? t(CHEST_NAME_KEYS[chest.tier]) : chest.tier}</p>
                <p className="text-xs text-on-surface-variant mb-2">
                  {chest.min_coins}-{chest.max_coins} {t("coinsWord").toLowerCase()}
                </p>
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenChest(chest.tier)}
                  disabled={coins < chest.price_coins || (isPending && pendingAction === `chest-${chest.tier}`)}
                >
                  {isPending && pendingAction === `chest-${chest.tier}` ? t("openingLabel") : `${chest.price_coins} ${t("coinsWord").toLowerCase()}`}
                </PremiumButton>
              </PremiumCard>
            ))}
          </div>
        </motion.div>
      </div>

      <p className="text-xs text-on-surface-variant text-center">
        <PremiumBadge variant="secondary" size="sm" className="mr-2">{t("noteLabel")}</PremiumBadge>
        {t("rewardsFootnote")}
      </p>
    </div>
  )
}
