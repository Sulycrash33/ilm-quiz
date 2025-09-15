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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function GameDashboard() {
  const [userPoints] = useState(750);
  const [streak] = useState(7);
  const [coins] = useState(1250);
  const [questionsToday] = useState(13);
  const [accuracy] = useState(87);
  const [dailyProgress] = useState(65);

  return (
    <motion.div
      className="container mx-auto px-4 py-6 max-w-4xl"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <motion.div className="text-center mb-8" variants={cardVariants}>
        <h1 className="text-2xl font-bold text-primary mb-2">Assalamu Alaikum, Seeker!</h1>
        <p className="text-muted-foreground text-base">Ready to expand your Islamic knowledge today?</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" variants={cardVariants}>
        <RankBadge currentPoints={userPoints} />
        <StreakCounter streak={streak} />
        <UserStats coins={coins} />
      </motion.div>

      <motion.div variants={cardVariants} className="mb-8">
        <DailyProgressCard
          questionsToday={questionsToday}
          accuracy={accuracy}
          dailyProgress={dailyProgress}
        />
      </motion.div>

      <motion.div variants={cardVariants} className="mb-8">
        <DailyHadith />
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
