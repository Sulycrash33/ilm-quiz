"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { ShopItem } from "@/components/game/ShopItem"
import { MysteryChest } from "@/components/game/MysteryChest"

type StoreTab = "lifelines" | "powerups" | "cosmetics" | "bundles" | "chests"

const storeItems = {
  lifelines: [
    { id: "1", name: "50/50", description: "Remove two wrong answers", price: 100, icon: "🎯", category: "power-up" as const },
    { id: "2", name: "Hint", description: "Get a helpful hint", price: 50, icon: "💡", category: "power-up" as const },
    { id: "3", name: "Skip", description: "Skip to next question", price: 75, icon: "⏭️", category: "power-up" as const },
    { id: "4", name: "Double XP", description: "2x XP for next quiz", price: 200, icon: "⚡", category: "power-up" as const },
  ],
  powerups: [
    { id: "5", name: "Time Freeze", description: "Stop the timer for 30s", price: 150, icon: "❄️", category: "power-up" as const },
    { id: "6", name: "Score Multiplier", description: "3x score for one question", price: 250, icon: "🔥", category: "power-up" as const },
    { id: "7", name: "Second Chance", description: "Retry a wrong answer", price: 125, icon: "🔄", category: "power-up" as const },
    { id: "8", name: "Wisdom Boost", description: "Extra time for thinking", price: 100, icon: "🧠", category: "power-up" as const },
  ],
  cosmetics: [
    { id: "9", name: "Golden Avatar Frame", description: "Exclusive golden border", price: 500, icon: "🖼️", category: "avatar" as const },
    { id: "10", name: "Celestial Theme", description: "Premium app theme", price: 750, icon: "✨", category: "theme" as const },
    { id: "11", name: "Scholar Badge", description: "Special profile badge", price: 300, icon: "🎓", category: "badge" as const },
    { id: "12", name: "Star Particles", description: "Custom answer effects", price: 400, icon: "⭐", category: "avatar" as const },
  ],
  bundles: [
    { id: "13", name: "Starter Pack", description: "500 coins + 3 lifelines", price: 400, icon: "📦", category: "power-up" as const },
    { id: "14", name: "Scholar Bundle", description: "1000 coins + all power-ups", price: 800, icon: "📚", category: "power-up" as const },
    { id: "15", name: "Premium Collection", description: "All cosmetics + 2000 coins", price: 1500, icon: "👑", category: "avatar" as const },
    { id: "16", name: "Ultimate Pack", description: "Everything in the store", price: 3000, icon: "💎", category: "theme" as const },
  ],
}

export default function StorePage() {
  const [activeTab, setActiveTab] = useState<StoreTab>("lifelines")
  const [userCoins, setUserCoins] = useState(1250)

  const tabs: { id: StoreTab; label: string; icon: React.ReactNode }[] = [
    { id: "lifelines", label: "Lifelines", icon: <span className="text-lg">🎯</span> },
    { id: "powerups", label: "Power-ups", icon: <span className="text-lg">⚡</span> },
    { id: "cosmetics", label: "Cosmetics", icon: <span className="text-lg">✨</span> },
    { id: "bundles", label: "Bundles", icon: <span className="text-lg">📦</span> },
    { id: "chests", label: "Chests", icon: <span className="text-lg">🎁</span> },
  ]

  return (
    <div className="min-h-screen px-5 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <Link href="/home">
          <PremiumButton variant="ghost" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </PremiumButton>
        </Link>
        <div className="text-center">
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">
            ILM Store
          </h1>
          <p className="text-on-surface-variant">Enhance your learning journey</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-tertiary/10 px-4 py-2 rounded-full border border-tertiary/30">
            <svg className="w-5 h-5 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.98-3.12 3.19z" />
            </svg>
            <span className="font-bold text-tertiary">{userCoins.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Featured Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-tertiary/10" />
        <div className="absolute top-0 right-0 w-64 h-64 mashrabiya-pattern rotate-12 opacity-30" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <PremiumBadge variant="warning" size="md" className="mb-2">LIMITED TIME</PremiumBadge>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
              Special Offer: 2x Coins!
            </h2>
            <p className="text-on-surface-variant">
              Purchase any bundle and get double the coins. Offer ends in 24 hours!
            </p>
          </div>
          <PremiumButton variant="primary" size="lg">
            View Bundles
          </PremiumButton>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-8 overflow-x-auto pb-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              font-label-caps text-label-caps uppercase tracking-widest
              transition-all duration-200 whitespace-nowrap
              ${activeTab === tab.id
                ? "bg-primary text-on-primary"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "chests" ? (
          <motion.div
            key="chests"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {(["bronze", "silver", "gold", "diamond"] as const).map((tier, index) => (
              <motion.div
                key={tier}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <MysteryChest tier={tier} />
                <p className="mt-4 font-bold text-on-surface capitalize">{tier} Chest</p>
                <p className="text-sm text-on-surface-variant">
                  {[100, 250, 500, 1000][index]} coins
                </p>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {storeItems[activeTab].map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ShopItem
                  {...item}
                  onPurchase={() => setUserCoins((prev) => prev - item.price)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
