"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Study circles.
 *
 * A circle is a group with a shared weekly XP goal (migration 0012). Every
 * member's XP for the current week counts towards it — the same `weekly_xp`
 * rows the leagues rank on, so one session of play moves both. Completed weeks
 * are recorded by `get_circle_summaries`, which closes any outstanding ones on
 * read; there is no scheduler in this project.
 *
 * Hitting a goal pays nothing. The goal is set by the circle's own creator and
 * anyone can create a circle, so a payout would be a coin loop. What a circle
 * earns is the streak.
 */

/** Bounds enforced by `study_circles_weekly_xp_goal_range`; repeated here so a
 * bad value is rejected before it reaches the database. */
const GOAL_MIN = 100
const GOAL_MAX = 100000

export interface StudyCircleView {
  id: string
  name: string
  description: string | null
  currentTopic: string | null
  maxMembers: number
  memberCount: number
  isMember: boolean
  createdByMe: boolean
  /** XP the circle is aiming for between Monday and Sunday. */
  weeklyGoal: number
  /** What its members have earned towards that so far this week. */
  weekXp: number
  /** Whether this week's goal is already met. */
  goalMet: boolean
  /** Completed weeks in a row where the goal was met, up to last week. */
  streakWeeks: number
  /** The longest such run the circle has ever had. */
  bestStreak: number
}

export interface CircleContribution {
  userId: string
  displayName: string
  avatarId: string | null
  xp: number
  rank: number
  isMe: boolean
}

export async function getStudyCircles(): Promise<StudyCircleView[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: circles }, { data: summaries }] = await Promise.all([
    supabase
      .from("study_circles")
      .select(
        "id, name, description, current_topic, max_members, weekly_xp_goal, created_by, study_circle_members(user_id)",
      )
      .order("created_at", { ascending: false }),
    supabase.rpc("get_circle_summaries"),
  ])

  type Row = {
    id: string
    name: string
    description: string | null
    current_topic: string | null
    max_members: number
    weekly_xp_goal: number
    created_by: string
    study_circle_members: { user_id: string }[]
  }
  type Summary = {
    o_circle_id: string
    o_goal: number
    o_xp: number
    o_member_count: number
    o_met: boolean
    o_streak_weeks: number
    o_best_streak: number
  }

  const rows = (circles ?? []) as unknown as Row[]
  const byId = new Map((((summaries ?? []) as Summary[]) || []).map((s) => [s.o_circle_id, s]))

  return rows.map((c) => {
    const s = byId.get(c.id)
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      currentTopic: c.current_topic,
      maxMembers: c.max_members,
      memberCount: s?.o_member_count ?? c.study_circle_members.length,
      isMember: user ? c.study_circle_members.some((m) => m.user_id === user.id) : false,
      createdByMe: user ? c.created_by === user.id : false,
      weeklyGoal: s?.o_goal ?? c.weekly_xp_goal,
      weekXp: s?.o_xp ?? 0,
      goalMet: s?.o_met ?? false,
      streakWeeks: s?.o_streak_weeks ?? 0,
      bestStreak: s?.o_best_streak ?? 0,
    }
  })
}

/**
 * Who in the circle earned what this week.
 *
 * Members only — the circle's total and streak are public because they help
 * someone decide whether to join, but the breakdown of who carried the week is
 * for the people in it. The gate is in the RPC, not here.
 */
export async function getCircleBoard(circleId: string): Promise<CircleContribution[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_circle_board", { p_circle_id: circleId })
  if (error || !data) return []

  type Row = {
    o_user_id: string
    o_display_name: string
    o_avatar_id: string | null
    o_xp: number
    o_rank: number
    o_is_me: boolean
  }

  return (data as Row[]).map((r) => ({
    userId: r.o_user_id,
    displayName: r.o_display_name,
    avatarId: r.o_avatar_id,
    xp: r.o_xp,
    rank: r.o_rank,
    isMe: r.o_is_me,
  }))
}

export async function createStudyCircle(input: {
  name: string
  description: string
  maxMembers: number
  weeklyGoal?: number
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "You must be signed in." }

  if (!input.name.trim()) return { success: false, error: "Give your circle a name." }

  const { data: circle, error } = await supabase
    .from("study_circles")
    .insert({
      name: input.name.trim(),
      description: input.description.trim() || null,
      max_members: Math.max(2, Math.min(200, input.maxMembers || 20)),
      weekly_xp_goal: clampGoal(input.weeklyGoal ?? 500),
      created_by: user.id,
    })
    .select("id")
    .single()

  if (error || !circle) return { success: false, error: "Could not create the circle." }

  // Creator automatically joins their own circle.
  await supabase.from("study_circle_members").insert({ circle_id: circle.id, user_id: user.id })

  revalidatePath("/community")
  return { success: true }
}

/**
 * Change the weekly target. Only the creator can — enforced by the
 * "Creator can update their own circle" RLS policy, so a forged circle id
 * fails at the database rather than here.
 */
export async function setCircleGoal(
  circleId: string,
  goal: number,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "You must be signed in." }

  if (!Number.isFinite(goal) || goal < GOAL_MIN || goal > GOAL_MAX) {
    return { success: false, error: `Choose a goal between ${GOAL_MIN} and ${GOAL_MAX} XP.` }
  }

  const { data, error } = await supabase
    .from("study_circles")
    .update({ weekly_xp_goal: Math.round(goal) })
    .eq("id", circleId)
    .select("id")

  if (error) return { success: false, error: "Could not update the goal." }
  if (!data || data.length === 0) return { success: false, error: "Only the circle's creator can change its goal." }

  revalidatePath("/community")
  return { success: true }
}

export async function joinStudyCircle(circleId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "You must be signed in." }

  const { data: circle } = await supabase
    .from("study_circles")
    .select("max_members, study_circle_members(user_id)")
    .eq("id", circleId)
    .single()

  if (!circle) return { success: false, error: "Circle not found." }
  const members = (circle as unknown as { study_circle_members: { user_id: string }[] }).study_circle_members
  if (members.some((m) => m.user_id === user.id)) return { success: true }
  if (members.length >= circle.max_members) return { success: false, error: "This circle is full." }

  const { error } = await supabase.from("study_circle_members").insert({ circle_id: circleId, user_id: user.id })
  if (error) return { success: false, error: "Could not join the circle." }

  revalidatePath("/community")
  return { success: true }
}

export async function leaveStudyCircle(circleId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "You must be signed in." }

  const { error } = await supabase
    .from("study_circle_members")
    .delete()
    .eq("circle_id", circleId)
    .eq("user_id", user.id)

  if (error) return { success: false, error: "Could not leave the circle." }

  revalidatePath("/community")
  return { success: true }
}

function clampGoal(goal: number): number {
  if (!Number.isFinite(goal)) return 500
  return Math.round(Math.max(GOAL_MIN, Math.min(GOAL_MAX, goal)))
}
