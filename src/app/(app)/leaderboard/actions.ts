"use server"

import { createClient } from "@/lib/supabase/server"

export interface LeagueEntry {
  rank: number
  userId: string
  name: string
  xp: number
  streak: number
  isCurrentUser: boolean
}

export interface LeagueView {
  /** Division number. 1 is the entry league; higher is better. */
  division: number
  entries: LeagueEntry[]
  /** How the player got here this week, if they moved. */
  moved: "promoted" | "relegated" | "none"
  promoteTop: number
  relegateBottom: number
}

/**
 * This week's division standings for the signed-in player.
 *
 * Assigns a division first if they do not have one yet. That call also closes
 * out their previous week, which is what makes promotion and relegation apply —
 * there is no scheduled job in this project, so the work is done lazily by the
 * first request of a new week (migration 0011).
 */
export async function getMyLeague(): Promise<LeagueView | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: assignment, error: assignError } = await supabase.rpc("ensure_league_cohort")
  if (assignError) return null

  const assigned = Array.isArray(assignment) ? assignment[0] : assignment
  if (!assigned) return null

  const { data: rows, error } = await supabase.rpc("get_league_standings")
  if (error || !rows) return null

  const entries: LeagueEntry[] = (rows as any[]).map((r) => ({
    rank: r.o_rank as number,
    userId: r.o_user_id as string,
    name: (r.o_display_name as string) ?? "Learner",
    xp: (r.o_xp as number) ?? 0,
    streak: 0,
    isCurrentUser: Boolean(r.o_is_me),
  }))

  return {
    division: (assigned.o_cohort_number as number) ?? 1,
    entries,
    moved: ((assigned.o_moved as string) ?? "none") as LeagueView["moved"],
    // Mirrors league_rules() in migration 0011. Shown so the cut lines can be
    // drawn in the standings rather than left implicit.
    promoteTop: 3,
    relegateBottom: 2,
  }
}
