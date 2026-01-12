
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

interface DailyProgressCardProps {
  questionsToday: number;
  accuracy: number;
  dailyProgress: number;
}

export function DailyProgressCard({ questionsToday, accuracy, dailyProgress }: DailyProgressCardProps) {
    return (
        <Card className="border-2 border-blue-200/50 shadow-lg h-full">
            <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
                <Target className="h-5 w-5" aria-hidden="true" />
                Today's Progress
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{questionsToday}</div>
                    <div className="text-sm text-muted-foreground">Questions Answered</div>
                    <div className="text-xs text-primary/80 mt-1">Goal: 20</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{accuracy}%</div>
                    <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                    <div className="text-xs text-blue-500 mt-1">Personal Best: 92%</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">{dailyProgress}%</div>
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
