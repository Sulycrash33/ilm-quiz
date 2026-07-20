import { createClient } from "@/lib/supabase/server"

export interface CategoryStat {
  categoryId: string
  slug: string
  name: string
  attempted: number
  correct: number
}

export interface RankInfo {
  slug: string
  name: string
  minXp: number
  sortOrder: number
}

export interface AchievementView {
  slug: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  earnedAt: string | null
  progress: number
  target: number
}

export interface RecentAttempt {
  questionText: string
  isCorrect: boolean
  xpEarned: number
  createdAt: string
  categoryName: string
}

export interface ProfileStats {
  profile: {
    id: string
    displayName: string | null
    avatarId: string | null
    totalXp: number
    coins: number
    streakCount: number
    longestStreak: number
    highScore: number
  }
  currentRank: RankInfo | null
  nextRank: RankInfo | null
  totalAttempts: number
  correctCount: number
  accuracyPct: number
  categories: CategoryStat[]
  achievements: AchievementView[]
  globalRank: number | null
  recentAttempts: RecentAttempt[]
}

interface CriteriaStats {
  totalAttempts: number
  correctCount: number
  accuracyPct: number
  usedLifelineEver: boolean
  categoriesTouched: number
  categoryCounts: Record<string, number>
  streakCount: number
  rankSortOrder: number
}

/** Real numeric progress toward a criteria, for progress bars - not fabricated, just a different view of the same stats used to unlock it. */
function computeProgress(
  criteria: Record<string, unknown> | null,
  stats: CriteriaStats
): { progress: number; target: number } {
  if (!criteria || typeof criteria.type !== "string") return { progress: 0, target: 1 }
  switch (criteria.type) {
    case "attempts_count":
      return { progress: Math.min(stats.totalAttempts, Number(criteria.min)), target: Number(criteria.min) }
    case "correct_count":
      return { progress: Math.min(stats.correctCount, Number(criteria.min)), target: Number(criteria.min) }
    case "accuracy":
      return { progress: Math.min(stats.totalAttempts, Number(criteria.min_attempts)), target: Number(criteria.min_attempts) }
    case "category_breadth":
      return { progress: Math.min(stats.categoriesTouched, Number(criteria.min_categories)), target: Number(criteria.min_categories) }
    case "category_count": {
      const min = Number(criteria.min)
      return { progress: Math.min(stats.categoryCounts[String(criteria.category_slug)] ?? 0, min), target: min }
    }
    case "used_lifeline":
      return { progress: stats.usedLifelineEver ? 1 : 0, target: 1 }
    case "streak":
      return { progress: Math.min(stats.streakCount, Number(criteria.min_days)), target: Number(criteria.min_days) }
    case "rank":
      return { progress: 0, target: 1 }
    default:
      return { progress: 0, target: 1 }
  }
}

function evaluateCriteria(
  criteria: Record<string, unknown> | null,
  stats: CriteriaStats,
  rankSortOrderBySlug: Map<string, number>
): boolean {
  if (!criteria || typeof criteria.type !== "string") return false
  switch (criteria.type) {
    case "attempts_count":
      return stats.totalAttempts >= Number(criteria.min ?? Infinity)
    case "correct_count":
      return stats.correctCount >= Number(criteria.min ?? Infinity)
    case "accuracy":
      return (
        stats.totalAttempts >= Number(criteria.min_attempts ?? Infinity) &&
        stats.accuracyPct >= Number(criteria.min_pct ?? Infinity)
      )
    case "category_breadth":
      return stats.categoriesTouched >= Number(criteria.min_categories ?? Infinity)
    case "category_count":
      return (
        (stats.categoryCounts[String(criteria.category_slug)] ?? 0) >= Number(criteria.min ?? Infinity)
      )
    case "used_lifeline":
      return stats.usedLifelineEver
    case "streak":
      return stats.streakCount >= Number(criteria.min_days ?? Infinity)
    case "rank": {
      const targetSortOrder = rankSortOrderBySlug.get(String(criteria.slug))
      if (targetSortOrder === undefined) return false
      return stats.rankSortOrder >= targetSortOrder
    }
    default:
      return false
  }
}

/**
 * Real, live-computed profile stats for a signed-in user. Nothing here is
 * fabricated - counts come from `attempts`, ranks from `rank_tiers`,
 * achievements from `achievements` + `user_achievements`. A brand-new
 * player with zero attempts will correctly get all-zero stats and every
 * achievement showing locked, rather than placeholder numbers.
 */
