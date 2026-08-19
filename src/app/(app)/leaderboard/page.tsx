import { createClient } from "@/lib/supabase/server"
import { LeaderboardPageClient } from "@/components/leaderboard/LeaderboardPageClient"
import { LeagueStandings } from "@/components/leaderboard/LeagueStandings"
import { getMyLeague } from "./actions"

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: allTimeRows } = await supabase
    .from("profiles")
    .select("id, display_name, total_xp, streak_count")
    .order("total_xp", { ascending: false })
    .limit(20)

  const today = new Date()
  const dayOfWeek = today.getUTCDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(today)
  weekStart.setUTCDate(today.getUTCDate() - mondayOffset)
  const weekStartStr = weekStart.toISOString().slice(0, 10)

  const { data: weeklyRows } = await supabase
    .from("weekly_xp")
    .select("user_id, xp, profiles(display_name, streak_count)")
    .eq("week_start", weekStartStr)
    .order("xp", { ascending: false })
    .limit(20)

  type WeeklyRow = { user_id: string; xp: number; profiles: { display_name: string | null; streak_count: number } | null }
  const weeklyRowsTyped = (weeklyRows ?? []) as unknown as WeeklyRow[]

  const allTime = (allTimeRows ?? []).map((p, i) => ({
    rank: i + 1,
    userId: p.id,
    name: p.display_name ?? "Learner",
    xp: p.total_xp,
    streak: p.streak_count,
    isCurrentUser: user ? p.id === user.id : false,
  }))

  const weekly = weeklyRowsTyped.map((w, i) => ({
    rank: i + 1,
    userId: w.user_id,
    name: w.profiles?.display_name ?? "Learner",
    xp: w.xp,
    streak: w.profiles?.streak_count ?? 0,
    isCurrentUser: user ? w.user_id === user.id : false,
  }))

  const myAllTimeRank = allTime.find((e) => e.isCurrentUser)
  const myWeeklyRank = weekly.find((e) => e.isCurrentUser)

  // Assigns a division if the player has none yet, which also closes out their
  // previous week so promotion applies. Null when signed out.
  const league = await getMyLeague()

  return (
    <div className="space-y-8">
      {league && (
        <div className="mx-auto max-w-7xl px-5 pt-6">
          <LeagueStandings league={league} />
        </div>
      )}
      <LeaderboardPageClient
        allTime={allTime}
        weekly={weekly}
        myAllTimeRank={myAllTimeRank ?? null}
        myWeeklyRank={myWeeklyRank ?? null}
      />
    </div>
  )
}
