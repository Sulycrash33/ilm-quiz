
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
        <Card className="border-2 border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Coins className="h-8 w-8 text-primary" aria-hidden="true" />
                    <div>
                        <p className="text-xl font-bold text-primary">{coins.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Ilm Coins</p>
                    </div>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    className="border-primary/40 text-primary hover:bg-primary/10 bg-transparent"
                    asChild
                >
                    <Link href="/rewards">
                        <Zap className="h-3 w-3 mr-1" aria-hidden="true" />
                        Earn More
                    </Link>
                </Button>
            </div>
            </CardContent>
        </Card>
    )
}
