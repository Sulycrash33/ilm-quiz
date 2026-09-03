"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Real data for the home page cards.
 *
 * The home page used to hardcode all of this: a "Life of the Prophet (pbuh)"
 * course at "Lesson 4 of 12, 60% complete", a prayer widget reading
 * "Dhuhr, in 2h 15m", and a mission to "Complete 3 Arabic Quizzes". None of it
 * came from anywhere — a brand-new account with zero attempts was told it was
 * 60% through a course it had never opened, and the card had `cursor-pointer`
 * with nothing to click.
 *
 * Everything here comes from the database or returns null so the card can say
 * something true instead.
 */

export interface ContinueCard {
  slug: string
  name: string
  /** Distinct questions this seeker has answered in the category. */
  answered: number
  /** Published questions available in it. */
  total: number
  /** 0-100, floored at 0 and capped at 100. */
  percent: number
}

/**
 * The category to offer next.
 *
 * Prefers the one most recently attempted, so "continue" means what it says.
 * Returns null for someone who has never answered anything, which is the case
 * the old hardcoded card got wrong — the caller shows a "start here" invitation
 * instead of inventing progress.
 */
export async function getContinueCard(): Promise<ContinueCard | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: recent } = await supabase
    .from("attempts")
    .select("question_id, created_at, questions!inner(category_id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)

  const row = (recent ?? [])[0] as unknown as { questions?: { category_id?: string } } | undefined
  const categoryId = row?.questions?.category_id
  if (!categoryId) return null

  const [{ data: category }, { count: total }, { data: answeredRows }] = await Promise.all([
    supabase.from("categories").select("slug, name").eq("id", categoryId).single(),
    supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId)
      .eq("review_status", "published"),
    supabase
      .from("attempts")
      .select("question_id, questions!inner(category_id)")
      .eq("user_id", user.id)
      .eq("questions.category_id", categoryId),
  ])

  if (!category) return null

  // Distinct questions, not attempts: answering the same one twice is not
  // progress through the category.
  const answered = new Set((answeredRows ?? []).map((a: { question_id: string }) => a.question_id)).size
  const published = total ?? 0

  return {
    slug: category.slug,
    name: category.name,
    answered,
    total: published,
    percent: published === 0 ? 0 : Math.min(100, Math.round((answered / published) * 100)),
  }
}

/**
 * Today's hadith, in every language at once.
 *
 * `DAILY_HADITH` used to be one hardcoded English string in `constants.ts`, so
 * the card showed the same narration forever and stayed English when the
 * player chose Hausa — the one piece of genuine religious content on a home
 * screen that had otherwise translated around it.
 *
 * Every locale comes back in a single call rather than just the caller's. That
 * is the same bargain the question pipeline strikes: pay one round trip when
 * the page loads, and a language change afterwards is a re-render with the
 * text already in hand, instant and offline-safe. Fetching per locale would
 * have put a network request between tapping a flag and reading a hadith.
 */
export interface DailyHadithView {
  reference: string
  /** Locale code to `{ text, attribution }`. English is always present. */
  byLocale: Record<string, { text: string; attribution: string }>
}

export async function getDailyHadith(): Promise<DailyHadithView | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("daily_hadith")
  if (error || !data || data.length === 0) return null

  const rows = data as {
    o_reference: string
    o_locale: string
    o_text: string
    o_attribution: string
  }[]

  const byLocale: DailyHadithView["byLocale"] = {}
  for (const r of rows) {
    byLocale[r.o_locale] = { text: r.o_text, attribution: r.o_attribution }
  }

  // No English means no fallback for the other five, and a card that would go
  // blank the moment someone switched to a locale nobody has filled in yet.
  if (!byLocale.en) return null

  return { reference: rows[0].o_reference, byLocale }
}
