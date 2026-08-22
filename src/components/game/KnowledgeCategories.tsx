"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getCategoriesWithProgress } from "@/lib/quiz-service";
import { useLanguage } from "@/contexts/LanguageContext";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  publishedCount: number;
  answeredCount: number;
}

export function KnowledgeCategories() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategoriesWithProgress()
      .then((cats) => {
        setCategories(cats as Category[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
          {t("knowledgeCategories")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))
          ) : (
            categories.slice(0, 9).map((category) => (
              <Button
                key={category.id}
                asChild
                variant="outline"
                className="h-20 justify-start text-left flex-col items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
              >
                <Link href={`/quiz/${category.slug}`}>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">{category.icon || "📚"}</span>
                    <span className="text-sm font-medium text-center">{category.name}</span>
                  </div>
                </Link>
              </Button>
            ))
          )}
          <Button
            asChild
            variant="outline"
            className="h-20 justify-start text-left flex-col items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 bg-slate-100 text-slate-800 hover:bg-slate-200"
          >
            <Link href="/quiz">
              <div className="flex flex-col items-center gap-1">
                <Plus className="h-6 w-6" />
                <span className="text-sm font-medium">{t("moreEllipsis")}</span>
              </div>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
