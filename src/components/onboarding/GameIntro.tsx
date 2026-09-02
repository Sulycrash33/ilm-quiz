"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Flame, Layers, Swords } from "lucide-react";
import { OnboardingBackdrop } from "@/components/layout/OnboardingBackdrop";
import { RANKS } from "@/lib/constants";
import { TIER_MAX } from "@/lib/hunt-engine";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Translations } from "@/lib/i18n";

interface GameIntroProps {
  /** How many subjects there are, counted in the database on each request.
   *  0 means "could not be counted" and renders as no figure at all. */
  categoryCount: number;
}

/**
 * The three panels between the language choice and the sound setup.
 *
 * ── Built to the landing screen's rules, not its own ──────────────────────
 * The first version of this screen was a small icon, a heading and two lines
 * of body text floating in the middle of an otherwise empty page, three times
 * over. Beside the landing screen — pulsing rings, a glowing emblem, display
 * type, a call to action you can see from across the room — it read like
 * documentation that had wandered into a product.
 *
 * So it borrows the landing screen's vocabulary exactly: the same pulse rings
 * around the same glass emblem, the same display type, the same gold call to
 * action. A player moving from one to the other should not feel a seam.
 *
 * **No framer-motion here, deliberately.** The landing screen dropped it for a
 * specific reason worth repeating: a motion component renders its `initial`
 * state into the HTML, which is `opacity: 0`, so the content is in the
 * document and invisible until React has downloaded, parsed and hydrated. On a
 * phone that is the whole feel of the page. The entrance animations are the
 * CSS `settle-in` and `rise-in` classes instead, which run off the stylesheet
 * at first paint and stop entirely under `prefers-reduced-motion`. Replaying
 * them per panel is what the `key` is for.
 *
 * ── How this differs from /onboarding/how-it-works ────────────────────────
 * They are the two explainers and they must not converge. This one answers
 * **what is this**, for a stranger who has not signed up. That one answers
 * **how do I play**, for a player about to start. The rank names appear here
 * as a horizon, not as a rules table.
 *
 * ── Why the size of the question bank is not on this screen ───────────────
 * A total tells a player where the game ends, and everything after it is
 * measured against finishing rather than against learning. The bank is meant
 * to feel open. Anyone who works the number out from the parts is welcome to
 * it; the app must not hand it over. **Do not add a question count back.** The
 * subject count stays: it says how wide the app is, not where it stops.
 *
 * ── Why there are no subject names on panel two ───────────────────────────
 * The reason used to be that this screen ran before the language choice. It
 * no longer does, and the conclusion survives the move on a different footing:
 * category names are stored in English in the database and there is no
 * translation layer over them anywhere in the app. Knowing the reader's
 * language does not help when the data has only one. So the disciplines are
 * named in translated prose, and the counts, which are language neutral, carry
 * the evidence.
 */

const PANELS: {
  eyebrowKey: keyof Translations;
  titleKey: keyof Translations;
  bodyKey: keyof Translations;
  Icon: typeof Swords;
}[] = [
  { eyebrowKey: "introEyebrowOne", titleKey: "introTitleOne", bodyKey: "introBodyOne", Icon: Swords },
  { eyebrowKey: "introEyebrowTwo", titleKey: "introTitleTwo", bodyKey: "introBodyTwo", Icon: Layers },
  { eyebrowKey: "introEyebrowThree", titleKey: "introTitleThree", bodyKey: "introBodyThree", Icon: Flame },
];

