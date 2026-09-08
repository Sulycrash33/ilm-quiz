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
  openEarnedChest,
  type EarnedChest,
  type SpinResult,
  type DailyTaskProgress,
} from "@/app/(app)/rewards/actions"
import { SpinWheel, type SpinSegment } from "@/components/rewards/SpinWheel"
import { DailyChallengeCard } from "@/components/challenges/DailyChallengeCard"
import type { DailyChallengeView } from "@/app/(app)/challenges/actions"
import { useLanguage } from "@/contexts/LanguageContext"
import type { Translations } from "@/lib/i18n"

interface LoginReward {
  day_number: number
  coins: number
  xp: number
  is_special: boolean
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
  dailyTask,
  dailyChallenge,
  streakCount,
  longestStreak,
  streakFreezesAvailable,
  coins: initialCoins,
  totalXp: initialXp,
  lastSpinAt,
  claimedToday: initialClaimedToday,
  currentDayNumber,
  loginRewards,
  earnedChests: initialChests,
  spinRewards,
}: {
  dailyTask: DailyTaskProgress
  /** Today's five questions. Null on a day the arena cannot fill a challenge. */
  dailyChallenge: DailyChallengeView | null
  streakCount: number
  longestStreak: number
  streakFreezesAvailable: number
  coins: number
  totalXp: number
  lastSpinAt: string | null
  claimedToday: boolean
  currentDayNumber: number
  loginRewards: LoginReward[]
  earnedChests: EarnedChest[]
  spinRewards: SpinSegment[]
}) {
  const { t, dir } = useLanguage()
  const [coins, setCoins] = useState(initialCoins)
  const [xp, setXp] = useState(initialXp)
  const [claimedToday, setClaimedToday] = useState(initialClaimedToday)
  /**
   * Today's questions, seeded from the server and corrected by it.
   *
   * Held in state rather than read straight from the prop because the claim
   * itself reports the count: if the player answered questions in another tab
   * since this page loaded, the refusal carries the true number and the bar
   * moves to match instead of arguing with the button.
   */
  const [taskAnswered, setTaskAnswered] = useState(dailyTask.answered)
  const taskRequired = dailyTask.required
  const taskDone = taskRequired > 0 && taskAnswered >= taskRequired
  const taskPercent = taskRequired > 0 ? Math.min(100, Math.round((taskAnswered / taskRequired) * 100)) : 0
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
  /** Unopened chests, held in state so an opened one leaves the shelf at once
   *  rather than after a round trip. The server is still the authority: a
   *  second tap on the same chest is refused by `open_chest_rpc`, not by this. */
  const [chests, setChests] = useState<EarnedChest[]>(initialChests)

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
        // Coins only. Migration 0058 zeroed the ladder's XP: a gift may hand
        // the player coins, it may not hand them rank. The RPC still reports
        // an `xpAwarded`, and it is now always 0, so adding it to the header
        // and printing "+0 XP" would be noise at best and a promise the app no
        // longer keeps at worst.
        setCoins((c) => c + (result.coinsAwarded ?? 0))
        setMessage(t("claimSuccessMsg", { day: result.dayNumber ?? "", coins: result.coinsAwarded ?? 0 }))
      } else if (result.alreadyClaimedToday) {
        setClaimedToday(true)
        setMessage(t("alreadyClaimedMsg"))
      } else if (result.taskIncomplete) {
        // The server refused because today's questions are not done. It also
        // reports how far along the player is, so the bar corrects itself from
        // the authority rather than from whatever this page loaded with.
        setTaskAnswered(result.taskAnswered ?? taskAnswered)
        setMessage(t("dailyTaskLocked", { required: result.taskRequired ?? taskRequired }))
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

  /**
   * Open an earned chest.
   *
   * The chest is removed from the shelf the moment the server confirms, and
   * only then — an optimistic removal would hide a refusal, and a refusal is
   * exactly what a second tap is supposed to get. `open_chest_rpc` claims the
   * row with `where opened_at is null`, so two taps race for one chest and one
   * of them loses; this reads the loser's error rather than guessing.
   */
  const handleOpenChest = (chest: EarnedChest) => {
    setPendingAction(`chest-${chest.id}`)
    startTransition(async () => {
      const result = await openEarnedChest(chest.id)
      if (result.success) {
        setChests((list) => list.filter((c) => c.id !== chest.id))
        setCoins((c) => c + (result.coinsAwarded ?? 0))
        setXp((x) => x + (result.xpAwarded ?? 0))
        setMessage(
          t("chestOpenedMsg", {
            tier: CHEST_NAME_KEYS[chest.tier] ? t(CHEST_NAME_KEYS[chest.tier]) : chest.tier,
            coins: result.coinsAwarded ?? 0,
            xp: result.xpAwarded ?? 0,
          })
        )
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

      {/* The day, in one panel: the five questions, then what finishing them
          pays.

          These were two features with one body. The "daily challenge" — five
          questions the server picks for everyone, on `/challenges` — and the
          "daily login reward" — answer five questions, collect the day's coins,
          here — are the same five questions and the same day. The player met
          them on two screens under two names, and the one on this page did not
          even lead to the questions: its "Start answering" pointed at `/quiz`,
          the category grid, which is precisely the complaint #73 and #77 were
          each supposed to have closed. Reported a third time, from this screen.

          So the challenge moves in above the ladder, and the ladder becomes
          what it was always meant to be from here: the answer to "what do I get
          for doing this". One card, one task, one place to press. It is the
          same `DailyChallengeCard` component, so there is still exactly one
          definition of what the challenge says and what it pays. */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 mb-8">
        {dailyChallenge && (
          <div className="mb-6">
            <DailyChallengeCard challenge={dailyChallenge} />
          </div>
        )}
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
        {/* The day's task, for a day with no challenge on it.

            This reward used to pay for opening the app. 0053 attaches a
            condition to it and enforces that condition in the database; this
            strip is what makes the condition visible, because a button that
            refuses without saying why is a bug as far as the player is
            concerned. Hidden once claimed: at that point the task is history
            and the only useful thing to say is that the reward is spent.

            Hidden too whenever there *is* a challenge above, because then this
            strip is a second progress bar for the same five questions with a
            worse link on it — two bars disagreeing about one day is the
            confusion this whole change is undoing. The challenge card carries
            the bar; the claim button below still names the condition when it
            is not met, so nothing goes unexplained.

            It survives for the days the arena cannot fill a challenge. On those
            the gate is still real and still has to be reachable, and `/quiz` is
            then the honest destination rather than the wrong one: any five
            answers satisfy `daily_task_progress()`, from any room. */}
        {!dailyChallenge && !claimedToday && taskRequired > 0 && (
          <div className="mb-4 rounded-lg border border-white/5 bg-surface-container-high/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-on-surface">
                {t("dailyTaskTitle", { required: taskRequired })}
              </p>
              <span
                className={`font-bold tabular-nums shrink-0 ${taskDone ? "text-success" : "text-on-surface-variant"}`}
              >
                {Math.min(taskAnswered, taskRequired)}/{taskRequired}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
              <div
                className={`h-full rounded-full transition-[width] duration-700 ${taskDone ? "bg-success" : "bg-gradient-to-r from-primary to-primary-fixed-dim"}`}
                style={{ width: `${taskPercent}%` }}
              />
            </div>
            {!taskDone && (
              <Link
                href="/quiz"
                className="mt-3 inline-flex items-center gap-1 font-bold text-sm text-primary hover:underline"
              >
                {t("dailyTaskCta")}
                <span aria-hidden="true">&rarr;</span>
              </Link>
            )}
          </div>
        )}

        <PremiumButton
          variant="primary"
          onClick={handleClaim}
          disabled={claimedToday || !taskDone || (isPending && pendingAction === "claim")}
        >
          {claimedToday
            ? t("claimedForToday")
            : isPending && pendingAction === "claim"
              ? t("claimingLabel")
              : !taskDone
                ? t("dailyTaskLocked", { required: taskRequired })
                : t("claimDayReward", { day: currentDayNumber })}
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

        {/* Mystery chests, earned rather than bought.

            They used to be a purchase: pay 100 coins, receive an unknown
            return. That is a loot box, which is why 0008 removed the roll —
            and what it left behind was worse in one way, because this grid
            went on advertising "20-60 coins" over a payout that was always
            exactly 40. A fake gamble is not an improvement on a real one.

            Mystery with a price is a gamble; mystery you were given is a
            surprise. So the price is gone and the roll is back: a chest is
            earned at a study milestone (`award_chests`, 0060), and its
            contents are rolled by the server at the moment it is opened. It
            pays barakah, and that is consistent with 0058 rather than an
            exception to it — you got it by studying. */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-4">{t("mysteryChests")}</h2>
          {chests.length === 0 ? (
            <p className="text-sm text-on-surface-variant">{t("noChestsYet")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {chests.map((chest) => (
                <PremiumCard key={chest.id} className="p-3 text-center">
                  <p className="text-3xl" aria-hidden="true">🎁</p>
                  <p className="font-bold text-on-surface">
                    {CHEST_NAME_KEYS[chest.tier] ? t(CHEST_NAME_KEYS[chest.tier]) : chest.tier}
                  </p>
                  {/* No range printed. Nobody knows what is inside, including
                      this page: the roll happens server side on open. */}
                  <PremiumButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenChest(chest)}
                    disabled={isPending && pendingAction === `chest-${chest.id}`}
                  >
                    {isPending && pendingAction === `chest-${chest.id}`
                      ? t("openingLabel")
                      : t("openChestLabel")}
                  </PremiumButton>
                </PremiumCard>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <p className="text-xs text-on-surface-variant text-center">
        <PremiumBadge variant="secondary" size="sm" className="mr-2">{t("noteLabel")}</PremiumBadge>
        {t("rewardsFootnote")}
      </p>
    </div>
  )
}
