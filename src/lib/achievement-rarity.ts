import type { AchievementRarity } from "./design-tokens"

/**
 * How rare an achievement is.
 *
 * `RARITY_STYLES` has sat in `design-tokens.ts` since early on with five tiers
 * and no consumer, because nothing ever decided which achievement was which
 * tier. The `achievements` table has no rarity column either: it holds `slug`,
 * `name`, `description`, `icon`, `criteria` and `created_at`, and nothing else.
 *
 * So rarity is **derived from the criteria**, not stored. Two reasons that is
 * the better answer here rather than a migration adding a column:
 *
 *  - It cannot drift. The same `criteria` object that `award_achievements()`
 *    evaluates is the one scored here, so an achievement's badge always matches
 *    the difficulty of actually earning it. A hand-set column would be one more
 *    pair of numbers that must be kept in step, and this project already has a
 *    note about exactly that failure mode with rank thresholds.
 *  - A new achievement gets a sensible tier for free. Nobody has to remember to
 *    set it, and forgetting cannot leave a blank badge on the gallery.
 *
 * If an administrator ever needs to overrule the scoring for a specific
 * achievement, a nullable `rarity` column read in preference to this function
 * is the natural next step. It is deliberately not built yet, because nothing
 * has asked for it.
 *
 * Scores are a rough "how much work is this" number, not a probability. They
 * were chosen by reading all thirteen live achievements and sorting them by how
 * much play each actually demands.
 */

interface Criteria {
  type?: string
  min?: number
  min_days?: number
  min_pct?: number
  min_attempts?: number
  min_categories?: number
  slug?: string
  category_slug?: string
}

/** Rank slugs in ladder order, used to score a `rank` criterion by depth. */
const RANK_ORDER = [
  "mubtadi",
  "talib",
  "hafiz",
  "faqih",
  "muhaddith",
  "mufassir",
  "shaykh",
  "imam",
  "mujaddid",
]

/**
 * A single effort score. Higher is harder.
 *
 * Unknown criteria types deliberately score 0 and land in `common` rather than
 * throwing: a new achievement type appearing in the database must never be able
 * to break the gallery for everyone.
 */
export function achievementEffort(raw: unknown): number {
  const c = (raw ?? {}) as Criteria
  switch (c.type) {
    // One attempt, or one tap of a lifeline. The tutorial tier.
    case "attempts_count":
      return c.min ?? 1
    case "used_lifeline":
      return 1

    // Answering correctly, in bulk.
    case "correct_count":
      return c.min ?? 0

    // Within a single category, which is narrower and so worth more per unit.
    case "category_count":
      return (c.min ?? 0) * 2

    // Breadth across categories.
    case "category_breadth":
      return (c.min_categories ?? 0) * 8

    // Streaks are days of real life, not questions, so they weigh heavily.
    case "streak":
      return (c.min_days ?? 0) * 7

    // Accuracy over a sample. Both halves matter, since 90% of 10 is not 90%
    // of 100, but they cannot simply be added: a percentage and a count are
    // different units, and summing them raw scored "90% over 10 attempts" as
    // high as reaching the third rank. The percentage is measured from 50,
    // because anything at or below a coin flip is worth nothing here.
    case "accuracy":
      return Math.max(0, (c.min_pct ?? 0) - 50) + (c.min_attempts ?? 0) * 4

    // Rank achievements scale with how deep the ladder goes.
    case "rank": {
      const i = RANK_ORDER.indexOf((c.slug ?? "").toLowerCase())
      return i < 0 ? 0 : (i + 1) * 45
    }

    default:
      return 0
  }
}

/** Thresholds on the effort score. Ordered hardest first so the first match wins. */
const TIERS: ReadonlyArray<readonly [AchievementRarity, number]> = [
  ["legendary", 130],
  ["epic", 90],
  ["rare", 40],
  ["uncommon", 20],
  ["common", 0],
]

export function achievementRarity(criteria: unknown): AchievementRarity {
  const score = achievementEffort(criteria)
  for (const [tier, min] of TIERS) {
    if (score >= min) return tier
  }
  return "common"
}

/**
 * What an unlocked achievement contributes to the gallery's point total.
 *
 * The header number has to mean something. It is the sum of these over
 * everything the player has actually unlocked, so it moves only when they earn
 * something, and it moves further for harder things.
 */
export const RARITY_POINTS: Record<AchievementRarity, number> = {
  common: 10,
  uncommon: 25,
  rare: 50,
  epic: 100,
  legendary: 250,
}

/** The two tiers that earn a place on the trophy rail rather than the badge grid. */
export function isMilestone(rarity: AchievementRarity): boolean {
  return rarity === "epic" || rarity === "legendary"
}
