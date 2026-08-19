"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Mentorship.
 *
 * Public question-and-answer, not private matching. There is no direct-message
 * table in migration 0014 and no function here that opens a private channel:
 * this app onboards under-13s, has no age verification and no safeguarding
 * process, so an unmoderated adult-to-child thread is not something to ship.
 * Everything below is readable by any signed-in user and reportable by any of
 * them.
 *
 * Answering is gated on an admin having approved the mentor. That check lives
 * in `answer_mentor_question`, not here — there is no INSERT grant on
 * `mentor_answers` for a client session, so the RPC is the only way in.
 */

export type MentorApplicationStatus = "pending" | "approved" | "rejected" | "paused"

export interface MentorProfileView {
  userId: string
  displayName: string
  avatarId: string | null
  bio: string
  credentials: string | null
  languages: string[]
  status: MentorApplicationStatus
  answersGiven: number
  reviewNote: string | null
  appliedAt: string
}

export interface MentorAnswerView {
  id: string
  body: string
  status: "visible" | "hidden" | "removed"
  mentorId: string
  mentorName: string
  createdAt: string
  accepted: boolean
  isMine: boolean
}

export interface MentorQuestionView {
  id: string
  title: string
  body: string
  status: "visible" | "hidden" | "removed"
  askerId: string
  askerName: string
  categoryName: string | null
  answerCount: number
  answered: boolean
  createdAt: string
  isMine: boolean
}

export interface MentorshipContext {
  signedIn: boolean
  userId: string | null
  isModerator: boolean
  /** The caller's own application, if they have ever made one. */
  myApplication: MentorProfileView | null
  /** Shorthand for "may answer questions". */
  canAnswer: boolean
}

type RpcResult = { o_success: boolean; o_error: string | null }

function unwrap(data: unknown, error: unknown): { success: boolean; error?: string } {
  if (error) return { success: false, error: "Something went wrong." }
  const row = Array.isArray(data) ? (data[0] as RpcResult | undefined) : (data as RpcResult | null)
  if (!row) return { success: false, error: "Something went wrong." }
  return row.o_success ? { success: true } : { success: false, error: row.o_error ?? "Something went wrong." }
}

function toMentor(row: any): MentorProfileView {
  return {
    userId: row.user_id,
    displayName: row.profiles?.display_name ?? "Learner",
    avatarId: row.profiles?.avatar_id ?? null,
    bio: row.bio,
    credentials: row.credentials ?? null,
    languages: row.languages ?? [],
    status: row.status,
    answersGiven: row.answers_given ?? 0,
    reviewNote: row.review_note ?? null,
    appliedAt: row.applied_at,
  }
}

export async function getMentorshipContext(): Promise<MentorshipContext> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { signedIn: false, userId: null, isModerator: false, myApplication: null, canAnswer: false }
  }

  const [{ data: profile }, { data: application }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    supabase
      .from("mentor_profiles")
      .select("user_id, bio, credentials, languages, status, answers_given, review_note, applied_at, profiles!mentor_profiles_user_id_fkey(display_name, avatar_id)")
      .eq("user_id", user.id)
      .maybeSingle(),
  ])

  const mine = application ? toMentor(application) : null

  return {
    signedIn: true,
    userId: user.id,
    isModerator: profile?.role === "reviewer" || profile?.role === "admin",
    myApplication: mine,
    canAnswer: mine?.status === "approved",
  }
}

/** Approved mentors only. RLS hides pending and rejected applications from
 * everyone but the applicant and moderators, so this needs no status filter. */
export async function getApprovedMentors(): Promise<MentorProfileView[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select("user_id, bio, credentials, languages, status, answers_given, review_note, applied_at, profiles!mentor_profiles_user_id_fkey(display_name, avatar_id)")
    .eq("status", "approved")
    .order("answers_given", { ascending: false })

  if (error || !data) return []
  return (data as any[]).map(toMentor)
}

