"use client";

import { Flame, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { getStreakStyle } from "@/lib/design-tokens";
import { useLanguage } from "@/contexts/LanguageContext";

interface StreakCounterProps {
  streak: number;
  /**
   * Streak freezes the player actually holds. The "protected" badge used to
   * render unconditionally, so the card told every player their streak was
   * safe whether or not they owned a single freeze. Defaults to none, because
   * claiming protection nobody has is worse than saying nothing.
   */
  freezesAvailable?: number;
}

/**
 * The streak card.
 *
 * NOTE: not currently rendered anywhere. `home/page.tsx` imports it and never
 * uses it, and the home header draws the streak count itself. Kept and fixed
 * rather than deleted, because the two faults below would have shipped the
 * moment anyone wired it up.
 */
export function StreakCounter({ streak, freezesAvailable = 0 }: StreakCounterProps) {
  const { t } = useLanguage();
  const flameStyle = getStreakStyle(streak);

  /**
   * How much of the current week to fill.
   *
   * This was `streak % 7`, which is 0 at exactly 7, 14 and 21 days: complete a
   * full week and the meter emptied itself, at precisely the moment the card
   * exists to celebrate. A completed week now reads as seven of seven until
   * the eighth day starts the next one.
   */
  const daysThisWeek = streak > 0 && streak % 7 === 0 ? 7 : streak % 7;

  return (
    <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* The glow follows the streak but is capped: `streak / 5` was
                unbounded, so a hundred day streak asked for a 20px bloom that
                swallowed the number beside it. `currentColor` keeps the halo on
                whatever the ramp chose, so it can never disagree with the
                flame it surrounds. */}
            <Flame
              className={cn("h-8 w-8", flameStyle)}
              style={{
                filter:
                  streak > 0
                    ? `drop-shadow(0 0 ${Math.min(2 + streak / 5, 10)}px currentColor)`
                    : "none",
              }}
              aria-hidden="true"
            />
            <div>
              <p className={cn("text-xl font-bold", flameStyle)}>{streak}</p>
              <p className="text-sm text-muted-foreground">{t("dayStreak")}</p>
            </div>
          </div>
          {freezesAvailable > 0 && (
            <Badge variant="secondary" className="bg-success/10 text-success">
              <Shield className="h-3 w-3 mr-1" aria-hidden="true" />
              {t("protectedLabel")}
            </Badge>
          )}
        </div>
        <div
          className="flex gap-1"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={7}
          aria-valuenow={daysThisWeek}
          aria-label={`${t("dayStreak")}: ${streak}`}
        >
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded ${i < daysThisWeek ? "bg-primary/60" : "bg-muted"}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
