"use client"

import { useState, useTransition } from "react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  getCircleBoard,
  setCircleGoal,
  type CircleContribution,
  type StudyCircleView,
} from "@/app/(app)/community/actions"

interface CircleCardProps {
  circle: StudyCircleView
  pending: boolean
  onToggleMembership: (circle: StudyCircleView) => void
  onError: (message: string) => void
}

export function CircleCard({ circle, pending, onToggleMembership, onError }: CircleCardProps) {
  const { t } = useLanguage()
  const [board, setBoard] = useState<CircleContribution[] | null>(null)
  const [showBoard, setShowBoard] = useState(false)
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalDraft, setGoalDraft] = useState(circle.weeklyGoal)
  const [isPending, startTransition] = useTransition()

  const full = circle.memberCount >= circle.maxMembers
  // The bar fills, it does not overflow: a circle that doubled its goal still
  // reads as done rather than as a broken layout.
  const percent = Math.min(100, Math.round((circle.weekXp / Math.max(1, circle.weeklyGoal)) * 100))

  const handleToggleBoard = () => {
    if (showBoard) {
      setShowBoard(false)
      return
    }
    setShowBoard(true)
    if (board === null) {
      startTransition(async () => {
        setBoard(await getCircleBoard(circle.id))
      })
    }
  }

  const handleSaveGoal = () => {
    startTransition(async () => {
      const result = await setCircleGoal(circle.id, goalDraft)
      if (result.success) {
        setEditingGoal(false)
      } else {
        onError(result.error ?? t("somethingWentWrong"))
      }
    })
  }

  return (
    <PremiumCard className="p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-2 gap-2">
        <h3 className="font-bold text-on-surface text-lg">{circle.name}</h3>
        <div className="flex flex-wrap items-center justify-end gap-1">
          {circle.streakWeeks > 0 && (
            <PremiumBadge variant="warning" size="sm">
              {t("circleStreakWeeks", { count: circle.streakWeeks })}
            </PremiumBadge>
          )}
          {circle.createdByMe && (
            <PremiumBadge variant="tertiary" size="sm">
              {t("yoursLabel")}
            </PremiumBadge>
          )}
        </div>
      </div>

      {circle.description && <p className="text-on-surface-variant text-sm mb-3">{circle.description}</p>}
      {circle.currentTopic && (
        <p className="text-xs text-on-surface-variant mb-3">
          {t("currentlyDiscussing")} <span className="text-on-surface">{circle.currentTopic}</span>
        </p>
      )}

      {/* The shared goal. Everything above this line was already a circle; this
          is the part that gives the members a reason to come back. */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-label-caps uppercase tracking-wider text-on-surface-variant text-xs">
            {t("circleWeeklyGoal")}
          </span>
          <span className="text-xs tabular-nums text-on-surface-variant">
            {t("circleGoalProgress", { xp: circle.weekXp, goal: circle.weeklyGoal })}
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("circleWeeklyGoal")}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              circle.goalMet ? "bg-tertiary" : "bg-primary"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className={`text-xs ${circle.goalMet ? "text-tertiary" : "text-on-surface-variant"}`}>
            {circle.goalMet ? t("circleGoalMet") : t("circleGoalRemaining", { xp: circle.weeklyGoal - circle.weekXp })}
          </span>
          {circle.bestStreak > 0 && (
            <span className="text-xs text-on-surface-variant">
              {t("circleBestStreak", { count: circle.bestStreak })}
            </span>
          )}
        </div>
      </div>

      {circle.createdByMe && (
        <div className="mb-3">
          {editingGoal ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={100}
                max={100000}
                step={50}
                value={goalDraft}
                onChange={(e) => setGoalDraft(Number(e.target.value))}
                aria-label={t("circleGoalLabel")}
                className="w-28 px-3 py-1.5 rounded-lg bg-surface-container-high border border-white/10 text-on-surface text-sm"
              />
              <PremiumButton variant="primary" size="sm" onClick={handleSaveGoal} disabled={isPending}>
                {t("save")}
              </PremiumButton>
              <PremiumButton variant="ghost" size="sm" onClick={() => setEditingGoal(false)} disabled={isPending}>
                {t("cancel")}
              </PremiumButton>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setGoalDraft(circle.weeklyGoal)
                setEditingGoal(true)
              }}
              className="text-xs text-primary underline-offset-2 hover:underline"
            >
              {t("circleChangeGoal")}
            </button>
          )}
        </div>
      )}

      {/* Contributions are for members. Non-members see the total, not who
          earned it, so the RPC returns nothing for them anyway. */}
      {circle.isMember && (
        <div className="mb-3">
          <button
            type="button"
            onClick={handleToggleBoard}
            aria-expanded={showBoard}
            className="text-xs text-primary underline-offset-2 hover:underline"
          >
            {showBoard ? t("circleHideContributions") : t("circleContributions")}
          </button>

          {showBoard && (
            <div className="mt-2 space-y-1">
              {board === null ? (
                <p className="text-xs text-on-surface-variant">{t("loading")}</p>
              ) : board.length === 0 ? (
                <p className="text-xs text-on-surface-variant">{t("circleNoContributions")}</p>
              ) : (
                board.map((member) => (
                  <div
                    key={member.userId}
                    className={`flex items-center justify-between rounded-lg px-2 py-1 text-xs ${
                      member.isMe ? "bg-primary/10 text-on-surface" : "text-on-surface-variant"
                    }`}
                  >
                    <span className="truncate">
                      <span className="tabular-nums mr-2 text-on-surface-variant">{member.rank}.</span>
                      {member.displayName}
                    </span>
                    <span className="tabular-nums">{t("circleMemberXp", { xp: member.xp })}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto">
        <span className="text-sm text-on-surface-variant">
          {circle.memberCount}/{circle.maxMembers} {t("membersCountSuffix")}
        </span>
        <PremiumButton
          variant={circle.isMember ? "ghost" : "primary"}
          size="sm"
          onClick={() => onToggleMembership(circle)}
          disabled={pending || (!circle.isMember && full)}
        >
          {circle.isMember ? t("leaveLabel") : full ? t("fullLabel") : t("joinLabel")}
        </PremiumButton>
      </div>
    </PremiumCard>
  )
}
