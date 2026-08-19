"use client";

import { motion } from "framer-motion";
import { Trophy, ChevronUp, ChevronDown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { LeagueView } from "@/app/(app)/leaderboard/actions";

/**
 * This week's division standings.
 *
 * The cut lines are drawn explicitly rather than left implicit: a player should
 * be able to see they are two places off promotion without counting rows. The
 * table resets every Monday, which is the point — an all-time leaderboard
 * becomes unreachable within a month and everyone below the top stops looking.
 */
export function LeagueStandings({ league }: { league: LeagueView }) {
  const { t } = useLanguage();
  const { entries, promoteTop, relegateBottom, division } = league;
  const relegationLine = entries.length - relegateBottom;
  // A division too small for a meaningful bottom does not relegate at all,
  // matching close_league_week.
  const relegationApplies = division > 1 && entries.length > promoteTop + relegateBottom;

  return (
    <section className="space-y-4" aria-label={t("leagueTitle")}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">{t("leagueTitle")}</h2>
          <p className="text-sm text-on-surface-variant">
            {t("leagueDivision", { division })} · {t("leagueResetsMonday")}
          </p>
        </div>
        {league.moved !== "none" && (
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
              league.moved === "promoted"
                ? "bg-primary/15 text-primary"
                : "bg-error/15 text-error",
            )}
          >
            {league.moved === "promoted" ? (
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {league.moved === "promoted" ? t("leaguePromoted") : t("leagueRelegated")}
          </span>
        )}
      </header>

      {entries.length === 0 ? (
        <p className="rounded-xl bg-surface-container p-6 text-center text-sm text-on-surface-variant">
          {t("leagueEmpty")}
        </p>
      ) : (
        <ol className="overflow-hidden rounded-xl bg-surface-container">
          {entries.map((e, i) => {
            const inPromotion = e.rank <= promoteTop && entries.length > promoteTop;
            const inRelegation = relegationApplies && e.rank > relegationLine;
            const isLastPromotion = inPromotion && (i + 1 === promoteTop || i + 1 === entries.length);
            const isFirstRelegation = inRelegation && e.rank === relegationLine + 1;

            return (
              <motion.li
                key={e.userId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  e.isCurrentUser && "bg-primary/10",
                  isLastPromotion && "border-b-2 border-primary/50",
                  isFirstRelegation && "border-t-2 border-error/50",
                )}
              >
                <span
                  className={cn(
                    "w-7 text-center text-sm font-bold tabular-nums",
                    inPromotion ? "text-primary" : inRelegation ? "text-error" : "text-on-surface-variant",
                  )}
                >
                  {e.rank}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-on-surface">
                  {e.name}
                  {e.isCurrentUser && <span className="ml-2 text-xs text-primary">{t("youBadge")}</span>}
                </span>
                {inPromotion && <Trophy className="h-4 w-4 shrink-0 text-primary" aria-label={t("leaguePromotionZone")} />}
                {inRelegation && <Shield className="h-4 w-4 shrink-0 text-error" aria-label={t("leagueRelegationZone")} />}
                <span className="w-16 text-right text-sm font-semibold tabular-nums text-tertiary">
                  {e.xp.toLocaleString()}
                </span>
              </motion.li>
            );
          })}
        </ol>
      )}

      <p className="text-xs text-on-surface-variant">
        {t("leagueRules", { promote: promoteTop, relegate: relegateBottom })}
      </p>
    </section>
  );
}
