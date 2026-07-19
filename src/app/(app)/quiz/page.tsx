import Link from "next/link";
import { getCategoriesWithProgress } from "@/lib/quiz-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export default async function KnowledgeCategoriesPage() {
  const categories = await getCategoriesWithProgress();
  const totalPublished = categories.reduce((s, c) => s + c.publishedCount, 0);
  const totalAnswered = categories.reduce((s, c) => s + c.answeredCount, 0);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-headline text-primary mb-2">Knowledge Categories</h1>
        <p className="text-muted-foreground">
          {categories.length} categories · {totalPublished} questions available · {totalAnswered} answered
        </p>
      </div>

      {categories.length === 0 ? (
        <p className="text-center text-muted-foreground">No categories yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => {
            const pct = c.publishedCount > 0 ? Math.round((c.answeredCount / c.publishedCount) * 100) : 0;
            const hasQuestions = c.publishedCount > 0;

            const inner = (
              <Card
                className={`h-full border-2 shadow-lg transition-all duration-300 ${
                  hasQuestions ? "hover:shadow-xl hover:scale-[1.02] cursor-pointer" : "opacity-60"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden="true">{c.icon ?? "📚"}</span>
                    <CardTitle className="text-lg leading-tight">{c.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {c.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
                  )}
                  {hasQuestions ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-semibold">{c.answeredCount}/{c.publishedCount}</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  ) : (
                    <Badge variant="outline">
                      <BookOpen className="h-3 w-3 mr-1" />
                      No questions yet
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );

            return hasQuestions ? (
              <Link key={c.id} href={`/quiz/${c.slug}`}>{inner}</Link>
            ) : (
              <div key={c.id}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
