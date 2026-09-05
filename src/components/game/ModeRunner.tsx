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
  // The daily challenge is not a game mode — it has no row in
  // `game_mode_rules` and no XP multiplier — but it renders through the same
  // runner, so it names itself from the same place. Both keys already existed
  // for the challenge card, so it is called the same thing wherever it appears.
  daily: { name: "dailyChallengeTitle", desc: "challengeIncompleteMsg" },
};

export function ModeRunner({
  mode,
  questions,
  lifelinePrices,
  rules,
  runId,
  fixedLadder,
}: {
  mode: string;
  questions: QuizQuestion[];
  lifelinePrices: LifelinePrice[];
  rules: ModeRules;
  /** Absent for the daily challenge, which opens no server-side run: its XP
   * multiplier is 1x, so there is nothing for a run to authorise. */
  runId?: string;
  fixedLadder?: boolean;
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
      fixedLadder={fixedLadder}
    />
  );
}
