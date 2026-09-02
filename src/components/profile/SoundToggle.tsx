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
 *
 * `compact` renders the same control as a single icon button for the corner of
 * a setup page. Sound is off by default, so a player who wants it on had to
 * find the profile to say so — which is the wrong order, because the first
 * thing the app does after onboarding is play cues at them. One component with
 * two shapes rather than two components, so the storage rule has one home.
 */
export function SoundToggle({ compact = false }: { compact?: boolean }) {
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

  if (compact) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={enabled ? t("soundOn") : t("soundOff")}
        title={enabled ? t("soundOn") : t("soundOff")}
        onClick={toggle}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-surface-container/80 backdrop-blur-sm transition-colors hover:bg-surface-container-highest ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      >
        {enabled ? (
          <Volume2 className="h-5 w-5 text-primary" aria-hidden="true" />
        ) : (
          <VolumeX className="h-5 w-5 text-on-surface-variant" aria-hidden="true" />
        )}
      </button>
    )
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
        //
        // Flex with a logical padding, not an absolutely positioned knob.
        // The knob used to be `absolute top-1` with no `left`, so it resolved
        // against its static position rather than the track, and in the "on"
        // state it landed 20px past the track's right edge — the full width of
        // the knob, entirely outside the pill it is supposed to sit in. The
        // travel is now exactly the space that exists: 48px track, less 4px of
        // padding at each end, less the 20px knob, is 20px.
        className={`flex h-7 w-12 shrink-0 items-center rounded-full px-1 transition-colors ${
          enabled ? "bg-primary" : "bg-surface-container-highest"
        } ${ready ? "opacity-100" : "opacity-0"}`}
      >
        <span
          // `rtl:` mirrors the travel, because a knob that slides right in
          // Arabic would move away from the end of its own track.
          className={`h-5 w-5 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}
