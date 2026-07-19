"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { MysteryChest } from "@/components/game/MysteryChest"
import { PremiumProgress } from "@/components/ui/premium-progress"

const dailyRewards = [
  { day: 1, coins: 10, xp: 50, claimed: true },
  { day: 2, coins: 20, xp: 75, claimed: true },
  { day: 3, coins: 30, xp: 100, claimed: true },
  { day: 4, coins: 40, xp: 125, claimed: false, isToday: true },
  { day: 5, coins: 50, xp: 150, claimed: false },
  { day: 6, coins: 75, xp: 200, claimed: false },
  { day: 7, coins: 100, xp: 500, claimed: false, isSpecial: true },
]

const spinWheelSegments = [
  { label: "10 XP", color: "bg-primary", probability: 30 },
  { label: "25 XP", color: "bg-secondary", probability: 25 },
  { label: "50 XP", color: "bg-tertiary", probability: 20 },
  { label: "100 XP", color: "bg-primary", probability: 10 },
  { label: "250 XP", color: "bg-secondary", probability: 5 },
  { label: "500 XP", color: "bg-tertiary", probability: 3 },
  { label: "Mystery Box", color: "bg-primary", probability: 5 },
  { label: "Double XP", color: "bg-secondary", probability: 2 },
]

export default function RewardsPage() {
  const [spinAngle, setSpinAngle] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [chestsOpened, setChestsOpened] = useState(0)

  const handleSpin = () => {
    if (isSpinning) return
    setIsSpinning(true)
    const randomAngle = Math.floor(Math.random() * 360) + 1440
    setSpinAngle((prev) => prev + randomAngle)
    setTimeout(() => setIsSpinning(false), 3000)
  }

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
            Rewards Center
          </h1>
          <p className="text-on-surface-variant">Claim your rewards and try your luck</p>
        </div>
        <div className="w-20" />
      </motion.div>

      {/* Daily Login Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Daily Login Rewards
          </h2>
          <PremiumBadge variant="warning" size="md">
            Day {dailyRewards.find((r) => r.isToday)?.day || 1}/7
          </PremiumBadge>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {dailyRewards.map((reward, index) => (
            <motion.div
              key={reward.day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`
                relative p-3 rounded-xl text-center
                ${reward.claimed
                  ? "bg-primary/20 border border-primary/30"
                  : reward.isToday
                  ? "bg-tertiary/20 border-2 border-tertiary animate-pulse"
                  : "bg-surface-container-high border border-white/5"
                }
                ${reward.isSpecial ? "ring-2 ring-tertiary" : ""}
              `}
            >
              {reward.isSpecial && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-tertiary rounded-full flex items-center justify-center">
                  <span className="text-xs text-on-tertiary">★</span>
                </div>
              )}
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">
                DAY {reward.day}
              </p>
              <p className="font-bold text-on-surface">{reward.coins}</p>
              <p className="text-xs text-on-surface-variant">coins</p>
              {reward.claimed && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/30 rounded-xl">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spin Wheel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PremiumCard className="p-6">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6">
              Spin the Wheel
            </h2>
            <div className="relative w-64 h-64 mx-auto mb-6">
              {/* Wheel */}
              <motion.div
                animate={{ rotate: spinAngle }}
                transition={{ duration: 3, ease: "easeOut" }}
                className="w-full h-full rounded-full border-4 border-primary overflow-hidden"
                style={{
                  background: `conic-gradient(from 0deg, ${
                    spinWheelSegments.map((s, i) => {
                      const start = (i / spinWheelSegments.length) * 100
                      const end = ((i + 1) / spinWheelSegments.length) * 100
                      return `${s.color === "bg-primary" ? "#4edea3" : s.color === "bg-secondary" ? "#b4c5ff" : "#e9c349"} ${start}% ${end}%`
                    }).join(", ")
                  })`,
                }}
              >
                {spinWheelSegments.map((segment, index) => {
                  const angle = (index / spinWheelSegments.length) * 360
                  return (
                    <div
                      key={index}
                      className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-white/30"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: "left center",
                      }}
                    />
                  )
                })}
              </motion.div>
              {/* Center Pointer */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-surface rounded-full border-2 border-primary shadow-lg flex items-center justify-center">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary -mt-2" />
              </div>
            </div>
            <div className="text-center">
              <PremiumButton
                variant="primary"
                size="lg"
                onClick={handleSpin}
                disabled={isSpinning}
              >
                {isSpinning ? "Spinning..." : "Spin for Free!"}
              </PremiumButton>
              <p className="text-sm text-on-surface-variant mt-2">
                Next free spin in 4 hours
              </p>
            </div>
          </PremiumCard>
        </motion.div>

        {/* Mystery Chests */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Mystery Chests
              </h2>
              <PremiumBadge variant="primary" size="sm">
                {chestsOpened} opened
              </PremiumBadge>
            </div>
            <div className="flex justify-center gap-4 mb-6">
              {(["bronze", "silver", "gold"] as const).map((tier, index) => (
                <motion.div
                  key={tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <MysteryChest
                    tier={tier}
                    onOpen={() => setChestsOpened((prev) => prev + 1)}
                  />
                </motion.div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-on-surface-variant mb-2">
                Open chests to earn coins, XP, and exclusive items!
              </p>
              <PremiumButton variant="secondary" size="sm">
                Buy More Chests
              </PremiumButton>
            </div>
          </PremiumCard>
        </motion.div>
      </div>

      {/* Weekly Challenge Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Weekly Challenge Progress
          </h2>
          <PremiumBadge variant="warning" size="md">3 days left</PremiumBadge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-on-surface-variant">Questions Answered</span>
              <span className="font-bold text-on-surface">35/50</span>
            </div>
            <PremiumProgress value={35} max={50} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-on-surface-variant">Accuracy Target</span>
              <span className="font-bold text-on-surface">87%/90%</span>
            </div>
            <PremiumProgress value={87} max={90} variant="secondary" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-on-surface-variant">Study Time</span>
              <span className="font-bold text-on-surface">4.5h/5h</span>
            </div>
            <PremiumProgress value={4.5} max={5} variant="tertiary" />
          </div>
        </div>
        <div className="mt-6 text-center">
          <PremiumButton variant="primary">
            View Challenge Details
          </PremiumButton>
        </div>
      </motion.div>
    </div>
  )
}
