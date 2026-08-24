import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getModeQuestionPool } from "@/lib/quiz-service";
import { getLifelinePrices, startGameRun } from "@/app/(app)/quiz/actions";
import { ModeRunner } from "@/components/game/ModeRunner";
import { rankFor } from "@/lib/ranks";

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

  // The pool is centred on the player's own rank so Survival, where a wrong
  // answer is expensive, does not open with questions from four tiers above.
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp")
    .eq("id", user.id)
    .single();

  const centreTier = rankFor(profile?.total_xp ?? 0).level;

  const [questions, lifelinePrices, run] = await Promise.all([
    getModeQuestionPool(centreTier),
    getLifelinePrices(),
    startGameRun(mode),
  ]);

  // Without a run there is no mode multiplier, and a run in the wrong mode
  // would pay the wrong amount — so this fails rather than quietly playing a
  // classic hunt wearing a Survival label.
  if (!run) redirect("/challenges");
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
