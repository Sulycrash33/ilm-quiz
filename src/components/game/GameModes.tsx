
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookUp, Repeat, Home as HomeIcon, Swords, RefreshCcw } from "lucide-react";
import Link from "next/link";

const gameModes = [
    {
        title: "Story Mode",
        description: "Embark on a guided journey from the Quran, through the Hadith, to the lives of the Sahaba and beyond.",
        icon: BookUp,
        color: "border-primary/20 bg-primary/5 text-primary",
        buttonText: "Begin Journey",
        href: "/quiz"
    },
    {
        title: "Endless Runner",
        description: "Test your knowledge in a continuous stream of questions. How long can you last?",
        icon: Repeat,
        color: "border-accent/20 bg-accent/5 text-accent",
        buttonText: "Start Running",
        href: "/quiz"
    },
     {
        title: "Revision Mode",
        description: "Practice questions you've previously answered incorrectly to master difficult topics.",
        icon: RefreshCcw,
        color: "border-blue-200/20 bg-blue-500/5 text-blue-500",
        buttonText: "Start Revising",
        href: "/quiz",
    },
    {
        title: "Head-to-Head",
        description: "Challenge a friend or a random opponent in a real-time quiz battle.",
        icon: Swords,
        color: "border-destructive/10 bg-destructive/5 text-destructive",
        buttonText: "Find Opponent",
        href: "/community"
    },
    {
        title: "Family Mode",
        description: "Create a private group and challenge your family members to see who knows more.",
        icon: HomeIcon,
        color: "border-secondary-foreground/10 bg-secondary/50 text-secondary-foreground",
        buttonText: "Create Family Group",
        href: "/community"
    }
]

export function GameModes() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8">
            {gameModes.map(mode => {
                const Icon = mode.icon;
                return (
                    <Card key={mode.title} className={`border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${mode.color}`}>
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-background rounded-lg">
                                    <Icon className="h-8 w-8" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl mb-1">{mode.title}</CardTitle>
                                    <CardDescription className="text-muted-foreground">{mode.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <Button asChild className="w-full">
                                <Link href={mode.href}>
                                    {mode.buttonText} <ArrowRight className="h-4 w-4 ml-2" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
