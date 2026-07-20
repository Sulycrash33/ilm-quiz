"use client"

import { useState, useEffect } from "react"
import { DailyLoginRewards } from "./DailyLoginRewards"
import { SpinWheel } from "./SpinWheel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useProfile } from "@/hooks/use-profile"
import { DAILY_REWARDS } from "@/lib/achievements-data"

export function RewardCenter() {
  const { profile, updateProfile } = useProfile();
  const [coins, setCoins] = useState(1250);
  const [dailyStreak, setDailyStreak] = useState(1);

  // Seed from the real, cross-device profile once it loads.
  useEffect(() => {
    if (profile) {
      setCoins(profile.coins);
      // streak_count tracks completed days; the claimable day is the next one.
      setDailyStreak((profile.streakCount || 0) + 1);
    }
  }, [profile]);

  // Persist back to Supabase (replaces localStorage writes).
  useEffect(() => {
    if (!profile) return;
    if (coins === profile.coins) return;
    updateProfile({ coins });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coins]);

  const handleClaim = (day: number) => {
    if (day !== dailyStreak) return;
    const reward = DAILY_REWARDS[day - 1];
    const newStreak = Math.min(dailyStreak + 1, 8);
    const newCoins = coins + reward.coins;
    setCoins(newCoins);
    setDailyStreak(newStreak);
    updateProfile({ streakCount: newStreak - 1, coins: newCoins });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpinWheel coins={coins} setCoins={setCoins} />
        <DailyLoginRewards dailyStreak={dailyStreak} onClaim={handleClaim} />
      </div>

      <Card className="border-2 border-purple-400/30 shadow-xl">
        <CardHeader className="bg-purple-400/10">
          <CardTitle className="flex items-center gap-2 font-headline text-purple-400">
            <Crown className="h-6 w-6" />
            Special Events
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-purple-400/10 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">ðŸŒ™</div>
                <div>
                  <h4 className="font-semibold text-purple-400">Ramadan Special</h4>
                  <p className="text-sm text-purple-400/80">Double rewards during Ramadan</p>
                </div>
              </div>
              <Badge variant="outline" className="border-purple-400/40 text-purple-400">
                Coming Soon
              </Badge>
            </div>
            <div className="p-4 bg-emerald-400/10 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">ðŸ•Œ</div>
                <div>
                  <h4 className="font-semibold text-emerald-400">Hajj Challenge</h4>
                  <p className="text-sm text-emerald-400/80">Special pilgrimage-themed quizzes</p>
                </div>
              </div>
              <Badge variant="outline" className="border-emerald-400/40 text-emerald-400">
                Coming Soon
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
