"use client"

import { motion } from "framer-motion"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  questions: { count: number }[]
}

interface CategoriesPageClientProps {
  categories: Category[]
}

export function CategoriesPageClient({ categories }: CategoriesPageClientProps) {
  return (
    <div className="min-h-[100dvh] px-5 py-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-2">
          Categories
        </h1>
        <p className="text-on-surface-variant">
          {categories.length} total categories
        </p>
      </motion.div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <PremiumCard className="p-8 text-center">
            <p className="text-on-surface-variant">No categories yet.</p>
          </PremiumCard>
        ) : (
          categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PremiumCard className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <span className="text-2xl">{category.icon || "📚"}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-on-surface">{category.name}</h3>
                      <p className="text-sm text-on-surface-variant">{category.description ?? "No description"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-primary">{category.questions?.[0]?.count ?? 0}</p>
                      <p className="text-sm text-on-surface-variant">questions</p>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
