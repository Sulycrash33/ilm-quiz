"use client"

import { useEffect, useState } from "react"
import { Volume1, Volume2, VolumeX } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getVolume, setVolume, isSoundEnabled, playCue } from "@/lib/sound"

/**
 * The volume control.
 *
 * Lives here rather than only on the setup screen it was drawn for. A level
 * the player can set exactly once, during onboarding, and never reach again is
 * a trap: the first guess is made before they have heard a single cue in a
 * real run. This renders on the profile too, so the knob is where they will
 * look for it later.
 *
 * Like the two switches beside it, the stored value is read in an effect
 * rather than during render — `localStorage` does not exist on the server, so
 * seeding state from it directly would make the two renders disagree and trip
 * a hydration mismatch.
 *
 * Dragging plays a cue, throttled to the moments the value crosses a step, so
 * the player hears what they are setting while they set it rather than after.
 * The cue is `tap`: it is the shortest one in the game and the only one brief
 * enough to fire repeatedly without the tail of one overlapping the head of
 * the next.
 */
export function VolumeSlider({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage()
  const [value, setValueState] = useState(0.75)
  const [enabled, setEnabled] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setValueState(getVolume())
    setEnabled(isSoundEnabled())
    setReady(true)
  }, [])

  // The switch beside this one writes the same storage key this reads. Without
  // a nudge, turning sound on left the slider still rendering as disabled
  // until a navigation, so the control the player had just enabled looked
  // broken. Cheap to poll, and it costs nothing while the tab is hidden.
  useEffect(() => {
    const id = setInterval(() => setEnabled(isSoundEnabled()), 400)
    return () => clearInterval(id)
  }, [])

  function change(next: number) {
    setValueState(next)
    setVolume(next)
    // Reads the value it has just written, so what plays is what was set.
    playCue("tap")
  }

  const Icon = !enabled || value === 0 ? VolumeX : value < 0.5 ? Volume1 : Volume2

  return (
    <div
      className={
        compact
          ? "flex flex-col gap-3"
          : "flex flex-col gap-3 rounded-xl border border-white/10 bg-surface-container p-5"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon
            className={`h-4 w-4 ${enabled ? "text-primary" : "text-on-surface-variant"}`}
            aria-hidden="true"
          />
          <h3 className="font-semibold text-on-surface">{t("soundVolume")}</h3>
        </div>
        <span className="text-sm tabular-nums text-on-surface-variant">
          {Math.round(value * 100)}%
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        disabled={!enabled}
        onChange={(e) => change(Number.parseFloat(e.target.value))}
        aria-label={t("soundVolume")}
        className={`volume-slider ${ready ? "opacity-100" : "opacity-0"}`}
      />

      <p className="text-sm text-on-surface-variant">
        {enabled ? t("soundVolumeHint") : t("soundSetupMutedHint")}
      </p>
    </div>
  )
}
