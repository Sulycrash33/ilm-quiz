import { RANKS } from "@/lib/constants";
import type { Rank } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RankBadgeProps {
  currentPoints: number;
}

export function RankBadge({ currentPoints }: RankBadgeProps) {
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
    <Card className="relative overflow-hidden border-2 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className={cn("pb-4", nextRank ? "bg-purple-50/50" : "bg-accent/20")}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={cn("text-lg", "text-purple-800")}>{currentRank.title}</CardTitle>
            <p className="text-sm text-muted-foreground">Rank {currentRank.level}</p>
          </div>
          <div className={cn("text-4xl", "text-purple-600")} aria-hidden="true">
            <Icon className="h-10 w-10" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {nextRank ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {nextRank.title}</span>
              <span className="font-semibold">{currentPoints}/{nextRank.minPoints} XP</span>
            </div>
            <Progress value={progress} className="h-3" aria-label={`Progress to ${nextRank.title}`} />
          </div>
        ) : (
          <p className="text-center text-sm font-semibold text-accent">You have reached the highest rank!</p>
        )}
      </CardContent>
    </Card>
  );
}
