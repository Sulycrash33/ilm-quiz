"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift } from "lucide-react"
import type { DailyReward } from "@/lib/types"
import { DAILY_REWARDS } from "@/lib/achievements-data"

interface DailyLoginRewardsProps {
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}

export function DailyLoginRewards({ coins, setCoins }: DailyLoginRewardsProps) {
  const [dailyStreak, setDailyStreak] = useState(() => {
    if (typeof window === 'undefined') return 3;
    return Number(localStorage.getItem("dailyStreak")) || 3
  });

   useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("dailyStreak", dailyStreak.toString())
    }
  }, [dailyStreak]);

  const claimDailyReward = (day: number) => {
    if (day === dailyStreak) {
      const reward = DAILY_REWARDS[day - 1]
      setCoins((prev) => prev + reward.coins)
      setDailyStreak((prev) => Math.min(prev + 1, 8))
    }
  }

  return (
    <Card className="border-2 border-emerald-200 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardTitle className="flex items-center gap-2 text-emerald-800">
          <Gift className="h-6 w-6" />
          Daily Login Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-primary">{dailyStreak-1} Day Streak</div>
          <p className="text-sm text-muted-foreground">Keep logging in to maintain your streak!</p>
        </div>
        <div className="space-y-3">
          {DAILY_REWARDS.map((reward, index) => {
            const day = index + 1
            const isClaimed = day < dailyStreak
            const isToday = day === dailyStreak
            const isLocked = day > dailyStreak
            return (
              <div
                key={day}
                className={`
                  flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200
                  ${isClaimed ? "bg-green-50 border-green-200" : ""}
                  ${isToday ? "bg-emerald-50 border-emerald-300 shadow-md" : ""}
                  ${isLocked ? "bg-muted/50 border-border opacity-60" : ""}
                `}
                role="region"
                aria-label={`Day ${day} reward`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold
                      ${isClaimed ? "bg-green-500 text-white" : ""}
                      ${isToday ? "bg-primary text-primary-foreground" : ""}
                      ${isLocked ? "bg-muted text-muted-foreground" : ""}
                    `}
                  >
                    {isClaimed ? "✓" : day}
                  </div>
                  <div>
                    <div className="font-semibold">Day {day}</div>
                    <div className="text-sm text-muted-foreground">
                      {reward.coins} coins, {reward.xp} XP
                      {reward.bonus && ` + ${reward.bonus}`}
                    </div>
                  </div>
                </div>
                <div>
                  {isClaimed && <Badge className="bg-green-100 text-green-700">Claimed</Badge>}
                  {isToday && (
                    <Button
                      size="sm"
                      onClick={() => claimDailyReward(day)}
                      aria-label={`Claim reward for day ${day}`}
                    >
                      Claim
                    </Button>
                  )}
                  {isLocked && (
                    <Badge variant="outline">
                      Locked
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">Complete your 7-day streak for an exclusive badge!</p>
        </div>
      </CardContent>
    </Card>
  )
}
