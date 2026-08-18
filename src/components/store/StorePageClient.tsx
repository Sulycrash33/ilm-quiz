"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useMemo, useState } from "react"
import { PremiumButton } from "@/components/ui/premium-button"
import { ShopItem } from "@/components/game/ShopItem"
import { purchaseStoreItem, type StoreCatalogueItem } from "@/app/(app)/store/actions"
import { useLanguage } from "@/contexts/LanguageContext"
import type { Translations } from "@/lib/i18n"

type StoreTab = "lifelines" | "powerups" | "cosmetics" | "bundles"

/**
 * The catalogue is no longer hardcoded here.
 *
 * There used to be an inline `storeItems` map in this file AND a second one in
 * src/data/store-items.ts, and they disagreed: item "1" was 100 coins here and
 * 50 there. Worse, the price rendered here was the price sent to the server to
 * deduct. Both are fixed by reading the catalogue from `store_items` on the
 * server (see migration 0006) and sending only an item id when buying.
 */
interface StorePageClientProps {
  initialCoins: number
  catalogue: StoreCatalogueItem[]
}

export function StorePageClient({ initialCoins, catalogue }: StorePageClientProps) {
  const { t, dir } = useLanguage()
  const [activeTab, setActiveTab] = useState<StoreTab>("lifelines")
  const [coins, setCoins] = useState(initialCoins)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  // Owned counts start from the server and are bumped locally on a successful
  // purchase, so an item flips to "Owned" without a round trip.
  const [owned, setOwned] = useState<Record<string, number>>(() =>
    Object.fromEntries(catalogue.map((i) => [i.id, i.owned])),
  )

  const visibleItems = useMemo(
    () => catalogue.filter((item) => item.tab === activeTab),
    [catalogue, activeTab],
  )

  const tabs: { id: StoreTab; label: string; icon: React.ReactNode }[] = [
    { id: "lifelines", label: t("lifelines"), icon: <span className="text-lg">🎯</span> },
    { id: "powerups", label: t("powerups"), icon: <span className="text-lg">⚡</span> },
    { id: "cosmetics", label: t("cosmetics"), icon: <span className="text-lg">✨</span> },
    { id: "bundles", label: t("bundles"), icon: <span className="text-lg">📦</span> },
  ]

  const handlePurchase = async (id: string, name: string) => {
    setPendingId(id)
    setMessage(null)
    // Only the id goes to the server. It decides the price.
    const result = await purchaseStoreItem(id)
    setPendingId(null)

    if (result.success && result.newBalance !== undefined) {
      setCoins(result.newBalance)
      setOwned((prev) => ({ ...prev, [id]: result.quantity ?? (prev[id] ?? 0) + 1 }))
      // Report the price the server charged, not the one this page displayed.
      setMessage(t("purchasedMsg", { name, price: result.price ?? 0 }))
    } else {
      if (result.newBalance !== undefined) setCoins(result.newBalance)
      setMessage(result.error ?? t("purchaseFailedMsg"))
    }
  }

  return (
    <div dir={dir} className="min-h-screen px-5 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <Link href="/home">
          <PremiumButton variant="ghost" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("back")}
          </PremiumButton>
        </Link>
        <div className="text-center">
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">{t("ilmStore")}</h1>
          <p className="text-on-surface-variant">{t("enhanceLearning")}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-tertiary/10 px-4 py-2 rounded-full border border-tertiary/30">
            <svg className="w-5 h-5 text-tertiary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.98-3.12 3.19z" />
            </svg>
            <span className="font-bold text-tertiary">{coins.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center text-sm text-on-surface-variant">
          {message}
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-caps text-label-caps uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleItems.map((item, index) => {
            const isOwned = !item.consumable && (owned[item.id] ?? 0) > 0
            return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <ShopItem
                name={t(item.nameKey as keyof Translations)}
                description={t(item.descKey as keyof Translations)}
                price={item.price}
                icon={item.icon}
                category={item.category}
                isOwned={isOwned}
                onPurchase={
                  isOwned || !item.inStock
                    ? undefined
                    : () => handlePurchase(item.id, t(item.nameKey as keyof Translations))
                }
              />
              {pendingId === item.id && <p className="text-xs text-on-surface-variant text-center mt-1">{t("processingLabel")}</p>}
              {item.consumable && (owned[item.id] ?? 0) > 0 && (
                <p className="text-xs text-tertiary text-center mt-1">×{owned[item.id]}</p>
              )}
            </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>

      <p className="text-xs text-on-surface-variant text-center mt-8">
        {t("storeFootnote")}
      </p>
    </div>
  )
}
