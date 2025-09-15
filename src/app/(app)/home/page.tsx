"use client"

import { GameDashboard } from "@/components/game/GameDashboard"

export default function HomePage() {
  return (
    <main
      role="main"
      aria-label="IlmQuest Game Dashboard"
      className="min-h-screen"
    >
      {/* Foreground content */}
      <div className="relative z-10 container mx-auto px-4 py-10">
        <GameDashboard />
      </div>
    </main>
  )
}
