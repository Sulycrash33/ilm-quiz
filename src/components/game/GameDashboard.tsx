"use client";

import { motion } from "framer-motion";
import { DailyHadith } from "@/components/game/DailyHadith";
import { HomeActions } from "@/components/game/HomeActions";
import { KnowledgeCategories } from "@/components/game/KnowledgeCategories";
import { RankBadge } from "@/components/game/RankBadge";
import { StreakCounter } from "@/components/game/StreakCounter";
import { UserStats } from "@/components/game/UserStats";
import { DailyProgressCard } from "@/components/game/DailyProgressCard";
import { PrayerTimesCard } from "./PrayerTimesCard";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DailyLoginRewards } from "./DailyLoginRewards";
import { Target } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { useTodayStats } from "@/hooks/use-today-stats";
import { DAILY_REWARDS } from "@/lib/achievements-data";
import { Skeleton } from "@/components/ui/skeleton";

const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export function GameDashboard() {
  const { profile, loading, updateProfile } = useProfile();
  const { questionsToday, accuracy } = useTodayStats();
  const dailyStreak = Math.min((profile?.streakCount ?? 0) + 1, DAILY_REWARDS.length);

  const handleClaim = (day: number) => {
    if (day !== dailyStreak || !profile) return;
    const reward = DAILY_REWARDS[day - 1];
    updateProfile({ streakCount: day, coins: profile.coins + reward.coins, totalXp: profile.totalXp + reward.xp });
  };

  return <motion.div className="container mx-auto px-4 py-6 max-w-5xl" initial="hidden" animate="visible" variants={cardVariants}>
    <motion.div className="text-center mb-8" variants={cardVariants}>
      {loading ? <Skeleton className="h-9 w-72 mx-auto mb-2" /> : <h1 className="text-3xl font-bold font-headline text-primary">Assalamu Alaikum{profile?.displayName ? `, ${profile.displayName}` : ''}!</h1>}
      <p className="text-muted-foreground text-lg">Your next meaningful win is a short round away.</p>
    </motion.div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"><motion.div variants={cardVariants}><PrayerTimesCard /></motion.div><motion.div variants={cardVariants}><DailyHadith /></motion.div></div>
    <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" variants={cardVariants}><RankBadge currentPoints={profile?.totalXp ?? 0} /><StreakCounter streak={profile?.streakCount ?? 0} /><UserStats coins={profile?.coins ?? 0} /></motion.div>
    <motion.div variants={cardVariants} className="mb-8"><Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-accent/5"><CardHeader><CardTitle className="flex items-center gap-2 font-headline text-primary"><Target className="h-6 w-6" />Your next move</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6"><DailyProgressCard questionsToday={questionsToday} accuracy={accuracy} /><DailyLoginRewards dailyStreak={dailyStreak} onClaim={handleClaim} /></CardContent></Card></motion.div>
    <motion.div className="mb-8" variants={cardVariants}><HomeActions /></motion.div><motion.div variants={cardVariants}><KnowledgeCategories /></motion.div>
  </motion.div>;
}
