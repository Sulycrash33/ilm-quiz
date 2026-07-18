/**
 * Centralized semantic color mappings.
 *
 * These are grounded in the palette of historical Islamic manuscript
 * illumination: gold leaf, lapis lazuli (blue), malachite/jade (green), and
 * Tyrian purple (the rarest, most prestigious dye available to scribes) -
 * rather than arbitrary Tailwind defaults. Use these instead of hardcoding
 * text-yellow-500 / bg-green-100 / etc. directly in components, so a tier's
 * color means the same thing everywhere in the app.
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
    text: "text-jade",
    bg: "bg-jade-soft",
    border: "border-jade/30",
  },
  rare: {
    text: "text-lapis",
    bg: "bg-lapis-soft",
    border: "border-lapis/30",
  },
  epic: {
    text: "text-amethyst",
    bg: "bg-amethyst-soft",
    border: "border-amethyst/30",
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
    text: "text-jade",
    bg: "bg-jade-soft",
    border: "border-jade/30",
  },
  medium: {
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
  },
  hard: {
    text: "text-henna",
    bg: "bg-henna-soft",
    border: "border-henna/30",
  },
};

/** Streak intensity - warmer as the streak grows, echoes henna/gold/primary. */
export function getStreakStyle(streak: number): string {
  if (streak > 30) return "text-henna";
  if (streak > 7) return "text-primary";
  if (streak > 0) return "text-accent";
  return "text-muted-foreground";
}
