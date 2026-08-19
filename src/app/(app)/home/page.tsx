"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ProgressRing } from "@/components/game/ProgressRing"
import { PrayerTimesCard } from "@/components/game/PrayerTimesCard"
import { SalaamGreeting } from "@/components/game/SalaamGreeting"
import { DailyHadith } from "@/components/game/DailyHadith"
import { StreakCounter } from "@/components/game/StreakCounter"
import { ReviewCallout } from "@/components/game/ReviewCallout"
import { UserStats } from "@/components/game/UserStats"
import { DailyProgressCard } from "@/components/game/DailyProgressCard"

import { useProfile } from "@/hooks/use-profile"
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

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const dailyProgress = Math.min((questionsToday / 10) * 100, 100)

  return (
    <div dir={dir} className="relative min-h-[100dvh] bg-background pb-32">
      {/* Background Accents */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-secondary/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 mashrabiya-pattern" />
      </div>

      {/* Top Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-surface/60 backdrop-blur-xl border-b border-white/5 h-16"
      >
        <div className="flex justify-between items-center px-5 h-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full border-2 border-primary overflow-hidden shadow-sm">
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </div>
            </div>
            {/* The greeting moved into <main> as <SalaamGreeting />. It used to
                live here behind `hidden sm:block`, a 640px width breakpoint no
                phone reaches in portrait, so no phone user ever saw it. The
                wordmark stays and is shown at every size. */}
            <h1 className="font-headline-md text-headline-md text-primary">ILM Hunt</h1>
          </div>
          <div className="flex items-center gap-4 bg-surface-container-high/40 px-4 py-1.5 rounded-full border border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="text-tertiary">{profile?.streakCount ?? 0}</span>
              <svg className="w-4 h-4 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
              </svg>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="text-primary-fixed">{profile?.coins ?? 0}</span>
              <svg className="w-4 h-4 text-primary-fixed" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.98-3.12 3.19z" />
              </svg>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="mt-20 px-5 max-w-7xl mx-auto space-y-4 relative">
        {/* Salaam, name, rank. First thing on the page, on every screen size. */}
        <SalaamGreeting />

        {/* What is due for spaced review. Renders nothing when the queue is empty. */}
        <ReviewCallout />

        {/* Daily Progress Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center py-8"
        >
          <div className="relative w-64 h-64 md:w-72 md:h-72">
            <ProgressRing progress={dailyProgress} size={288} strokeWidth={8} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-display-lg-mobile text-display-lg-mobile text-primary">
                {Math.round(dailyProgress)}%
              </span>
              <p className="font-label-caps text-label-caps text-on-surface-variant">{t("todayProgress").toUpperCase()}</p>
            </div>
          </div>
          <div className="flex gap-12 mt-4">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center mb-1">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z" />
                </svg>
                <span className="font-bold text-headline-md text-on-surface">{profile?.totalXp ?? 0}</span>
              </div>
              <p className="font-label-caps text-label-caps text-on-surface-variant/70 uppercase tracking-widest">{t("xpGained")}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center mb-1">
                <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z" />
                </svg>
                <span className="font-bold text-headline-md text-on-surface">{accuracy}%</span>
              </div>
              <p className="font-label-caps text-label-caps text-on-surface-variant/70 uppercase tracking-widest">{t("focusLevel")}</p>
            </div>
          </div>
        </motion.section>

        {/* Bento Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Continue Learning Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-8 glass-card p-6 relative overflow-hidden group cursor-pointer transition-transform active:scale-[0.98]"
          >
            <div className="absolute bottom-0 right-0 mashrabiya-pattern w-32 h-32 rotate-12" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">{t("inProgress")}</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface mt-1">
                    Life of the Prophet (pbuh)
                  </h2>
                  <p className="text-on-surface-variant text-sm mt-1">{t("lessonOf", { current: 4, total: 12 })} • {t("minsRemaining", { mins: 15 })}</p>
                </div>
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                </svg>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-on-surface-variant">
                  <span>{t("complete", { percent: 60 })}</span>
                </div>
                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-fixed-dim w-[60%] rounded-full shadow-[0_0_8px_rgba(240, 205, 109,0.3)]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Prayer Progress Widget */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-4 glass-card p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
                <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">{t("prayerTimes")}</h3>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-on-surface">Dhuhr</span>
                <span className="text-on-surface-variant mt-1">In 2h 15m</span>
              </div>
            </div>
            <div className="mt-6 flex gap-1">
              <div className="flex-1 h-1 bg-primary rounded-full" />
              <div className="flex-1 h-1 bg-primary rounded-full" />
              <div className="flex-1 h-1 bg-surface-container-highest rounded-full" />
              <div className="flex-1 h-1 bg-surface-container-highest rounded-full" />
              <div className="flex-1 h-1 bg-surface-container-highest rounded-full" />
            </div>
          </motion.div>

          {/* Daily Mission Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-12 glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-tertiary"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">Complete 3 Arabic Quizzes</h3>
                <p className="text-on-surface-variant">Current progress: {questionsToday} / 3</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-surface-container-high/60 px-4 py-2 rounded-lg border border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-tertiary font-bold">+50</span>
                <svg className="w-5 h-5 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.98-3.12 3.19z" />
                </svg>
              </div>
              <Link
                href="/quiz"
                className="btn-primary px-6 py-2 rounded-lg font-bold text-sm"
              >
                {t("continueButton")}
              </Link>
            </div>
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

        {/* Explore - the only entry point to these pages besides typing the URL */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <Link href="/achievements" className="glass-card p-4 flex flex-col items-center text-center gap-2 hover:bg-white/5 transition-colors">
            <span className="text-2xl">🏆</span>
            <span className="text-sm font-bold text-on-surface">{t("achievements")}</span>
          </Link>
          <Link href="/challenges" className="glass-card p-4 flex flex-col items-center text-center gap-2 hover:bg-white/5 transition-colors">
            <span className="text-2xl">⚡</span>
            <span className="text-sm font-bold text-on-surface">{t("challenges")}</span>
          </Link>
          <Link href="/community" className="glass-card p-4 flex flex-col items-center text-center gap-2 hover:bg-white/5 transition-colors">
            <span className="text-2xl">👥</span>
            <span className="text-sm font-bold text-on-surface">{t("communityHub")}</span>
          </Link>
          <Link href="/multiplayer" className="glass-card p-4 flex flex-col items-center text-center gap-2 hover:bg-white/5 transition-colors">
            <span className="text-2xl">🎮</span>
            <span className="text-sm font-bold text-on-surface">{t("multiplayerQuiz")}</span>
          </Link>
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
