"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { rankFor } from "@/lib/ranks";
import { useProfile } from "@/hooks/use-profile";
import { useLanguage } from "@/contexts/LanguageContext";
import type { GradeResult, QuizQuestion } from "@/lib/types";
import {
  applyAnswer,
  applySkip,
  applyTimeout,
  buildLadder,
  buildTierLadder,
  currentQuestion,
  initialState,
  makeRng,
  spendLifeline as markLifelineSpent,
  summarize,
  type HuntState,
} from "@/lib/hunt-engine";
import {
  fiftyFifty,
  recordHuntRun,
  spendLifeline,
  submitAnswer,
  type LifelinePrice,
} from "@/app/(app)/quiz/actions";
import { AskTheImamDialog } from "../AskTheImamDialog";
import StarParticles from "../StarParticles";
import { HuntHeader } from "./HuntHeader";
import { QuestionCard } from "./QuestionCard";
import { OptionTile, type OptionState } from "./OptionTile";
import { LifelineDock } from "./LifelineDock";
import { RunSummary } from "./RunSummary";

interface HuntViewProps {
  questions: QuizQuestion[];
  categoryTitle: string;
  categoryId: string | null;
  lifelinePrices: LifelinePrice[];
  onExit: () => void;
  /** Set for a level-locked adventure run: confines the ladder to exactly this
   * tier via `buildTierLadder` instead of the adaptive, rank-anchored
   * `buildLadder` used by the whole-category Hunt. */
  forceTier?: number;
}

/** How long the reveal stays on screen before the next stage. */
const REVEAL_MS = 2600;

/**
 * Drives one hunt.
 *
 * The split of responsibility is deliberate:
 *  - `hunt-engine` owns the run's rules (ladder, combo, lives, adaptivity) and
 *    is pure, so it can be tested without a browser.
 *  - the server owns grading and the XP/coins that actually land on a profile.
 *  - this component owns the clock, the animation, and nothing else that matters.
 *
 * That last point is why the timer lives in a ref-driven interval rather than
 * in engine state: a re-render must never be able to change what a run scored.
 */
