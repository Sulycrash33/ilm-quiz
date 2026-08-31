"use client"

import { IslamicPattern } from "@/components/islamic-pattern";
import { motion } from "framer-motion"
import Link from "next/link"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { useLanguage } from "@/contexts/LanguageContext"
import type { Translations } from "@/lib/i18n"

interface GameMode {
  id: string
  nameKey: keyof Translations
  descKey: keyof Translations
  icon: string
  color: "primary" | "tertiary" | "secondary" | "warning"
  difficultyKey: keyof Translations
  xpMultiplier: string
  available: boolean
  href?: string
}

const gameModes: GameMode[] = [
  {
    id: "classic",
    nameKey: "modeClassicName",
    descKey: "modeClassicDesc",
    icon: "📝",
    color: "primary",
    difficultyKey: "difficultyAllLevels",
    xpMultiplier: "1x",
    available: true,
    href: "/quiz",
  },
  {
    id: "timed",
    nameKey: "modeSpeedName",
    descKey: "modeSpeedDesc",
    icon: "⚡",
    color: "tertiary",
    difficultyKey: "difficultyIntermediate",
    xpMultiplier: "1.5x",
    available: true,
    href: "/play/timed",
  },
  {
    id: "survival",
    nameKey: "modeSurvivalName",
    descKey: "modeSurvivalDesc",
    icon: "🏆",
    color: "secondary",
    difficultyKey: "difficultyAdvanced",
    xpMultiplier: "2x",
    available: true,
    href: "/play/survival",
  },
  {
    id: "practice",
    nameKey: "modePracticeName",
    descKey: "modePracticeDesc",
    icon: "🎯",
    color: "primary",
    difficultyKey: "difficultyBeginner",
    xpMultiplier: "0.5x",
    available: true,
    href: "/play/practice",
  },
  {
    id: "tournament",
    nameKey: "modeTournamentName",
    descKey: "modeTournamentDesc",
    icon: "👑",
    color: "warning",
    difficultyKey: "difficultyExpert",
    xpMultiplier: "5x",
    available: true,
    href: "/multiplayer",
  },
]

export function GameModesPageClient({
  totalAttempts,
  accuracyPct,
  totalXp,
  todayChallenge,
}: {
  totalAttempts: number
  accuracyPct: number
  totalXp: number
  todayChallenge: { rewardCoins: number; rewardXp: number; completed: boolean } | null
}) {
  const { t, dir } = useLanguage()

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
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">{t("gameModesTitle")}</h1>
          <p className="text-on-surface-variant">{t("choosePathToKnowledge")}</p>
        </div>
        <div className="w-20" />
      </motion.div>

      {/* Daily Challenge feature card - real data */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-tertiary/10" />
        <IslamicPattern variant="flat" className="inset-auto right-0 top-0 h-64 w-64 rotate-12" />
        <div className="relative z-10">
          <PremiumBadge variant="warning" size="md" className="mb-4">{t("todaySpecialBadge")}</PremiumBadge>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">{t("dailyChallengeTitle")}</h2>
          {todayChallenge ? (
            <>
              <p className="text-on-surface-variant mb-4">
                {todayChallenge.completed ? t("challengeCompletedMsg") : t("challengeIncompleteMsg")}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.98-3.12 3.19z" />
                  </svg>
                  <span className="font-bold text-tertiary">+{todayChallenge.rewardCoins} {t("coinsWord").toLowerCase()}, +{todayChallenge.rewardXp} {t("barakahShort")}</span>
                </div>
              </div>
              {!todayChallenge.completed && (
                <Link href="/quiz">
                  <PremiumButton variant="primary" size="lg">{t("startDailyChallenge")}</PremiumButton>
                </Link>
              )}
            </>
          ) : (
            <p className="text-on-surface-variant mb-4">{t("noDailyChallengeToday")}</p>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-6">{t("allGameModesTitle")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Playable modes first. Three of the five are not built yet, and
              interleaving them — Classic, then three greyed cards, then
              Tournament — made a page with two working modes read as a page
              with none. They are still listed, still honestly labelled
              "coming soon"; they just stop separating the things a player can
              actually press. `sort` on a copy, so the source order stays the
              declaration order. */}
          {[...gameModes]
            .sort((a, b) => Number(b.available) - Number(a.available))
            .map((mode, index) => (
            <motion.div key={mode.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
              <PremiumCard hover={mode.available} className={`p-6 h-full ${!mode.available ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center">
                    <span className="text-3xl">{mode.icon}</span>
                  </div>
                  <PremiumBadge variant={mode.color} size="sm">{t(mode.difficultyKey)}</PremiumBadge>
                </div>
                <h3 className="font-bold text-on-surface text-lg mb-2">{t(mode.nameKey)}</h3>
                <p className="text-on-surface-variant mb-4">{t(mode.descKey)}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z" />
                    </svg>
                    <span className="font-bold text-primary">{mode.xpMultiplier} {t("barakahShort")}</span>
                  </div>
                  {mode.available && mode.href ? (
                    <Link href={mode.href}>
                      <PremiumButton variant="primary" size="sm">{t("playButton")}</PremiumButton>
                    </Link>
                  ) : (
                    <PremiumButton variant="secondary" size="sm" disabled>{t("comingSoon")}</PremiumButton>
                  )}
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Your Stats - real data */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12 glass-card p-6">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-6">{t("yourStatsTitle")}</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="font-bold text-3xl text-primary">{totalAttempts.toLocaleString()}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">{t("questions").toUpperCase()}</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-3xl text-secondary">{totalAttempts > 0 ? `${accuracyPct}%` : "—"}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">{t("accuracy").toUpperCase()}</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-3xl text-primary-fixed">{totalXp.toLocaleString()}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">{t("totalXp").toUpperCase()}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
