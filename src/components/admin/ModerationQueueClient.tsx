"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { useLanguage } from "@/contexts/LanguageContext"
import { moderateContent } from "@/app/(app)/community/forum-actions"
import {
  dismissReport,
  reviewMentorApplication,
  type ModerationQueueItem,
  type PendingMentorApplication,
} from "@/app/(app)/community/mentor-actions"

export function ModerationQueueClient({
  queue,
  applications,
}: {
  queue: ModerationQueueItem[]
  applications: PendingMentorApplication[]
}) {
  const { t } = useLanguage()
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const run = (key: string, fn: () => Promise<unknown>) => {
    setBusy(key)
    startTransition(async () => {
      await fn()
      setBusy(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 font-headline-md text-headline-md text-on-surface">{t("modQueueTitle")}</h2>

        {queue.length === 0 ? (
          <PremiumCard className="p-8 text-center">
            <p className="text-on-surface-variant">{t("modQueueEmpty")}</p>
          </PremiumCard>
        ) : (
          <div className="space-y-4">
            {queue.map((item) => (
              <PremiumCard key={item.reportId} className="p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <PremiumBadge variant="danger" size="sm">
                    {item.reason.replace(/_/g, " ")}
                  </PremiumBadge>
                  <PremiumBadge variant="secondary" size="sm">
                    {item.targetKind.replace(/_/g, " ")}
                  </PremiumBadge>
                  {item.reportCount > 1 && (
                    <PremiumBadge variant="warning" size="sm">
                      {t("modQueueReports", { count: item.reportCount })}
                    </PremiumBadge>
                  )}
                  {item.status !== "visible" && (
                    <PremiumBadge variant="tertiary" size="sm">
                      {item.status}
                    </PremiumBadge>
                  )}
                </div>

                <p className="text-xs text-on-surface-variant">{item.authorName}</p>
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-surface-container p-3 text-sm text-on-surface">
                  {item.excerpt || "—"}
                </p>
                {item.detail && (
                  <p className="mt-2 text-xs italic text-on-surface-variant">&ldquo;{item.detail}&rdquo;</p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <PremiumButton
                    variant="danger"
                    size="sm"
                    disabled={busy === item.reportId}
                    onClick={() =>
                      run(item.reportId, () =>
                        moderateContent({
                          kind: item.targetKind,
                          id: item.targetId,
                          status: item.status === "hidden" ? "visible" : "hidden",
                        }),
                      )
                    }
                  >
                    {item.status === "hidden" ? t("modRestore") : t("modHide")}
                  </PremiumButton>
                  <PremiumButton
                    variant="ghost"
                    size="sm"
                    disabled={busy === item.reportId}
                    onClick={() => run(item.reportId, () => dismissReport(item.reportId))}
                  >
                    {t("dismissLabel")}
                  </PremiumButton>
                </div>
              </PremiumCard>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-headline-md text-headline-md text-on-surface">{t("modApplicationsTitle")}</h2>

        {applications.length === 0 ? (
          <PremiumCard className="p-8 text-center">
            <p className="text-on-surface-variant">{t("modApplicationsEmpty")}</p>
          </PremiumCard>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <PremiumCard key={app.userId} className="p-5">
                <p className="font-bold text-on-surface">{app.displayName}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-on-surface-variant">{app.bio}</p>
                {app.credentials && (
                  <p className="mt-2 text-sm text-on-surface">
                    <span className="text-on-surface-variant">{t("mentorCredentialsLabel")}: </span>
                    {app.credentials}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <PremiumButton
                    variant="primary"
                    size="sm"
                    disabled={busy === app.userId}
                    onClick={() => run(app.userId, () => reviewMentorApplication({ userId: app.userId, status: "approved" }))}
                  >
                    {t("approveLabel")}
                  </PremiumButton>
                  <PremiumButton
                    variant="danger"
                    size="sm"
                    disabled={busy === app.userId}
                    onClick={() => run(app.userId, () => reviewMentorApplication({ userId: app.userId, status: "rejected" }))}
                  >
                    {t("rejectLabel")}
                  </PremiumButton>
                </div>
              </PremiumCard>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
