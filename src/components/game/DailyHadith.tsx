"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDailyHadith, type DailyHadithView } from "@/app/(app)/home/actions";

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
 * It is now actually daily. The narration comes from the `hadiths` table and
 * is chosen by the date, so every player sees the same one on the same day —
 * the deterministic choice migration 0008 established for the rewards, for the
 * same reason: a rotation nobody can predict is not a calendar.
 *
 * ── On the fallback ───────────────────────────────────────────────────────
 * The card holds every locale of today's narration and picks one on render, so
 * changing language is instant and needs no network. A locale nobody has
 * entered text for falls back to English rather than blanking, which is the
 * same per-row fallback the question translations use: a partly translated
 * bank is a working bank.
 *
 * Hadith text is never machine-translated. `0047` sets out why at length: a
 * narration is a claim about what the Prophet ﷺ said, published translations
 * exist, and there would be nothing to check a model's output against. Locales
 * are filled in by hand at `/admin/hadiths`.
 */
export function DailyHadith() {
  const { t, locale } = useLanguage();
  const [hadith, setHadith] = useState<DailyHadithView | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDailyHadith()
      .then((h) => {
        if (!cancelled) setHadith(h);
      })
      .catch(() => {
        /* The card is decoration on a study screen, not a control. If it
           cannot load, showing nothing is better than showing an error where
           a hadith should be. */
      });
    return () => {
      cancelled = true;
    };
    // Deliberately not keyed on `locale`: every language is already in `hadith`,
    // so switching one re-renders and does not re-fetch.
  }, []);

  // Nothing on the first paint, and nothing if the table is empty. The home
  // page is a stack of independent cards, so an absent one costs no layout.
  if (!hadith) return null;

  const entry = hadith.byLocale[locale] ?? hadith.byLocale.en;
  if (!entry) return null;

  // A hadith rendered in a locale that has no text of its own is English text,
  // whatever the surrounding page is set to. Saying so lets a screen reader
  // switch voice rather than reading English aloud in a Hausa one.
  const isFallback = !hadith.byLocale[locale];

  return (
    <section className="glass-card relative overflow-hidden rounded-xl p-6 text-center">
      {/* The khatim moved into `.glass-card` itself, so every box in the game
          carries it rather than this one alone. Drawing it here as well would
          stack two copies and make the hadith card the only panel with the
          motif at double strength — which is the inconsistency, inverted. */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <Quote className="h-8 w-8 text-primary/40" aria-hidden="true" />

        <h2 className="sr-only">{t("dailyHadith")}</h2>

        <blockquote
          className="font-quote-italic text-quote-italic italic text-on-surface"
          {...(isFallback ? { lang: "en", dir: "ltr" } : {})}
        >
          {entry.text}
        </blockquote>

        <cite
          className="font-label-caps text-label-caps uppercase not-italic tracking-widest text-primary"
          {...(isFallback ? { lang: "en", dir: "ltr" } : {})}
        >
          {entry.attribution}
        </cite>
      </div>
    </section>
  );
}
