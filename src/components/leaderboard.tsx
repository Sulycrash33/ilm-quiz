"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GLOBAL_LEADERBOARD, WEEKLY_LEADERS, CATEGORY_LEADERS } from '@/lib/leaderboard-data';
import { LeaderboardItem } from './game/LeaderboardItem';
import { CategoryLeaderItem } from './game/CategoryLeaderItem';
import { Globe, Calendar, LayoutGrid } from 'lucide-react';

export function Leaderboard() {
  const [selectedTab, setSelectedTab] = useState('global');

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="global">
          <Globe className="h-4 w-4 mr-2" />
          Global
        </TabsTrigger>
        <TabsTrigger value="weekly">
          <Calendar className="h-4 w-4 mr-2" />
          This Week
        </TabsTrigger>
        <TabsTrigger value="category">
          <LayoutGrid className="h-4 w-4 mr-2" />
          By Category
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="global" className="space-y-4">
          <div className="space-y-3">
            {GLOBAL_LEADERBOARD.map((user, index) => (
              <LeaderboardItem key={user.rank} user={user} index={index} isPodium={index < 3} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <div className="space-y-3">
            {WEEKLY_LEADERS.map((user, index) => (
              <LeaderboardItem key={user.rank} user={user} index={index} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="category">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CATEGORY_LEADERS.map((category) => (
              <CategoryLeaderItem key={category.category} category={category} />
            ))}
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
