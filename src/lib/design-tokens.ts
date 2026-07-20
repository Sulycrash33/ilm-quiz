/**
 * Centralized semantic color mappings.
 *
 * Uses the Premium design system tokens (Material-3 inspired) for consistent
 * theming across all components. Colors are mapped to the Tailwind config
 * definitions for emerald, blue, purple, and amber.
 */

export type AchievementRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export const RARITY_STYLES: Record<
  AchievementRarity,
  { text: string; bg: string; border: string }
> = {
  common: {
    text: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
  },
  uncommon: {
    text: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
  },
  rare: {
    text: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/30",
  },
  epic: {
    text: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/30",
  },
  legendary: {
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/40",
  },
};

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTY_STYLES: Record<
  Difficulty,
  { text: string; bg: string; border: string }
> = {
  easy: {
    text: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
  },
  medium: {
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
  },
  hard: {
    text: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
};

/** Streak intensity - warmer as the streak grows. */
export function getStreakStyle(streak: number): string {
  if (streak > 30) return "text-amber-500";
  if (streak > 7) return "text-primary";
  if (streak > 0) return "text-accent";
  return "text-muted-foreground";
}
