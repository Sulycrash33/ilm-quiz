"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface LifetimeStats {
  /** Every question this player has ever answered. */
  answered: number;
  /** Accuracy across all of them, or null before the first answer. */
  accuracy: number | null;
}

/**
 * The player's whole history, not just today.
 *
 * ── Why this counts instead of selecting ──────────────────────────────────
 * `useTodayStats` fetches the day's rows and counts them in JavaScript, which
 * is fine for a day. Doing the same for a lifetime is the trap this repository
 * has already fallen into twice: **PostgREST caps an unbounded select at 1,000
 * rows.** A player past their thousandth question would have silently stopped
 * counting, and the number would have been wrong in the direction nobody
 * checks — too low, plausible, and stuck.
 *
 * So both numbers come back as `count` with `head: true`: no rows cross the
 * wire at all, and the ceiling does not exist. Two round trips instead of one,
 * for a card that renders once on the home screen.
 */
export function useLifetimeStats() {
  const [stats, setStats] = useState<LifetimeStats>({ answered: 0, accuracy: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }

      /*
       * First answers only, both of them.
       *
       * "Questions answered" should mean questions, not answers: a review
       * session re-serves what you have already seen, and counting it again
       * inflated this figure while the achievements, chests and daily task
       * (migration 0063) had stopped counting it. Two numbers for one idea,
       * disagreeing on the busiest screen in the app, is the shape of bug this
       * project keeps finding — so this reads `is_first_answer` too.
       */
      const [total, correct] = await Promise.all([
        supabase
          .from("attempts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_first_answer", true),
        supabase
          .from("attempts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_first_answer", true)
          .eq("is_correct", true),
      ]);

      if (cancelled) return;

      const answered = total.count ?? 0;
      const right = correct.count ?? 0;
      setStats({
        answered,
        accuracy: answered > 0 ? Math.round((right / answered) * 100) : null,
      });
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...stats, loading };
}
