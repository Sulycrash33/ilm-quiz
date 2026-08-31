"use client"

import { motion } from "framer-motion"
import { PremiumAvatar } from "@/components/ui/premium-avatar"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { useLanguage } from "@/contexts/LanguageContext";

interface Friend {
  id: string
  name: string
  avatar?: string
  status: "online" | "offline" | "away"
  xp: number
  rank: string
  isOnline: boolean
}

interface FriendsListProps {
  friends: Friend[]
}

export function FriendsList({ friends }: FriendsListProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-3">
      {friends.map((friend, index) => (
        <motion.div
          key={friend.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ x: 5 }}
          className="glass-card p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <PremiumAvatar
              src={friend.avatar}
              size="md"
              status={friend.status}
            />
            <div>
              <p className="font-bold text-on-surface">{friend.name}</p>
              <p className="text-sm text-on-surface-variant">{friend.rank}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold text-primary">{friend.xp} {t("barakahShort")}</p>
              <p className="text-xs text-on-surface-variant">
                {friend.isOnline ? t("online") : t("offline")}
              </p>
            </div>
            {friend.isOnline && (
              <PremiumBadge variant="success" size="sm">
                {t("liveLabel")}
              </PremiumBadge>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
