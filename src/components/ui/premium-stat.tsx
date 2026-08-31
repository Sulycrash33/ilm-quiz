"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface PremiumStatProps {
  label: string
  value: string | number | React.ReactNode
  icon?: ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  className?: string
}

export function PremiumStat({
  label,
  value,
  icon,
  trend,
  trendValue,
  className = "",
}: PremiumStatProps) {
  const trendColors = {
    up: "text-success",
    down: "text-error",
    neutral: "text-on-surface-variant",
  }

  const trendIcons = {
    up: "↑",
    down: "↓",
    neutral: "→",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center ${className}`}
    >
      {icon && (
        <div className="flex items-center gap-1 justify-center mb-1">
          {icon}
          <span className="font-bold text-headline-md text-on-surface">
            {value}
          </span>
        </div>
      )}
      {!icon && (
        <span className="font-bold text-headline-md text-on-surface block">
          {value}
        </span>
      )}
      <p className="font-label-caps text-label-caps text-on-surface-variant/70 uppercase tracking-widest">
        {label}
      </p>
      {trend && trendValue && (
        <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${trendColors[trend]}`}>
          <span>{trendIcons[trend]}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </motion.div>
  )
}
