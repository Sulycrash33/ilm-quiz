"use client";

import { RANKS } from "@/lib/constants";
import type { Rank } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface RankBadgeProps {
  currentPoints: number;
}

export function RankBadge({ currentPoints }: RankBadgeProps) {
  const { t } = useLanguage();
  const currentRank = [...RANKS].reverse().find(rank => currentPoints >= rank.minPoints) || RANKS[0];
  const nextRank = RANKS.find(rank => rank.level === currentRank.level + 1);

  const getProgress = () => {
    if (!nextRank) return 100;
    const pointsInCurrentRank = currentPoints - currentRank.minPoints;
    const pointsForNextRank = nextRank.minPoints - currentRank.minPoints;
    return (pointsInCurrentRank / pointsForNextRank) * 100;
  };

  const progress = getProgress();
  const Icon = currentRank.icon;

  return (
    <Card className="relative overflow-hidden border-2 border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className={cn("pb-4", nextRank ? "bg-primary/10" : "bg-accent/20")}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={cn("text-base font-headline", "text-primary")}>{currentRank.title}</CardTitle>
            <p className="text-sm text-muted-foreground">Rank {currentRank.level}</p>
          </div>
          <div className={cn("text-4xl", "text-primary")} aria-hidden="true">
            <Icon className="h-10 w-10" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {nextRank ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("progressToRank", { rank: nextRank.title })}</span>
              <span className="font-semibold">{currentPoints}/{nextRank.minPoints} {t("barakahShort")}</span>
            </div>
            <Progress value={progress} className="h-3" aria-label={t("progressToRank", { rank: nextRank.title })} />
          </div>
        ) : (
          <p className="text-center text-sm font-semibold text-accent">{t("highestRankReachedFull")}</p>
        )}
      </CardContent>
    </Card>
  );
}
