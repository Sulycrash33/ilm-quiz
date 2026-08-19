"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Forum.
 *
 * Nothing posted here is reviewed before it is shown, which is the whole reason
 * the moderation machinery in migration 0014 exists. Two consequences show up
 * in this file:
 *
 *   - Every write goes through an RPC. There is no INSERT grant on
 *     `forum_topics` or `forum_replies` for a client session, so the rate limits
 *     in those functions cannot be gone around by calling the table directly.
 *   - Reads rely on RLS rather than filtering here. A hidden post is invisible
 *     to everyone except its author and a moderator because the policy says so,
 *     not because this file remembered to add `.eq("status", "visible")`.
 */

export interface ForumAuthor {
  id: string
  displayName: string
  avatarId: string | null
}

export interface ForumReplyView {
  id: string
  body: string
  status: "visible" | "hidden" | "removed"
  author: ForumAuthor
  createdAt: string
  /** Set when a reviewer or admin has checked this reply. */
  verifiedByName: string | null
  isMine: boolean
}

export interface ForumTopicView {
  id: string
  title: string
  body: string
  status: "visible" | "hidden" | "removed"
  author: ForumAuthor
  categoryName: string | null
  replyCount: number
  createdAt: string
  lastActivityAt: string
  pinned: boolean
  isMine: boolean
}

export interface ForumViewerContext {
  signedIn: boolean
  userId: string | null
  isModerator: boolean
}

async function viewer(): Promise<ForumViewerContext & { supabase: Awaited<ReturnType<typeof createClient>> }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { supabase, signedIn: false, userId: null, isModerator: false }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  return {
    supabase,
    signedIn: true,
    userId: user.id,
    isModerator: profile?.role === "reviewer" || profile?.role === "admin",
  }
}

export async function getForumViewer(): Promise<ForumViewerContext> {
  const { signedIn, userId, isModerator } = await viewer()
  return { signedIn, userId, isModerator }
}

type ProfileJoin = { id: string; display_name: string | null; avatar_id: string | null } | null

function toAuthor(p: ProfileJoin): ForumAuthor {
  return {
    id: p?.id ?? "",
    displayName: p?.display_name ?? "Learner",
    avatarId: p?.avatar_id ?? null,
  }
}

export async function getForumTopics(limit = 40): Promise<ForumTopicView[]> {
  const { supabase, userId } = await viewer()

  const { data, error } = await supabase
    .from("forum_topics")
    .select(
      "id, title, body, status, reply_count, created_at, last_activity_at, pinned, author_id, profiles!forum_topics_author_id_fkey(id, display_name, avatar_id), categories(name)",
    )
    .order("pinned", { ascending: false })
    .order("last_activity_at", { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return (data as any[]).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    status: row.status,
    author: toAuthor(row.profiles),
    categoryName: row.categories?.name ?? null,
    replyCount: row.reply_count,
    createdAt: row.created_at,
    lastActivityAt: row.last_activity_at,
    pinned: row.pinned,
    isMine: userId === row.author_id,
  }))
}

export async function getForumReplies(topicId: string): Promise<ForumReplyView[]> {
  const { supabase, userId } = await viewer()

  const { data, error } = await supabase
    .from("forum_replies")
    .select(
      "id, body, status, created_at, author_id, verified_at, profiles!forum_replies_author_id_fkey(id, display_name, avatar_id), verifier:profiles!forum_replies_verified_by_fkey(display_name)",
    )
    .eq("topic_id", topicId)
    .order("created_at")

  if (error || !data) return []

  return (data as any[]).map((row) => ({
    id: row.id,
    body: row.body,
    status: row.status,
    author: toAuthor(row.profiles),
    createdAt: row.created_at,
    verifiedByName: row.verified_at ? (row.verifier?.display_name ?? "A reviewer") : null,
    isMine: userId === row.author_id,
  }))
}

type RpcResult = { o_success: boolean; o_error: string | null }

/** Every RPC in 0014 returns a single row of `o_success`/`o_error`. */
function unwrap(data: unknown, error: unknown): { success: boolean; error?: string } {
  if (error) return { success: false, error: "Something went wrong." }
  const row = Array.isArray(data) ? (data[0] as RpcResult | undefined) : (data as RpcResult | null)
  if (!row) return { success: false, error: "Something went wrong." }
  return row.o_success ? { success: true } : { success: false, error: row.o_error ?? "Something went wrong." }
}

export async function createForumTopic(input: {
  title: string
  body: string
  categoryId?: string | null
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("create_forum_topic", {
    p_title: input.title,
    p_body: input.body,
    p_category_id: input.categoryId ?? null,
  })
  const result = unwrap(data, error)
  if (result.success) revalidatePath("/community")
  return result
}

export async function createForumReply(
  topicId: string,
  body: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("create_forum_reply", {
    p_topic_id: topicId,
    p_body: body,
  })
  const result = unwrap(data, error)
  if (result.success) revalidatePath("/community")
  return result
}

/** Edit or soft-delete your own post, on any of the four content kinds. */
export async function editOwnPost(input: {
  kind: "forum_topic" | "forum_reply" | "mentor_question" | "mentor_answer"
  id: string
  body?: string
  remove?: boolean
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("edit_own_post", {
    p_kind: input.kind,
    p_id: input.id,
    p_body: input.body ?? null,
    p_delete: input.remove ?? false,
  })
  const result = unwrap(data, error)
  if (result.success) revalidatePath("/community")
  return result
}

export async function reportContent(input: {
  kind: "forum_topic" | "forum_reply" | "mentor_question" | "mentor_answer"
  id: string
  reason: string
  detail?: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("report_content", {
    p_kind: input.kind,
    p_id: input.id,
    p_reason: input.reason,
    p_detail: input.detail ?? null,
  })
  return unwrap(data, error)
}

/** Moderator only — the RPC enforces it, this is just the call. */
export async function moderateContent(input: {
  kind: "forum_topic" | "forum_reply" | "mentor_question" | "mentor_answer"
  id: string
  status: "visible" | "hidden" | "removed"
  note?: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("moderate_content", {
    p_kind: input.kind,
    p_id: input.id,
    p_status: input.status,
    p_note: input.note ?? null,
  })
  const result = unwrap(data, error)
  if (result.success) revalidatePath("/community")
  return result
}

export async function verifyForumReply(
  replyId: string,
  verified: boolean,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("verify_forum_reply", {
    p_reply_id: replyId,
    p_verified: verified,
  })
  const result = unwrap(data, error)
  if (result.success) revalidatePath("/community")
  return result
}
