"use client";

import { useEffect, useState } from "react";
import { DailyChallengeCard } from "@/components/challenges/DailyChallengeCard";
import { getDailyChallenge, type DailyChallengeView } from "@/app/(app)/challenges/actions";

/**
 * The daily challenge, on the front door.
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 * #73 gave the daily challenge a route to play (`/play/daily`) and pointed
 * both of its buttons at it. Both fixes were correct, and the feature was
 * still unreachable in practice, because of where those buttons live: one is
 * on `/challenges`, and the only way to `/challenges` is a 44px tile labelled
 * "Challenges" in a grid of four, below the fold on the home screen.
 *
 * So a player who opens the app looking for today's five questions sees a
 * greeting, a hadith, a progress ring and some stats, and the only obvious
 * "where do I answer questions" affordance on the screen is the Learning tab
 * in the bottom bar — which goes to the category grid. That is exactly the
 * report this fixes: "the five daily questions is not there, it keeps taking
 * me to the category." The link was never wrong after #73. The journey to it
 * was.
 *
 * It is worth being precise about the lesson, because the handoff drew it one
 * step short. "What does a player press to reach it, and have I followed that
 * link myself?" caught the button. It did not catch that nothing on the front
 * door tells the player the button exists. A feature reachable only by a
 * player who already knows where it is, is reachable only by the person who
 * built it.
 *
 * ── Why it reuses `DailyChallengeCard` ────────────────────────────────────
 * Because a second card would be a second definition of what the challenge
 * says — its progress, its reward, its claim rule — and this repository has
 * paid for duplicated definitions repeatedly (`localiseQuestions` exists for
 * the same reason). The card renders identically in both places, so the daily
 * challenge looks like one thing wherever the player meets it, and the claim
 * button works on the home screen too.
 *
 * ── Why it fetches on the client ──────────────────────────────────────────
 * `/home` is a client component. `getDailyChallenge` is a server action, so it
 * is callable from here directly, and this follows the shape `useProfile` and
 * `useLifetimeStats` already use on this page. Nothing renders until the
 * challenge arrives: a skeleton would reserve space for a card that may not
 * exist on a day the arena cannot fill one.
 */
export function HomeDailyChallenge() {
  const [challenge, setChallenge] = useState<DailyChallengeView | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await getDailyChallenge();
        if (!cancelled) setChallenge(result);
      } catch {
        // A challenge that cannot be loaded leaves the rest of the home screen
        // alone. The card is an invitation, not a dependency.
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!challenge) return null;

  return <DailyChallengeCard challenge={challenge} />;
}
