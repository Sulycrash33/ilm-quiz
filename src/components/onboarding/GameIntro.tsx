"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Layers, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingBackdrop } from "@/components/layout/OnboardingBackdrop";
import { IlmHuntMark } from "@/components/icons/IlmHuntMark";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Translations } from "@/lib/i18n";

interface GameIntroProps {
  /** How many subjects there are, counted in the database on each request.
   *  0 means "could not be counted" and renders as no figure at all. */
  categoryCount: number;
}

/**
 * The three panels between the landing screen and the language choice.
 *
 * ── How this differs from /onboarding/how-it-works ────────────────────────
 * They are the two explainers in this app and they must not converge, so the
 * line between them is worth stating. This one answers **what is this**, and
 * is read by a stranger who has not signed up and may not. That one answers
 * **how do I play** — nine tiers, twenty questions, three lives, the clock —
 * and is read by a player who already has an account and is about to start.
 * Nothing about the rules of a run belongs here; it would be explaining the
 * mechanics of a game to someone still deciding whether to open it.
 *
 * ── Why the size of the question bank is not on this screen ──────────────
 * It was, briefly: panel one carried the total number of questions and panel
 * three the total number of explanations. Both are gone, and this is a
 * product decision rather than an oversight, so **do not add them back**.
 *
 * A total tells a player where the game ends. The moment somebody reads
 * "5,220 questions" they have a denominator, and everything after it is
 * measured against finishing rather than against learning. The bank is meant
 * to feel open. Anyone who works the number out from the parts — nine levels,
 * twenty questions each, the subject count on this very panel — is welcome to
 * it; what the app must not do is hand it over.
 *
 * The subject count stays. It says how wide the app is, not where it stops,
 * and breadth is the honest thing to promise someone deciding whether to sign
 * up.
 *
 * ── Why there are no subject names on panel two ───────────────────────────
 * The obvious version of that panel lists real category names from the
 * database. They are stored in English, this app runs in six languages, and
 * this screen is shown *before* the language choice — so an Arabic reader
 * would meet a wall of English on the first page that tries to explain
 * anything. The counts carry the same weight and are language neutral; the
 * subjects are named in translated prose instead.
 *
 * ── On the mockup ─────────────────────────────────────────────────────────
 * Three things in it deliberately did not come across. Its hero was a stock
 * image on a `googleusercontent` URL, which will rot and takes the top of the
 * screen with it when it does; the mark this app already owns cannot. Its
 * background redefined `mashrabiya-overlay` as green dots, which is the exact
 * palette leak this codebase has already cleaned out once. And its parallax
 * bound a `mousemove` listener that overwrote the float animation's transform
 * on every pointer move — on a phone, which has no pointer, it was dead code
 * that would have fought the animation on a desktop.
 */
export function GameIntro({ categoryCount }: GameIntroProps) {
  const { t, dir } = useLanguage();
  const reduce = useReducedMotion();
  const [panel, setPanel] = useState(0);

  const PANELS: {
    titleKey: keyof Translations;
    bodyKey: keyof Translations;
    Icon: typeof BookOpen;
    /** The figure under the panel, or null where there is none. */
    figure: string | null;
  }[] = [
    { titleKey: "introTitleOne", bodyKey: "introBodyOne", Icon: BookOpen, figure: null },
    {
      titleKey: "introTitleTwo",
      bodyKey: "introBodyTwo",
      Icon: Layers,
      figure: categoryCount > 0 ? t("introCategoriesCount", { count: categoryCount }) : null,
    },
    { titleKey: "introTitleThree", bodyKey: "introBodyThree", Icon: Lightbulb, figure: null },
  ];

  const isLast = panel === PANELS.length - 1;
  const current = PANELS[panel];

  return (
    <div
      dir={dir}
      className="relative flex min-h-[100dvh] flex-col items-center bg-background px-4 py-8"
    >
      <OnboardingBackdrop />

      {/* Back steps through the panels, and on the first one leaves for the
          landing screen, which is genuinely what is behind it. Two branches
          rather than one Button with a conditional `asChild`: that prop swaps
          the rendered element between a Slot and a button, and changing it
          across renders of the same node is how a Radix Slot ends up with the
          wrong child. */}
      <div className="absolute start-4 top-4 z-20">
        {panel === 0 ? (
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="me-2 h-5 w-5" aria-hidden="true" />
              {t("back")}
            </Link>
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setPanel((p) => p - 1)}>
            <ArrowLeft className="me-2 h-5 w-5" aria-hidden="true" />
            {t("back")}
          </Button>
        )}
      </div>

      <div className="absolute end-4 top-4 z-20">
        <Button asChild variant="ghost" size="sm">
          <Link href="/language">{t("skip")}</Link>
        </Button>
      </div>

      {/* The mark sits in the header band rather than inside the centred
          column. Grouped with the panel it was centred *with* it, which pushed
          both down and left the top third of the screen empty. */}
      <div className="relative z-10 flex w-full justify-center pt-12">
        <IlmHuntMark className="h-12 w-12 text-primary" aria-hidden="true" />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-1 flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={panel}
            initial={reduce ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="space-y-5 text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-surface-container">
              <current.Icon className="h-7 w-7 text-primary" aria-hidden="true" />
            </div>

            <h1 className="font-headline text-3xl font-bold text-on-surface">
              {t(current.titleKey)}
            </h1>

            <p className="mx-auto max-w-prose text-on-surface-variant">{t(current.bodyKey)}</p>

            {current.figure && (
              <p className="font-display-lg-mobile text-2xl tabular-nums text-primary">
                {current.figure}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-5 pb-2">
        <div className="flex justify-center gap-2" aria-hidden="true">
          {PANELS.map((p, i) => (
            <span
              key={p.titleKey}
              className={`h-2 rounded-full transition-all ${
                i === panel ? "w-6 bg-primary" : "w-2 bg-surface-container-highest"
              }`}
            />
          ))}
        </div>

        {isLast ? (
          <Button asChild size="lg" className="h-12 w-full">
            <Link href="/language">
              {t("continue")}
              <ArrowRight className="ms-2 h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button size="lg" className="h-12 w-full" onClick={() => setPanel((p) => p + 1)}>
            {t("next")}
            <ArrowRight className="ms-2 h-5 w-5" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
