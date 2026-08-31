/**
 * Centralized semantic color mappings.
 *
 * This file used to say it used the design system while being written almost
 * entirely in raw Tailwind palette classes: `emerald`, `blue`, `purple` and
 * `amber` appear in no token anywhere in this project. The one file whose
 * whole job was consistency was the one contradicting it, and because it is
 * `.ts` rather than `.tsx` it slipped straight through a component sweep.
 *
 * Everything here now names a token: `success`, `info`, `special`, `warning`
 * and the brand `primary`.
 */

export type AchievementRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export const RARITY_STYLES: Record<
  AchievementRarity,
  {
    text: string
    /** A faint wash, for a card background behind content. */
    bg: string
    border: string
    /**
     * A solid fill, for shapes that ARE the colour rather than sit on it.
     * The `/10` washes above are correct behind text and useless as the rim of
     * the achievement hexagon, where they vanish against the plate inside.
     */
    plate: string
  }
> = {
  common: {
    text: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    plate: "bg-outline",
  },
  uncommon: {
    text: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
    plate: "bg-success",
  },
  rare: {
    text: "text-info",
    bg: "bg-info/10",
    border: "border-info/30",
    plate: "bg-info",
  },
  epic: {
    text: "text-special",
    bg: "bg-special/10",
    border: "border-special/30",
    plate: "bg-special",
  },
  legendary: {
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/40",
    plate: "bg-primary",
  },
};

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTY_STYLES: Record<
  Difficulty,
  { text: string; bg: string; border: string }
> = {
  easy: {
    text: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
  },
  medium: {
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
  },
  hard: {
    text: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
  },
};

/**
 * Streak intensity, warmer as the streak grows.
 *
 * The 1 to 7 day step used to return `text-accent`, and `accent` is the
 * subtle hover *surface* (#2d3449), not a text colour. On the #0b1326
 * background that is a slate-on-navy figure with almost no contrast, so the
 * number a player sees for their first week of a streak was very nearly
 * invisible. It takes the warm sand `secondary` instead, which is what the
 * ramp wanted: sand, then gold, then the hot `warning` orange.
 */
export function getStreakStyle(streak: number): string {
  if (streak > 30) return "text-warning";
  if (streak > 7) return "text-primary";
  if (streak > 0) return "text-secondary";
  return "text-muted-foreground";
}
