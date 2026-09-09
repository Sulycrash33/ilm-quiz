import type { Translations } from "@/lib/i18n";

/**
 * The i18n key naming where a run's exit leads.
 *
 * `backHref` decides the destination and this decides what the player is told
 * about it, so the two cannot drift. They did: the run summary's exit button
 * said "Back to Categories" for every run in the app, including the daily
 * challenge, which goes to `/rewards`, and the mode runs, which go to
 * `/challenges`. The header link above the run had already grown a correct
 * version of this rule; this is that rule, in one place, used by both.
 */
export function backLabelKey(backHref?: string): keyof Translations {
  if (backHref === "/challenges") return "backToChallenges";
  if (backHref === "/rewards") return "backToRewards";
  return backHref ? "backToLevels" : "backToCategories";
}
