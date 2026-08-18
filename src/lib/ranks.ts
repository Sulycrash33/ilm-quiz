/**
 * Rank progression.
 *
 * The blueprint's nine ranks — Mubtadi (beginner) through Mujaddid (reviver) —
 * already exist as data in `constants.ts`, but nothing derived progress from
 * them, so a seeker's total XP never turned into a visible climb. These helpers
 * turn a raw `total_xp` into "where you are, what's next, and how close".
 *
 * Kept free of JSX so it can be used from server actions and the run summary
 * alike; the icon component rides along on the Rank object for callers that
 * want to render it.
 */

import { RANKS } from './constants';
import type { Rank } from './types';

export interface RankProgress {
  rank: Rank;
  /** The next rank up, or null when already at Mujaddid. */
  next: Rank | null;
  /** XP into the current rank's band. */
  xpIntoRank: number;
  /** Total XP the current band spans. 0 at max rank. */
  xpForRank: number;
  /** XP still needed for the next rank. 0 at max rank. */
  xpToNext: number;
  /** Progress through the current band, 0–100. 100 at max rank. */
  percent: number;
  isMax: boolean;
}

/** The rank a seeker holds at `totalXp`. Never returns undefined — XP below the
 * first threshold still counts as Mubtadi. */
export function rankFor(totalXp: number): Rank {
  const xp = Math.max(0, Math.floor(totalXp || 0));
  let held = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.minPoints) held = rank;
    else break;
  }
  return held;
}

export function nextRankAfter(rank: Rank): Rank | null {
  return RANKS.find((r) => r.level === rank.level + 1) ?? null;
}

export function rankProgress(totalXp: number): RankProgress {
  const xp = Math.max(0, Math.floor(totalXp || 0));
  const rank = rankFor(xp);
  const next = nextRankAfter(rank);

  if (!next) {
    return {
      rank,
      next: null,
      xpIntoRank: xp - rank.minPoints,
      xpForRank: 0,
      xpToNext: 0,
      percent: 100,
      isMax: true,
    };
  }

  const xpForRank = next.minPoints - rank.minPoints;
  const xpIntoRank = xp - rank.minPoints;
  return {
    rank,
    next,
    xpIntoRank,
    xpForRank,
    xpToNext: Math.max(0, next.minPoints - xp),
    percent: xpForRank <= 0 ? 100 : Math.min(100, Math.round((xpIntoRank / xpForRank) * 100)),
    isMax: false,
  };
}

/**
 * Did `gained` XP push the seeker over a rank threshold? The summary screen
 * uses this to decide whether to celebrate, so it compares the rank held before
 * the run with the rank held after.
 */
export function rankUpBetween(beforeXp: number, gained: number): Rank | null {
  if (gained <= 0) return null;
  const before = rankFor(beforeXp);
  const after = rankFor(beforeXp + gained);
  return after.level > before.level ? after : null;
}

/** Every rank crossed by a single gain, oldest first. A big run can skip a tier. */
export function ranksCrossed(beforeXp: number, gained: number): Rank[] {
  if (gained <= 0) return [];
  const before = rankFor(beforeXp);
  const after = rankFor(beforeXp + gained);
  return RANKS.filter((r) => r.level > before.level && r.level <= after.level);
}
