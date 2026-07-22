"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState, useTransition } from "react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  createStudyCircle,
  joinStudyCircle,
  leaveStudyCircle,
  type StudyCircleView,
} from "@/app/(app)/community/actions"

type Tab = "circles" | "forum" | "mentorship"

export function CommunityPageClient({ circles }: { circles: StudyCircleView[] }) {
  const { t, dir } = useLanguage()
  const [activeTab, setActiveTab] = useState<Tab>("circles")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [maxMembers, setMaxMembers] = useState(20)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleCreate = () => {
    setError(null)
    startTransition(async () => {
      const result = await createStudyCircle({ name, description, maxMembers })
      if (result.success) {
        setShowCreateForm(false)
        setName("")
        setDescription("")
        setMaxMembers(20)
      } else {
        setError(result.error ?? t("somethingWentWrong"))
      }
    })
  }

  const handleToggleMembership = (circle: StudyCircleView) => {
    setPendingId(circle.id)
    startTransition(async () => {
      const result = circle.isMember ? await leaveStudyCircle(circle.id) : await joinStudyCircle(circle.id)
      if (!result.success) setError(result.error ?? t("somethingWentWrong"))
      setPendingId(null)
    })
  }

  return (
    <div dir={dir} className="min-h-screen px-5 py-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <Link href="/home">
          <PremiumButton variant="ghost" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("back")}
          </PremiumButton>
        </Link>
        <div className="text-center">
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">{t("communityTitle")}</h1>
          <p className="text-on-surface-variant">{t("communitySubtitle")}</p>
        </div>
        <div className="w-20" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-8">
        {(["circles", "forum", "mentorship"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-label-caps text-label-caps uppercase tracking-widest transition-all duration-200 ${
              activeTab === tab ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            {tab === "circles" ? t("studyCirclesTab") : tab === "forum" ? t("forum") : t("mentorship")}
          </button>
        ))}
      </motion.div>

      {activeTab !== "circles" ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-10 text-center">
          <PremiumBadge variant="secondary" size="md" className="mb-4">{t("comingSoon")}</PremiumBadge>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
            {activeTab === "forum" ? t("forumNotLive") : t("mentorshipNotLive")}
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto">
            {t("circlesWorkingNote")} {activeTab === "forum" ? t("forumThreadsNeed") : t("mentorMatchingNeed")} {t("needBackendSuffix")}
          </p>
        </motion.div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex justify-end mb-6">
            <PremiumButton variant="primary" size="sm" onClick={() => setShowCreateForm((v) => !v)}>
              {showCreateForm ? t("cancel") : t("createACircle")}
            </PremiumButton>
          </motion.div>

          {showCreateForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass-card p-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-on-surface-variant mb-1 block">{t("circleNameLabel")}</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("circleNamePlaceholder")}
                    className="w-full px-4 py-2 rounded-lg bg-surface-container-high border border-white/10 text-on-surface"
                  />
                </div>
                <div>
                  <label className="text-sm text-on-surface-variant mb-1 block">{t("descriptionLabel")}</label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("circleDescPlaceholder")}
                    className="w-full px-4 py-2 rounded-lg bg-surface-container-high border border-white/10 text-on-surface"
                  />
                </div>
                <div>
                  <label className="text-sm text-on-surface-variant mb-1 block">{t("maxMembersLabel")}</label>
                  <input
                    type="number"
                    min={2}
                    max={200}
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(Number(e.target.value))}
                    className="w-32 px-4 py-2 rounded-lg bg-surface-container-high border border-white/10 text-on-surface"
                  />
                </div>
                {error && <p className="text-sm text-error">{error}</p>}
                <PremiumButton variant="primary" onClick={handleCreate} disabled={isPending}>
                  {isPending ? t("creatingLabel") : t("createCircleButton")}
                </PremiumButton>
              </div>
            </motion.div>
          )}

          {circles.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-10 text-center">
              <p className="text-on-surface-variant">{t("noCirclesYet")}</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {circles.map((circle, index) => (
                <motion.div key={circle.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <PremiumCard className="p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-on-surface text-lg">{circle.name}</h3>
                      {circle.createdByMe && <PremiumBadge variant="tertiary" size="sm">{t("yoursLabel")}</PremiumBadge>}
                    </div>
                    {circle.description && <p className="text-on-surface-variant text-sm mb-3 flex-1">{circle.description}</p>}
                    {circle.currentTopic && (
                      <p className="text-xs text-on-surface-variant mb-3">
                        {t("currentlyDiscussing")} <span className="text-on-surface">{circle.currentTopic}</span>
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm text-on-surface-variant">
                        {circle.memberCount}/{circle.maxMembers} {t("membersCountSuffix")}
                      </span>
                      <PremiumButton
                        variant={circle.isMember ? "ghost" : "primary"}
                        size="sm"
                        onClick={() => handleToggleMembership(circle)}
                        disabled={pendingId === circle.id || (!circle.isMember && circle.memberCount >= circle.maxMembers)}
                      >
                        {circle.isMember ? t("leaveLabel") : circle.memberCount >= circle.maxMembers ? t("fullLabel") : t("joinLabel")}
                      </PremiumButton>
                    </div>
                  </PremiumCard>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
