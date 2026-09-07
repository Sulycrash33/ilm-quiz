"use client"

import { useEffect } from "react"
import { playCue } from "@/lib/sound"

/**
 * The tap cue, on every press in the app.
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 * `sound.ts` describes `tap` as "Every press, anywhere in the game… the most
 * frequent cue in the app by a wide margin", and tunes its gain (0.035) and
 * length (35ms) to be nearly subliminal precisely because it was meant to fire
 * constantly. It never did. Counted on 2026-09-07, `playCue` had thirteen call
 * sites in the whole app and `tap` was reached from exactly two: an answer
 * tile inside a run, and the volume slider on the settings screen.
 *
 * The consequence is the sixth "I can't hear anything" report. Every other cue
 * — `correct`, `wrong`, `comboUp`, `levelComplete`, `rankUp`, `tick` — fires
 * only inside a quiz run or on the spin wheel, and `streak` fires on `/home`
 * only when the streak actually advances. So a player who switches sound on
 * and then walks around the app hears **nothing at all**, correctly, by
 * construction. With `attempts` at 0 and `streak` at 0 there was no reachable
 * sound in this application outside the confirmation cue on the toggle itself.
 * The audio engine was fixed in #76 and #77 and there was still nothing for it
 * to play.
 *
 * ── Why one delegated listener and not a prop on every button ─────────────
 * Same reason `.glass-card` carries the khatim in one CSS rule rather than at
 * twenty-four call sites: a cue added button by button is a cue that is
 * missing from the next button somebody writes. This listens once, on the
 * document, and catches anything a player can actually press — including
 * links, nav items and the home tiles, which are not buttons at all and would
 * each have needed their own handler.
 *
 * It rides on `pointerdown`, which is the same gesture the audio unlock
 * listener uses, so the press that makes the sound is also a press the browser
 * accepts as permission to make it.
 *
 * `playCue` is already silent when sound is off, so this costs a `closest()`
 * call per press and nothing else for the players who have not opted in.
 */

/** Anything a player presses on purpose. */
const PRESSABLE = 'button, a[href], [role="button"], [role="switch"], [role="tab"], summary'

/**
 * Opt out where a component plays its own `tap` — the answer tile does, and
 * two cues on one press is a louder click, not a better one. Put
 * `data-self-cue` on the element that plays its own.
 */
const SELF_CUED = "[data-self-cue]"

export function TapCue() {
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Element)) return

      const pressed = target.closest(PRESSABLE)
      if (!pressed) return
      if (pressed.closest(SELF_CUED)) return

      // A disabled control gives no feedback of any other kind, and a sound
      // saying "that worked" when nothing worked is worse than silence.
      if (pressed.hasAttribute("disabled") || pressed.getAttribute("aria-disabled") === "true") {
        return
      }

      playCue("tap")
    }

    // Capture, so a handler that stops propagation — the answer tile's, for
    // one — does not silence the press on its way up.
    document.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true })
    return () => document.removeEventListener("pointerdown", onPointerDown, { capture: true })
  }, [])

  return null
}
