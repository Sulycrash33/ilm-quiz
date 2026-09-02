"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Heart, Lock, Play, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RANKS } from "@/lib/constants";
import { HUNT_RULES, TIER_MAX, TIER_MIN, timeLimitForTier } from "@/lib/hunt-engine";
import { SoundToggle } from "@/components/profile/SoundToggle";
import { OnboardingBackdrop } from "@/components/layout/OnboardingBackdrop";
import { useLanguage } from "@/contexts/LanguageContext";
import { markOnboardingSeen } from "@/app/onboarding/how-it-works/actions";

interface HowItWorksProps {
  /** Where "start playing" goes: tier 1 of the first category. */
  startSlug: string;
  startName: string;
  startIcon: string | null;
  /** Questions in that first level, read from the database rather than
   *  assumed, so the promise on screen matches what the player will get. */
  tierOneCount: number;
}

const PANELS = 4;

/**
 * The three screens that explain the game.
 *
 * ILM Hunt's whole shape — nine tiers per category, twenty questions each,
 * every one of them right before the next opens — was never stated anywhere.
 * A new player saw a dashboard and a row of padlocks and had to infer the
 * rules from them. Progression that nobody notices may as well not exist.
 *
 * Four panels, in the order the questions actually occur to someone:
 * what is this shape, what does it take to move, what happens during a run,
 * and what am I climbing toward. Then straight into the first level rather
 * than back to a dashboard, because the fastest way to understand a ladder is
 * to stand on it.
 *
 * The run panel was added after a tester reported not realising the questions
 * were timed until "Time's up!" appeared. Nothing here had ever mentioned the
 * clock or the three lives — the explainer described the ladder and the ranks
 * and skipped the part the player actually experiences.
 */
