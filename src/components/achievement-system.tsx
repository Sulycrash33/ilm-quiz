"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { Trophy, Star, Shield } from "lucide-react";
import { ACHIEVEMENTS_DATA, DAILY_CHALLENGES_DATA, WEEKLY_CHALLENGES_DATA } from "@/lib/achievements-data";
import { AchievementCard } from "@/components/game/AchievementCard";
import { ChallengeCard } from "./game/ChallengeCard";

export function AchievementSystem() {
    const { t } = useLanguage();
    return (
        <div className="w-full">
            <Tabs defaultValue="achievements" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="achievements">
                    <Star className="h-4 w-4 mr-2" />
                    {t("achievements")}
                </TabsTrigger>
                <TabsTrigger value="daily">
                    <Trophy className="h-4 w-4 mr-2" />
                    {t("dailyChallenges")}
                </TabsTrigger>
                <TabsTrigger value="weekly">
                    <Shield className="h-4 w-4 mr-2" />
                    {t("weeklyChallenges")}
                </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="achievements">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {ACHIEVEMENTS_DATA.map((achievement) => (
                                <AchievementCard
                                    key={achievement.id}
                                    title={achievement.title}
                                    description={achievement.description}
                                    icon={achievement.icon}
                                    progress={achievement.progress}
                                    maxProgress={achievement.target}
                                    reward={`${achievement.reward.xp} XP`}
                                    isUnlocked={achievement.completed}
                                />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="daily">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {DAILY_CHALLENGES_DATA.map((challenge) => (
                                <ChallengeCard key={challenge.id} challenge={challenge} type="daily" />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="weekly">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {WEEKLY_CHALLENGES_DATA.map((challenge) => (
                                <ChallengeCard key={challenge.id} challenge={challenge} type="weekly" />
                            ))}
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}