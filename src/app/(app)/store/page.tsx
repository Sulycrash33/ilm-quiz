"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Coins,
  ShoppingCart,
} from "lucide-react"

import { STORE_ITEMS } from "@/data/store-items"
import { StoreItemCard } from "@/components/game/StoreItemCard"
import { BundleCard } from "@/components/game/BundleCard"
import type { StoreItem, Bundle } from "@/data/store-items"

export default function StorePage() {
  const [selectedTab, setSelectedTab] = useState("lifelines")
  const [userCoins, setUserCoins] = useState(1250)
  const [cart, setCart] = useState<StoreItem[]>([])

  const handlePurchase = (item: StoreItem | Bundle) => {
    if (userCoins >= item.price) {
      setUserCoins((prev) => prev - item.price)
      console.log("Purchased:", item.name)
      // Here you would typically add the item to user's inventory
    }
  }

  const addToCart = (item: StoreItem) => setCart((prev) => [...prev, item])

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" asChild>
          <Link href="/home">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Link>
        </Button>
        <div className="text-center">
          <h1 className="text-3xl font-bold font-headline text-primary mb-2">IlmHunt Store</h1>
          <p className="text-muted-foreground">Enhance your learning journey</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
            <Coins className="h-5 w-5 text-yellow-600" />
            <span className="font-bold text-yellow-700">{userCoins.toLocaleString()}</span>
          </div>
          <Button variant="outline">
            <ShoppingCart className="h-4 w-4 mr-2" /> Cart ({cart.length})
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lifelines">Lifelines</TabsTrigger>
          <TabsTrigger value="powerups">Power-ups</TabsTrigger>
          <TabsTrigger value="cosmetics">Cosmetics</TabsTrigger>
          <TabsTrigger value="bundles">Bundles</TabsTrigger>
        </TabsList>

        {/* Lifelines */}
        <TabsContent value="lifelines" className="space-y-6">
          <h2 className="text-2xl font-bold text-primary text-center">Quiz Lifelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STORE_ITEMS.lifelines.map((i) => (
              <StoreItemCard
                key={i.id}
                item={i}
                theme="lifeline"
                userCoins={userCoins}
                handlePurchase={handlePurchase}
                addToCart={addToCart}
              />
            ))}
          </div>
        </TabsContent>

        {/* Power-ups */}
        <TabsContent value="powerups" className="space-y-6">
          <h2 className="text-2xl font-bold text-primary text-center">Power-ups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STORE_ITEMS.powerups.map((i) => (
              <StoreItemCard
                key={i.id}
                item={i}
                theme="powerup"
                userCoins={userCoins}
                handlePurchase={handlePurchase}
                addToCart={addToCart}
              />
            ))}
          </div>
        </TabsContent>

        {/* Cosmetics */}
        <TabsContent value="cosmetics" className="space-y-6">
          <h2 className="text-2xl font-bold text-primary text-center">Cosmetics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STORE_ITEMS.cosmetics.map((i) => (
              <StoreItemCard
                key={i.id}
                item={i}
                theme="cosmetic"
                userCoins={userCoins}
                handlePurchase={handlePurchase}
                addToCart={addToCart}
              />
            ))}
          </div>
        </TabsContent>

        {/* Bundles */}
        <TabsContent value="bundles" className="space-y-6">
          <h2 className="text-2xl font-bold text-primary text-center">Value Bundles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {STORE_ITEMS.bundles.map((b) => (
              <BundleCard key={b.id} bundle={b} userCoins={userCoins} handlePurchase={handlePurchase} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
