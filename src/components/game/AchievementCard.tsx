"use client";

import { motion } from "framer-motion";
import type { Achievement } from "@/lib/types";
import { Award, Coins, Crown, Lock, Star } from "lucide-react";
import { ProgressBar } from "./ProgressBar";

export const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case "common": return "text-gray-600 bg-gray-100";
            case "uncommon": return "text-green-600 bg-green-100";
            case "rare": return "text-blue-600 bg-blue-100";
            case "epic": return "text-purple-600 bg-purple-100";
            case "legendary": return "text-yellow-600 bg-yellow-100";
            default: return "text-gray-600 bg-gray-100";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border-2 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 ${
                achievement.completed
                    ? "border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50"
                    : "border-gray-200 hover:border-accent"
            }`}
            whileHover={{ scale: 1.02 }}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`text-4xl ${achievement.completed ? "" : "grayscale opacity-60"}`}>
                        {achievement.icon}
                    </div>
                    <div>
                        <h3 className={`text-lg font-semibold ${achievement.completed ? "text-yellow-800" : "text-card-foreground"}`}>
                            {achievement.title}
                        </h3>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${getRarityColor(achievement.rarity)}`}>
                            {achievement.rarity}
                        </span>
                    </div>
                </div>
                {achievement.completed && <Crown className="h-6 w-6 text-yellow-500" />}
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
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
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
