"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { useLanguage } from "@/contexts/LanguageContext"
import type { QuizCategory } from "@/lib/quiz-service"

export function QuizCategoriesGrid({ categories }: { categories: QuizCategory[] }) {
  const { t, dir } = useLanguage()
  // The size of the question bank is deliberately not shown anywhere on this
  // screen. It used to be, twice: once in the line under the heading and once
  // as a stat tile three times the size of the body text. A total tells a
  // player where the game ends, and everything after that is measured against
  // finishing rather than against learning. Working it out from nine levels
  // and a subject count is fair game; printing it is not. **Do not add it
  // back.** `answeredCount` stays — that is the player's own record, not the
  // shape of the bank.
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
          {categories.length} {t("categories").toLowerCase()} ·{" "}
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
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="font-bold text-3xl text-primary">{categories.length}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">
              {t("categories").toUpperCase()}
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
                      {/* The player's own count, and no denominator.

                          This was a `PremiumProgress` filled to
                          `answeredCount / publishedCount`, which broke two
                          rules at once.

                          It printed the percentage TWICE. `PremiumProgress`
                          renders `label` on the left and the computed
                          percentage on the right, and the label passed in was
                          that same percentage — so every card read "0%  0%",
                          twenty-nine times down the screen, fifty-eight
                          identical numbers on one page.

                          And the denominator was the size of the bank. This
                          project's oldest product rule is that a total hands
                          the player something to finish instead of something
                          to learn; it was taken off `/intro` and off this
                          page's heading, and then left on every card. A
                          seeker who cleared forty questions of Aqeedah saw
                          "7%", which is a discouraging way to describe a good
                          week — and the measured research on progress bars
                          says exactly that: a large denominator lowers
                          completion rather than raising it.

                          A count about the player is explicitly fine, and is
                          all this needs to be. */}
                      {category.answeredCount > 0 && (
                        <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant/70">
                          {category.answeredCount} {t("questionsAnswered")}
                        </p>
                      )}
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
