"use client";

import { Heart, Coins, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { comboMultiplier, HUNT_RULES, type Difficulty } from "@/lib/hunt-engine";
import { TimerRing } from "./TimerRing";

interface HuntHeaderProps {
  stage: number;
  totalStages: number;
  lives: number;
  coins: number;
  combo: number;
  tier: Difficulty;
  remaining: number;
  timeLimit: number;
  frozen: boolean;
}

const TIER_STYLE: Record<Difficulty, string> = {
  Beginner: "border-primary/40 text-primary",
  Intermediate: "border-secondary/40 text-secondary",
  Advanced: "border-tertiary/40 text-tertiary",
};

/**
 * Everything the player needs mid-question without looking away from it:
 * how far into the run they are, what's left of the clock, and what a miss
 * would cost. Lives are drawn as discrete hearts rather than a number because
 * the count is small and losing one should be legible instantly.
 */
export function HuntHeader({
  stage,
  totalStages,
  lives,
  coins,
  combo,
  tier,
  remaining,
  timeLimit,
  frozen,
}: HuntHeaderProps) {
  const { t } = useLanguage();
  const multiplier = comboMultiplier(combo);
  const progress = totalStages === 0 ? 0 : (stage / totalStages) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-label-caps uppercase tracking-wider text-on-surface-variant">
            {t("progress")}
          </p>
          <p className="truncate text-headline-md text-primary">
            {t("huntStage", { current: Math.min(stage + 1, totalStages), total: totalStages })}
          </p>
          <span
            className={cn(
              "inline-block rounded-full border px-2 py-0.5 text-label-caps uppercase tracking-wider",
              TIER_STYLE[tier],
            )}
          >
            {tier}
          </span>
        </div>

        <TimerRing remaining={remaining} total={timeLimit} frozen={frozen} />
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={totalStages}
        aria-valuenow={stage}
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 24 }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span className="flex items-center gap-1.5" aria-label={`${lives} ${t("livesLabel")}`}>
          {Array.from({ length: HUNT_RULES.startingLives }).map((_, i) => (
            <Heart
              key={i}
              aria-hidden="true"
              className={cn(
                "h-4 w-4 transition-colors",
                i < lives ? "fill-error text-error" : "text-surface-container-highest",
              )}
            />
          ))}
        </span>

        <span className="flex items-center gap-1.5 text-tertiary">
          <Coins className="h-4 w-4" aria-hidden="true" />
          <span className="tabular-nums font-semibold">{coins}</span>
          <span className="sr-only">{t("coinsWord")}</span>
        </span>

        {combo > 0 && (
          <motion.span
            key={combo}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "flex items-center gap-1.5 font-semibold",
              multiplier > 1 ? "text-tertiary" : "text-primary",
            )}
          >
            <Flame className="h-4 w-4" aria-hidden="true" />
            {multiplier > 1 ? t("comboX", { multiplier }) : `${combo} ${t("comboLabel")}`}
          </motion.span>
        )}
      </div>
    </div>
  );
}
