"use client"

import { useEffect, useState } from "react"
import { Vibrate, VibrateOff } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  isHapticsEnabled,
  setHapticsEnabled,
  hapticsSupported,
  playHaptic,
} from "@/lib/haptics"

/**
 * The vibration switch.
 *
 * Follows the same rules as `SoundToggle`, for the same reasons: the stored
 * preference lives in localStorage, which the server cannot read, so the
 * initial value is taken in an effect and the control stays invisible until it
 * is known rather than flashing the wrong position.
 *
 * Two things it does differently.
 *
 * **It renders nothing on a device that cannot vibrate.** `navigator.vibrate`
 * is absent on iOS Safari entirely, so on an iPhone this switch could never do
 * anything at all. A dead control that claims to change something is worse
 * than an absent one, and it would generate support questions nobody can
 * answer.
 *
 * **Turning it on fires a pulse**, exactly as turning sound on plays a cue: it
 * confirms the switch worked and shows the strength before the player is
 * mid-run.
 *
 * The switch reads `isHapticsEnabled`, which returns false whenever the device
 * asks for reduced motion. That is deliberate but it does mean the control can
 * show "off" while storage says otherwise. It is the honest reading: off is
 * what the player will actually experience.
 */
export function HapticsToggle() {
  const { t } = useLanguage()
  const [enabled, setEnabled] = useState(false)
  const [ready, setReady] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported(hapticsSupported())
    setEnabled(isHapticsEnabled())
    setReady(true)
  }, [])

  // Until support is known, render nothing rather than a switch that may be
  // about to disappear.
  if (!ready || !supported) return null

  function toggle() {
    const next = !enabled
    setEnabled(next)
    setHapticsEnabled(next)
    if (next) playHaptic("correct")
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-surface-container p-5">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          {enabled ? (
            <Vibrate className="h-4 w-4 text-primary" aria-hidden="true" />
          ) : (
            <VibrateOff className="h-4 w-4 text-on-surface-variant" aria-hidden="true" />
          )}
          <h3 className="font-semibold text-on-surface">{t("haptics")}</h3>
        </div>
        <p className="text-sm text-on-surface-variant">{t("hapticsHint")}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={enabled ? t("hapticsOn") : t("hapticsOff")}
        onClick={toggle}
        // Flex with a logical padding, not an absolutely positioned knob.
        // The knob used to be `absolute top-1` with no `left`, so it resolved
        // against its static position rather than the track, and in the "on"
        // state it landed 20px past the track's right edge — the full width of
        // the knob, entirely outside the pill it is supposed to sit in. The
        // travel is now exactly the space that exists: 48px track, less 4px of
        // padding at each end, less the 20px knob, is 20px.
        className={`flex h-7 w-12 shrink-0 items-center rounded-full px-1 transition-colors ${
          enabled ? "bg-primary" : "bg-surface-container-highest"
        }`}
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
