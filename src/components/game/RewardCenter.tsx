"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Gift, Coins, Crown, Sparkles, RefreshCw, Clock } from "lucide-react"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use"
import type { DailyReward, SpinReward } from "@/lib/types"
import { DAILY_REWARDS, SPIN_REWARDS } from "@/lib/achievements-data"
import { DailyLoginRewards } from "./DailyLoginRewards"
import { SpinWheel } from "./SpinWheel"

export function RewardCenter() {
  const [coins, setCoins] = useState(() => {
    if (typeof window === 'undefined') return 1250;
    return Number(localStorage.getItem("coins")) || 1250;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem("coins", coins.toString())
    }
  }, [coins]);
  

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpinWheel coins={coins} setCoins={setCoins} />
        <DailyLoginRewards coins={coins} setCoins={setCoins} />
      </div>

      <Card className="border-2 border-purple-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Crown className="h-6 w-6" />
            Special Events
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">🌙</div>
                <div>
                  <h4 className="font-semibold text-purple-800">Ramadan Special</h4>
                  <p className="text-sm text-purple-600">Double rewards during Ramadan</p>
                </div>
              </div>
              <Badge variant="outline" className="border-purple-300 text-purple-700">
                Coming Soon
              </Badge>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">🕌</div>
                <div>
                  <h4 className="font-semibold text-emerald-800">Hajj Challenge</h4>
                  <p className="text-sm text-emerald-600">Special pilgrimage-themed quizzes</p>
                </div>
              </div>
              <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                Coming Soon
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