export function HowItWorks({ startSlug, startName, startIcon, tierOneCount }: HowItWorksProps) {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const [panel, setPanel] = useState(0);

  // Marked seen on arrival, not on finish. Someone who reads the first panel
  // and taps away has been shown the rules; re-teaching them on their next
  // visit would be worse than letting them skip.
  useEffect(() => {
    void markOnboardingSeen();
  }, []);

  const isLast = panel === PANELS - 1;

  function next() {
    if (isLast) {
      router.push(`/quiz/${startSlug}/1`);
      return;
    }
    setPanel((p) => p + 1);
  }

  return (
    <div
      dir={dir}
      className="relative flex min-h-[100dvh] flex-col items-center justify-between bg-background px-4 py-8"
    >
      {/* The explainer is where a player first hears a cue, so it is also the
          first place the switch is any use. */}
      <div className="absolute end-4 top-4 z-20">
        <SoundToggle compact />
      </div>

      <OnboardingBackdrop />

      <div className="relative z-10 flex w-full max-w-md flex-1 flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={panel}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="space-y-6 text-center"
          >
            {panel === 0 && <LadderPanel />}
            {panel === 1 && <ClearingPanel count={tierOneCount} />}
            {panel === 2 && <RunPanel />}
            {panel === 3 && <RankPanel />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-5">
        <div className="flex justify-center gap-2" aria-hidden="true">
          {Array.from({ length: PANELS }, (_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === panel ? "w-6 bg-primary" : "w-2 bg-surface-container-highest"
              }`}
            />
          ))}
        </div>

        <Button size="lg" className="h-12 w-full" onClick={next}>
          {isLast ? (
            <>
              <Play className="mr-2 h-5 w-5" />
              {t("startFirstLevel", { category: startName })}
            </>
          ) : (
            <>
              {t("next")}
              <ArrowRight className="ms-2 h-5 w-5" />
            </>
          )}
        </Button>

        {/* Never a dead end: someone who already knows how this works, or who
            wants a different category, should not have to tap through. */}
        <button
          type="button"
          onClick={() => router.push("/home")}
          className="w-full text-sm text-on-surface-variant underline-offset-4 hover:underline"
        >
          {t("skipExplainer")}
        </button>
      </div>

      {/* The category the CTA leads to, kept visible so the last panel's
          button isn't a surprise. */}
      <span className="sr-only">
        {startIcon} {startName}
      </span>
    </div>
  );
}

/** Panel 1 — the shape: nine tiers, one category at a time. */
function LadderPanel() {
  const { t } = useLanguage();
  return (
    <>
      <h1 className="font-headline text-3xl text-primary">{t("howItWorksLadderTitle")}</h1>
      <p className="mx-auto max-w-prose text-on-surface-variant">{t("howItWorksLadderBody")}</p>

      {/* The ladder itself, drawn rather than described — nine rungs, the
          first open and the rest shut, which is exactly what the player will
          see on the category page a minute from now. */}
      <ol className="mx-auto flex w-full max-w-xs flex-col-reverse gap-1.5">
        {RANKS.map((rank, i) => (
          <li
            key={rank.level}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
              i === 0
                ? "border-primary/40 bg-primary/10 text-on-surface"
                : "border-white/10 bg-surface-container text-on-surface-variant"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="tabular-nums opacity-60">{rank.level}</span>
              {rank.title}
            </span>
            {i === 0 ? (
              <Play className="h-4 w-4 text-primary" aria-hidden="true" />
            ) : (
              <Lock className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </>
  );
}

/** Panel 2 — the rule: every question in the tier, correct, before the next opens. */
function ClearingPanel({ count }: { count: number }) {
  const { t } = useLanguage();
  return (
    <>
      <h1 className="font-headline text-3xl text-primary">{t("howItWorksClearingTitle")}</h1>
      <p className="mx-auto max-w-prose text-on-surface-variant">
        {t("howItWorksClearingBody", { count })}
      </p>

      <div className="mx-auto max-w-xs space-y-2 text-start">
        <Rule icon={<CheckCircle2 className="h-4 w-4 text-primary" />} text={t("howItWorksRuleAll", { count })} />
        <Rule icon={<CheckCircle2 className="h-4 w-4 text-primary" />} text={t("howItWorksRuleRetry")} />
        <Rule icon={<CheckCircle2 className="h-4 w-4 text-primary" />} text={t("howItWorksRuleRandom")} />
      </div>
    </>
  );
}

function Rule({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-surface-container px-3 py-2.5 text-sm text-on-surface">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

/**
 * Panel 3 — what a run is actually like: a clock and three lives.
 *
 * The numbers come from `HUNT_RULES` rather than the copy, so the screen
 * cannot promise a timer the engine does not give. A tester played a whole
 * run without realising it was timed, which is a failure of this screen, not
 * of their attention.
 */
function RunPanel() {
  const { t } = useLanguage();
  return (
    <>
      <h1 className="font-headline text-3xl text-primary">{t("howItWorksRunTitle")}</h1>
      <p className="mx-auto max-w-prose text-on-surface-variant">
        {t("howItWorksRunBody", {
          seconds: timeLimitForTier(TIER_MIN),
          max: timeLimitForTier(TIER_MAX),
        })}
      </p>

      <div className="mx-auto max-w-xs space-y-2 text-start">
        <Rule
          icon={<Heart className="h-4 w-4 text-error" />}
          text={t("howItWorksRuleLives", { lives: HUNT_RULES.startingLives })}
        />
        <Rule icon={<Timer className="h-4 w-4 text-tertiary" />} text={t("howItWorksRuleTimeout")} />
        <Rule icon={<CheckCircle2 className="h-4 w-4 text-primary" />} text={t("howItWorksRulePace")} />
      </div>
    </>
  );
}

/** Panel 4 — the destination: the rank ladder the XP is climbing. */
function RankPanel() {
  const { t } = useLanguage();
  const first = RANKS[0];
  const last = RANKS[RANKS.length - 1];
  return (
    <>
      <h1 className="font-headline text-3xl text-primary">{t("howItWorksRankTitle")}</h1>
      <p className="mx-auto max-w-prose text-on-surface-variant">
        {t("howItWorksRankBody", { first: first.title, last: last.title })}
      </p>

      <div className="mx-auto flex max-w-xs flex-wrap justify-center gap-1.5">
        {RANKS.map((rank, i) => (
          <span
            key={rank.level}
            className={`rounded-full px-2.5 py-1 text-xs ${
              i === 0
                ? "bg-primary/15 text-primary"
                : "bg-surface-container text-on-surface-variant"
            }`}
          >
            {rank.title}
          </span>
        ))}
      </div>

      <p className="mx-auto max-w-prose text-sm text-on-surface-variant">
        {t("howItWorksRankFooter", { xp: last.minPoints.toLocaleString() })}
      </p>
    </>
  );
}
