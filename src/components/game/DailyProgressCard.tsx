import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

const DAILY_GOAL = 20;

interface DailyProgressCardProps {
  questionsToday: number;
  accuracy: number | null;
}

export function DailyProgressCard({ questionsToday, accuracy }: DailyProgressCardProps) {
    const dailyProgress = Math.min(100, Math.round((questionsToday / DAILY_GOAL) * 100));

    return (
        <Card className="border-2 border-primary/20 shadow-lg h-full">
            <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-primary">
                <Target className="h-5 w-5" aria-hidden="true" />
                Today's Progress
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{questionsToday}</div>
                    <div className="text-sm text-muted-foreground">Questions Answered</div>
                    <div className="text-xs text-primary/80 mt-1">Goal: {DAILY_GOAL}</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-jade mb-1">
                        {accuracy === null ? "—" : `${accuracy}%`}
                    </div>
                    <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                    <div className="text-xs text-jade/80 mt-1">
                        {accuracy === null ? "Answer a question to see this" : "Today"}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-amethyst mb-1">{dailyProgress}%</div>
                    <div className="text-sm text-muted-foreground">Daily Goal</div>
                    <Progress
                        value={dailyProgress}
                        className="mt-2 h-2"
                        aria-label={`Daily progress: ${dailyProgress}%`}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
