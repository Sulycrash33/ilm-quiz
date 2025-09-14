import { RANKS } from "@/lib/constants";
import type { Rank } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="bg-card/80 backdrop-blur-sm border-accent/20 shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className={cn("p-3 rounded-full bg-accent/10", currentRank.theme)}>
            <Icon className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Current Rank</p>
            <h3 className={cn("text-2xl font-bold font-headline", currentRank.theme)}>{currentRank.title}</h3>
          </div>
        </div>
        {nextRank && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs font-medium text-muted-foreground">
              <span>Progress to {nextRank.title}</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 [&>div]:bg-accent" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
