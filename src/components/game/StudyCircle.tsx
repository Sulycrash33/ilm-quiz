"use client"

import { motion } from "framer-motion"
import { PremiumAvatar } from "@/components/ui/premium-avatar"
import { PremiumButton } from "@/components/ui/premium-button"

interface StudyCircleProps {
  name: string
  description: string
  members: { id: string; name: string; avatar?: string }[]
  maxMembers: number
  currentTopic: string
  isActive: boolean
  onJoin?: () => void
}

export function StudyCircle({
  name,
  description,
  members,
  maxMembers,
  currentTopic,
  isActive,
  onJoin,
}: StudyCircleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 mashrabiya-pattern rotate-12 opacity-50" />

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {name}
            </h3>
            <p className="text-sm text-on-surface-variant mt-1">
              {description}
            </p>
          </div>
          {isActive && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-bold">ACTIVE</span>
            </div>
          )}
        </div>

        {/* Current Topic */}
        <div className="bg-surface-container-high/50 rounded-lg p-3 mb-4">
          <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
            Current Topic
          </p>
          <p className="font-bold text-on-surface">{currentTopic}</p>
        </div>

        {/* Members */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex -space-x-2">
            {members.slice(0, 5).map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PremiumAvatar src={member.avatar} size="sm" />
              </motion.div>
            ))}
            {members.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center border-2 border-surface">
                <span className="text-xs font-bold text-on-surface-variant">
                  +{members.length - 5}
                </span>
              </div>
            )}
          </div>
          <span className="text-sm text-on-surface-variant">
            {members.length}/{maxMembers} members
          </span>
        </div>

        {/* Join Button */}
        <PremiumButton
          variant={isActive ? "primary" : "secondary"}
          fullWidth
          onClick={onJoin}
        >
          {isActive ? "Join Session" : "Join Circle"}
        </PremiumButton>
      </div>
    </motion.div>
  )
}
