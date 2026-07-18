"use client"

import { useState, useEffect } from "react"
import { DailyLoginRewards } from "./DailyLoginRewards"
import { SpinWheel } from "./SpinWheel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useProfile } from "@/hooks/use-profile"

export function RewardCenter() {
  const { profile, updateProfile } = useProfile();
  const [coins, setCoins] = useState(1250);

  // Seed from the real, cross-device profile once it loads.
  useEffect(() => {
    if (profile) {
      setCoins(profile.coins);
    }
  }, [profile]);

  // Persist back to Supabase (replaces localStorage writes).
  useEffect(() => {
    if (!profile) return;
    if (coins === profile.coins) return;
    updateProfile({ coins });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coins]);
  

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpinWheel coins={coins} setCoins={setCoins} />
        <DailyLoginRewards coins={coins} setCoins={setCoins} />
      </div>

      <Card className="border-2 border-amethyst/30 shadow-xl">
        <CardHeader className="bg-amethyst-soft">
          <CardTitle className="flex items-center gap-2 font-headline text-amethyst">
            <Crown className="h-6 w-6" />
            Special Events
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-amethyst-soft rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">🌙</div>
                <div>
                  <h4 className="font-semibold text-amethyst">Ramadan Special</h4>
                  <p className="text-sm text-amethyst/80">Double rewards during Ramadan</p>
                </div>
              </div>
              <Badge variant="outline" className="border-amethyst/40 text-amethyst">
                Coming Soon
              </Badge>
            </div>
            <div className="p-4 bg-jade-soft rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">🕌</div>
                <div>
                  <h4 className="font-semibold text-jade">Hajj Challenge</h4>
                  <p className="text-sm text-jade/80">Special pilgrimage-themed quizzes</p>
                </div>
              </div>
              <Badge variant="outline" className="border-jade/40 text-jade">
                Coming Soon
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
