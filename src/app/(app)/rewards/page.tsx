import { createClient } from "@/lib/supabase/server"
import { RewardsPageClient } from "@/components/rewards/RewardsPageClient"

export default async function RewardsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please sign in to view rewards.</p>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, longest_streak, streak_freezes_available, coins")
    .eq("id", user.id)
    .single()

  return (
    <RewardsPageClient
      streakCount={profile?.streak_count ?? 0}
      longestStreak={profile?.longest_streak ?? 0}
      streakFreezesAvailable={profile?.streak_freezes_available ?? 0}
      coins={profile?.coins ?? 0}
    />
  )
}
