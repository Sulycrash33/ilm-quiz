import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLifelinePrices } from "@/app/(app)/quiz/actions";
import { getDailyChallenge, getDailyChallengeQuestions } from "@/app/(app)/challenges/actions";
import { ModeRunner } from "@/components/game/ModeRunner";

/**
 * The daily challenge, played.
 *
 * It has existed since migration 0011 and until now there was no way to play
 * it. The challenge card linked to `/quiz/<its category>` and the Game Modes
 * page to `/quiz` — the category grid — so "start the daily challenge" opened
 * a subject picker and the five questions the challenge is made of were never
 * served as a set. Migration 0056 then made the link impossible as well as
 * wrong: a day's five now span the whole arena bank and `category_id` is
 * written null, so the card's button stopped rendering at all.
 *
 * This route serves the five ids on the row and nothing else. Nobody picks a
 * subject, which is the whole point of the arena.
 *
 * ── Why there is no `game_runs` row ───────────────────────────────────────
 * Speed Round, Survival and Practice open one because they advertise an XP
 * multiplier, and migration 0030 exists so that multiplier comes from a row
 * the server wrote rather than from the client. The daily challenge advertises
 * no multiplier — it pays its 60 coins and 50 barakah through
 * `complete_daily_challenge_rpc`, once, against `attempts` — so a run would
 * authorise a 1x multiplier that is already the default, while closing any
 * other run the player had open. Nothing to gain, something to lose.
 *
 * ── Why the rules are written here ────────────────────────────────────────
 * They are not a mode's bargain, so they do not belong in `game_mode_rules`.
 * No lives, because the reward asks for all five to be answered and losing on
 * the third would put the day's challenge behind a replay. A per-question
 * clock, because every other run in this app has one and the daily is meant
 * to be a real test rather than a reading exercise.
 */
export default async function DailyChallengePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [lifelinePrices, challenge, questions] = await Promise.all([
    getLifelinePrices(),
    getDailyChallenge(),
    getDailyChallengeQuestions(),
  ]);

  // Already claimed: the day is finished, and replaying it would be five
  // questions the player has answered for a reward that cannot pay twice.
  //
  // Both exits lead to `/rewards`, not `/challenges`. The daily challenge and
  // the daily login reward were two names for one day's five questions, on two
  // screens, and the login one sent the player to the category grid. They are
  // one panel on the Rewards Center now, so that is where a player who cannot
  // play today belongs — beside the coins it pays and the wheel.
  if (challenge?.completed) redirect("/rewards");

  // Answered but not yet claimed is also finished. The reward is claimed on
  // `/rewards`, so a player who has answered all five has nothing left to do
  // here — and re-entering by URL was the other half of the replay hole that
  // 0059 closed in the database. The button is gone from the summary
  // (`allowReplay`), the award is gone from a repeat answer (0059), and this
  // is the third lock: the route itself refuses.
  if (
    challenge &&
    challenge.questionCount > 0 &&
    challenge.answered >= challenge.questionCount
  ) {
    redirect("/rewards");
  }

  // No challenge today, or its questions were unpublished after it was set.
  if (questions.length === 0) redirect("/rewards");

  return (
    <ModeRunner
      mode="daily"
      questions={questions}
      lifelinePrices={lifelinePrices}
      fixedLadder
      backHref="/rewards"
      rules={{
        lives: null,
        runSeconds: null,
        perQuestionTimer: true,
        endless: false,
      }}
    />
  );
}