export async function getProfileStats(userId: string): Promise<ProfileStats | null> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_id, total_xp, coins, current_rank_id, streak_count, longest_streak, high_score")
    .eq("id", userId)
    .single()

  if (!profile) return null

  const { data: ranks } = await supabase
    .from("rank_tiers")
    .select("slug, name, min_xp, sort_order")
    .order("sort_order")

  const rankList = ranks ?? []
  const rankSortOrderBySlug = new Map(rankList.map((r) => [r.slug, r.sort_order]))

  let currentRank: RankInfo | null = null
  let nextRank: RankInfo | null = null
  for (let i = 0; i < rankList.length; i++) {
    if (profile.total_xp >= rankList[i].min_xp) {
      currentRank = {
        slug: rankList[i].slug,
        name: rankList[i].name,
        minXp: rankList[i].min_xp,
        sortOrder: rankList[i].sort_order,
      }
      nextRank = rankList[i + 1]
        ? {
            slug: rankList[i + 1].slug,
            name: rankList[i + 1].name,
            minXp: rankList[i + 1].min_xp,
            sortOrder: rankList[i + 1].sort_order,
          }
        : null
    }
  }

  const { data: attemptRows } = await supabase
    .from("attempts")
    .select(
      "is_correct, xp_earned, used_ask_the_imam_hint, created_at, questions(question_text, category_id, categories(slug, name))"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  type AttemptRow = {
    is_correct: boolean
    xp_earned: number
    used_ask_the_imam_hint: boolean
    created_at: string
    questions: {
      question_text: string
      category_id: string
      categories: { slug: string; name: string } | null
    } | null
  }
  const attemptList = (attemptRows ?? []) as unknown as AttemptRow[]

  const totalAttempts = attemptList.length
  const correctCount = attemptList.filter((a) => a.is_correct).length
  const accuracyPct = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0
  const usedLifelineEver = attemptList.some((a) => a.used_ask_the_imam_hint)

  const categoryMap = new Map<string, CategoryStat>()
  for (const a of attemptList) {
    const cat = a.questions?.categories
    if (!cat) continue
    if (!categoryMap.has(cat.slug)) {
      categoryMap.set(cat.slug, {
        categoryId: a.questions!.category_id,
        slug: cat.slug,
        name: cat.name,
        attempted: 0,
        correct: 0,
      })
    }
    const entry = categoryMap.get(cat.slug)!
    entry.attempted += 1
    if (a.is_correct) entry.correct += 1
  }
  const categories = Array.from(categoryMap.values())

  const { data: achievementDefs } = await supabase
    .from("achievements")
    .select("id, slug, name, description, icon, criteria")
    .order("id")

  const { data: userAchievementRows } = await supabase
    .from("user_achievements")
    .select("achievement_id, earned_at")
    .eq("user_id", userId)

  const earnedMap = new Map((userAchievementRows ?? []).map((ua) => [ua.achievement_id, ua.earned_at]))

  const criteriaStats: CriteriaStats = {
    totalAttempts,
    correctCount,
    accuracyPct,
    usedLifelineEver,
    categoriesTouched: categories.length,
    categoryCounts: Object.fromEntries(categories.map((c) => [c.slug, c.attempted])),
    streakCount: profile.streak_count,
    rankSortOrder: currentRank?.sortOrder ?? 0,
  }

  const newlyEarnedIds: number[] = []
  const achievements: AchievementView[] = []

  for (const def of achievementDefs ?? []) {
    let unlocked = earnedMap.has(def.id)
    if (!unlocked) {
      unlocked = evaluateCriteria(def.criteria as Record<string, unknown>, criteriaStats, rankSortOrderBySlug)
      if (unlocked) newlyEarnedIds.push(def.id)
    }
    const { progress, target } = computeProgress(def.criteria as Record<string, unknown>, criteriaStats)
    achievements.push({
      slug: def.slug,
      name: def.name,
      description: def.description,
      icon: def.icon,
      unlocked,
      earnedAt: earnedMap.get(def.id) ?? null,
      progress: unlocked ? target : progress,
      target,
    })
  }

  // Persist newly-met achievements for real, so `earned_at` reflects when
  // they were actually first detected rather than being recomputed forever.
  if (newlyEarnedIds.length > 0) {
    await supabase
      .from("user_achievements")
      .insert(newlyEarnedIds.map((id) => ({ user_id: userId, achievement_id: id })))
  }

  const { count: higherCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gt("total_xp", profile.total_xp)

  const globalRank = higherCount !== null ? higherCount + 1 : null

  const recentAttempts: RecentAttempt[] = attemptList.slice(0, 8).map((a) => ({
    questionText: a.questions?.question_text ?? "",
    isCorrect: a.is_correct,
    xpEarned: a.xp_earned,
    createdAt: a.created_at,
    categoryName: a.questions?.categories?.name ?? "General",
  }))

  return {
    profile: {
      id: profile.id,
      displayName: profile.display_name,
      avatarId: profile.avatar_id,
      totalXp: profile.total_xp,
      coins: profile.coins,
      streakCount: profile.streak_count,
      longestStreak: profile.longest_streak,
      highScore: profile.high_score,
    },
    currentRank,
    nextRank,
    totalAttempts,
    correctCount,
    accuracyPct,
    categories,
    achievements,
    globalRank,
    recentAttempts,
  }
}
