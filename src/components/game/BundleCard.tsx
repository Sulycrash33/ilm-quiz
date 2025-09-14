
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Coins,
  Trophy,
  Gift,
  BookOpen
} from "lucide-react"
import type { Bundle } from "@/data/store-items"

interface BundleCardProps {
    bundle: Bundle;
    userCoins: number;
    handlePurchase: (bundle: Bundle) => void;
}

export function BundleCard({ bundle, userCoins, handlePurchase }: BundleCardProps) {
  const savings = bundle.originalPrice - bundle.price
  const discount = Math.round((savings / bundle.originalPrice) * 100)

  return (
    <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="text-5xl">{bundle.icon}</div>
          <Badge className="bg-primary/10 text-primary">
            <Trophy className="h-3 w-3 mr-1" />
            Best Value
          </Badge>
        </div>
        <CardTitle className="text-2xl text-primary">{bundle.name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <p className="text-muted-foreground leading-relaxed">{bundle.description}</p>
        <ul className="space-y-1">
          {bundle.items.map((i, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-3 w-3 text-primary" />
              {i}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between p-4 bg-background rounded-lg">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold text-card-foreground">{bundle.price}</span>
            </div>
            <div className="text-sm text-muted-foreground line-through">Regular: {bundle.originalPrice}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">Save {savings}!</div>
            <div className="text-sm text-muted-foreground">{discount}% off</div>
          </div>
        </div>

        <Button
          onClick={() => handlePurchase(bundle)}
          disabled={userCoins < bundle.price}
          className="w-full text-lg py-3"
          size="lg"
        >
          <Gift className="h-5 w-5 mr-2" />
          Buy Bundle
        </Button>
      </CardContent>
    </Card>
  )
}
