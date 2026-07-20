import { createClient } from "@/lib/supabase/server"
import { getProfileStats } from "@/lib/profile-stats"
import { GameModesPageClient } from "@/components/challenges/GameModesPageClient"

export default async function ChallengesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const stats = user ? await getProfileStats(user.id) : null

  const today = new Date().toISOString().slice(0, 10)
  const { data: todayChallenge } = await supabase
    .from("daily_challenges")
    .select("id, reward_coins, reward_xp")
    .eq("challenge_date", today)
    .maybeSingle()

  let challengeCompleted = false
  if (todayChallenge && user) {
    const { data: completion } = await supabase
      .from("user_daily_challenge_completions")
      .select("completed_at")
      .eq("user_id", user.id)
      .eq("daily_challenge_id", todayChallenge.id)
      .maybeSingle()
    challengeCompleted = !!completion
  }

  return (
    <GameModesPageClient
      totalAttempts={stats?.totalAttempts ?? 0}
      accuracyPct={stats?.accuracyPct ?? 0}
      totalXp={stats?.profile.totalXp ?? 0}
      todayChallenge={
        todayChallenge
          ? { rewardCoins: todayChallenge.reward_coins, rewardXp: todayChallenge.reward_xp, completed: challengeCompleted }
          : null
      }
    />
  )
}
