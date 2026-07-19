"use client"

import { motion } from "framer-motion"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumAvatar } from "@/components/ui/premium-avatar"
import { PremiumCard } from "@/components/ui/premium-card"

interface Player {
  id: string
  userName: string
  avatar?: string
  isHost: boolean
  isReady: boolean
  score: number
}

interface RoomLobbyProps {
  roomCode: string
  players: Player[]
  currentUserId: string
  isHost: boolean
  onStart: () => void
  onLeave: () => void
  onToggleReady: () => void
  isReady: boolean
}

export function RoomLobby({
  roomCode,
  players,
  currentUserId,
  isHost,
  onStart,
  onLeave,
  onToggleReady,
  isReady,
}: RoomLobbyProps) {
  const allReady = players.every((p) => p.isReady || p.isHost)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Room Code */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-on-surface-variant mb-2">Room Code</p>
        <div className="inline-flex items-center gap-3 bg-surface-container-high px-6 py-3 rounded-xl border border-white/10">
          <span className="font-mono text-3xl font-bold text-primary tracking-widest">
            {roomCode}
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(roomCode)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-on-surface-variant mt-2">
          Share this code with friends to join
        </p>
      </motion.div>

      {/* Players */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PremiumCard className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Players ({players.length})
            </h3>
            <PremiumBadge variant="primary" size="sm">
              WAITING
            </PremiumBadge>
          </div>
          <div className="space-y-3">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  player.id === currentUserId
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-surface-container-high"
                }`}
              >
                <div className="flex items-center gap-3">
                  <PremiumAvatar src={player.avatar} size="sm" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface">{player.userName}</span>
                      {player.isHost && (
                        <PremiumBadge variant="warning" size="sm">HOST</PremiumBadge>
                      )}
                      {player.id === currentUserId && (
                        <PremiumBadge variant="secondary" size="sm">YOU</PremiumBadge>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  {player.isReady || player.isHost ? (
                    <PremiumBadge variant="success" size="sm">READY</PremiumBadge>
                  ) : (
                    <PremiumBadge variant="secondary" size="sm">NOT READY</PremiumBadge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </PremiumCard>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3"
      >
        <PremiumButton variant="secondary" fullWidth onClick={onLeave}>
          Leave Room
        </PremiumButton>
        {!isHost && (
          <PremiumButton
            variant={isReady ? "secondary" : "primary"}
            fullWidth
            onClick={onToggleReady}
          >
            {isReady ? "Not Ready" : "Ready Up"}
          </PremiumButton>
        )}
        {isHost && (
          <PremiumButton
            variant="primary"
            fullWidth
            onClick={onStart}
            disabled={!allReady || players.length < 2}
          >
            {players.length < 2 ? "Need 2+ Players" : "Start Quiz"}
          </PremiumButton>
        )}
      </motion.div>
    </div>
  )
}
