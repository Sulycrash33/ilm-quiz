"use client"

import { motion } from "framer-motion"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { useLanguage } from "@/contexts/LanguageContext"

interface ShopItemProps {
  name: string
  description: string
  price: number
  icon: string
  category: "avatar" | "theme" | "power-up" | "badge"
  isOwned?: boolean
  onPurchase?: () => void
}

export function ShopItem({
  name,
  description,
  price,
  icon,
  category,
  isOwned = false,
  onPurchase,
}: ShopItemProps) {
  const { t } = useLanguage()
  const categoryColors = {
    avatar: "primary",
    theme: "secondary",
    "power-up": "tertiary",
    badge: "warning",
  } as const
  const categoryLabels: Record<typeof category, string> = {
    avatar: t("catAvatar"),
    theme: t("catTheme"),
    "power-up": t("catPowerUp"),
    badge: t("catBadge"),
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass-card p-4 relative overflow-hidden group"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-surface-container-high to-surface-container flex items-center justify-center">
          <span className="text-4xl">{icon}</span>
        </div>

        {/* Info */}
        <div className="text-center mb-4">
          <PremiumBadge variant={categoryColors[category]} size="sm" className="mb-2">
            {categoryLabels[category]}
          </PremiumBadge>
          <h4 className="font-bold text-on-surface mb-1">{name}</h4>
          <p className="text-sm text-on-surface-variant line-clamp-2">
            {description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-tertiary font-bold">{price}</span>
            <svg className="w-4 h-4 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.98-3.12 3.19z" />
            </svg>
          </div>
          <PremiumButton
            variant={isOwned ? "ghost" : "primary"}
            size="sm"
            onClick={onPurchase}
            disabled={isOwned}
          >
            {isOwned ? t("owned") : t("buy")}
          </PremiumButton>
        </div>
      </div>
    </motion.div>
  )
}
