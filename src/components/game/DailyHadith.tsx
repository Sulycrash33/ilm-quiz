"use client";

import { DAILY_HADITH } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export function DailyHadith() {
  const { t } = useLanguage();
  return (
    <Card className="h-full bg-tertiary/10 border-tertiary/30">
      <CardContent className="pt-6 flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="font-semibold font-headline text-tertiary mb-3">{t("dailyHadith")}</h3>
          {/*
            The attribution used to be joined on with a spaced hyphen, which the
            copy rule forbids in anything a player reads. A citation does not
            need a dash to be a citation: `cite` is the element the sentence was
            asking for, and putting it on its own line reads as an attribution
            without punctuation doing the work.
          */}
          <blockquote className="font-quote-italic text-quote-italic italic text-on-surface/80">
            "{DAILY_HADITH.text}"
          </blockquote>
          <cite className="mt-2 block font-label-caps text-label-caps not-italic text-on-surface-variant">
            {DAILY_HADITH.source}
          </cite>
        </div>
      </CardContent>
    </Card>
  );
}
