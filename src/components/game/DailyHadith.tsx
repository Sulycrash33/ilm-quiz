"use client";

import { Quote } from "lucide-react";
import { DAILY_HADITH } from "@/lib/constants";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * The opening word on the home screen.
 *
 * This component existed and was **imported by the home page without ever
 * being rendered**, the same fault `StreakCounter` had on the same file. So the
 * app had a hadith card built, styled and translated, and nobody ever saw it.
 *
 * Given room here because it is the one part of the home screen that is not a
 * number: a page that opens with progress rings and streak counts is a
 * scoreboard, and this is meant to be a place of study. The quote is set in the
 * serif at quote size, the attribution sits under it as a `cite` rather than
 * being joined on with a dash, and the khatim runs behind it.
 *
 * ── On the word "daily" ───────────────────────────────────────────────────
 * `DAILY_HADITH` is a single hardcoded constant, so this shows the same hadith
 * every day forever. The heading is therefore the honest one, not a promise of
 * rotation. Making it genuinely daily means a set of verified narrations with
 * their references, which is content work for the owner or a scholar to supply:
 * this project's rule is that a citation is never invented, and a wrong hadith
 * number in a religious app is worse than no number.
 */
export function DailyHadith() {
  const { t } = useLanguage();

  return (
    <section className="glass-card relative overflow-hidden rounded-xl p-6 text-center">
      {/* The khatim moved into `.glass-card` itself, so every box in the game
          carries it rather than this one alone. Drawing it here as well would
          stack two copies and make the hadith card the only panel with the
          motif at double strength — which is the inconsistency, inverted. */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <Quote className="h-8 w-8 text-primary/40" aria-hidden="true" />

        <h2 className="sr-only">{t("dailyHadith")}</h2>

        <blockquote className="font-quote-italic text-quote-italic italic text-on-surface">
          {DAILY_HADITH.text}
        </blockquote>

        <cite className="font-label-caps text-label-caps uppercase not-italic tracking-widest text-primary">
          {DAILY_HADITH.source}
        </cite>
      </div>
    </section>
  );
}
