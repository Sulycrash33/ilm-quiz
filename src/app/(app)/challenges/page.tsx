import { createClient } from "@/lib/supabase/server"
import { getProfileStats } from "@/lib/profile-stats"
import { GameModesPageClient } from "@/components/challenges/GameModesPageClient"
import { DailyChallengeCard } from "@/components/challenges/DailyChallengeCard"
import { getDailyChallenge } from "./actions"

export default async function ChallengesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const stats = user ? await getProfileStats(user.id) : null

  // Generates today's challenge if this is the first request of the day; there
  // is no scheduler, so it is materialised lazily (migration 0011).
  const dailyChallenge = await getDailyChallenge()

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
    <div className="space-y-6">
      {dailyChallenge && (
        <div className="mx-auto max-w-7xl px-5 pt-6">
          <DailyChallengeCard challenge={dailyChallenge} />
        </div>
      )}
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
    </div>
  )
}
