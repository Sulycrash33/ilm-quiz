"use client";

import { motion } from "framer-motion";
import { Trophy, HeartCrack, Flame, Target, Gauge, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { RunSummary as RunSummaryData } from "@/lib/hunt-engine";
import { rankProgress, rankUpBetween } from "@/lib/ranks";
import { useEffect } from "react";
import { playCue } from "@/lib/sound";

interface RunSummaryProps {
  summary: RunSummaryData;
  /** Profile XP before this run, used to work out the rank climb. */
  xpBefore: number;
  onPlayAgain: () => void;
  onExit: () => void;
}

/**
 * The payoff screen.
 *
 * The old one showed three numbers, one of which ("coins") was local state that
 * had drifted from the real balance. This one reports what actually happened:
 * XP the server credited, how accurate the run was, the best combo reached, and
 * — the part that makes a run feel like progress rather than a score — where
 * the run left the seeker on the nine-rank climb.
 */
export function RunSummary({ summary, xpBefore, onPlayAgain, onExit }: RunSummaryProps) {
  const { t } = useLanguage();
  const won = summary.status === "won";

  const progress = rankProgress(xpBefore + summary.xp);
  const rankedUp = rankUpBetween(xpBefore, summary.xp);

  // The rarest cue in the game — nine times in a whole playthrough. Fires on
  // mount of the summary, once, and only when the run actually promoted them.
  useEffect(() => {
    if (rankedUp) playCue("rankUp");
  }, [rankedUp]);
  const RankIcon = progress.rank.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-2xl space-y-6"
    >
      <div className="space-y-3 text-center">
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          className={cn(
            "mx-auto flex h-20 w-20 items-center justify-center rounded-full",
            won ? "bg-primary/15 text-primary" : "bg-error/15 text-error",
          )}
        >
          {won ? <Trophy className="h-9 w-9" /> : <HeartCrack className="h-9 w-9" />}
        </motion.div>

        <h2 className="font-headline text-3xl text-on-surface">
          {won ? t("huntComplete") : t("outOfLives")}
        </h2>

        {summary.flawless && (
          <p className="inline-flex items-center gap-1.5 rounded-full bg-tertiary/15 px-3 py-1 text-sm font-semibold text-tertiary">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {t("flawlessRun")}
          </p>
        )}
      </div>

      {/* What the run actually earned. `xp` is server-credited; `speedScore`
          is a run score and is labelled as pace, never as XP. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={<Sparkles className="h-4 w-4" />} label={t("xpThisRound")} value={summary.xp} tone="primary" />
        <Stat icon={<Target className="h-4 w-4" />} label={t("accuracy")} value={`${summary.accuracy}%`} tone="secondary" />
        <Stat icon={<Flame className="h-4 w-4" />} label={t("bestComboLabel")} value={summary.bestCombo} tone="tertiary" />
        <Stat icon={<Gauge className="h-4 w-4" />} label={t("paceLabel")} value={summary.speedScore} tone="tertiary" />
      </div>

      <div className="rounded-xl bg-surface-container p-5 text-sm">
        <dl className="grid grid-cols-2 gap-y-3 sm:grid-cols-5">
          <Row label={t("answeredLabel")} value={summary.answered} />
          <Row label={t("correct")} value={summary.correct} />
          <Row label={t("incorrect")} value={summary.wrong} />
          <Row label={t("timesUp")} value={summary.timedOut} />
          <Row label={t("runScoreLabel")} value={summary.runScore} />
        </dl>
      </div>

      {/* The climb. This is the bit that makes one run connect to the next. */}
      <div className="space-y-3 rounded-xl bg-surface-container p-5">
        <div className="flex items-center gap-3">
          <RankIcon className={cn("h-6 w-6", progress.rank.theme)} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-on-surface">{progress.rank.title}</p>
            <p className="text-xs text-on-surface-variant">
              {progress.isMax
                ? t("maxRankReached")
                : t("xpToRank", { xp: progress.xpToNext, rank: progress.next!.title })}
            </p>
          </div>
          {rankedUp && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="rounded-full bg-tertiary/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-tertiary"
            >
              {progress.rank.title}
            </motion.span>
          )}
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="flex-1" onClick={onPlayAgain}>
          {t("playAgain")}
        </Button>
        <Button size="lg" variant="outline" className="flex-1" onClick={onExit}>
          {t("backToCategories")}
        </Button>
      </div>
    </motion.div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone: "primary" | "secondary" | "tertiary";
}) {
  return (
    <div className="rounded-xl bg-surface-container p-4 text-center">
      <div
        className={cn(
          "mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg",
          tone === "primary" && "bg-primary/15 text-primary",
          tone === "secondary" && "bg-secondary/15 text-secondary",
          tone === "tertiary" && "bg-tertiary/15 text-tertiary",
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="text-2xl font-bold tabular-nums text-on-surface">{value}</div>
      <div className="text-xs text-on-surface-variant">{label}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs text-on-surface-variant">{label}</dt>
      <dd className="font-semibold tabular-nums text-on-surface">{value}</dd>
    </div>
  );
}
