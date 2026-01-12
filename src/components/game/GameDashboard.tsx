"use client"

import { useState } from "react";
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
import { Gift, Target } from "lucide-react";


const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function GameDashboard() {
  const [userPoints, setUserPoints] = useState(750);
  const [streak, setStreak] = useState(7);
  const [coins, setCoins] = useState(1250);
  const [questionsToday] = useState(13);
  const [accuracy] = useState(87);
  const [dailyProgress] = useState(65);

  return (
    <motion.div
      className="container mx-auto px-4 py-6 max-w-5xl"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <motion.div className="text-center mb-8" variants={cardVariants}>
        <h1 className="text-3xl font-bold text-primary mb-2">Assalamu Alaikum, Zainab!</h1>
        <p className="text-muted-foreground text-lg">Ready to expand your Islamic knowledge today?</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div variants={cardVariants}>
            <PrayerTimesCard />
        </motion.div>
        <motion.div variants={cardVariants}>
           <DailyHadith />
        </motion.div>
      </div>
      
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" variants={cardVariants}>
        <RankBadge currentPoints={userPoints} />
        <StreakCounter streak={streak} />
        <UserStats coins={coins} />
      </motion.div>

      <motion.div variants={cardVariants} className="mb-8">
        <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Target className="h-6 w-6" />
                    Today's Missions
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DailyProgressCard
                    questionsToday={questionsToday}
                    accuracy={accuracy}
                    dailyProgress={dailyProgress}
                />
                 <DailyLoginRewards coins={coins} setCoins={setCoins} />
            </CardContent>
        </Card>
      </motion.div>


      <motion.div className="mb-8" variants={cardVariants}>
          <HomeActions />
      </motion.div>

      <motion.div variants={cardVariants}>
        <KnowledgeCategories />
      </motion.div>
    </motion.div>
  );
}
