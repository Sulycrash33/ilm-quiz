
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/constants";
import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {CATEGORIES.map((category) => (
                    <Button
                        key={category.id}
                        asChild
                        variant="ghost"
                        className="h-20 bg-secondary/50 hover:bg-secondary hover:text-secondary-foreground transition-all duration-200 shadow-sm hover:shadow-md justify-start"
                    >
                        <Link href={`/quiz/${category.id}`}>
                            <div className="flex items-center gap-3">
                                <category.icon className="h-6 w-6 text-primary" />
                                <span className="text-sm font-medium text-left">{category.title}</span>
                            </div>
                        </Link>
                    </Button>
                ))}
                 <Button
                    asChild
                    variant="ghost"
                    className="h-20 bg-muted/50 hover:bg-muted transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    <Link href="/quiz">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-medium">View All</span>
                            <ChevronRight className="h-5 w-5" />
                        </div>
                    </Link>
                </Button>
            </div>
          </CardContent>
        </Card>
    )
}
