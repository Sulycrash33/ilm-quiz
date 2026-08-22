"use client"

import { useEffect, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { isSoundEnabled, setSoundEnabled, playCue } from "@/lib/sound"

/**
 * The sound switch.
 *
 * Reads its initial value in an effect rather than during render: the stored
 * preference lives in localStorage, which does not exist on the server, so
 * initialising state from it directly would make the server and client render
 * different markup and trip a hydration mismatch.
 *
 * Turning sound ON plays one cue immediately. That is the point — it both
 * confirms the switch worked and lets the player hear the volume before they
 * are mid-run, and the tap itself is the user gesture browsers require before
 * an AudioContext may start.
 */
export function SoundToggle() {
  const { t } = useLanguage()
  const [enabled, setEnabled] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setEnabled(isSoundEnabled())
    setReady(true)
  }, [])

  function toggle() {
    const next = !enabled
    setEnabled(next)
    setSoundEnabled(next)
    if (next) playCue("correct")
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-surface-container p-5">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          {enabled ? (
            <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
          ) : (
            <VolumeX className="h-4 w-4 text-on-surface-variant" aria-hidden="true" />
          )}
          <h3 className="font-semibold text-on-surface">{t("sound")}</h3>
        </div>
        <p className="text-sm text-on-surface-variant">{t("soundHint")}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={enabled ? t("soundOn") : t("soundOff")}
        onClick={toggle}
        // Invisible until the stored value is known, so the switch never
        // flashes the wrong position on load.
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          enabled ? "bg-primary" : "bg-surface-container-highest"
        } ${ready ? "opacity-100" : "opacity-0"}`}
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
