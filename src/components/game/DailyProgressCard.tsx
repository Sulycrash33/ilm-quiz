"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Sparkles } from "lucide-react";
import { REWARD_RULES } from "@/lib/gamification";
import { useLanguage } from "@/contexts/LanguageContext";

interface DailyProgressCardProps { questionsToday: number; accuracy: number | null; }

export function DailyProgressCard({ questionsToday, accuracy }: DailyProgressCardProps) {
  const { t } = useLanguage();
  const dailyProgress = Math.min(100, Math.round((questionsToday / REWARD_RULES.dailyMissionQuestions) * 100));
  const complete = questionsToday >= REWARD_RULES.dailyMissionQuestions;
  return <Card className="border-2 border-primary/20 shadow-lg h-full"><CardHeader><CardTitle className="flex items-center gap-2 font-headline text-primary"><Target className="h-5 w-5" aria-hidden="true" />{t("todaysMission")} <Sparkles className="h-4 w-4 ml-auto text-accent" /></CardTitle></CardHeader><CardContent className="space-y-5"><div><div className="flex items-end justify-between"><div><div className="text-3xl font-bold text-primary tabular-nums">{questionsToday}/{REWARD_RULES.dailyMissionQuestions}</div><div className="text-sm text-muted-foreground">{t("questionsAnsweredLower")}</div></div><div className="text-right"><div className="text-2xl font-bold text-success tabular-nums">{accuracy === null ? '—' : `${accuracy}%`}</div><div className="text-xs text-muted-foreground">{t("todaysAccuracy")}</div></div></div><Progress value={dailyProgress} className="mt-4 h-2" aria-label={`Daily mission progress: ${dailyProgress}%`} /></div><div className={`rounded-lg p-3 text-sm ${complete ? 'bg-success/10 text-success' : 'bg-secondary text-secondary-foreground'}`}><strong>{complete ? t("missionCompleteLabel") : t("nextMove")}</strong><div>{complete ? t("dailyMissionComplete") : t("questionsToFinishMission", { count: REWARD_RULES.dailyMissionQuestions - questionsToday })}</div></div></CardContent></Card>;
}
