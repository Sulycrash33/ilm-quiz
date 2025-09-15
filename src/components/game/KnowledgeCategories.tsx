
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/constants";
import { BookOpen, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function KnowledgeCategories() {
    return (
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              Knowledge Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {CATEGORIES.slice(0,9).map((category) => {
                    const Icon = category.icon;
                    return (
                    <Button
                        key={category.id}
                        asChild
                        variant="outline"
                        className={cn(
                            "h-20 justify-start text-left flex-col items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105",
                            category.color,
                        )}
                    >
                        <Link href={`/quiz/${category.id}`}>
                           <div className="flex flex-col items-center gap-1">
                                <Icon className="h-6 w-6" />
                                <span className="text-sm font-medium text-center">{category.title}</span>
                            </div>
                        </Link>
                    </Button>
                )})}
                 <Button
                    asChild
                    variant="outline"
                    className="h-20 justify-start text-left flex-col items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 bg-muted/50 hover:bg-muted"
                >
                    <Link href="/quiz">
                         <div className="flex flex-col items-center gap-1">
                            <Plus className="h-6 w-6" />
                            <span className="text-sm font-medium">More...</span>
                        </div>
                    </Link>
                </Button>
            </div>
          </CardContent>
        </Card>
    )
}
