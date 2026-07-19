"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

interface MysteryChestProps {
  tier?: "bronze" | "silver" | "gold" | "diamond"
  onOpen?: () => void
  isOpened?: boolean
}

export function MysteryChest({
  tier = "bronze",
  onOpen,
  isOpened = false,
}: MysteryChestProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showReward, setShowReward] = useState(false)

  const tierColors = {
    bronze: {
      chest: "from-amber-700 to-amber-900",
      glow: "shadow-[0_0_30px_rgba(180,130,60,0.5)]",
      sparkle: "text-amber-400",
    },
    silver: {
      chest: "from-gray-300 to-gray-500",
      glow: "shadow-[0_0_30px_rgba(200,200,220,0.5)]",
      sparkle: "text-gray-200",
    },
    gold: {
      chest: "from-yellow-400 to-yellow-600",
      glow: "shadow-[0_0_30px_rgba(255,200,0,0.5)]",
      sparkle: "text-yellow-300",
    },
    diamond: {
      chest: "from-cyan-300 to-blue-500",
      glow: "shadow-[0_0_30px_rgba(100,200,255,0.5)]",
      sparkle: "text-cyan-200",
    },
  }

  const handleOpen = () => {
    if (isOpened || isAnimating) return
    setIsAnimating(true)
    setTimeout(() => {
      setShowReward(true)
      onOpen?.()
    }, 1500)
  }

  return (
    <div className="relative">
      <motion.div
        whileHover={!isOpened ? { scale: 1.05 } : {}}
        whileTap={!isOpened ? { scale: 0.95 } : {}}
        onClick={handleOpen}
        className={`
          relative cursor-pointer
          ${!isOpened ? tierColors[tier].glow : ""}
        `}
      >
        {/* Chest Body */}
        <div
          className={`
            w-32 h-32 rounded-xl
            bg-gradient-to-br ${tierColors[tier].chest}
            flex items-center justify-center
            ${isOpened ? "opacity-50" : ""}
          `}
        >
          <svg
            className="w-16 h-16 text-white/80"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
          </svg>
        </div>

        {/* Sparkle Effects */}
        {!isOpened && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-1 ${tierColors[tier].sparkle} rounded-full`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * 40],
                  y: [0, (Math.random() - 0.5) * 40],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
                style={{
                  left: `${30 + Math.random() * 40}%`,
                  top: `${30 + Math.random() * 40}%`,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Reward Animation */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="text-4xl mb-2"
              >
                🎉
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-bold text-primary"
              >
                +50 XP
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
