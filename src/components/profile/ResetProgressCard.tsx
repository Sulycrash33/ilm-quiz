"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Loader2, RotateCcw } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useToast } from "@/hooks/use-toast"
import { resetMyProgress } from "@/app/(app)/profile/actions"

/**
 * "Start again from zero", with a deliberate second step.
 *
 * The reset is irreversible and wipes every answered question, so a single
 * tap must not be able to trigger it — the button only arms the confirmation,
 * and the confirmation is what calls the action. That is the whole reason
 * this is a small stateful component rather than a plain button.
 */
export function ResetProgressCard() {
  const { t, dir } = useLanguage()
  const { toast } = useToast()
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleReset() {
    if (busy) return
    setBusy(true)
    const result = await resetMyProgress()
    setBusy(false)
    setConfirming(false)

    if (!result.ok) {
      toast({ variant: "destructive", title: t("resetProgressFailed"), description: result.error })
      return
    }

    toast({ title: t("resetProgressDone") })
    // The page is server-rendered from the now-cleared state, so pull it fresh
    // rather than leaving the old XP and streak on screen.
    router.refresh()
  }

  return (
    <div dir={dir} className="rounded-xl border border-error/30 bg-error/5 p-5">
      <div className="mb-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-error" aria-hidden="true" />
        <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-error">
          {t("dangerZone")}
        </h3>
      </div>

      <p className="mb-4 text-sm text-on-surface-variant">{t("resetProgressDesc")}</p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-error/40 px-4 py-2 text-sm font-semibold text-error transition-colors hover:bg-error/15"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {t("resetProgress")}
        </button>
      ) : (
        <div className="space-y-3 rounded-lg border border-error/40 bg-surface-container p-4">
          <p className="font-semibold text-on-surface">{t("resetProgressConfirmTitle")}</p>
          <p className="text-sm text-on-surface-variant">{t("resetProgressConfirmBody")}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleReset}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {busy ? t("resetting") : t("resetProgressConfirmAction")}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={busy}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-white/5 disabled:opacity-60"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
