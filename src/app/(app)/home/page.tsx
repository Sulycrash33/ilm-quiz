"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { Trophy, Zap, Users, Gamepad2 } from "lucide-react"
import { PremiumAvatar } from "@/components/ui/premium-avatar"
import { CountUp } from "@/components/ui/count-up"
import { ProgressRing } from "@/components/game/ProgressRing"
import { PrayerTimesCard } from "@/components/game/PrayerTimesCard"
import { SalaamGreeting } from "@/components/game/SalaamGreeting"
import { DailyHadith } from "@/components/game/DailyHadith"
import { IslamicPattern } from "@/components/islamic-pattern"
import { ReviewCallout } from "@/components/game/ReviewCallout"
import { UserStats } from "@/components/game/UserStats"
import { DailyProgressCard } from "@/components/game/DailyProgressCard"
import { LogoutButton } from "@/components/layout/LogoutButton"

import { getContinueCard, type ContinueCard } from "./actions"
import { getDailyChallenge, type DailyChallengeView } from "../challenges/actions"
import { useProfile } from "@/hooks/use-profile"
import { playCue } from "@/lib/sound"
import { playHaptic } from "@/lib/haptics"
import { takeStreakAdvance } from "@/lib/streak-cue"
import { useTodayStats } from "@/hooks/use-today-stats"
import { useLanguage } from "@/contexts/LanguageContext"

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function HomePage() {
  const { profile, loading } = useProfile()
  const { questionsToday, accuracy } = useTodayStats()
  const { t, dir } = useLanguage()
  const [currentTime, setCurrentTime] = useState("")

  // Both of these cards used to be hardcoded. They now come from the database
  // and render an honest empty state when there is nothing to show.
  const [continueCard, setContinueCard] = useState<ContinueCard | null>(null)
  const [challenge, setChallenge] = useState<DailyChallengeView | null>(null)

  /**
   * Until this resolves, both cards below have nothing to show — and "nothing
   * to show" is not the same claim as "there is nothing".
   *
   * Both used to start at `null` and render their empty state immediately, so
   * the most prominent card on the front door announced "No challenge today"
   * for the whole time the request was in flight, then flipped to a real
   * challenge when it landed. On a slow connection — which is most of the
   * people this app is for — that is what the home screen says for seconds,
   * and if the request fails it is what it says forever. There is in fact a
   * challenge nearly every day: a cron job materialises one at 00:05.
   */
  const [cardsLoading, setCardsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [c, d] = await Promise.all([getContinueCard(), getDailyChallenge()])
        if (cancelled) return
        setContinueCard(c)
        setChallenge(d)
      } finally {
        if (!cancelled) setCardsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  /**
   * The streak, heard the first time the player sees it move.
   *
   * Waits for `loading` to clear: `useProfile` reports 0 before the profile
   * arrives, and celebrating that would first record a streak of nothing and
   * then fire on the very next render when the real number landed.
   *
   * `takeStreakAdvance` consumes the advance, so this stays correct under
   * strict mode's double effect run and across the re-renders the two card
   * requests cause as they resolve.
   */
  useEffect(() => {
    if (loading) return
    if (!takeStreakAdvance(profile?.streakCount ?? 0)) return
    playCue("streak")
    playHaptic("streak")
  }, [loading, profile?.streakCount])

  const reduceMotion = useReducedMotion()
  const dailyProgress = Math.min((questionsToday / 10) * 100, 100)
  const streakAlive = (profile?.streakCount ?? 0) > 0
  /** Nothing earned, nothing answered, no streak: the cold-start screen. */
  const coldStart =
    !loading && !cardsLoading && !continueCard && questionsToday === 0 && !streakAlive

  return (
    <div dir={dir} className="relative min-h-[100dvh] bg-background pb-32">
      {/* The backdrop lives in `(app)/layout.tsx`, which this page renders
          inside. It used to be repeated here verbatim, so the home screen drew
          two gold blurs, two secondary blurs and two copies of the pattern on
          top of each other: the ornament was twice as strong here as on every
          other screen, and it cost an extra compositing layer on the most
          visited page in the app. */}

      {/* Top Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-surface/60 backdrop-blur-xl border-b border-white/5 h-16"
      >
        <div className="flex justify-between items-center px-5 h-full max-w-7xl mx-auto">
          {/* The player's own face, linking to their profile. This used to be a
              hardcoded silhouette: onboarding asked everyone to choose an
              avatar, stored the choice, and then no screen in the app ever drew
              it. Showing it here is the cheapest identity win available — the
              first thing you see on opening the app is you. */}
          <Link href="/profile" className="flex items-center gap-3 group min-w-0">
            <PremiumAvatar
              size="sm"
              ring
              ringColor="primary"
              avatarId={profile?.avatarId}
              className="shrink-0 transition-transform group-active:scale-95"
            />
            {/* The greeting moved into <main> as <SalaamGreeting />. It used to
                live here behind `hidden sm:block`, a 640px width breakpoint no
                phone reaches in portrait, so no phone user ever saw it. The
                wordmark stays and is shown at every size. */}
            <h1 className="font-headline-md text-headline-md bg-gradient-to-br from-[#f6dfa0] via-primary to-[#c9962f] bg-clip-text text-transparent drop-shadow-[0_1px_6px_rgba(240,205,109,0.25)]">
              ILM Hunt
            </h1>
          </Link>
          {/* Streak and coins. Both numbers climb rather than snap, and the
              flame only breathes while a streak is actually alive — a cold
              streak sitting still is information, not an oversight. */}
          <div className="flex items-center gap-4 bg-surface-container-high/40 px-4 py-1.5 rounded-full border border-white/5">
            <div className="flex items-center gap-1.5">
              <CountUp value={profile?.streakCount ?? 0} className={`tabular-nums ${streakAlive ? "text-warning" : "text-on-surface-variant"}`} />
              <motion.svg
                /* A live streak is warm. This drew a `tertiary` mint flame with a
                   hardcoded orange halo, the same contradiction the combo badge
                   carried: green fire giving off orange light. Warm ramp now,
                   and the glow is `currentColor` so the two cannot drift apart. */
                className={`w-4 h-4 ${streakAlive ? "text-warning drop-shadow-[0_0_6px_currentColor]" : "text-on-surface-variant/40"}`}
                fill="currentColor"
                viewBox="0 0 24 24"
                animate={streakAlive && !reduceMotion ? { scale: [1, 1.14, 1] } : { scale: 1 }}
                transition={{ duration: 1.7, repeat: streakAlive && !reduceMotion ? Infinity : 0, ease: "easeInOut" }}
              >
                <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
              </motion.svg>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <CountUp value={profile?.coins ?? 0} className="text-primary-fixed tabular-nums" />
              <svg className="w-4 h-4 text-primary-fixed" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.98-3.12 3.19z" />
              </svg>
            </div>
          </div>
          <LogoutButton className="flex items-center justify-center h-9 w-9 rounded-full text-on-surface-variant/70 hover:bg-white/5 hover:text-error transition-colors" />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="mt-20 px-5 max-w-7xl mx-auto space-y-4 relative">
        {/* Salaam, name, rank. First thing on the page, on every screen size. */}
        <SalaamGreeting />

        {/* The hadith card, finally on screen. It was imported by this file and
            never rendered, so a built, styled and fully translated component
            had been invisible to every player. It leads because it is the one
            thing here that is not a number: opening on rings and streak counts
            makes a scoreboard, and this is meant to be a place of study. */}
        <DailyHadith />

        {/* Prayer times, directly under the greeting. This is the real card:
            it locates the seeker, counts down to the next salah, and rolls over
            to tomorrow's Fajr after Isha. What used to sit further down the
            page was a hardcoded panel that always read "Dhuhr, in 2h 15m". */}
        <PrayerTimesCard />

        {/* What is due for spaced review. Renders nothing when the queue is empty. */}
        <ReviewCallout />

        {/* Today, in one band instead of one screenful.

            This was a 288px ring centred in its own full-width section, with
            two stats stranded below it. On a phone that spent most of the fold
            drawing a large circle whose only message, for a new player, was
            "0%" — the emptiest possible thing to lead with. The ring is still
            here because it is genuinely satisfying once it fills; it is now
            sized to sit beside the numbers rather than instead of them, and
            the whole band costs about a third of the height it used to. */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="glass-card p-4 sm:p-5"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
              <ProgressRing progress={dailyProgress} size={96} strokeWidth={7} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-headline-md text-headline-md text-primary tabular-nums">
                  <CountUp value={Math.round(dailyProgress)} format={(n) => `${n}%`} />
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                {t("todayProgress")}
              </p>
              {/* Same shape LevelPath already uses, so this needs no new
                  string in any of the six locales. */}
              <p className="font-bold text-headline-md text-on-surface tabular-nums mt-0.5">
                {questionsToday}/10{" "}
                <span className="font-normal text-body-md text-on-surface-variant">
                  {t("questions").toLowerCase()}
                </span>
              </p>

              <div className="flex gap-6 mt-3">
                <div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z" />
                    </svg>
                    <span className="font-bold text-title-md text-on-surface tabular-nums">
                      <CountUp value={profile?.totalXp ?? 0} />
                    </span>
                  </div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant/70 uppercase tracking-widest">
                    {t("xpGained")}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z" />
                    </svg>
                    {/* `accuracy` is null until a question has been answered.
                        Interpolating it rendered a bare "%" with no number. */}
                    <span className="font-bold text-title-md text-on-surface tabular-nums">
                      {accuracy === null ? "\u2014" : `${accuracy}%`}
                    </span>
                  </div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant/70 uppercase tracking-widest">
                    {t("focusLevel")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Bento Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Continue Learning Card.
              Everything here was hardcoded: the course name, "Lesson 4 of 12",
              "15 mins remaining", "60% complete". A brand-new account with no
              attempts at all was told it was most of the way through a course
              it had never opened. It also carried `cursor-pointer` with nothing
              to click, which is why tapping it did nothing.

              It now shows the category most recently answered in, with real
              counts, and is a real link. Someone who has never played is
              invited to start rather than shown invented progress. */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-8"
          >
            {/* On a cold start this is the only thing on the page worth
                tapping, so it says so: a warm ring and a slow breath draw the
                eye to the one action that begins everything. Once there is any
                history at all it settles down to an ordinary card. */}
            <Link
              href={continueCard ? `/quiz/${continueCard.slug}` : "/quiz"}
              className={`glass-card p-6 relative overflow-hidden group block transition-transform active:scale-[0.98] ${
                coldStart ? "ring-1 ring-primary/40 shadow-[0_0_28px_-6px_rgba(240,205,109,0.35)]" : ""
              } ${coldStart && !reduceMotion ? "animate-pulse-slow" : ""}`}
            >
              <IslamicPattern variant="flat" className="inset-auto bottom-0 right-0 h-32 w-32 rotate-12" />
              <div className="relative z-10">
                <div className="flex justify-between items-start gap-3 mb-6">
                  <div className="min-w-0">
                    <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
                      {continueCard ? t("inProgress") : t("startLearning")}
                    </span>
                    <h2 className="font-headline-md text-headline-md text-on-surface mt-1 break-words">
                      {continueCard ? continueCard.name : t("pickACategory")}
                    </h2>
                    {/* Same reason as the challenge card: telling someone they
                        have never answered anything, while the request that
                        would say otherwise is still running, is a guess
                        dressed as a fact. */}
                    {cardsLoading ? (
                      <span
                        className="mt-2 block h-4 w-36 max-w-full animate-pulse rounded bg-surface-container-highest"
                        aria-hidden="true"
                      />
                    ) : (
                      <p className="text-on-surface-variant text-sm mt-1">
                        {continueCard
                          ? t("continueAnswered", {
                              answered: continueCard.answered,
                              total: continueCard.total,
                            })
                          : t("noProgressYet")}
                      </p>
                    )}
                  </div>
                  <svg className="w-8 h-8 shrink-0 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                  </svg>
                </div>
                {continueCard && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-on-surface-variant">
                      <span>{t("complete", { percent: continueCard.percent })}</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary-fixed-dim rounded-full transition-[width] duration-700"
                        style={{ width: `${continueCard.percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Link>
          </motion.div>

          {/* Daily Mission. The title used to read "Complete 3 Arabic
              Quizzes" regardless of what today's challenge actually was; only
              the progress number was real. Both now come from
              `getDailyChallenge`. It calls `ensure_daily_challenge`, which
              is belt and braces: the `ilm-daily-challenge` cron job already
              materialises the day's challenge at 00:05, and this covers the
              case where a reader arrives before it has run. */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-12 glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-tertiary"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 shrink-0 rounded-full bg-tertiary/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-headline-md text-headline-md text-on-surface break-words">
                  {challenge
                    ? t("challengeQuestions", { count: challenge.questionCount })
                    : t("dailyChallengeTitle")}
                </h3>
                {/* While the request is in flight this stays a shimmer rather
                    than an answer. A skeleton needs no copy, so the honest
                    loading state costs nothing in six locales. */}
                {cardsLoading ? (
                  <span
                    className="mt-1 block h-4 w-40 max-w-full animate-pulse rounded bg-surface-container-highest"
                    aria-hidden="true"
                  />
                ) : (
                  <p className="text-on-surface-variant">
                    {challenge
                      ? challenge.completed
                        ? t("challengeDone")
                        : t("currentProgress", {
                            answered: challenge.answered,
                            total: challenge.questionCount,
                          })
                      : t("noChallengeToday")}
                  </p>
                )}
              </div>
            </div>
            {challenge && (
              <div className="flex items-center gap-4 bg-surface-container-high/60 px-4 py-2 rounded-lg border border-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-tertiary font-bold">+{challenge.rewardXp}</span>
                  <svg className="w-5 h-5 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.98-3.12 3.19z" />
                  </svg>
                </div>
                <Link href="/challenges" className="btn-primary px-6 py-2 rounded-lg font-bold text-sm">
                  {t("continueButton")}
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Additional Content */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Link href="/rewards" className="glass-card p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div>
              <h3 className="font-bold text-on-surface">{t("dailyLoginRewards")}</h3>
              <p className="text-sm text-on-surface-variant">{t("claimRewards")}</p>
            </div>
            <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        {/* Explore - the only entry point to these pages besides typing the URL.

            These were four flat emoji on four identical grey cards, which made
            the four most interesting rooms in the game — achievements, daily
            challenges, the community, live multiplayer — read as a row of
            filing cabinets. Each now has its own colour and a real icon, lifts
            under the cursor and presses under a thumb, and they arrive in
            sequence rather than all at once. Same four links, same four
            strings; only the invitation changed. */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4"
        >
          {[
            { href: "/achievements", label: t("achievements"), Icon: Trophy, tint: "from-warning/25 to-warning/10", fg: "text-warning-bright" },
            { href: "/challenges", label: t("challenges"), Icon: Zap, tint: "from-special/25 to-special-container/10", fg: "text-special-bright" },
            { href: "/community", label: t("communityHub"), Icon: Users, tint: "from-info/25 to-info-container/10", fg: "text-info-bright" },
            { href: "/multiplayer", label: t("multiplayerQuiz"), Icon: Gamepad2, tint: "from-success/25 to-success/10", fg: "text-success-bright" },
          ].map(({ href, label, Icon, tint, fg }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.35 }}
            >
              <Link
                href={href}
                className="glass-card p-4 h-full flex flex-col items-center text-center gap-2 transition-all hover:bg-white/5 hover:-translate-y-0.5 active:scale-[0.97]"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tint} ring-1 ring-white/10`}
                >
                  <Icon className={`h-5 w-5 ${fg}`} aria-hidden="true" />
                </span>
                <span className="text-sm font-bold text-on-surface">{label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-6 bg-surface/60 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_20px_0_rgba(0,0,0,0.1)] rounded-t-xl">
        <Link href="/home" className="flex flex-col items-center justify-center bg-primary-container/20 text-primary dark:text-primary-fixed rounded-xl px-3 py-1 transition-transform active:scale-95 duration-200">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="font-label-caps text-label-caps mt-1">{t("home")}</span>
        </Link>
        <Link href="/quiz" className="flex flex-col items-center justify-center text-on-surface-variant/70 hover:bg-white/5 transition-colors rounded-xl px-3 py-1">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
          </svg>
          <span className="font-label-caps text-label-caps mt-1">{t("learning")}</span>
        </Link>
        <Link href="/leaderboard" className="flex flex-col items-center justify-center text-on-surface-variant/70 hover:bg-white/5 transition-colors rounded-xl px-3 py-1">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z" />
          </svg>
          <span className="font-label-caps text-label-caps mt-1">{t("rankings")}</span>
        </Link>
        <Link href="/store" className="flex flex-col items-center justify-center text-on-surface-variant/70 hover:bg-white/5 transition-colors rounded-xl px-3 py-1">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.78 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
          </svg>
          <span className="font-label-caps text-label-caps mt-1">{t("shop")}</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center text-on-surface-variant/70 hover:bg-white/5 transition-colors rounded-xl px-3 py-1">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <span className="font-label-caps text-label-caps mt-1">{t("profile")}</span>
        </Link>
      </nav>
    </div>
  )
}
