"use client";

import { QuizRunner } from "@/components/game/QuizRunner";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ModeRules } from "@/lib/hunt-engine";
import type { LifelinePrice } from "@/app/(app)/quiz/actions";
import type { QuizQuestion } from "@/lib/types";
import type { Translations } from "@/lib/i18n";

/**
 * The client half of a mode run.
 *
 * It exists only to turn a mode id into its name and description in the
 * player's own language: the page that loads the questions is a server
 * component and cannot reach the language context, and the alternative —
 * resolving the copy on the server — would pick a language from the wrong
 * place. The strings themselves already existed for the Game Modes cards, so
 * a mode is named identically wherever it appears.
 */
const NAME_KEYS: Record<string, { name: keyof Translations; desc: keyof Translations }> = {
  timed: { name: "modeSpeedName", desc: "modeSpeedDesc" },
  survival: { name: "modeSurvivalName", desc: "modeSurvivalDesc" },
  practice: { name: "modePracticeName", desc: "modePracticeDesc" },
};

export function ModeRunner({
  mode,
  questions,
  lifelinePrices,
  rules,
  runId,
}: {
  mode: string;
  questions: QuizQuestion[];
  lifelinePrices: LifelinePrice[];
  rules: ModeRules;
  runId: string;
}) {
  const { t } = useLanguage();
  const keys = NAME_KEYS[mode];

  return (
    <QuizRunner
      categoryName={keys ? t(keys.name) : mode}
      categoryDescription={keys ? t(keys.desc) : null}
      categoryIcon={null}
      categoryId={null}
      questions={questions}
      lifelinePrices={lifelinePrices}
      backHref="/challenges"
      modeRules={rules}
      runId={runId}
    />
  );
}
