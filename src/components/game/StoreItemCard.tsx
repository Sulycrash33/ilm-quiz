
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Coins,
  Zap,
  Sparkles,
  Heart,
  Star,
  Flame,
  Crown
} from "lucide-react"

import type { StoreItem } from "@/data/store-items"

interface StoreItemCardProps {
  item: StoreItem;
  userCoins: number;
  handlePurchase: (item: StoreItem) => void;
  addToCart: (item: StoreItem) => void;
  theme: "lifeline" | "powerup" | "cosmetic";
}

export function StoreItemCard({ item, userCoins, handlePurchase, addToCart, theme }: StoreItemCardProps) {
  const themeStyles = {
    lifeline: {
      badgeColor: "bg-yellow-100 text-yellow-700",
      border: item.popular
        ? "border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50"
        : "border-border",
      buttonColor: "bg-primary hover:bg-primary/90",
      icon: <Zap className="h-4 w-4 mr-2" />,
    },
    powerup: {
      badgeColor: "bg-blue-100 text-blue-700",
      border: item.popular
        ? "border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50"
        : "border-border",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      icon: <Sparkles className="h-4 w-4 mr-2" />,
    },
    cosmetic: {
      badgeColor: "bg-purple-100 text-purple-700",
      border: item.popular
        ? "border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50"
        : "border-border",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
      icon: <Heart className="h-4 w-4 mr-2" />,
    },
  }

  const themeCfg = themeStyles[theme] ?? themeStyles.lifeline

  return (
    <Card className={`border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${themeCfg.border}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="text-4xl">{item.icon}</div>
          {item.popular && (
            <Badge className={themeCfg.badgeColor}>
              {theme === "lifeline" && <Star className="h-3 w-3 mr-1" />}
              {theme === "powerup" && <Flame className="h-3 w-3 mr-1" />}
              {theme === "cosmetic" && <Crown className="h-3 w-3 mr-1" />}
              {theme === "lifeline" ? "Popular" : theme === "powerup" ? "Hot" : "Premium"}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg text-card-foreground">{item.name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed h-20">{item.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-bold text-card-foreground">{item.price}</span>
          </div>
          {item.inStock ? (
            <Badge className="bg-green-100 text-green-700">Available</Badge>
          ) : (
            <Badge variant="secondary">Out of Stock</Badge>
          )}
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => handlePurchase(item)}
            disabled={!item.inStock || userCoins < item.price}
            className={`w-full ${themeCfg.buttonColor}`}
          >
            {themeCfg.icon}
            {item.inStock ? "Buy Now" : "Notify Me"}
          </Button>
          {item.inStock && (
            <Button variant="outline" onClick={() => addToCart(item)} className="w-full">
              Add to Cart
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
