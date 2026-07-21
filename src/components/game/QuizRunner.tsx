"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, BookOpen } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";
import { QuizView } from "./QuizView";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuizRunnerProps {
  categoryName: string;
  categoryDescription: string | null;
  categoryIcon: string | null;
  questions: QuizQuestion[];
}

export function QuizRunner({ categoryName, categoryDescription, categoryIcon, questions }: QuizRunnerProps) {
  const [started, setStarted] = useState(false);
  const { t, dir } = useLanguage();

  if (started) {
    return (
      <div dir={dir} className="container mx-auto px-4 py-6 max-w-4xl">
        <QuizView questions={questions} categoryTitle={categoryName} onExit={() => setStarted(false)} />
      </div>
    );
  }

  return (
    <div dir={dir} className="container mx-auto px-4 py-6 max-w-3xl">
      <header className="mb-8 flex items-center justify-between">
        <Button asChild variant="ghost">
          <Link href="/quiz">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToCategories")}
          </Link>
        </Button>
      </header>

      <Card className="border-2 border-primary/20 shadow-lg text-center">
        <CardHeader>
          <div className="text-5xl mb-2" aria-hidden="true">{categoryIcon ?? "📚"}</div>
          <CardTitle className="text-2xl text-primary">{categoryName}</CardTitle>
          {categoryDescription && <p className="text-muted-foreground">{categoryDescription}</p>}
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.length === 0 ? (
            <div className="py-8 space-y-3">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                {t("questionsBeingPrepared", { category: categoryName })}
              </p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground">
                {questions.length} {t("questions").toLowerCase()}
              </p>
              <Button size="lg" onClick={() => setStarted(true)}>
                <Play className="h-5 w-5 mr-2" />
                {t("startQuiz")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
