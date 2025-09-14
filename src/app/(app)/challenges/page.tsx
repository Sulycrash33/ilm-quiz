"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Gift } from "lucide-react";
import type { Achievement, Challenge } from "@/lib/types";
import { ACHIEVEMENTS_DATA, DAILY_CHALLENGES_DATA, WEEKLY_CHALLENGES_DATA } from "@/lib/achievements-data";
import { AchievementCard } from "@/components/game/AchievementCard";
import { ChallengeCard } from "@/components/game/ChallengeCard";
import { ProgressBar } from "@/components/game/ProgressBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RewardCenter } from "@/components/game/RewardCenter";

export default function AchievementsPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
    const [weeklyChallenges, setWeeklyChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            setAchievements(ACHIEVEMENTS_DATA);
            setDailyChallenges(DAILY_CHALLENGES_DATA);
            setWeeklyChallenges(WEEKLY_CHALLENGES_DATA);
        } catch (error) {
            setError('Failed to load achievements');
        } finally {
            setLoading(false);
        }
    }, []);

    const filteredAchievements = selectedCategory === 'all'
        ? achievements
        : achievements.filter((a) => a.category.toLowerCase() === selectedCategory.toLowerCase());

    const completedCount = achievements.filter((a) => a.completed).length;
    const totalCount = achievements.length;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-destructive text-center p-4">
                Error: {error}
                <Button
                    className="mt-2"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            <header className="flex items-center justify-between mb-8">
                <Button asChild variant="ghost" className="flex items-center gap-2">
                  <Link href="/home">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Link>
                </Button>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-primary mb-2">Challenges & Rewards</h1>
                    <p className="text-muted-foreground">Earn achievements and claim your rewards.</p>
                </div>
                <div className="w-20" />
            </header>

            <Tabs defaultValue="achievements" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="achievements">
                    <Trophy className="h-4 w-4 mr-2" />
                    Achievements & Challenges
                  </TabsTrigger>
                  <TabsTrigger value="rewards">
                    <Gift className="h-4 w-4 mr-2" />
                    Reward Center
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="achievements" className="mt-6">
                    <motion.div
                        className="mb-8 border-2 border-accent/20 rounded-lg shadow-lg p-6 bg-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Trophy className="h-8 w-8 text-accent" />
                                <div>
                                    <h3 className="text-xl font-bold text-card-foreground">Achievement Progress</h3>
                                    <p className="text-muted-foreground">Keep unlocking new milestones!</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-primary">
                                    {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                                </div>
                                <div className="text-sm text-muted-foreground">Complete</div>
                            </div>
                        </div>
                        <ProgressBar value={totalCount > 0 ? (completedCount / totalCount) * 100 : 0} />
                    </motion.div>

                    <div className="space-y-12">
                        <div>
                          <h2 className="text-2xl font-bold text-primary mb-4 text-center">Achievements</h2>
                          <div className="flex flex-wrap gap-2 justify-center mb-6">
                              {["all", "Beginner", "Progress", "Dedication", "Mastery", "Excellence"].map(
                                  (category) => (
                                      <motion.button
                                          key={category}
                                          onClick={() => setSelectedCategory(category)}
                                          className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                                              selectedCategory === category
                                                  ? "bg-primary text-primary-foreground"
                                                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                          }`}
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          aria-label={`Filter by ${category} category`}
                                      >
                                          {category.charAt(0).toUpperCase() + category.slice(1)}
                                      </motion.button>
                                  )
                              )}
                          </div>

                          <AnimatePresence>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {filteredAchievements.map((achievement) => (
                                      <AchievementCard key={achievement.id} achievement={achievement} />
                                  ))}
                              </div>
                          </AnimatePresence>
                        </div>

                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-primary mb-2">Daily Challenges</h2>
                                <p className="text-muted-foreground">Complete these challenges before they reset!</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {dailyChallenges.map((challenge) => (
                                    <ChallengeCard key={challenge.id} challenge={challenge} type="daily" />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-primary mb-2">Weekly Challenges</h2>
                                <p className="text-muted-foreground">Bigger challenges, bigger rewards!</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {weeklyChallenges.map((challenge) => (
                                    <ChallengeCard key={challenge.id} challenge={challenge} type="weekly" />
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="rewards" className="mt-6">
                    <RewardCenter />
                </TabsContent>
            </Tabs>
        </div>
    );
}
