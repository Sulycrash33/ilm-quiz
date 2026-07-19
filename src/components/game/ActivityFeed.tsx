"use client"

import { motion } from "framer-motion"
import { PremiumAvatar } from "@/components/ui/premium-avatar"

interface Activity {
  id: string
  user: {
    name: string
    avatar?: string
  }
  action: string
  target: string
  timestamp: string
  type: "achievement" | "quiz" | "streak" | "purchase" | "join"
}

interface ActivityFeedProps {
  activities: Activity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "achievement":
        return <span className="text-xl">🏆</span>
      case "quiz":
        return <span className="text-xl">📝</span>
      case "streak":
        return <span className="text-xl">🔥</span>
      case "purchase":
        return <span className="text-xl">🛒</span>
      case "join":
        return <span className="text-xl">👋</span>
      default:
        return <span className="text-xl">✨</span>
    }
  }

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "achievement":
        return "bg-tertiary/10"
      case "quiz":
        return "bg-primary/10"
      case "streak":
        return "bg-orange-500/10"
      case "purchase":
        return "bg-secondary/10"
      case "join":
        return "bg-green-500/10"
      default:
        return "bg-surface-container-high"
    }
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="glass-card p-4 flex items-start gap-3"
        >
          {/* Icon */}
          <div
            className={`
              w-10 h-10 rounded-full
              flex items-center justify-center
              ${getActivityColor(activity.type)}
            `}
          >
            {getActivityIcon(activity.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-on-surface">
              <span className="font-bold">{activity.user.name}</span>{" "}
              <span className="text-on-surface-variant">{activity.action}</span>{" "}
              <span className="font-bold text-primary">{activity.target}</span>
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              {activity.timestamp}
            </p>
          </div>

          {/* User Avatar */}
          <PremiumAvatar src={activity.user.avatar} size="sm" />
        </motion.div>
      ))}
    </div>
  )
}
