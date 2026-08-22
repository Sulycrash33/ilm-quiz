"use client";

import { motion } from "framer-motion";
import type { Challenge } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "./ProgressBar";
import { Calendar, Coins, Shield, Star } from "lucide-react";

export const ChallengeCard: React.FC<{ challenge: Challenge; type: 'daily' | 'weekly' }> = ({ challenge, type }) => {
  const { t } = useLanguage();
  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-2 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 ${
            type === 'daily' ? 'border-blue-400/30' : 'border-purple-400/30'
        }`}
        whileHover={{ scale: 1.02 }}
    >
        <div className="flex items-center gap-3">
            <div className="text-4xl">{challenge.icon}</div>
            <div>
                <h3 className={`text-lg font-semibold font-headline ${type === 'daily' ? 'text-blue-400' : 'text-purple-400'}`}>
                    {challenge.title}
                </h3>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs border ${
                    type === 'daily' ? 'border-blue-400/40 text-blue-400' : 'border-purple-400/40 text-purple-400'
                }`}>
                    <Calendar className="h-3 w-3 mr-1" /> {challenge.timeLeft}
                </span>
            </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{challenge.description}</p>
        <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
                <span>{t("progress")}</span>
                <span className="font-semibold">{challenge.progress}/{challenge.target}</span>
            </div>
            <ProgressBar value={(challenge.progress / challenge.target) * 100} />
        </div>
        <div className="flex items-center justify-between mt-4 pt-2 border-t">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Coins className="h-3 w-3" /> {challenge.reward.coins}
                </span>
                <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" /> {challenge.reward.xp} XP
                </span>
                {challenge.reward.badge && (
                    <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" /> {t("badgeLabel")}
                    </span>
                )}
            </div>
            <Button
                size="sm"
                className={`text-white ${
                    type === 'daily' ? 'bg-blue-400 hover:bg-blue-400/90' : 'bg-purple-400 hover:bg-purple-400/90'
                }`}
            >
                {t("startChallenge")}
            </Button>
        </div>
    </motion.div>
);
};
