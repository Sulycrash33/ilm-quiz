import { createClient } from "@/lib/supabase/server"
import { TranslatedNotice } from "@/components/layout/TranslatedNotice"
import { getProfileStats } from "@/lib/profile-stats"
import { getEarnedChests } from "@/app/(app)/rewards/actions"
import { getMyDayBounds } from "@/lib/day-bounds"
import { AchievementsPageClient } from "@/components/achievements/AchievementsPageClient"

export default async function AchievementsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <TranslatedNotice messageKey="signInToViewAchievements" />
  }

  // The player's local date (migration 0064), not the UTC one this used to
  // compute for itself.
  const today = (await getMyDayBounds()).localDate

  /*
   * Three independent reads, at once.
   *
   * They were sequential and none of them needed the one before it. That
   * matters more than it looks: the database is in eu-west-1 and Vercel's
   * default function region is `iad1`, so each `await` was a transatlantic
   * round trip taken in turn. `vercel.json` moves the function to `dub1` to
   * shorten the trip; this stops taking it three times in a row.
   *
   * The completion check below cannot join this batch — it needs the
   * challenge's id — so it stays a second step rather than being faked into
   * the first.
   */
  const [stats, earnedChests, { data: todayChallenge }] = await Promise.all([
    getProfileStats(user.id),
    // Earned and unopened. They live on this page rather than on `/rewards`,
    // where every other panel is something handed to you for showing up.
    getEarnedChests(),
    supabase
      .from("daily_challenges")
      .select("id, challenge_date, category_id, question_ids, reward_coins, reward_xp, categories(name)")
      .eq("challenge_date", today)
      .maybeSingle(),
  ])

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
      earnedChests={earnedChests}
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
