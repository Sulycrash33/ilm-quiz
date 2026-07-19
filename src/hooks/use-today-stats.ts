"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface TodayStats {
  questionsToday: number;
  accuracy: number | null; // null when there's nothing to compute a % from yet
}

/**
 * Real today's-activity stats computed from the attempts table, replacing
 * the dashboard's old hardcoded fake numbers (13 questions, 87% accuracy).
 * "Today" is UTC-day-boundary for now - fine for a v1, but means someone
 * near a timezone edge could see their day roll over at an odd local hour.
 * Worth revisiting once real usage patterns are known.
 */
export function useTodayStats() {
  const [stats, setStats] = useState<TodayStats>({ questionsToday: 0, accuracy: null });
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

      const startOfToday = new Date();
      startOfToday.setUTCHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("attempts")
        .select("is_correct")
        .eq("user_id", user.id)
        .gte("created_at", startOfToday.toISOString());

      if (!cancelled) {
        if (!error && data) {
          const total = data.length;
          const correct = data.filter((a) => a.is_correct).length;
          setStats({
            questionsToday: total,
            accuracy: total > 0 ? Math.round((correct / total) * 100) : null,
          });
        }
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...stats, loading };
}
