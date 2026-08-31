"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Flame } from "lucide-react";
import type { LeaderboardUser } from "@/lib/types";

export const LeaderboardItem = ({ user, index, isPodium = false }: { user: LeaderboardUser; index: number; isPodium?: boolean }) => {
  const podiumStyles = isPodium 
    ? index === 0 ? "border-primary bg-primary/10" 
    : index === 1 ? "border-muted-foreground/30 bg-muted" 
    : "border-warning bg-warning/10" 
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center justify-between p-3 rounded-lg ${isPodium ? podiumStyles : "bg-card hover:bg-muted/50"}`}
      role="listitem"
    >
      <div className="flex items-center gap-4">
        <div className="text-lg font-bold text-muted-foreground w-6 text-center">{user.rank}</div>
        <div className="relative">
          <Avatar className={`h-12 w-12`}>
            <AvatarFallback className="font-bold">{user.avatar}</AvatarFallback>
          </Avatar>
          {user.badge && <div className="absolute -top-1 -right-1 text-lg">{user.badge}</div>}
        </div>
        <div>
          <h4 className="font-semibold text-card-foreground">{user.name}</h4>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {user.rank_title}
            </Badge>
            <span className="text-sm text-muted-foreground">{user.country}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-base font-bold text-primary">{user.points.toLocaleString()} pts</div>
        {user.streak && (
          <div className="flex items-center justify-end gap-1 text-sm text-primary">
            <Flame className="h-3 w-3" />
            {user.streak} day streak
          </div>
        )}
        {user.questionsAnswered && (
          <div className="text-sm text-muted-foreground">{user.questionsAnswered} questions</div>
        )}
      </div>
    </motion.div>
  );
};
