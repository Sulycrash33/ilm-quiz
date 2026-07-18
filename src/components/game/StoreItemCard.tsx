
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
      badgeColor: "bg-primary/10 text-primary",
      border: item.popular
        ? "border-primary/30 bg-primary/5"
        : "border-border",
      buttonColor: "bg-primary hover:bg-primary/90",
      icon: <Zap className="h-4 w-4 mr-2" />,
    },
    powerup: {
      badgeColor: "bg-lapis-soft text-lapis",
      border: item.popular
        ? "border-lapis/30 bg-lapis-soft"
        : "border-border",
      buttonColor: "bg-lapis hover:bg-lapis/90",
      icon: <Sparkles className="h-4 w-4 mr-2" />,
    },
    cosmetic: {
      badgeColor: "bg-amethyst-soft text-amethyst",
      border: item.popular
        ? "border-amethyst/30 bg-amethyst-soft"
        : "border-border",
      buttonColor: "bg-amethyst hover:bg-amethyst/90",
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
            <Coins className="h-4 w-4 text-primary" />
            <span className="font-bold text-card-foreground">{item.price}</span>
          </div>
          {item.inStock ? (
            <Badge className="bg-jade-soft text-jade">Available</Badge>
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
