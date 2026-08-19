"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface PremiumIconProps {
  children: ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "circle" | "rounded" | "square"
  color?: "primary" | "secondary" | "tertiary" | "success" | "warning" | "danger"
  glow?: boolean
  className?: string
}

export function PremiumIcon({
  children,
  size = "md",
  variant = "circle",
  color = "primary",
  glow = false,
  className = "",
}: PremiumIconProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  }

  const variants = {
    circle: "rounded-full",
    rounded: "rounded-xl",
    square: "rounded-none",
  }

  const colors = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    tertiary: "bg-tertiary/10 text-tertiary",
    success: "bg-green-500/10 text-green-400",
    warning: "bg-yellow-500/10 text-yellow-400",
    danger: "bg-error/10 text-error",
  }

  const glowEffects = {
    primary: "shadow-[0_0_20px_rgba(240, 205, 109,0.3)]",
    secondary: "shadow-[0_0_20px_rgba(180,197,255,0.3)]",
    tertiary: "shadow-[0_0_20px_rgba(233,195,73,0.3)]",
    success: "shadow-[0_0_20px_rgba(34,197,94,0.3)]",
    warning: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
    danger: "shadow-[0_0_20px_rgba(255,180,171,0.3)]",
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`
        ${sizes[size]}
        ${variants[variant]}
        ${colors[color]}
        ${glow ? glowEffects[color] : ""}
        flex items-center justify-center
        transition-all duration-200
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
