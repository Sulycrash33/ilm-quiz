import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getModeQuestionPool } from "@/lib/quiz-service";
import { getLifelinePrices, startGameRun } from "@/app/(app)/quiz/actions";
import { ModeRunner } from "@/components/game/ModeRunner";

/**
 * Speed Round, Survival and Practice.
 *
 * These three were advertised on the Game Modes page from the start and had
 * nothing behind them — no route, no rules, only a card and a "coming soon".
 * What separates them is not subject matter but pressure: Speed Round times
 * the run instead of the question, Survival removes the end of the ladder so
 * only the lives stop you, and Practice removes both.
 *
 * The run is opened here, on the server, and its id travels with every answer.
 * That is what makes the advertised multipliers real without making them
 * forgeable: the client never sends a multiplier, only a run, and the server
 * decides what that run is worth. See migration 0030.
 */
const PLAYABLE_MODES = new Set(["timed", "survival", "practice"]);

interface ModePageProps {
  params: Promise<{ mode: string }>;
}

export default async function ModePlayPage({ params }: ModePageProps) {
  const { mode } = await params;
  if (!PLAYABLE_MODES.has(mode)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // The run is opened first because it is what decides the difficulty. Since
  // migration 0035 `start_game_run` records the tier band on the run itself,
  // derived in the database from this player's own XP, and the grader pays the
  // mode multiplier only inside it. Fetching the pool from that same band is
  // what makes the offer and the reward describe one set of questions.
  const [lifelinePrices, run] = await Promise.all([getLifelinePrices(), startGameRun(mode)]);

  // Without a run there is no mode multiplier, and a run in the wrong mode
  // would pay the wrong amount — so this fails rather than quietly playing a
  // classic hunt wearing a Survival label.
  if (!run) redirect("/challenges");

  const questions = await getModeQuestionPool(run.tierMin, run.tierMax);
  if (questions.length === 0) redirect("/challenges");

  return (
    <ModeRunner
      mode={mode}
      questions={questions}
      lifelinePrices={lifelinePrices}
      rules={{
        lives: run.rules.lives,
        runSeconds: run.rules.runSeconds,
        perQuestionTimer: run.rules.perQuestionTimer,
        endless: run.rules.endless,
      }}
      runId={run.runId}
    />
  );
}
