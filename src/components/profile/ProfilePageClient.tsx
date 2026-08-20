"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumAvatar } from "@/components/ui/premium-avatar"
import { PremiumProgress } from "@/components/ui/premium-progress"
import { PremiumStat } from "@/components/ui/premium-stat"
import { AchievementCard } from "@/components/game/AchievementCard"
import { useLanguage } from "@/contexts/LanguageContext"
import type { Locale } from "@/lib/i18n"
import type { ProfileStats } from "@/lib/profile-stats"

type Tab = "overview" | "achievements" | "statistics" | "activity"

const LANGUAGE_OPTIONS: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ha", label: "Hausa" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "id", label: "Bahasa Indonesia" },
]

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function ProfilePageClient({
  stats,
  email,
  joinedAt,
}: {
  stats: ProfileStats
  email: string | null
  joinedAt: string
}) {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const { locale, setLocale, t, dir } = useLanguage()
  const { profile, currentRank, nextRank, totalAttempts, accuracyPct, categories, achievements, globalRank, recentAttempts } = stats

  const unlockedAchievements = achievements.filter((a) => a.unlocked)
  const xpIntoCurrentRank = currentRank ? profile.totalXp - currentRank.minXp : profile.totalXp
  const xpNeededForNextRank = nextRank ? nextRank.minXp - (currentRank?.minXp ?? 0) : null

  const joinDate = new Date(joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: t("overview"), icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg> },
    { id: "achievements", label: t("achievements"), icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" /></svg> },
    { id: "statistics", label: t("statistics"), icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" /></svg> },
    { id: "activity", label: t("activity"), icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 9V3.5L18.5 9M6 2c-1.11 0-2 .89-2 2v16c0 1.11.89 2 2 2h12c1.11 0 2-.89 2-2V8l-6-6H6z" /></svg> },
  ]

  return (
    <div dir={dir} className="min-h-[100dvh] px-5 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <Link href="/home">
          <PremiumButton variant="ghost" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("back")}
          </PremiumButton>
        </Link>
        <label className="flex items-center gap-2 text-sm text-on-surface-variant">
          {/* `hidden sm:inline` removed the word entirely on phones, which
              also removed the select's accessible name — and `sm` is 640px, so
              that meant every phone. `sr-only` keeps the label for assistive
              technology while still freeing the space visually. */}
          <span className="sr-only sm:not-sr-only sm:inline">{t("language")}</span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="bg-surface-container-high border border-white/10 rounded-lg px-3 py-1.5 text-on-surface text-sm"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>{opt.label}</option>
            ))}
          </select>
        </label>
      </motion.div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <PremiumAvatar size="xl" ring ringColor="primary" />
            {currentRank && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="absolute -top-2 -right-2">
                <PremiumBadge variant="warning" size="sm">{currentRank.name.toUpperCase()}</PremiumBadge>
              </motion.div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-2">
              {profile.displayName ?? email ?? "Learner"}
            </h1>

            <div className="flex items-center gap-4 justify-center md:justify-start mb-4 text-on-surface-variant">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                </svg>
                Joined {joinDate}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <PremiumStat label={t("totalXp")} value={profile.totalXp.toLocaleString()} />
              <PremiumStat label={t("dayStreak")} value={profile.streakCount} />
              <PremiumStat label={t("globalRank")} value={globalRank ? `#${globalRank}` : "—"} />
              <PremiumStat label={t("accuracy")} value={totalAttempts > 0 ? `${accuracyPct}%` : "—"} />
            </div>

            {currentRank && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-on-surface-variant">
                    {nextRank ? `Progress to ${nextRank.name}` : `Highest rank reached: ${currentRank.name}`}
                  </span>
                  {nextRank && xpNeededForNextRank !== null && (
                    <span className="font-bold text-on-surface">{xpIntoCurrentRank}/{xpNeededForNextRank} XP</span>
                  )}
                </div>
                {nextRank && xpNeededForNextRank !== null && (
                  <PremiumProgress value={xpIntoCurrentRank} max={xpNeededForNextRank} size="lg" />
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-caps text-label-caps uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PremiumCard className="p-6">
              <h3 className="font-headline-md text-headline-md text-primary mb-4">{t("learningProgress")}</h3>
              {categories.length === 0 ? (
                <p className="text-on-surface-variant text-sm">
                  No quizzes completed yet - your category progress will show up here once you start playing.
                </p>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.slug}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-on-surface">{category.name}</span>
                        <span className="text-on-surface-variant">{category.attempted} questions</span>
                      </div>
                      <PremiumProgress value={category.correct} max={category.attempted} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </PremiumCard>

            <PremiumCard className="p-6">
              <h3 className="font-headline-md text-headline-md text-primary mb-4">{t("recentAchievements")}</h3>
              {unlockedAchievements.length === 0 ? (
                <p className="text-on-surface-variant text-sm">No achievements unlocked yet - keep playing to earn your first one.</p>
              ) : (
                <div className="space-y-3">
                  {unlockedAchievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.slug} className="flex items-center gap-3 p-3 bg-surface-container-high/50 rounded-lg">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold text-on-surface">{achievement.name}</p>
                        <p className="text-sm text-on-surface-variant">{achievement.description}</p>
                      </div>
                      {achievement.earnedAt && (
                        <PremiumBadge variant="success" size="sm">
                          {new Date(achievement.earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </PremiumBadge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </PremiumCard>
          </motion.div>
        )}

        {activeTab === "achievements" && (
          <motion.div key="achievements" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement.slug}
                title={achievement.name}
                description={achievement.description}
                icon={achievement.icon}
                progress={achievement.progress}
                maxProgress={achievement.target}
                reward=""
                isUnlocked={achievement.unlocked}
                unlockedAt={achievement.earnedAt ? new Date(achievement.earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : undefined}
              />
            ))}
          </motion.div>
        )}

        {activeTab === "statistics" && (
          <motion.div key="statistics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PremiumCard className="p-6">
              <h3 className="font-headline-md text-headline-md text-primary mb-4">{t("categoryPerformance")}</h3>
              {categories.length === 0 ? (
                <p className="text-on-surface-variant text-sm">Play a few quizzes to see your accuracy by category here.</p>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => {
                    const pct = category.attempted > 0 ? Math.round((category.correct / category.attempted) * 100) : 0
                    return (
                      <div key={category.slug}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-on-surface">{category.name}</span>
                          <span className="text-on-surface-variant">{pct}% accuracy</span>
                        </div>
                        <PremiumProgress value={category.correct} max={category.attempted} size="sm" />
                      </div>
                    )
                  })}
                </div>
              )}
            </PremiumCard>

            <PremiumCard className="p-6">
              <h3 className="font-headline-md text-headline-md text-primary mb-4">{t("learningStreaks")}</h3>
              <div className="text-center mb-6">
                <p className="font-bold text-5xl text-primary mb-2">{profile.streakCount}</p>
                <p className="text-on-surface-variant">{t("currentStreak")}</p>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-6">
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`h-10 rounded-lg ${i < Math.min(profile.streakCount, 7) ? "bg-primary/60" : "bg-surface-container-highest"}`}
                  />
                ))}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">{t("longestStreak")}</span>
                  <span className="font-bold text-on-surface">{profile.longestStreak} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Questions Answered</span>
                  <span className="font-bold text-on-surface">{totalAttempts}</span>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div key="activity" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <PremiumCard className="p-6">
              <h3 className="font-headline-md text-headline-md text-primary mb-4">{t("recentActivity")}</h3>
              {recentAttempts.length === 0 ? (
                <p className="text-on-surface-variant text-sm">
                  Nothing here yet - your completed questions will show up as you play.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentAttempts.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-surface-container-high/50 rounded-lg">
                      <span className="text-xl">{a.isCorrect ? "✅" : "❌"}</span>
                      <div className="flex-1">
                        <p className="text-on-surface text-sm">{a.questionText}</p>
                        <p className="text-xs text-on-surface-variant">{a.categoryName} · {timeAgo(a.createdAt)}</p>
                      </div>
                      {a.xpEarned > 0 && <PremiumBadge variant="primary" size="sm">+{a.xpEarned} XP</PremiumBadge>}
                    </div>
                  ))}
                </div>
              )}
            </PremiumCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
