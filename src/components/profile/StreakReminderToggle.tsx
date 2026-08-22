"use client"

import { useEffect, useState } from "react"
import { Bell, BellOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/LanguageContext"
import { pushSupport, subscribeToPush, unsubscribeFromPush } from "@/lib/push"
import {
  savePushSubscription,
  disablePushReminders,
  getReminderPreference,
} from "@/app/(app)/profile/push-actions"

/**
 * The streak reminder switch.
 *
 * Two things have to be true for a reminder to arrive: the browser has given
 * permission, and the player has turned this on. Browser permission alone is
 * not consent to be messaged every day — plenty of people grant it once for
 * something else and forget. So the stored preference is the authority, and
 * turning this off deletes every device's subscription rather than just this
 * browser's.
 *
 * When push isn't available the switch says so plainly instead of failing on
 * tap. iOS Safari, for instance, only allows this once the app is installed to
 * the home screen, and a player deserves to be told that rather than left
 * pressing a control that does nothing.
 */
export function StreakReminderToggle() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [enabled, setEnabled] = useState(false)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [support, setSupport] = useState<ReturnType<typeof pushSupport>>("unsupported")

  useEffect(() => {
    setSupport(pushSupport())
    void getReminderPreference().then((on) => {
      setEnabled(on)
      setReady(true)
    })
  }, [])

  const blocked = support !== "ready"

  async function toggle() {
    if (busy || blocked) return
    setBusy(true)

    try {
      if (enabled) {
        await unsubscribeFromPush()
        const { disabled } = await disablePushReminders()
        if (disabled) setEnabled(false)
        setBusy(false)
        return
      }

      const keys = await subscribeToPush()
      if (!keys) {
        // Declining the permission prompt lands here, and is not an error —
        // say nothing rather than scolding someone for a legitimate choice.
        setBusy(false)
        return
      }

      const { saved } = await savePushSubscription(keys.endpoint, keys.p256dh, keys.auth)
      if (saved) {
        setEnabled(true)
        toast({ title: t("remindersOn"), description: t("remindersOnHint") })
      } else {
        toast({ title: t("error"), variant: "destructive" })
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-surface-container p-5">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          {enabled ? (
            <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
          ) : (
            <BellOff className="h-4 w-4 text-on-surface-variant" aria-hidden="true" />
          )}
          <h3 className="font-semibold text-on-surface">{t("streakReminders")}</h3>
        </div>
        <p className="text-sm text-on-surface-variant">
          {support === "unsupported"
            ? t("remindersUnsupported")
            : support === "denied"
              ? t("remindersBlocked")
              : support === "no-key"
                ? t("remindersUnavailable")
                : t("streakRemindersHint")}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={enabled ? t("remindersOn") : t("remindersOff")}
        disabled={blocked || busy}
        onClick={() => void toggle()}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          enabled ? "bg-primary" : "bg-surface-container-highest"
        } ${ready ? "opacity-100" : "opacity-0"} ${blocked ? "cursor-not-allowed opacity-40" : ""}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  )
}
