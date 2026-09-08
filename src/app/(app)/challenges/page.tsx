import { createClient } from "@/lib/supabase/server"
import { getProfileStats } from "@/lib/profile-stats"
import { GameModesPageClient } from "@/components/challenges/GameModesPageClient"

/**
 * The game modes: Classic, Speed Round, Survival, Practice, Multiplayer.
 *
 * The daily challenge used to open this page and no longer appears on it. It
 * and the daily login reward were the same five questions on the same day
 * wearing two names on two screens — and the login one, on `/rewards`, sent
 * the player to the category grid instead of to the questions. They are one
 * panel on the Rewards Center now, so the challenge is fetched, played and
 * claimed there. Nothing here needs `getDailyChallenge`, and `/rewards`
 * materialising the day lazily is what generates today's row.
 */
export default async function ChallengesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const stats = user ? await getProfileStats(user.id) : null

  return (
    <GameModesPageClient
      totalAttempts={stats?.totalAttempts ?? 0}
      accuracyPct={stats?.accuracyPct ?? 0}
      totalXp={stats?.profile.totalXp ?? 0}
    />
  )
}
