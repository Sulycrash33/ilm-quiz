import { DAILY_HADITH } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";

export function DailyHadith() {
  return (
    <Card className="mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10">
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="font-semibold text-primary mb-3">Daily Hadith</h3>
          <blockquote className="text-foreground/80 italic text-lg leading-relaxed">
            "{DAILY_HADITH.text}" - {DAILY_HADITH.source}
          </blockquote>
        </div>
      </CardContent>
    </Card>
  );
}