export function HuntView({
  questions,
  categoryTitle,
  categoryId,
  lifelinePrices,
  onExit,
  forceTier,
}: HuntViewProps) {
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const { profile, refresh: refreshProfile } = useProfile();

  // A run is seeded once per mount (and once per "play again"), so the ladder
  // is stable across re-renders but different every time you play.
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 2 ** 31));

  // The ladder is anchored to the seeker's own rank, so a Faqih is asked
  // Faqih-level questions rather than starting every run at Mubtadi. `rankFor`
  // uses the same thresholds as `rank_tiers`, which is what the database
  // derives `profiles.current_rank_id` from. A level-locked run ignores rank
  // entirely — `forceTier` pins the ladder to exactly the level being played.
  const startTier = rankFor(profile?.totalXp ?? 0).level;
  const ladder = useMemo(
    () =>
      forceTier !== undefined
        ? buildTierLadder(questions, forceTier, { rng: makeRng(seed) })
        : buildLadder(questions, { rng: makeRng(seed), startTier }),
    [questions, seed, startTier, forceTier],
  );

  const [state, setState] = useState<HuntState>(() => initialState(ladder));
  const [remaining, setRemaining] = useState(() => ladder[0]?.timeLimit ?? 30);
  const [selected, setSelected] = useState<number | null>(null);
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [grading, setGrading] = useState(false);
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [doublePoints, setDoublePoints] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [pendingLifeline, setPendingLifeline] = useState<string | null>(null);
  const [showImam, setShowImam] = useState(false);
  const [particles, setParticles] = useState(false);
  const [coins, setCoins] = useState(0);
  // Owned lifeline stock, seeded from the server and decremented as it is spent
  // (migration 0008: a stocked lifeline is consumed instead of charged).
  const [stock, setStock] = useState<Record<string, number>>(() =>
    Object.fromEntries(lifelinePrices.map((l) => [l.id, l.owned])),
  );

  // Profile XP as it stood when the run began — the summary needs it to work
  // out how far the run moved the rank bar.
  const xpAtStart = useRef<number | null>(null);

  const question = currentQuestion(state);
  const finished = state.status === "won" || state.status === "lost";
  const locked = selected !== null || grading || finished;

  const questionStartedAt = useRef(Date.now());
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runRecorded = useRef(false);
  /**
   * Stage the clock has already run out on. Without this the timeout can fire
   * twice for one question and cost two lives: when `applyTimeout` advances the
   * stage, the reset effect and the clock effect run in the same commit, and
   * the clock effect still sees `remaining === 0` from the stage just ended.
   */
  const timedOutStage = useRef(-1);

  useEffect(() => {
    if (!profile) return;
    setCoins(profile.coins);
    if (xpAtStart.current === null) xpAtStart.current = profile.totalXp;
  }, [profile]);

  /** Reset the per-question scratch state whenever a new stage comes up. */
  useEffect(() => {
    if (!question) return;
    setSelected(null);
    setGrade(null);
    setEliminated([]);
    setDoublePoints(false);
    setUsedHint(false);
    setRemaining(question.timeLimit);
    questionStartedAt.current = Date.now();
  }, [question?.id, question?.stage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  const handleTimeout = useCallback(
    (stage: number) => {
      if (timedOutStage.current === stage) return;
      timedOutStage.current = stage;
      setState((prev) => applyTimeout(prev));
      toast({ title: t("timesUp"), variant: "destructive" });
    },
    [toast, t],
  );

  /** The clock. Paused while a reveal is on screen or the run is over. */
  useEffect(() => {
    if (!question || locked) return;
    if (remaining <= 0) {
      handleTimeout(question.stage);
      return;
    }
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [question, locked, remaining, handleTimeout]);

  /** File the run in the journal once, when it ends. Best-effort: the XP is
   * already banked server-side by then, so a failure here changes nothing the
   * player earned. */
  useEffect(() => {
    if (!finished || runRecorded.current) return;
    runRecorded.current = true;
    const s = summarize(state);
    void recordHuntRun({
      categoryId,
      status: s.status,
      stages: state.ladder.length,
      correct: s.correct,
      wrong: s.wrong,
      timedOut: s.timedOut,
      bestCombo: s.bestCombo,
      livesLeft: s.livesLeft,
      lifelinesUsed: s.lifelinesUsed,
      xpEarned: s.xp,
      speedScore: s.speedScore,
    });
    void refreshProfile();
  }, [finished, state, categoryId, refreshProfile]);

  const handleAnswer = async (index: number) => {
    if (locked || !question || eliminated.includes(index)) return;

    setSelected(index);
    setGrading(true);

    // Measured from the real elapsed time, not the once-a-second display
    // counter, so the pace score reflects when the player actually committed.
    // `remaining` can exceed the limit after a Time Boost, hence the cap.
    const elapsedMs = Date.now() - questionStartedAt.current;
    const budgetMs = Math.max(question.timeLimit, remaining) * 1000;
    const msLeft = Math.max(0, budgetMs - elapsedMs);

    try {
      const result = await submitAnswer(question.id, index, {
        usedHint,
        responseTimeMs: elapsedMs,
        doublePoints,
      });
      setGrade(result);
      setGrading(false);
      // Keep the coin counter honest: the server credits coins per answer, and
      // a header showing a stale balance is what made the old lifeline dock lie.
      void refreshProfile();

      if (result.correct) {
        setParticles(true);
        setTimeout(() => setParticles(false), 1000);
      }

      // Hold the reveal, then let the engine decide what happens next.
      advanceTimer.current = setTimeout(() => {
        setState((prev) =>
          applyAnswer(prev, { correct: result.correct, xpEarned: result.xpEarned, msLeft }),
        );
      }, REVEAL_MS);
    } catch {
      // Grading failed — give the question back rather than silently eating
      // the attempt or, worse, counting it as wrong.
      setSelected(null);
      setGrading(false);
      toast({ title: t("error"), description: t("couldNotLoadQuestion"), variant: "destructive" });
    }
  };

  /**
   * Buy and apply a lifeline.
   *
   * Charge first, effect second, and never the other way round: if the spend
   * fails for any reason — not enough coins, RPC missing, network — the effect
   * must not happen. Lifelines used to be free precisely because the effect ran
   * without the server ever hearing about it.
   */
  const handleLifeline = async (id: string) => {
    if (locked || pendingLifeline || !question || state.lifelinesUsed.includes(id)) return;

    const price = lifelinePrices.find((l) => l.id === id);
    if (!price) return;
    // A stocked copy is spent instead of coins, so a low balance is no bar.
    if ((stock[id] ?? 0) === 0 && coins < price.cost) {
      toast({ title: t("notEnoughCoins"), variant: "destructive" });
      return;
    }

    setPendingLifeline(id);
    const spend = await spendLifeline(id);
    setPendingLifeline(null);

    if (!spend.success) {
      if (spend.newBalance !== undefined) setCoins(spend.newBalance);
      toast({
        title: t("lifelineUnavailable"),
        description: spend.error,
        variant: "destructive",
      });
      return;
    }

    if (spend.newBalance !== undefined) setCoins(spend.newBalance);
    if (spend.paidWith === "inventory") {
      setStock((prev) => ({ ...prev, [id]: spend.remaining ?? Math.max(0, (prev[id] ?? 1) - 1) }));
      toast({ title: t("usedFromStock") });
    }
    setState((prev) => markLifelineSpent(prev, id));

    switch (id) {
      case "fifty-fifty":
        try {
          setEliminated(await fiftyFifty(question.id));
        } catch {
          toast({ title: t("error"), variant: "destructive" });
        }
        break;
      case "ask-imam":
        setUsedHint(true);
        setShowImam(true);
        break;
      case "skip":
        setState((prev) => applySkip(prev));
        break;
      case "double-points":
        setDoublePoints(true);
        break;
      case "time-boost":
        setRemaining((r) => r + 15);
        break;
    }

    void refreshProfile();
  };

  const playAgain = () => {
    runRecorded.current = false;
    xpAtStart.current = profile?.totalXp ?? xpAtStart.current;
    setSeed(Math.floor(Math.random() * 2 ** 31));
  };

  // A fresh seed rebuilds the ladder; reset the run to match it. Stage numbers
  // restart at 1 on a replay, so the timeout guard has to be cleared too.
  useEffect(() => {
    setState(initialState(ladder));
    setRemaining(ladder[0]?.timeLimit ?? 30);
    timedOutStage.current = -1;
  }, [ladder]);

  if (ladder.length === 0) {
    return (
      <div dir={dir} className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="mb-2 font-headline text-2xl">{t("comingSoon")}</h2>
        <p className="text-on-surface-variant">
          {t("questionsBeingPrepared", { category: categoryTitle })}
        </p>
        <Button onClick={onExit} className="mt-6">
          {t("backToCategories")}
        </Button>
      </div>
    );
  }

  if (finished) {
    return (
      <div dir={dir} className="py-4">
        {forceTier !== undefined && state.status === "won" && (
          <p className="mb-4 rounded-xl bg-primary/10 px-4 py-3 text-center text-sm font-semibold text-primary">
            🔓 {t("levelComplete")}
          </p>
        )}
        <RunSummary
          summary={summarize(state)}
          xpBefore={xpAtStart.current ?? 0}
          onPlayAgain={playAgain}
          onExit={onExit}
        />
      </div>
    );
  }

  if (!question) {
    return (
      <div dir={dir} className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="mb-2 font-headline text-2xl">{t("couldNotLoadQuestion")}</h2>
        <Button onClick={onExit} className="mt-6">
          {t("backToCategories")}
        </Button>
      </div>
    );
  }

  return (
    <div dir={dir} className="relative space-y-6">
      <StarParticles isEmitting={particles} />

      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("exitQuiz")}
        </Button>
        <span className="truncate text-sm text-on-surface-variant">{categoryTitle}</span>
      </div>

      <HuntHeader
        stage={state.stage}
        totalStages={state.ladder.length}
        lives={state.lives}
        coins={coins}
        combo={state.combo}
        tier={question.difficulty}
        remaining={remaining}
        timeLimit={question.timeLimit}
        frozen={locked}
      />

      <QuestionCard text={question.text} questionId={question.id} />

      {doublePoints && (
        <p className="text-center text-sm font-semibold text-tertiary">
          💎 {t("lifelineDoublePoints")}
        </p>
      )}

      <div className="grid gap-3">
        {question.options.map((option, index) => (
          <OptionTile
            key={`${question.id}-${index}`}
            label={option}
            index={index}
            disabled={locked}
            state={optionState({ index, selected, grade, eliminated })}
            onSelect={() => handleAnswer(index)}
          />
        ))}
      </div>

      <AnimatePresence>
        {grade && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-secondary/30 bg-secondary/10 p-4"
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
              <div className="min-w-0 space-y-1">
                <p className="font-semibold text-secondary">{t("whyItsRight")}</p>
                <p className="text-sm leading-relaxed text-on-surface">{grade.explanation}</p>
                {grade.citation && (
                  <p className="text-xs italic text-on-surface-variant">
                    {t("sourceLabel")}: {grade.citation}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LifelineDock
        prices={lifelinePrices.map((l) => ({ ...l, owned: stock[l.id] ?? 0 }))}
        coins={coins}
        used={state.lifelinesUsed}
        locked={locked}
        pending={pendingLifeline}
        onUse={handleLifeline}
      />

      <AskTheImamDialog open={showImam} onOpenChange={setShowImam} question={question} />
    </div>
  );
}

/** Which of the five visual states an option is in, given the current reveal. */
function optionState({
  index,
  selected,
  grade,
  eliminated,
}: {
  index: number;
  selected: number | null;
  grade: GradeResult | null;
  eliminated: number[];
}): OptionState {
  if (!grade) return eliminated.includes(index) ? "eliminated" : "idle";
  if (index === grade.correctIndex) return selected === index ? "correct" : "missed";
  if (index === selected) return "wrong";
  return eliminated.includes(index) ? "eliminated" : "idle";
}
