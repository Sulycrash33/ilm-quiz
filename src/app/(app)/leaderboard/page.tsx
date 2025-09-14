"use client";

import { useState, useMemo } from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users } from "lucide-react";
import { motion } from "framer-motion";

import type { LeaderboardUser, CategoryLeader } from "@/lib/types";
import { GLOBAL_LEADERBOARD, WEEKLY_LEADERS, CATEGORY_LEADERS } from "@/lib/leaderboard-data";
import { LeaderboardItem } from "@/components/game/LeaderboardItem";
import { CategoryLeaderItem } from "@/components/game/CategoryLeaderItem";

export default function LeaderboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"global" | "weekly" | "categories" | "friends">("global");
  
  const currentUser = useMemo(
    () => ({
      rank: 47,
      points: 8420,
      name: "Suleiman (You)",
      rank_title: "Talib",
      country: "🇺🇸",
      avatar: "S",
      weeklyPoints: 340,
    }),
    []
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <header className="flex items-center justify-between mb-8">
        <Button asChild variant="ghost" className="flex items-center gap-2">
            <Link href="/community">
                <ArrowLeft className="h-4 w-4" /> Back to Community
            </Link>
        </Button>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank among fellow learners</p>
        </div>
        <div className="w-40" />
      </header>

      <Card className="mb-8 border-2 border-primary/20 shadow-lg bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-4 border-primary/50">
                  <AvatarFallback className="text-xl font-bold bg-secondary text-secondary-foreground">
                    {currentUser.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  #{currentUser.rank}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">{currentUser.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge className="bg-secondary text-secondary-foreground">{currentUser.rank_title}</Badge>
                  <span className="text-sm text-muted-foreground">{currentUser.country}</span>
                </div>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-2xl font-bold text-primary">{currentUser.points.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
              <div className="text-xs text-primary/80 mt-1">+{currentUser.weeklyPoints} this week</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="global">All Time</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-6">
          <Card className="border-2 border-yellow-200 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="pt-8 pb-8">
              {GLOBAL_LEADERBOARD.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-8">
                  {GLOBAL_LEADERBOARD.slice(1, 2).map((user, index) => ( // 2nd place
                    <motion.div key={user.rank} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center order-2 sm:order-1">
                      <PodiumItem user={user} index={1} />
                    </motion.div>
                  ))}
                  {GLOBAL_LEADERBOARD.slice(0, 1).map((user, index) => ( // 1st place
                     <motion.div key={user.rank} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center order-1 sm:order-2">
                      <PodiumItem user={user} index={0} />
                    </motion.div>
                  ))}
                  {GLOBAL_LEADERBOARD.slice(2, 3).map((user, index) => ( // 3rd place
                     <motion.div key={user.rank} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center order-3 sm:order-3">
                      <PodiumItem user={user} index={2} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No leaderboard data available.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-primary">Global Rankings (4-10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" role="list">
                {GLOBAL_LEADERBOARD.length > 3 ? (
                  GLOBAL_LEADERBOARD.slice(3).map((user, index) => (
                    <LeaderboardItem key={user.rank} user={user} index={index + 3} />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">No further rankings available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">This Week's Champions</h2>
            <p className="text-muted-foreground">Top performers from the last 7 days</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {WEEKLY_LEADERS.length > 0 ? (
              WEEKLY_LEADERS.map((user, index) => (
                <Card key={user.rank} className={`border-2 shadow-lg ${ index === 0 ? "border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50" : index === 1 ? "border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50" : "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"}`}>
                    <CardContent className="pt-6 text-center">
                        <LeaderboardItem user={user} index={index} isPodium />
                    </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground col-span-3">No weekly leaders available.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">Category Champions</h2>
            <p className="text-muted-foreground">Leaders in each knowledge area</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {CATEGORY_LEADERS.length > 0 ? (
              CATEGORY_LEADERS.map((category, index) => (
                <CategoryLeaderItem key={category.category} category={category} />
              ))
            ) : (
              <p className="text-center text-muted-foreground col-span-2">No category leaders available.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="friends" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">Friends Leaderboard</h2>
            <p className="text-muted-foreground">See how you compare with your friends</p>
          </div>
          <Card className="border-2 border-dashed border-blue-300 shadow-lg">
            <CardContent className="pt-8 text-center">
                <div className="mx-auto bg-blue-100 rounded-full h-20 w-20 flex items-center justify-center mb-4">
                    <Users className="h-10 w-10 text-blue-600" />
                </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Connect with Friends</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Add friends to see how you rank against each other and motivate your learning journey together.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Users className="h-4 w-4 mr-2" />
                Find Friends
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const PodiumItem = ({user, index}: {user: LeaderboardUser, index: number}) => {
    const podiumStyles = [
        { border: 'border-yellow-400', bg: 'bg-yellow-100', text: 'text-yellow-800', size: 'h-24 w-24', textSize: 'text-2xl', rankColor: 'text-yellow-600' },
        { border: 'border-gray-300', bg: 'bg-gray-100', text: 'text-gray-800', size: 'h-20 w-20', textSize: 'text-xl', rankColor: 'text-gray-600' },
        { border: 'border-amber-400', bg: 'bg-amber-100', text: 'text-amber-800', size: 'h-20 w-20', textSize: 'text-xl', rankColor: 'text-amber-600' }
    ];
    const style = podiumStyles[index];

    return (
        <div className="flex flex-col items-center">
             <div className="relative mb-2">
                <Avatar className={`mx-auto border-4 ${style.border} ${style.size}`}>
                    <AvatarFallback className={`font-bold ${style.bg} ${style.textSize}`}>
                        {user.avatar}
                    </AvatarFallback>
                </Avatar>
                 {user.badge && <div className={`absolute -top-2 -right-2 ${index === 0 ? 'text-4xl' : 'text-3xl'}`}>{user.badge}</div>}
             </div>
            <h3 className={`font-bold ${style.text} ${index === 0 ? 'text-lg' : ''}`}>{user.name}</h3>
            <Badge className={`${style.bg} ${style.text} mb-1`}>{user.rank_title}</Badge>
            <div className={`font-bold ${style.rankColor} ${index === 0 ? 'text-xl' : 'text-lg'}`}>{user.points.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">{user.country}</div>
        </div>
    )
}
