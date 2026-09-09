import { createClient } from "@/lib/supabase/server"
import { getDailyTaskProgress } from "./actions"
import { getDailyChallenge } from "@/app/(app)/challenges/actions"
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

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  /*
   * Seven round trips, at once rather than in a queue.
   *
   * These were seven sequential `await`s, and not one of them depended on
   * another — every one needs only `user.id`, which the auth call above has
   * already produced. Serialised, they cost seven times the latency of one,
   * and the latency of one is not small: **the database is in eu-west-1
   * (Ireland) and this function runs in Vercel's default `iad1` (Washington
   * DC)**, so each query crossed the Atlantic and came back. Measured on the
   * live site: `x-vercel-id: iad1::`, project region `eu-west-1`.
   *
   * `vercel.json` now pins the function to `dub1`, which puts it beside the
   * database and turns each of those crossings into a same-region hop. This
   * `Promise.all` is the other half: even at 2ms a query, seven in a row is
   * seven times longer than it needs to be, and the fix costs nothing.
   *
   * `getDailyChallenge` is in here too and does more than one query of its own
   * — it materialises the day lazily, since there is no scheduler.
   */
  const [
    { data: profile },
    { data: todayClaim },
    { data: yesterdayClaim },
    { data: loginRewards },
    { data: spinRewards },
    dailyTask,
    dailyChallenge,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("streak_count, longest_streak, streak_freezes_available, coins, total_xp, last_spin_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("user_login_claims")
      .select("day_number")
      .eq("user_id", user.id)
      .eq("claim_date", today)
      .maybeSingle(),
    supabase
      .from("user_login_claims")
      .select("day_number")
      .eq("user_id", user.id)
      .eq("claim_date", yesterday)
      .maybeSingle(),
    supabase
      .from("daily_login_rewards")
      .select("day_number, coins, xp, is_special")
      .order("day_number"),
    // Ordered by id because `spin_wheel_rpc` selects its reward with
    // `row_number() over (order by sr.id)`, so any other ordering here would
    // draw a wheel whose segments do not correspond to the ones the server is
    // choosing between.
    supabase
      .from("spin_rewards")
      .select("id, label, type, value")
      .order("id"),
    // The day's task, read from the same function that gates the claim.
    getDailyTaskProgress(),
    getDailyChallenge(),
  ])

  const nextDayNumber = todayClaim ? todayClaim.day_number : yesterdayClaim ? (yesterdayClaim.day_number % 7) + 1 : 1

  return (
    <RewardsPageClient
      dailyTask={dailyTask}
      dailyChallenge={dailyChallenge}
      streakCount={profile?.streak_count ?? 0}
      longestStreak={profile?.longest_streak ?? 0}
      streakFreezesAvailable={profile?.streak_freezes_available ?? 0}
      coins={profile?.coins ?? 0}
      totalXp={profile?.total_xp ?? 0}
      lastSpinAt={profile?.last_spin_at ?? null}
      claimedToday={!!todayClaim}
      currentDayNumber={nextDayNumber}
      loginRewards={loginRewards ?? []}
      spinRewards={(spinRewards ?? []) as SpinSegment[]}
    />
  )
}
