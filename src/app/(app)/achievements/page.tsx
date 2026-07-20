import { createClient } from "@/lib/supabase/server"
import { getProfileStats } from "@/lib/profile-stats"
import { AchievementsPageClient } from "@/components/achievements/AchievementsPageClient"

export default async function AchievementsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please sign in to view achievements.</p>
      </div>
    )
  }

  const stats = await getProfileStats(user.id)

  const today = new Date().toISOString().slice(0, 10)
  const { data: todayChallenge } = await supabase
    .from("daily_challenges")
    .select("id, challenge_date, category_id, question_ids, reward_coins, reward_xp, categories(name)")
    .eq("challenge_date", today)
    .maybeSingle()

  let completed = false
  if (todayChallenge) {
    const { data: completion } = await supabase
      .from("user_daily_challenge_completions")
      .select("completed_at")
      .eq("user_id", user.id)
      .eq("daily_challenge_id", todayChallenge.id)
      .maybeSingle()
    completed = !!completion
  }

  type ChallengeRow = {
    id: string
    challenge_date: string
    question_ids: string[]
    reward_coins: number
    reward_xp: number
    categories: { name: string } | null
  }
  const challenge = todayChallenge as unknown as ChallengeRow | null

  return (
    <AchievementsPageClient
      achievements={stats?.achievements ?? []}
      todayChallenge={
        challenge
          ? {
              categoryName: challenge.categories?.name ?? "Mixed",
              questionCount: challenge.question_ids?.length ?? 0,
              rewardCoins: challenge.reward_coins,
              rewardXp: challenge.reward_xp,
              completed,
            }
          : null
      }
    />
  )
}
