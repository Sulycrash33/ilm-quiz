"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import Link from "next/link"

interface PremiumButtonProps {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  href?: string
  onClick?: () => void
  className?: string
  disabled?: boolean
  fullWidth?: boolean
}

export function PremiumButton({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  className = "",
  disabled = false,
  fullWidth = false,
}: PremiumButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center font-bold
    transition-all duration-200 ease-out
    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? "w-full" : ""}
  `

  const variants = {
    primary: "bg-primary text-on-primary hover:opacity-90 shadow-lg glow-effect",
    secondary:
      "bg-surface-container-high text-on-surface border border-white/5 hover:bg-surface-container-highest",
    ghost: "bg-transparent text-on-surface hover:bg-white/5",
    danger: "bg-error text-white hover:opacity-90",
  }

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-lg",
    lg: "px-8 py-4 text-lg rounded-full",
  }

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

  const motionProps = {
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.02 },
  }

  if (href) {
    return (
      <motion.div {...motionProps}>
        <Link href={href} className={classes}>
          {children}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button
      {...motionProps}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </motion.button>
  )
}
