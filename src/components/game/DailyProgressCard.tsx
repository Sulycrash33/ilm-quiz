import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Sparkles } from "lucide-react";
import { REWARD_RULES, dailyMissionCopy } from "@/lib/gamification";

interface DailyProgressCardProps { questionsToday: number; accuracy: number | null; }

export function DailyProgressCard({ questionsToday, accuracy }: DailyProgressCardProps) {
  const dailyProgress = Math.min(100, Math.round((questionsToday / REWARD_RULES.dailyMissionQuestions) * 100));
  const complete = questionsToday >= REWARD_RULES.dailyMissionQuestions;
  return <Card className="border-2 border-primary/20 shadow-lg h-full"><CardHeader><CardTitle className="flex items-center gap-2 font-headline text-primary"><Target className="h-5 w-5" aria-hidden="true" />Todayâ€™s mission <Sparkles className="h-4 w-4 ml-auto text-accent" /></CardTitle></CardHeader><CardContent className="space-y-5"><div><div className="flex items-end justify-between"><div><div className="text-3xl font-bold text-primary tabular-nums">{questionsToday}/{REWARD_RULES.dailyMissionQuestions}</div><div className="text-sm text-muted-foreground">questions answered</div></div><div className="text-right"><div className="text-2xl font-bold text-emerald-400 tabular-nums">{accuracy === null ? 'â€”' : `${accuracy}%`}</div><div className="text-xs text-muted-foreground">todayâ€™s accuracy</div></div></div><Progress value={dailyProgress} className="mt-4 h-2" aria-label={`Daily mission progress: ${dailyProgress}%`} /></div><div className={`rounded-lg p-3 text-sm ${complete ? 'bg-emerald-400/10 text-emerald-400' : 'bg-secondary text-secondary-foreground'}`}><strong>{complete ? 'Mission complete' : 'Next move'}</strong><div>{dailyMissionCopy(questionsToday, 0)}</div></div></CardContent></Card>;
}
