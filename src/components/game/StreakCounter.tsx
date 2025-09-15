import { Flame, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

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
    <Card className="border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className={cn("h-8 w-8", getFlameColor())} style={{
          filter: streak > 0 ? `drop-shadow(0 0 ${streak / 5}px currentColor)` : 'none'
        }} aria-hidden="true" />
            <div>
              <p className="text-xl font-bold text-orange-600">{streak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            <Shield className="h-3 w-3 mr-1" aria-hidden="true" />
            Protected
          </Badge>
        </div>
        <div className="flex gap-1" role="meter" aria-label={`Streak progress: ${streak} days`}>
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded ${i < streak % 7 ? "bg-orange-400" : "bg-muted"}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
