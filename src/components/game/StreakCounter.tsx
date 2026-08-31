"use client";

import { Flame, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { getStreakStyle } from "@/lib/design-tokens";
import { useLanguage } from "@/contexts/LanguageContext";

interface StreakCounterProps {
  streak: number;
}

export function StreakCounter({ streak }: StreakCounterProps) {
  const { t } = useLanguage();
  const flameStyle = getStreakStyle(streak);

  return (
    <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className={cn("h-8 w-8", flameStyle)} style={{
          filter: streak > 0 ? `drop-shadow(0 0 ${streak / 5}px currentColor)` : 'none'
        }} aria-hidden="true" />
            <div>
              <p className={cn("text-xl font-bold", flameStyle)}>{streak}</p>
              <p className="text-sm text-muted-foreground">{t("dayStreak")}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-success/10 text-success">
            <Shield className="h-3 w-3 mr-1" aria-hidden="true" />
            {t("protectedLabel")}
          </Badge>
        </div>
        <div className="flex gap-1" role="meter" aria-label={`Streak progress: ${streak} days`}>
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded ${i < streak % 7 ? "bg-primary/60" : "bg-muted"}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
