import { createClient } from "@/lib/supabase/server"
import { TranslatedNotice } from "@/components/layout/TranslatedNotice"
import { RewardsPageClient } from "@/components/rewards/RewardsPageClient"
import type { SpinSegment } from "@/components/rewards/SpinWheel"

export default async function RewardsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <TranslatedNotice messageKey="signInToViewRewards" />
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, longest_streak, streak_freezes_available, coins, total_xp, last_spin_at")
    .eq("id", user.id)
    .single()

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  const { data: todayClaim } = await supabase
    .from("user_login_claims")
    .select("day_number")
    .eq("user_id", user.id)
    .eq("claim_date", today)
    .maybeSingle()

  const { data: yesterdayClaim } = await supabase
    .from("user_login_claims")
    .select("day_number")
    .eq("user_id", user.id)
    .eq("claim_date", yesterday)
    .maybeSingle()

  const nextDayNumber = todayClaim ? todayClaim.day_number : yesterdayClaim ? (yesterdayClaim.day_number % 7) + 1 : 1

  const { data: loginRewards } = await supabase
    .from("daily_login_rewards")
    .select("day_number, coins, xp, is_special")
    .order("day_number")

  const { data: chestTypes } = await supabase
    .from("chest_types")
    .select("tier, price_coins, min_coins, max_coins, min_xp, max_xp")
    .order("price_coins")

  // The wheel's segments. Ordered by id because `spin_wheel_rpc` selects its
  // reward with `row_number() over (order by sr.id)`, so any other ordering
  // here would draw a wheel whose segments do not correspond to the ones the
  // server is choosing between.
  const { data: spinRewards } = await supabase
    .from("spin_rewards")
    .select("id, label, type, value")
    .order("id")

  return (
    <RewardsPageClient
      streakCount={profile?.streak_count ?? 0}
      longestStreak={profile?.longest_streak ?? 0}
      streakFreezesAvailable={profile?.streak_freezes_available ?? 0}
      coins={profile?.coins ?? 0}
      totalXp={profile?.total_xp ?? 0}
      lastSpinAt={profile?.last_spin_at ?? null}
      claimedToday={!!todayClaim}
      currentDayNumber={nextDayNumber}
      loginRewards={loginRewards ?? []}
      chestTypes={chestTypes ?? []}
      spinRewards={(spinRewards ?? []) as SpinSegment[]}
    />
  )
}
