/**
 * The game's sound.
 *
 * Every cue here is **synthesised** with the Web Audio API rather than loaded
 * from an audio file. That is a deliberate choice, not a shortcut:
 *   - nothing to license, attribute, or host;
 *   - no network request, so a cue never arrives late on a slow connection;
 *   - a few hundred bytes of code instead of a few hundred KB of assets.
 *
 * ── On sacred phrases ──────────────────────────────────────────────────────
 * There is deliberately no takbir, tasbih or any other dhikr used as a routine
 * reward cue. Takbir is used joyfully in the tradition — at Eid, on Hajj, at
 * moments of triumph — but a phrase of remembrance fired every eight seconds
 * for a correct trivia answer reads to many Muslims as trivialising it, and
 * this app's audience is exactly the audience most likely to feel that.
 *
 * So routine feedback is instrumental: a frame-drum style hit and simple
 * tonal flourishes, in the spirit of the duff, which is the percussion the
 * tradition itself associates with celebration. Recorded human recitation, if
 * it is ever added, belongs on rare earned moments — finishing a whole
 * nine-tier category, or a rank promotion — not on the answer loop.
 *
 * ── On defaults ───────────────────────────────────────────────────────────
 * Sound is OFF until the player turns it on. People study on public
 * transport, around sleeping children, and near prayer times; an Islamic
 * learning app that blurts noise on first open is a bad guest on someone's
 * phone. `isSoundEnabled()` is the single source of truth and is read fresh
 * on every cue, so muting takes effect immediately everywhere.
 */

export type SoundCue =
  | "correct"
  | "wrong"
  | "levelComplete"
  | "rankUp"
  | "comboUp"
  | "tick"

const STORAGE_KEY = "ilm-sound-enabled"

/** Off unless the player has explicitly opted in. */
export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true"
  } catch {
    // Private windows and blocked site data throw on access rather than
    // returning null, and a thrown storage read must not break the game.
    return false
  }
}

export function setSoundEnabled(on: boolean): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "true" : "false")
  } catch {
    /* nothing to do — the cue simply stays off for this session */
  }
}

/**
 * One shared AudioContext, created lazily on the first cue.
 *
 * Browsers refuse to start an AudioContext outside a user gesture, and
 * creating one per cue leaks contexts until the tab is throttled. Creating it
 * on first play — which is always downstream of a tap — satisfies both.
 */
let ctx: AudioContext | null = null

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  try {
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    if (!ctx) ctx = new Ctor()
    // Safari and mobile Chrome suspend the context when the tab loses focus.
    if (ctx.state === "suspended") void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

interface ToneSpec {
  freq: number
  start: number
  duration: number
  gain?: number
  type?: OscillatorType
}

/** A single pitched note with a short percussive envelope. */
function tone(
  ac: AudioContext,
  { freq, start, duration, gain = 0.18, type = "sine" }: ToneSpec,
): void {
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime + start)

  // Fast attack, exponential decay: reads as a struck instrument rather than
  // a beep. Ramping to a tiny value instead of 0 because exponentialRampTo
  // is undefined at zero.
  amp.gain.setValueAtTime(0.0001, ac.currentTime + start)
  amp.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.012)
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration)

  osc.connect(amp).connect(ac.destination)
  osc.start(ac.currentTime + start)
  osc.stop(ac.currentTime + start + duration + 0.02)
}

/**
 * A duff-like frame-drum hit: a low body tone plus a very short filtered
 * noise transient for the skin. Cheap, and much warmer than a bare sine.
 */
function drum(ac: AudioContext, start: number, gain = 0.22): void {
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  osc.type = "sine"
  osc.frequency.setValueAtTime(180, ac.currentTime + start)
  osc.frequency.exponentialRampToValueAtTime(90, ac.currentTime + start + 0.16)
  amp.gain.setValueAtTime(0.0001, ac.currentTime + start)
  amp.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.01)
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + 0.22)
  osc.connect(amp).connect(ac.destination)
  osc.start(ac.currentTime + start)
  osc.stop(ac.currentTime + start + 0.26)

  // The transient. One buffer of white noise, band-limited so it reads as a
  // skin rather than a hiss.
  const frames = Math.floor(ac.sampleRate * 0.05)
  const buffer = ac.createBuffer(1, frames, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
  }
  const noise = ac.createBufferSource()
  noise.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = "bandpass"
  filter.frequency.value = 1800
  const noiseAmp = ac.createGain()
  noiseAmp.gain.value = gain * 0.5
  noise.connect(filter).connect(noiseAmp).connect(ac.destination)
  noise.start(ac.currentTime + start)
}

/**
 * Play a cue. Silent — and free — when sound is off, when the browser has no
 * Web Audio, or when anything at all goes wrong: a game must never fail
 * because a sound could not play.
 */
export function playCue(cue: SoundCue): void {
  if (!isSoundEnabled()) return
  const ac = audioContext()
  if (!ac) return

  try {
    switch (cue) {
      // A short rising third. Affirming without being a fanfare, because it
      // fires up to twenty times in a single run.
      case "correct":
        tone(ac, { freq: 587.33, start: 0, duration: 0.16, gain: 0.16 }) // D5
        tone(ac, { freq: 880.0, start: 0.075, duration: 0.2, gain: 0.13 }) // A5
        break

      // Deliberately soft and low. A wrong answer already costs a life; the
      // sound should not also scold.
      case "wrong":
        tone(ac, { freq: 220.0, start: 0, duration: 0.22, gain: 0.13, type: "triangle" })
        tone(ac, { freq: 174.61, start: 0.09, duration: 0.26, gain: 0.11, type: "triangle" })
        break

      // The earned moment: drum, then a rising figure.
      case "levelComplete":
        drum(ac, 0)
        tone(ac, { freq: 587.33, start: 0.1, duration: 0.18, gain: 0.15 })
        tone(ac, { freq: 739.99, start: 0.22, duration: 0.18, gain: 0.15 })
        tone(ac, { freq: 880.0, start: 0.34, duration: 0.34, gain: 0.16 })
        break

      // Rarer and fuller than a level: two drums and a wider flourish.
      case "rankUp":
        drum(ac, 0)
        drum(ac, 0.26)
        tone(ac, { freq: 440.0, start: 0.1, duration: 0.2, gain: 0.14 })
        tone(ac, { freq: 659.25, start: 0.26, duration: 0.2, gain: 0.15 })
        tone(ac, { freq: 880.0, start: 0.42, duration: 0.45, gain: 0.16 })
        break

      // The multiplier stepping up, every third correct answer in a row.
      // Deliberately a bright two-note flick rather than a fanfare: it lands
      // right after the `correct` cue and must read as a flourish on top of
      // it, not as a competing event. Higher and quieter than `correct` so
      // the two stack rather than muddy.
      case "comboUp":
        tone(ac, { freq: 987.77, start: 0, duration: 0.1, gain: 0.1, type: "triangle" }) // B5
        tone(ac, { freq: 1318.51, start: 0.07, duration: 0.16, gain: 0.09, type: "triangle" }) // E6
        break

      // The last seconds on the clock. Very quiet by design — this one
      // repeats, and a loud tick is the fastest way to make someone mute a game.
      case "tick":
        tone(ac, { freq: 1046.5, start: 0, duration: 0.05, gain: 0.05 })
        break
    }
  } catch {
    /* a failed cue is never worth breaking a run over */
  }
}
