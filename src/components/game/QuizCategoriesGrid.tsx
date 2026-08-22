"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumProgress } from "@/components/ui/premium-progress"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { useLanguage } from "@/contexts/LanguageContext"
import type { QuizCategory } from "@/lib/quiz-service"

export function QuizCategoriesGrid({ categories }: { categories: QuizCategory[] }) {
  const { t, dir } = useLanguage()
  const totalPublished = categories.reduce((s, c) => s + c.publishedCount, 0)
  const totalAnswered = categories.reduce((s, c) => s + c.answeredCount, 0)

  return (
    <div dir={dir} className="min-h-[100dvh] px-5 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-2">
          {t("knowledgeCategories")}
        </h1>
        <p className="text-on-surface-variant">
          {categories.length} {t("categories").toLowerCase()} · {totalPublished} {t("questionsAvailable")} ·{" "}
          {totalAnswered} {t("questionsAnswered")}
        </p>

        {/* The way back to the rules. Every category here is nine locked
            tiers deep, and a player who signed up before the explainer
            existed — or who skipped it — has nowhere else to find out why. */}
        <Link
          href="/onboarding/how-it-works"
          className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline"
        >
          {t("howItWorksLink")}
        </Link>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-8"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-bold text-3xl text-primary">{categories.length}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">
              {t("categories").toUpperCase()}
            </p>
          </div>
          <div>
            <p className="font-bold text-3xl text-secondary">{totalPublished}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">
              {t("questions").toUpperCase()}
            </p>
          </div>
          <div>
            <p className="font-bold text-3xl text-tertiary">{totalAnswered}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">
              {t("completedLabel").toUpperCase()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <span className="text-6xl mb-4 block">📚</span>
          <p className="text-on-surface-variant">{t("comingSoon")}</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const hasQuestions = category.publishedCount > 0

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {hasQuestions ? (
                  <Link href={`/quiz/${category.slug}`}>
                    <PremiumCard
                      hover
                      className="p-6 h-full"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center">
                          <span className="text-2xl">{category.icon || "📚"}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-on-surface">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-on-surface-variant line-clamp-1">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <PremiumProgress
                        value={category.answeredCount}
                        max={category.publishedCount}
                        showLabel
                        label={`${category.answeredCount}/${category.publishedCount}`}
                      />
                    </PremiumCard>
                  </Link>
                ) : (
                  <PremiumCard hover={false} className="p-6 h-full opacity-60">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center">
                        <span className="text-2xl">{category.icon || "📚"}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-on-surface">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-on-surface-variant line-clamp-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <PremiumBadge variant="secondary" size="sm">
                      {t("comingSoon")}
                    </PremiumBadge>
                  </PremiumCard>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
