"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import { AvatarArt } from "@/components/avatars/avatar-art"

interface PremiumAvatarProps {
  src?: string
  /**
   * The avatar chosen during onboarding, e.g. "m-3".
   *
   * Until now this component never received one. Onboarding stored the choice
   * in `profiles.avatar_id` and nothing ever read it back, so every player —
   * including those who had picked a face — saw the generic silhouette below.
   * The art was there the whole time; nothing drew it.
   */
  avatarId?: string | null
  alt?: string
  size?: "sm" | "md" | "lg" | "xl"
  ring?: boolean
  ringColor?: "primary" | "secondary" | "tertiary" | "success"
  status?: "online" | "offline" | "away"
  className?: string
}

export function PremiumAvatar({
  src,
  avatarId,
  alt,
  size = "md",
  ring = false,
  ringColor = "primary",
  status,
  className = "",
}: PremiumAvatarProps) {
  const { t } = useLanguage()
  const altText = alt ?? t("avatarAlt")
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  const ringColors = {
    primary: "border-primary",
    secondary: "border-secondary",
    tertiary: "border-tertiary",
    success: "border-success",
  }

  const statusColors = {
    online: "bg-success",
    offline: "bg-outline",
    away: "bg-warning",
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative inline-block ${className}`}
    >
      <div
        className={`
          ${sizes[size]}
          rounded-full overflow-hidden
          ${ring ? `border-2 ${ringColors[ringColor]}` : ""}
          shadow-lg
        `}
      >
        {src ? (
          <img src={src} alt={altText} className="w-full h-full object-cover" />
        ) : avatarId ? (
          // `AvatarArt` falls back to its own mark for an unknown id, which is
          // what an account still holding a pre-migration remote URL will hit.
          <AvatarArt id={avatarId} role="img" aria-label={altText} className="w-full h-full" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center">
            <svg
              className="w-1/2 h-1/2 text-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>
      {status && (
        <div
          className={`
            absolute bottom-0 right-0
            w-3 h-3 rounded-full
            ${statusColors[status]}
            border-2 border-surface
          `}
        />
      )}
    </motion.div>
  )
}
