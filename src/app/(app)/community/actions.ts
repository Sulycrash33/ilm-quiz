"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface StudyCircleView {
  id: string
  name: string
  description: string | null
  currentTopic: string | null
  maxMembers: number
  memberCount: number
  isMember: boolean
  createdByMe: boolean
}

export async function getStudyCircles(): Promise<StudyCircleView[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: circles } = await supabase
    .from("study_circles")
    .select("id, name, description, current_topic, max_members, created_by, study_circle_members(user_id)")
    .order("created_at", { ascending: false })

  type Row = {
    id: string
    name: string
    description: string | null
    current_topic: string | null
    max_members: number
    created_by: string
    study_circle_members: { user_id: string }[]
  }
  const rows = (circles ?? []) as unknown as Row[]

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    currentTopic: c.current_topic,
    maxMembers: c.max_members,
    memberCount: c.study_circle_members.length,
    isMember: user ? c.study_circle_members.some((m) => m.user_id === user.id) : false,
    createdByMe: user ? c.created_by === user.id : false,
  }))
}

export async function createStudyCircle(input: {
  name: string
  description: string
  maxMembers: number
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
