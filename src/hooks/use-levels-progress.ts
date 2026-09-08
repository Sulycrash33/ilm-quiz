"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface LevelsProgress {
  cleared: number;
  total: number;
  percent: number;
}

/**
 * How much of the app the player has actually worked through.
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 * The home ring showed progress toward the next rank, and the owner's
 * objection to that was exact: *"I answered just five questions, that is a
 * separate entity entirely to my progress in a game that has categories I
 * haven't even opened, and I am at 31%."*
 *
 * They were right twice over. The rank ladder was mis-scaled by a factor of
 * six — the ninth and highest rank arrived at about 16% of the question bank
 * (migration 0062 fixes that) — and even correctly scaled, a points total has
 * nothing to say about twenty-nine subjects sitting untouched. A front door
 * for a study app should measure the study.
 *
 * ── What a level is ───────────────────────────────────────────────────────
 * One tier of one category, cleared when every published question in it has
 * been answered correctly at least once. That is not a new rule: it is the
 * same one `getCategoryLevels` uses to decide whether the next level unlocks.
 * `levels_progress()` reads it in a single query so the ring and the level
 * path cannot disagree.
 *
 * ── Why it counts and does not select ─────────────────────────────────────
 * The RPC returns two integers. Fetching rows and counting them in JavaScript
 * is what walked this repository into the 1,000 row PostgREST cap twice, and
 * there are 5,220 published questions in the browsable bank.
 */
export function useLevelsProgress() {
  const [progress, setProgress] = useState<LevelsProgress | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      const { data, error } = await supabase.rpc("levels_progress");
      if (cancelled || error) return;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) return;
      const cleared = Number(row.o_cleared ?? 0);
      const total = Number(row.o_total ?? 0);
      setProgress({
        cleared,
        total,
        percent: total > 0 ? Math.min(100, (cleared / total) * 100) : 0,
      });
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return progress;
}
