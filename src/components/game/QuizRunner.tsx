"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, BookOpen, Heart, Flame, Timer } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";
import { HUNT_RULES } from "@/lib/hunt-engine";
import type { LifelinePrice } from "@/app/(app)/quiz/actions";
import { HuntView } from "./hunt/HuntView";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuizRunnerProps {
  categoryName: string;
  categoryDescription: string | null;
  categoryIcon: string | null;
  categoryId: string | null;
  questions: QuizQuestion[];
  lifelinePrices: LifelinePrice[];
  /** Set for a level-locked run: which tier (1-9) this run is confined to.
   * Passed straight through to `HuntView` as `forceTier`. */
  tier?: number;
  /** Where the header's back link goes. Defaults to the category grid; a
   * tier run points it at that category's level map instead, and the label
   * follows automatically (see below) rather than needing its own prop. */
  backHref?: string;
}

/**
 * The gate in front of a hunt: what the category is, what a run will demand,
 * and the button that starts it. Kept separate from `HuntView` so the run
 * component mounts fresh — that's what seeds a new ladder.
 */
export function QuizRunner({
  categoryName,
  categoryDescription,
  categoryIcon,
  categoryId,
  questions,
  lifelinePrices,
  tier,
  backHref,
}: QuizRunnerProps) {
  const [started, setStarted] = useState(false);
  const { t, dir } = useLanguage();

  if (started) {
    return (
      <div dir={dir} className="container mx-auto max-w-3xl px-4 py-6">
        <HuntView
          questions={questions}
          categoryTitle={categoryName}
          categoryId={categoryId}
          lifelinePrices={lifelinePrices}
          onExit={() => setStarted(false)}
          forceTier={tier}
        />
      </div>
    );
  }

  const runLength = Math.min(HUNT_RULES.runLength, questions.length);
  const playable = questions.length > 0;

  return (
    <div dir={dir} className="container mx-auto max-w-3xl px-4 py-6">
      <header className="mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref ?? "/quiz"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backHref ? t("backToLevels") : t("backToCategories")}
          </Link>
        </Button>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 rounded-xl bg-surface-container p-8 text-center"
      >
        <div className="space-y-3">
          <div className="text-6xl" aria-hidden="true">
            {categoryIcon ?? "📚"}
          </div>
          {tier !== undefined && (
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
              {t("levelLabel")} {tier}
            </p>
          )}
          <h1 className="font-headline text-3xl text-primary">{categoryName}</h1>
          {categoryDescription && (
            <p className="mx-auto max-w-prose text-on-surface-variant">{categoryDescription}</p>
          )}
        </div>

        {!playable ? (
          <div className="space-y-3 py-6">
            <BookOpen className="mx-auto h-10 w-10 text-on-surface-variant" aria-hidden="true" />
            <p className="text-on-surface-variant">
              {t("questionsBeingPrepared", { category: categoryName })}
            </p>
          </div>
        ) : (
          <>
            {/* What a run demands, before committing to it. */}
            <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
              <Brief
                icon={<BookOpen className="h-4 w-4" />}
                value={runLength}
                label={t("questions")}
              />
              <Brief
                icon={<Heart className="h-4 w-4" />}
                value={HUNT_RULES.startingLives}
                label={t("livesLabel")}
              />
              <Brief
                icon={<Flame className="h-4 w-4" />}
                value={`${HUNT_RULES.maxCombo}×`}
                label={t("comboLabel")}
              />
            </div>

            <div className="space-y-3">
              <Button size="lg" className="w-full sm:w-auto" onClick={() => setStarted(true)}>
                <Play className="mr-2 h-5 w-5" />
                {t("beginHunt")}
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-on-surface-variant">
                <Timer className="h-3 w-3" aria-hidden="true" />
                {t("questionHunt", { count: runLength })}
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function Brief({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-lg bg-surface-container-high p-3">
      <div
        className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary"
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="text-lg font-bold tabular-nums text-on-surface">{value}</div>
      <div className="text-xs text-on-surface-variant">{label}</div>
    </div>
  );
}
