import { DAILY_HADITH } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Pilcrow } from "lucide-react";

export function DailyHadith() {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-accent/20 shadow-md">
      <CardContent className="p-4 text-center">
        <Pilcrow className="mx-auto h-6 w-6 text-accent mb-2" />
        <p className="mb-2 text-lg italic text-foreground">
          "{DAILY_HADITH.text}"
        </p>
        <p className="text-sm font-medium text-muted-foreground font-headline">
          - {DAILY_HADITH.source}
        </p>
      </CardContent>
    </Card>
  );
}
