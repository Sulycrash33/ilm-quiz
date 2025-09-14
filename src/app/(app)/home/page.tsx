import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RankBadge } from "@/components/game/RankBadge";
import { ProgressRing } from "@/components/game/ProgressRing";
import { StreakCounter } from "@/components/game/StreakCounter";
import { DailyHadith } from "@/components/game/DailyHadith";
import { HomeActions } from "@/components/game/HomeActions";

// Mock user data
const userData = {
  username: "Aisha",
  points: 450,
  dailyGoalProgress: 75,
  streak: 5,
};

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-2xl p-4 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Assalamu Alaikum,</h1>
          <p className="text-3xl font-bold text-primary">{userData.username}!</p>
        </div>
      </header>
      
      <RankBadge currentPoints={userData.points} />

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm border-accent/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Goal</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ProgressRing progress={userData.dailyGoalProgress} />
          </CardContent>
        </Card>
        <StreakCounter streak={userData.streak} />
      </div>

      <DailyHadith />

      <HomeActions />

      <div className="hidden md:block p-4 text-center text-muted-foreground">
        <p>Use the Quiz tab to start learning!</p>
      </div>

    </div>
  );
}
