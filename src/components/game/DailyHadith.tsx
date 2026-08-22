"use client";

import { DAILY_HADITH } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export function DailyHadith() {
  const { t } = useLanguage();
  return (
    <Card className="h-full bg-emerald-400/10 border-emerald-400/30">
      <CardContent className="pt-6 flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="font-semibold font-headline text-emerald-400 mb-3">{t("dailyHadith")}</h3>
          <blockquote className="font-amiri text-foreground/80 italic text-lg leading-relaxed">
            "{DAILY_HADITH.text}" - {DAILY_HADITH.source}
          </blockquote>
        </div>
      </CardContent>
    </Card>
  );
}
