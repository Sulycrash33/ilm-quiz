import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  streak: number;
}

export function StreakCounter({ streak }: StreakCounterProps) {
  const getFlameColor = () => {
    if (streak > 30) return "text-red-500";
    if (streak > 7) return "text-orange-500";
    if (streak > 0) return "text-yellow-500";
    return "text-muted-foreground/50";
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-accent/20 shadow-md">
      <CardContent className="flex flex-col items-center justify-center p-4 text-center">
        <Flame className={cn("h-8 w-8 mb-2", getFlameColor())} style={{
          filter: streak > 0 ? `drop-shadow(0 0 ${streak / 5}px currentColor)` : 'none'
        }} />
        <p className="text-2xl font-bold font-headline text-foreground">{streak}</p>
        <p className="text-xs font-medium text-muted-foreground">Day Streak</p>
      </CardContent>
    </Card>
  );
}
