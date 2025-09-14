
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Zap } from "lucide-react";
import Link from "next/link";

interface UserStatsProps {
    coins: number;
}

export function UserStats({ coins }: UserStatsProps) {
    return (
        <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Coins className="h-8 w-8 text-yellow-500" aria-hidden="true" />
                    <div>
                        <p className="text-2xl font-bold text-yellow-600">{coins.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Ilm Coins</p>
                    </div>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 bg-transparent"
                    asChild
                >
                    <Link href="/challenges">
                        <Zap className="h-3 w-3 mr-1" aria-hidden="true" />
                        Earn More
                    </Link>
                </Button>
            </div>
            </CardContent>
        </Card>
    )
}
