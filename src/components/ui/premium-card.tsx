"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface PremiumCardProps {
  children: ReactNode
  className?: string
  variant?: "glass" | "solid" | "gradient"
  hover?: boolean
  animate?: boolean
  delay?: number
  onClick?: () => void
}

export function PremiumCard({
  children,
  className = "",
  variant = "glass",
  hover = true,
  animate = true,
  delay = 0,
  onClick,
}: PremiumCardProps) {
  const variants = {
    glass: "glass-card",
    solid: "bg-surface-container border border-white/5",
    gradient:
      "bg-gradient-to-br from-surface-container to-surface-container-high border border-white/5",
  }

  const baseClasses = `${variants[variant]} rounded-xl ${className}`

  if (!animate) {
    return (
      <div
        onClick={onClick}
        className={`${baseClasses} ${
          hover ? "interactive-card" : ""
        } ${onClick ? "cursor-pointer" : ""}`}
      >
        {children}
      </div>
    )
  }

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`${baseClasses} ${hover ? "interactive-card" : ""} ${onClick ? "cursor-pointer" : ""}`}
    >
      {children}
    </motion.div>
  )
}
