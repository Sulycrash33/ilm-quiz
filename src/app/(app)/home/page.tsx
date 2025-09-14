"use client"

import { GameDashboard } from "@/components/game/GameDashboard"
import { IslamicPattern } from "@/components/islamic-pattern"

export default function HomePage() {
  return (
    <main
      role="main"
      aria-label="IlmQuest Game Dashboard"
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950 dark:via-slate-950 dark:to-emerald-900"
    >
      {/* Decorative background pattern */}
      <IslamicPattern aria-hidden="true" className="absolute inset-0" />

      {/* Foreground content */}
      <div className="relative z-10 container mx-auto px-4 py-10">
        <GameDashboard />
      </div>
    </main>
  )
}
