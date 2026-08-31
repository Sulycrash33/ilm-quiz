"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface PremiumBadgeProps {
  children: ReactNode
  variant?: "primary" | "secondary" | "tertiary" | "success" | "warning" | "danger"
  size?: "sm" | "md"
  pulse?: boolean
  className?: string
}

export function PremiumBadge({
  children,
  variant = "primary",
  size = "sm",
  pulse = false,
  className = "",
}: PremiumBadgeProps) {
  const variants = {
    primary: "bg-primary/20 text-primary border-primary/30",
    secondary: "bg-secondary/20 text-secondary border-secondary/30",
    tertiary: "bg-tertiary/20 text-tertiary border-tertiary/30",
    success: "bg-success/20 text-success border-success/30",
    warning: "bg-warning/20 text-warning border-warning/30",
    danger: "bg-error/20 text-error border-error/30",
  }

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-1
        font-label-caps uppercase tracking-widest
        rounded-full border
        ${variants[variant]}
        ${sizes[size]}
        ${pulse ? "animate-pulse" : ""}
        ${className}
      `}
    >
      {children}
    </motion.span>
  )
}
