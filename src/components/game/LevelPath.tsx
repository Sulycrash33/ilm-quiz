"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RANKS } from "@/lib/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CategoryLevel } from "@/lib/quiz-service";

interface LevelPathProps {
  categorySlug: string;
  categoryName: string;
  categoryDescription: string | null;
  categoryIcon: string | null;
  levels: CategoryLevel[];
}

/**
 * The adventure path: one category's nine tiers, laid out as a winding trail
 * of locked/unlocked/completed nodes instead of the old single "start" button
 * that dropped straight into an adaptive, every-tier-blended run.
 *
 * Each node is one of the nine ranks (Mubtadi through Mujaddid) — the same
 * ladder a seeker climbs profile-wide, here scoped to one category. Finishing
 * a level (answering every published question in that tier correctly at
 * least once — see `getCategoryLevels`) is what unlocks the next node; a
 * locked node is not a link.
 */
export function LevelPath({
  categorySlug,
  categoryName,
  categoryDescription,
  categoryIcon,
  levels,
}: LevelPathProps) {
  const { t, dir } = useLanguage();

  return (
    <div dir={dir} className="container mx-auto max-w-2xl px-4 py-6">
      <header className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/quiz">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToCategories")}
          </Link>
        </Button>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 space-y-2 text-center"
      >
        <div className="text-5xl" aria-hidden="true">
          {categoryIcon ?? "📚"}
        </div>
        <h1 className="font-headline text-3xl text-primary">{categoryName}</h1>
        {categoryDescription && (
          <p className="mx-auto max-w-prose text-on-surface-variant">{categoryDescription}</p>
        )}
      </motion.div>

      <ol className="relative space-y-4 pb-8">
        {/* The connecting trail. A simple vertical line is enough to read as
            a path without needing per-node offset math to stay legible on
            narrow screens. */}
        <div
          aria-hidden="true"
          className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary/40 via-primary/15 to-transparent"
        />

        {levels.map((level, index) => {
          const rank = RANKS[index] ?? RANKS[RANKS.length - 1];
          const Icon = rank.icon;
          const state: "locked" | "unlocked" | "completed" = level.completed
            ? "completed"
            : level.unlocked
              ? "unlocked"
              : "locked";

          const node = (
            <div
              className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                state === "locked"
                  ? "border-white/5 bg-surface-container/60 opacity-60"
                  : state === "completed"
                    ? "border-primary/30 bg-primary/10"
                    : "border-white/10 bg-surface-container hover:bg-surface-container-high"
              }`}
            >
              <div
                className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${
                  state === "locked"
                    ? "border-white/10 bg-surface-container-high text-on-surface-variant"
                    : state === "completed"
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-primary/60 bg-primary/10 text-primary"
                }`}
              >
                {state === "locked" ? (
                  <Lock className="h-5 w-5" aria-hidden="true" />
                ) : state === "completed" ? (
                  <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Icon className="h-6 w-6" aria-hidden="true" />
                )}
              </div>

              <div className="min-w-0 flex-1 text-left">
                <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                  {t("levelLabel")} {level.tier}
                </p>
                <p className="truncate font-semibold text-on-surface">{rank.title}</p>
                {state === "locked" ? (
                  <p className="text-xs text-on-surface-variant">{t("completeLevelToUnlock")}</p>
                ) : level.publishedCount > 0 ? (
                  <p className="text-xs text-on-surface-variant">
                    {level.correctCount}/{level.publishedCount} {t("questions").toLowerCase()}
                  </p>
                ) : (
                  <p className="text-xs text-on-surface-variant">{t("comingSoon")}</p>
                )}
              </div>

              {state !== "locked" && level.publishedCount > 0 && (
                <Play
                  className={`h-5 w-5 shrink-0 ${state === "completed" ? "text-primary" : "text-on-surface-variant"}`}
                  aria-hidden="true"
                />
              )}
            </div>
          );

          return (
            <motion.li
              key={level.tier}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              {state === "locked" || level.publishedCount === 0 ? (
                <div aria-disabled="true">{node}</div>
              ) : (
                <Link href={`/quiz/${categorySlug}/${level.tier}`}>{node}</Link>
              )}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
