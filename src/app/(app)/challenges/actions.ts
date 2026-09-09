"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getQuestionsByIds } from "@/lib/quiz-service"
import { nextDailyResetAt } from "@/lib/countdown"
import type { QuizQuestion } from "@/lib/types"

export interface DailyChallengeView {
  id: string
  questionCount: number
  rewardCoins: number
  rewardXp: number
  completed: boolean
  /** How many of today's questions the player has answered so far. */
  answered: number
  /**
   * Today's attempt is spent: every one of the day's questions has been
   * answered, right or wrong. **The daily is one go, not one win.** Losing it
   * and replaying it would make the reward a matter of persistence rather than
   * knowledge, and before migration 0059 replaying it was also an XP printer.
   *
   * Kept separate from `completed`, which means the *reward* has been claimed.
   * A player who answered all five and has not yet collected is finished with
   * the questions and not finished with the day.
   */
  attemptSpent: boolean
  /**
   * When the next challenge arrives, as an ISO instant.
   *
   * **The database's midnight, not the player's** — the challenge is keyed on
   * `current_date` and Postgres here runs in UTC, checked rather than assumed.
   * The copy that renders this never names an hour for that reason; see
   * `nextDailyResetAt`.
   */
  resetsAt: string
}

/**
 * Today's challenge, generating it if this is the first request of the day.
 *
 * There is no scheduler in this project, so the challenge is materialised
 * lazily. Selection is deterministic from the date, so two concurrent first
 * requests produce the same set rather than racing (migration 0011).
 */
export async function getDailyChallenge(): Promise<DailyChallengeView | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: ensured } = await supabase.rpc("ensure_daily_challenge")
  const row = Array.isArray(ensured) ? ensured[0] : ensured
  // No challenge is generated on a day the arena bank cannot fill one.
  if (!row?.o_id) return null

  const today = new Date().toISOString().slice(0, 10)

  const { data: challenge } = await supabase
    .from("daily_challenges")
    .select("id, question_ids, reward_coins, reward_xp")
    .eq("challenge_date", today)
    .maybeSingle()

  if (!challenge) return null

  const questionIds = ((challenge as any).question_ids ?? []) as string[]
  let completed = false
  let answered = 0

  if (user) {
    const [{ data: completion }, { data: attempts }] = await Promise.all([
      supabase
        .from("user_daily_challenge_completions")
        .select("completed_at")
        .eq("user_id", user.id)
        .eq("daily_challenge_id", (challenge as any).id)
        .maybeSingle(),
      supabase
        .from("attempts")
        .select("question_id")
        .eq("user_id", user.id)
        .in("question_id", questionIds)
        .gte("created_at", `${today}T00:00:00Z`),
    ])
    completed = !!completion
    answered = new Set((attempts ?? []).map((a: { question_id: string }) => a.question_id)).size
  }

  return {
    id: (challenge as any).id,
    questionCount: questionIds.length,
    rewardCoins: (challenge as any).reward_coins,
    rewardXp: (challenge as any).reward_xp,
    completed,
    answered,
    attemptSpent: questionIds.length > 0 && answered >= questionIds.length,
    resetsAt: nextDailyResetAt().toISOString(),
  }
}

/**
 * Today's five questions, ready to be played.
 *
 * Until now there was nowhere to play them. `ensure_daily_challenge` has
 * chosen five questions by date since migration 0011 and stored their ids, but
 * the only way in was a link to `/quiz/<the challenge's category>` — so the
 * player was handed a whole category to hunt through and the five questions
 * the challenge was actually about were reached, if at all, by chance.
 * Migration 0056 then dropped the category (a day now spans the whole arena
 * bank and `category_id` is written null), which left that link pointing at
 * nothing and the "Start daily challenge" button on the Game Modes page
 * pointing at `/quiz` — the category picker. That is the subject-selection
 * step the arena was opened to remove.
 *
 * So the questions come from the ids on the row, and nowhere else.
 */
export async function getDailyChallengeQuestions(): Promise<QuizQuestion[]> {
  const supabase = await createClient()

  await supabase.rpc("ensure_daily_challenge")

  const today = new Date().toISOString().slice(0, 10)
  const { data: challenge } = await supabase
    .from("daily_challenges")
    .select("question_ids")
    .eq("challenge_date", today)
    .maybeSingle()

  const ids = ((challenge as any)?.question_ids ?? []) as string[]
  return getQuestionsByIds(ids)
}

export interface ClaimResult {
  success: boolean
  error?: string
  coinsAwarded?: number
  xpAwarded?: number
}

/**
 * Claims today's challenge reward.
 *
 * The server checks every question was actually answered today before paying,
 * against `attempts` — which only `submit_quiz_answer` writes — so the reward
 * cannot be claimed without playing.
 */
export async function claimDailyChallenge(): Promise<ClaimResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "You must be signed in." }

  const { data, error } = await supabase.rpc("complete_daily_challenge_rpc")
  if (error) return { success: false, error: error.message || "Could not claim that." }

  const row = Array.isArray(data) ? data[0] : data
  if (!row) return { success: false, error: "Could not claim that." }
  if (!row.success) return { success: false, error: row.error ?? "Could not claim that." }

  revalidatePath("/challenges")
  return { success: true, coinsAwarded: row.coins_awarded, xpAwarded: row.xp_awarded }
}