export function GameIntro({ categoryCount }: GameIntroProps) {
  const { t, dir } = useLanguage();
  const [panel, setPanel] = useState(0);

  const isLast = panel === PANELS.length - 1;
  const current = PANELS[panel];
  const firstRank = RANKS[0];
  const lastRank = RANKS[RANKS.length - 1];

  /** The rank titles are data, not copy, so the headline cannot drift from the
   *  ladder the game actually has. */
  const title =
    current.titleKey === "introTitleThree"
      ? t("introTitleThree", { first: firstRank.title, last: lastRank.title })
      : t(current.titleKey);

  return (
    <div
      dir={dir}
      className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-background"
    >
      <OnboardingBackdrop />

      <header className="relative z-20 flex items-center justify-between px-4 pt-4">
        {panel === 0 ? (
          <Link
            href="/language"
            className="haptic-feedback inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            {t("back")}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setPanel((p) => p - 1)}
            className="haptic-feedback inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            {t("back")}
          </button>
        )}

        <Link
          href="/onboarding/sound"
          className="haptic-feedback font-label-caps text-label-caps rounded-full px-3 py-2 uppercase tracking-widest text-on-surface-variant/70 transition-colors hover:text-on-surface"
        >
          {t("skip")}
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-5 py-4 sm:gap-8">
        {/* Everything below is keyed on the panel so the CSS entrances replay
            on every step. */}
        {/* Sized to the outer pulse ring, not to the emblem. The rings are
            absolutely positioned, so without an explicit size this box
            measured 112px while painting 208px, and the column centred itself
            around a height that was 96px short — which is where the dead air
            at the top and bottom of this screen came from. */}
        <div
          key={`hero-${panel}`}
          className="settle-in relative flex h-52 w-52 shrink-0 items-center justify-center sm:h-64 sm:w-64"
        >
          {/* The landing screen's emblem treatment, to the letter: two pulse
              rings, the second a second behind the first, around a glass disc. */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="pulse-effect h-40 w-40 rounded-full border border-primary/20 sm:h-52 sm:w-52" />
            <div
              className="pulse-effect absolute h-52 w-52 rounded-full border border-primary/10 sm:h-64 sm:w-64"
              style={{ animationDelay: "1s" }}
            />
          </div>

          <div className="glow-effect relative flex h-28 w-28 items-center justify-center rounded-full border border-primary/25 bg-gradient-to-br from-primary/20 to-primary-container/10 backdrop-blur-2xl sm:h-36 sm:w-36">
            <current.Icon className="h-12 w-12 text-primary sm:h-16 sm:w-16" aria-hidden="true" />
          </div>
        </div>

        <div key={`copy-${panel}`} className="rise-in delay-1 w-full text-center">
          <span className="font-label-caps text-label-caps mb-2 block uppercase tracking-[0.3em] text-primary/70">
            {t(current.eyebrowKey)}
          </span>
          <h1 className="font-display-lg-mobile text-display-lg-mobile mb-3 tracking-tight text-primary">
            {title}
          </h1>
          <p className="mx-auto max-w-prose text-on-surface/80">{t(current.bodyKey)}</p>
        </div>

        <div key={`flourish-${panel}`} className="rise-in delay-2 w-full">
          {panel === 0 && <LadderStrip />}
          {panel === 1 && <SubjectCount count={categoryCount} word={t("introSubjectsWord")} />}
          {panel === 2 && <RankStrip />}
        </div>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-lg px-5 pb-8 pt-2">
        <div className="mb-5 flex justify-center gap-2" aria-hidden="true">
          {PANELS.map((p, i) => (
            <span
              key={p.titleKey}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === panel ? "w-8 bg-primary shadow-[0_0_10px_rgba(240,205,109,0.5)]" : "w-1.5 bg-on-surface-variant/30"
              }`}
            />
          ))}
        </div>

        {isLast ? (
          <Link
            href="/onboarding/sound"
            className="btn-primary glow-effect haptic-feedback flex w-full items-center justify-center gap-2 rounded-full px-10 py-4 text-center text-lg font-bold shadow-lg"
          >
            {t("introEnter")}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setPanel((p) => p + 1)}
            className="btn-primary glow-effect haptic-feedback flex w-full items-center justify-center gap-2 rounded-full px-10 py-4 text-center text-lg font-bold shadow-lg"
          >
            {t("next")}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </footer>
    </div>
  );
}

/** The nine levels of a single subject, drawn as a climb.
 *
 * The first version was nine equal pills and read as a row of dots, which says
 * nothing. These ascend, and they fade as they rise: the near rung is lit and
 * solid because it is the one open to the player, and the far ones recede
 * because that is honestly what they are. It carries the shape of the game
 * without a word of copy, which is why it can sit under a headline in six
 * languages.
 *
 * `TIER_MAX` rather than a literal nine, so the drawing cannot outlive a
 * change to the ladder it is drawing.
 */
function LadderStrip() {
  return (
    <div className="flex h-16 items-end justify-center gap-1.5" aria-hidden="true">
      {Array.from({ length: TIER_MAX }, (_, i) => {
        const climb = i / Math.max(1, TIER_MAX - 1);
        return (
          <span
            key={i}
            className={`w-6 rounded-t-md sm:w-8 ${
              i === 0
                ? "bg-primary shadow-[0_0_16px_rgba(240,205,109,0.55)]"
                : "bg-surface-container-highest"
            }`}
            style={{
              height: `${18 + climb * 46}px`,
              opacity: i === 0 ? 1 : 0.85 - climb * 0.5,
            }}
          />
        );
      })}
    </div>
  );
}

/** The one figure on this screen, at display size because it is the only
 *  number the app is willing to hand over. */
function SubjectCount({ count, word }: { count: number; word: string }) {
  if (count <= 0) return null;
  return (
    <div className="text-center">
      <p className="font-display-lg-mobile text-7xl leading-none tabular-nums text-primary drop-shadow-[0_0_24px_rgba(240,205,109,0.4)]">
        {count}
      </p>
      <p className="font-label-caps text-label-caps mt-2 uppercase tracking-[0.3em] text-on-surface-variant">
        {word}
      </p>
    </div>
  );
}

/** The whole ladder of ranks, ends lit. Names come from `RANKS`, so this is
 *  the ladder the game has rather than a picture of one. */
function RankStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {RANKS.map((rank, i) => {
        const isEnd = i === 0 || i === RANKS.length - 1;
        return (
          <span
            key={rank.level}
            className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
              isEnd
                ? "border border-primary/40 bg-primary/15 font-semibold text-primary"
                : "bg-surface-container text-on-surface-variant/70"
            }`}
          >
            {rank.title}
          </span>
        );
      })}
    </div>
  );
}
