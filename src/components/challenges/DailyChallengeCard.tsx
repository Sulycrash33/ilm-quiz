"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Target, CheckCircle2, Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { claimDailyChallenge, type DailyChallengeView } from "@/app/(app)/challenges/actions";

/**
 * Today's challenge: the same five questions for everyone, with a bonus for
 * finishing them. The reward is claimed only after the questions are actually
 * answered — the server checks that against `attempts` before paying, so the
 * button is a convenience rather than the guard.
 */
export function DailyChallengeCard({ challenge }: { challenge: DailyChallengeView }) {
  const { t } = useLanguage();
  const [pending, startTransition] = useTransition();
  const [claimed, setClaimed] = useState(challenge.completed);
  const [message, setMessage] = useState<string | null>(null);

  const allAnswered = challenge.answered >= challenge.questionCount;
  const progress =
    challenge.questionCount === 0
      ? 0
      : Math.min(100, (challenge.answered / challenge.questionCount) * 100);

  const claim = () => {
    startTransition(async () => {
      const result = await claimDailyChallenge();
      if (result.success) {
        setClaimed(true);
        setMessage(t("challengeClaimed", { coins: result.coinsAwarded ?? 0, xp: result.xpAwarded ?? 0 }));
      } else {
        setMessage(result.error ?? null);
      }
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 rounded-xl border border-tertiary/30 bg-surface-container p-5"
      aria-label={t("dailyChallengeTitle")}
    >
      <header className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            claimed ? "bg-primary/15 text-primary" : "bg-tertiary/15 text-tertiary",
          )}
          aria-hidden="true"
        >
          {claimed ? <CheckCircle2 className="h-5 w-5" /> : <Target className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-on-surface">{t("dailyChallengeTitle")}</h2>
          <p className="text-sm text-on-surface-variant">
            {claimed
              ? t("challengeCompletedMsg")
              : t("challengeProgress", { done: challenge.answered, total: challenge.questionCount })}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-tertiary">
            <Coins className="h-4 w-4" aria-hidden="true" />
            {challenge.rewardCoins}
          </span>
          <span className="flex items-center gap-1 text-primary">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {challenge.rewardXp}
          </span>
        </span>
      </header>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={challenge.questionCount}
        aria-valuenow={challenge.answered}
      >
        <motion.div
          className={cn("h-full rounded-full", claimed ? "bg-primary" : "bg-tertiary")}
          initial={{ width: 0 }}
          animate={{ width: `${claimed ? 100 : progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {message && <p className="text-sm text-on-surface-variant">{message}</p>}

      {!claimed &&
        (allAnswered ? (
          <Button onClick={claim} disabled={pending} className="w-full sm:w-auto">
            {pending ? t("processingLabel") : t("challengeClaim")}
          </Button>
        ) : (
          challenge.categorySlug && (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/quiz/${challenge.categorySlug}`}>{t("startChallenge")}</Link>
            </Button>
          )
        ))}
    </motion.section>
  );
}