export async function getMentorQuestions(limit = 40): Promise<MentorQuestionView[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from("mentor_questions")
    .select("id, title, body, status, asker_id, answer_count, answered, created_at, profiles!mentor_questions_asker_id_fkey(display_name), categories(name)")
    // Unanswered first: a question nobody has replied to is the one that needs
    // a mentor's attention.
    .order("answered", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return (data as any[]).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    status: row.status,
    askerId: row.asker_id,
    askerName: row.profiles?.display_name ?? "Learner",
    categoryName: row.categories?.name ?? null,
    answerCount: row.answer_count,
    answered: row.answered,
    createdAt: row.created_at,
    isMine: user?.id === row.asker_id,
  }))
}

export async function getMentorAnswers(questionId: string): Promise<MentorAnswerView[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from("mentor_answers")
    .select("id, body, status, mentor_id, created_at, accepted, profiles!mentor_answers_mentor_id_fkey(display_name)")
    .eq("question_id", questionId)
    .order("accepted", { ascending: false })
    .order("created_at")

  if (error || !data) return []

  return (data as any[]).map((row) => ({
    id: row.id,
    body: row.body,
    status: row.status,
    mentorId: row.mentor_id,
    mentorName: row.profiles?.display_name ?? "Mentor",
    createdAt: row.created_at,
    accepted: row.accepted,
    isMine: user?.id === row.mentor_id,
  }))
}

export async function applyAsMentor(input: {
  bio: string
  credentials?: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("apply_as_mentor", {
    p_bio: input.bio,
    p_credentials: input.credentials ?? null,
  })
  const result = unwrap(data, error)
  if (result.success) revalidatePath("/community")
  return result
}

export async function askMentorQuestion(input: {
  title: string
  body: string
  categoryId?: string | null
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("ask_mentor_question", {
    p_title: input.title,
    p_body: input.body,
    p_category_id: input.categoryId ?? null,
  })
  const result = unwrap(data, error)
  if (result.success) revalidatePath("/community")
  return result
}

export async function answerMentorQuestion(
  questionId: string,
  body: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("answer_mentor_question", {
    p_question_id: questionId,
    p_body: body,
  })
  const result = unwrap(data, error)
  if (result.success) revalidatePath("/community")
  return result
}

export async function acceptMentorAnswer(answerId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("accept_mentor_answer", { p_answer_id: answerId })
  const result = unwrap(data, error)
  if (result.success) revalidatePath("/community")
  return result
}

/* ------------------------------------------------------------------ */
/* Moderation                                                          */
/* ------------------------------------------------------------------ */

export interface PendingMentorApplication extends MentorProfileView {}

export async function getPendingMentorApplications(): Promise<PendingMentorApplication[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select("user_id, bio, credentials, languages, status, answers_given, review_note, applied_at, profiles!mentor_profiles_user_id_fkey(display_name, avatar_id)")
    .eq("status", "pending")
    .order("applied_at")

  if (error || !data) return []
  return (data as any[]).map(toMentor)
}

export async function reviewMentorApplication(input: {
  userId: string
  status: "approved" | "rejected" | "paused"
  note?: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("review_mentor_application", {
    p_user_id: input.userId,
    p_status: input.status,
    p_note: input.note ?? null,
  })
  const result = unwrap(data, error)
  if (result.success) {
    revalidatePath("/community")
    revalidatePath("/admin/moderation")
  }
  return result
}

export interface ModerationQueueItem {
  reportId: string
  targetKind: "forum_topic" | "forum_reply" | "mentor_question" | "mentor_answer"
  targetId: string
  reason: string
  detail: string | null
  reportedAt: string
  reportCount: number
  authorName: string
  excerpt: string
  status: "visible" | "hidden" | "removed"
}

export async function getModerationQueue(): Promise<ModerationQueueItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_moderation_queue")
  if (error || !data) return []

  return (data as any[]).map((row) => ({
    reportId: row.o_report_id,
    targetKind: row.o_target_kind,
    targetId: row.o_target_id,
    reason: row.o_reason,
    detail: row.o_detail,
    reportedAt: row.o_reported_at,
    reportCount: row.o_report_count,
    authorName: row.o_author_name,
    excerpt: row.o_excerpt,
    status: row.o_status,
  }))
}

export async function dismissReport(reportId: string, note?: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("dismiss_report", {
    p_report_id: reportId,
    p_note: note ?? null,
  })
  const result = unwrap(data, error)
  if (result.success) revalidatePath("/admin/moderation")
  return result
}
