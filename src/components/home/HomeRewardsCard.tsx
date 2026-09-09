"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCountdown } from "@/lib/countdown";
import { getDailyTaskProgress, type DailyTaskProgress } from "@/app/(app)/rewards/actions";
import { getDailyChallenge, type DailyChallengeView } from "@/app/(app)/challenges/actions";

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
 *
 * ── The countdown, and why it had to come up here ─────────────────────────
 * The owner's report: *"after I am done with the daily challenge the countdown
 * should be on the home page, not inside it. From the home you can still see
 * it's still inviting."* Exactly right, and it was the worse half of the bug.
 * The card kept its arrow and its "Collect your reward" whether or not there
 * was anything left to do, so the front door invited a player into a page
 * whose only news was that they were finished. An invitation that leads to a
 * locked door is worse than no invitation.
 *
 * So this reads the challenge as well as the task, and once the attempt is
 * spent it says when the next one arrives — the same string, from the same
 * `resetsAt`, as the card on `/rewards`. The arrow stays only while something
 * is actually collectable.
 */
export function HomeRewardsCard() {
  const { t } = useLanguage();
  const [task, setTask] = useState<DailyTaskProgress | null>(null);
  const [challenge, setChallenge] = useState<DailyChallengeView | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Both at once. They are independent reads and the home screen is the
        // most opened page in the app.
        const [taskResult, challengeResult] = await Promise.all([
          getDailyTaskProgress(),
          getDailyChallenge(),
        ]);
        if (cancelled) return;
        setTask(taskResult);
        setChallenge(challengeResult);
      } catch {
        // A card that cannot load leaves the rest of the home screen alone.
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * A clock, ticking once a second, only once the day is actually spent.
   *
   * Declared before the early return below because hooks cannot be
   * conditional; the interval itself is still conditional, so a player who is
   * mid-challenge is not running a timer for a countdown that is not on screen.
   */
  const spent = !!challenge?.attemptSpent;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!spent) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [spent]);

  if (!task || task.required <= 0) return null;

  const answered = Math.min(task.answered, task.required);
  const percent = Math.round((answered / task.required) * 100);

  // Is there still something to collect? The challenge's own reward is
  // `challenge.completed`; the login reward is what `task.done` unlocks. While
  // either is outstanding the card keeps its arrow, because tapping through
  // still gets the player something.
  const somethingToCollect = task.done && challenge != null && !challenge.completed;
  const msUntilReset = challenge ? new Date(challenge.resetsAt).getTime() - now : 0;

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

        {/* Spent and nothing left to collect: the clock, not an invitation. */}
        {spent && !somethingToCollect ? (
          <div className="mt-3 space-y-1">
            <p className="text-sm text-on-surface-variant">{t("challengeSpentToday")}</p>
            <p className="text-sm font-bold tabular-nums text-tertiary">
              {t("nextChallengeIn", { time: formatCountdown(msUntilReset, t("countdownNow")) })}
            </p>
          </div>
        ) : (
          <p className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary">
            {task.done ? t("dailyTaskDone") : t("dailyTaskCta")}
            <span aria-hidden="true">&rarr;</span>
          </p>
        )}
      </Link>
    </motion.div>
  );
}
