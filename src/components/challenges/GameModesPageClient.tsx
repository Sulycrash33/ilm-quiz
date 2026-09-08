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
}: {
  totalAttempts: number
  accuracyPct: number
  totalXp: number
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

      {/* The daily challenge is not on this page at all any more, and neither
          is a `todayChallenge` prop describing it.

          It was rendered here twice once — a compact `DailyChallengeCard` that
          knew the player's progress, and a larger "Today's special" panel that
          did not — and after that was fixed the surviving card still stood
          beside a `Daily Login Reward` on `/rewards` asking for the same five
          questions under a different name. The two are one thing, so they are
          in one place: the Rewards Center, where the coins the five questions
          pay for are collected. This page keeps the game modes, which is its
          job. */}

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
