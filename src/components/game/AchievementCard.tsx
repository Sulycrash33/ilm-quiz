"use client";

import { motion } from "framer-motion";
import type { Achievement } from "@/lib/types";
import { Award, Coins, Crown, Lock, Star } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { RARITY_STYLES, type AchievementRarity } from "@/lib/design-tokens";

export const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
    const rarity = RARITY_STYLES[(achievement.rarity as AchievementRarity) ?? "common"];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border-2 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 ${
                achievement.completed
                    ? "border-primary/30 bg-primary/5"
                    : "border-border hover:border-accent"
            }`}
            whileHover={{ scale: 1.02 }}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`text-4xl ${achievement.completed ? "" : "grayscale opacity-60"}`}>
                        {achievement.icon}
                    </div>
                    <div>
                        <h3 className={`text-lg font-semibold font-headline ${achievement.completed ? "text-primary" : "text-card-foreground"}`}>
                            {achievement.title}
                        </h3>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${rarity.text} ${rarity.bg}`}>
                            {achievement.rarity}
                        </span>
                    </div>
                </div>
                {achievement.completed && <Crown className="h-6 w-6 text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground mt-2">{achievement.description}</p>
            <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span className="font-semibold">{achievement.progress}/{achievement.target}</span>
                </div>
                <ProgressBar value={(achievement.progress / achievement.target) * 100} />
            </div>
            <div className="flex items-center justify-between mt-4 pt-2 border-t">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Coins className="h-3 w-3" /> {achievement.reward.coins}
                    </span>
                    <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" /> {achievement.reward.xp} XP
                    </span>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                    achievement.completed
                        ? "bg-jade-soft text-jade"
                        : "bg-muted text-muted-foreground"
                }`}>
                    {achievement.completed ? (
                        <>
                            <Award className="h-3 w-3 mr-1" /> Completed
                        </>
                    ) : (
                        <>
                            <Lock className="h-3 w-3 mr-1" /> Locked
                        </>
                    )}
                </span>
            </div>
        </motion.div>
    );
};
