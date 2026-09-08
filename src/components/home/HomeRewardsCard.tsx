"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDailyTaskProgress, type DailyTaskProgress } from "@/app/(app)/rewards/actions";

/**
 * The day's invitation, on the front door: answer today's questions, collect
 * today's reward — and one link to the one page where both of those happen.
 *
 * ── What this replaces, and why ───────────────────────────────────────────
 * `HomeDailyChallenge` stood here and rendered the daily challenge card
 * itself. That was #77's fix for a real problem — the challenge was reachable
 * only from a 44px tile below the fold — and it left a different one standing:
 * the app then described the same five questions twice, in two places, under
 * two names. The "daily challenge" here and on `/challenges`, and the "daily
 * login reward" on `/rewards`, whose task is *also* five questions and whose
 * only button pointed at `/quiz`, the category grid. That is the report this
 * change answers, and it is the third time the category grid has been the
 * answer to a question about the daily.
 *
 * So the five questions live in exactly one place now — the Rewards Center,
 * beside the coins they pay for — and the front door keeps the position the
 * challenge card had, above the ring, pointing at it. The invitation still
 * goes before the record of what has been done.
 *
 * ── Why it shows the count and not a second card ──────────────────────────
 * A copy of `DailyChallengeCard` here would be a second definition of the
 * challenge's progress, reward and claim rule on a screen whose whole problem
 * was duplicate definitions. What this needs to do is say there is something
 * to do today and how far through it the player is. So it reads
 * `daily_task_progress()` — the same function that gates the claim, through
 * the same server action the Rewards Center uses — and renders nothing of its
 * own devising. One number, one source.
 */
export function HomeRewardsCard() {
  const { t } = useLanguage();
  const [task, setTask] = useState<DailyTaskProgress | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await getDailyTaskProgress();
        if (!cancelled) setTask(result);
      } catch {
        // A card that cannot load leaves the rest of the home screen alone.
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!task || task.required <= 0) return null;

  const answered = Math.min(task.answered, task.required);
  const percent = Math.round((answered / task.required) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        href="/rewards"
        className="glass-card block p-5 transition-all hover:bg-white/5 hover:-translate-y-0.5 active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tertiary/15 text-tertiary"
            aria-hidden="true"
          >
            <Gift className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-on-surface">{t("rewardsCenter")}</p>
            <p className="text-sm text-on-surface-variant">
              {t("dailyTaskTitle", { required: task.required })}
            </p>
          </div>
          <span
            className={`shrink-0 font-bold tabular-nums ${task.done ? "text-success" : "text-on-surface-variant"}`}
          >
            {answered}/{task.required}
          </span>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ${task.done ? "bg-success" : "bg-gradient-to-r from-primary to-primary-fixed-dim"}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary">
          {task.done ? t("dailyTaskDone") : t("dailyTaskCta")}
          <span aria-hidden="true">&rarr;</span>
        </p>
      </Link>
    </motion.div>
  );
}
