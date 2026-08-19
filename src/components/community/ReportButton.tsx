"use client"

import { useState, useTransition } from "react"
import { Flag } from "lucide-react"
import { PremiumButton } from "@/components/ui/premium-button"
import { useLanguage } from "@/contexts/LanguageContext"
import type { Translations } from "@/lib/i18n"
import { reportContent } from "@/app/(app)/community/forum-actions"

type Kind = "forum_topic" | "forum_reply" | "mentor_question" | "mentor_answer"

const REASONS: { value: string; key: keyof Translations }[] = [
  { value: "incorrect_religious_claim", key: "reportReasonIncorrect" },
  { value: "harassment", key: "reportReasonHarassment" },
  { value: "spam", key: "reportReasonSpam" },
  { value: "off_topic", key: "reportReasonOffTopic" },
  { value: "contact_details", key: "reportReasonContact" },
  { value: "other", key: "reportReasonOther" },
]

/**
 * Reporting is the only lever a reader has, so it stays one tap away on every
 * post. The server treats a repeat report from the same person as a no-op, and
 * this never tells the reporter whether anyone else has flagged the same item —
 * otherwise the button becomes a way to probe the moderation queue.
 */
export function ReportButton({ kind, id }: { kind: Kind; id: string }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState(REASONS[0].value)
  const [detail, setDetail] = useState("")
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (done) {
    return <span className="text-xs text-tertiary">{t("reportThanks")}</span>
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-error"
      >
        <Flag className="h-3 w-3" aria-hidden="true" />
        {t("reportLabel")}
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-outline-variant/40 bg-surface-container p-3 space-y-2">
          <p className="text-xs font-medium text-on-surface">{t("reportTitle")}</p>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-label={t("reportTitle")}
            className="w-full rounded-lg bg-surface-container-high border border-white/10 px-3 py-1.5 text-xs text-on-surface"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {t(r.key)}
              </option>
            ))}
          </select>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder={t("reportDetailPlaceholder")}
            rows={2}
            className="w-full rounded-lg bg-surface-container-high border border-white/10 px-3 py-1.5 text-xs text-on-surface"
          />
          <div className="flex gap-2">
            <PremiumButton
              variant="primary"
              size="sm"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await reportContent({ kind, id, reason, detail })
                  setOpen(false)
                  setDone(true)
                })
              }
            >
              {t("reportSubmit")}
            </PremiumButton>
            <PremiumButton variant="ghost" size="sm" onClick={() => setOpen(false)}>
              {t("cancel")}
            </PremiumButton>
          </div>
        </div>
      )}
    </>
  )
}
