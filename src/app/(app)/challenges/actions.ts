"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface DailyChallengeView {
  id: string
  questionCount: number
  rewardCoins: number
  rewardXp: number
  completed: boolean
  /** How many of today's questions the player has answered so far. */
  answered: number
  categorySlug: string | null
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
  // No challenge is generated when no category has enough published questions.
  if (!row?.o_id) return null

  const today = new Date().toISOString().slice(0, 10)

  const { data: challenge } = await supabase
    .from("daily_challenges")
    .select("id, question_ids, reward_coins, reward_xp, categories(slug)")
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
    categorySlug: (challenge as any).categories?.slug ?? null,
  }
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
