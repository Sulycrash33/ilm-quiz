import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/constants";
import { ChevronRight } from "lucide-react";

export function QuizCategoryList() {
  return (
    <div className="space-y-4">
      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        return (
          <Link href={`/quiz/${category.id}`} key={category.id} className="block">
            <Card className="hover:bg-muted transition-colors hover:border-accent shadow-sm">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-headline">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
