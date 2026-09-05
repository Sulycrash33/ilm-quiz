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
 *
 * ── On volume ─────────────────────────────────────────────────────────────
 * Every cue runs through one master gain rather than carrying its own volume
 * argument. The per-cue gains below were balanced against each other by ear —
 * `tick` is deliberately a third of `correct`, `tap` quieter still — and a
 * volume that multiplied each call site would let that balance drift the
 * first time somebody passed a number. One knob, applied once, keeps the mix
 * intact at every setting.
 *
 * The gain is read fresh on every cue for the same reason `isSoundEnabled()`
 * is: dragging the slider is audible immediately, with no cue caching a stale
 * value.
 */

export type SoundCue =
  | "tap"
  | "correct"
  | "wrong"
  | "levelComplete"
  | "rankUp"
  | "comboUp"
  | "streak"
  | "tick"

const STORAGE_KEY = "ilm-sound-enabled"
const VOLUME_KEY = "ilm-sound-volume"

/**
 * Default volume, 0 to 1.
 *
 * Not 1.0. The cue gains below were chosen to sit under speech and under a
 * podcast playing in another tab, and full scale on a phone speaker is louder
 * than any of them wants to be. 0.75 leaves headroom above the default for
 * someone on a bus who genuinely needs more, which a default of 1 would not.
 */
const DEFAULT_VOLUME = 0.75

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
 * Master volume, 0 to 1.
 *
 * Anything unparseable — absent, empty, "null" from a bad earlier write, or a
 * number outside the range — returns the default rather than propagating a
 * NaN into a GainNode, which would silence the app with no way for the player
 * to tell why.
 */
export function getVolume(): number {
  if (typeof window === "undefined") return DEFAULT_VOLUME
  try {
    const raw = window.localStorage.getItem(VOLUME_KEY)
    if (raw === null) return DEFAULT_VOLUME
    const value = Number.parseFloat(raw)
    if (!Number.isFinite(value)) return DEFAULT_VOLUME
    return Math.min(1, Math.max(0, value))
  } catch {
    return DEFAULT_VOLUME
  }
}

export function setVolume(value: number): void {
  if (typeof window === "undefined") return
  const clamped = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : DEFAULT_VOLUME
  try {
    window.localStorage.setItem(VOLUME_KEY, String(clamped))
  } catch {
    /* nothing to do — the level simply does not persist this session */
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
let masterGain: GainNode | null = null

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  try {
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    if (!ctx) ctx = new Ctor()
    return ctx
  } catch {
    return null
  }
}

/**
 * ── Why the audio device has to be opened deliberately ────────────────────
 *
 * Every mobile browser refuses to start an AudioContext outside a user
 * gesture. A context created anywhere else is born **suspended**, and a
 * `resume()` that is not itself inside a gesture is refused.
 *
 * This app used to depend on whichever cue happened to fire first landing
 * inside a tap. It does not: `/home` plays the streak cue from an effect on
 * load, with no gesture anywhere near it, and `/home` is the front door on
 * every open after onboarding. So the first context of the session was
 * routinely created suspended, the cue that created it was scheduled into a
 * context whose clock does not run, and — because the context is cached in
 * the module for the life of the tab — the old code then called an
 * unawaited `void ctx.resume()` from a *non*-gesture path and returned the
 * context anyway, so the cue was silently dropped.
 *
 * The player therefore switched sound on, heard the confirmation cue on the
 * settings screen (a real tap, so that one context was fine), reached the
 * game through `/home`, and heard nothing. Which is exactly the report.
 *
 * Two changes fix it, and neither is clever:
 *
 *  1. **The device is opened on the first real gesture anywhere in the app**,
 *     by the listener below, whatever the player happens to touch. Nothing
 *     depends any more on which cue fires first.
 *  2. **A suspended context is resumed and the cue is played after the
 *     resume resolves**, rather than scheduled into a stopped clock and
 *     lost. If the browser refuses the resume, nothing plays — which is
 *     honest, and the next gesture will open it.
 */
function primeAudio(): void {
  const ac = audioContext()
  if (!ac) return
  // iOS 16.4+ only. Without an audio session the hardware ring/silent switch
  // mutes Web Audio outright, so an iPhone with the switch flipped is silent
  // no matter what the player chose in this app — and roughly half this
  // audience is on iPhone. "playback" says this audio is content the user
  // asked for, which is true: sound is off by default and only an explicit
  // opt-in turns it on. Set only when they have opted in, so the switch is
  // still respected for everyone who has not.
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession
    if (session && isSoundEnabled()) session.type = "playback"
  } catch {
    /* not supported, or refused — the cues simply obey the silent switch */
  }
  if (ac.state === "suspended") void ac.resume()
}

if (typeof window !== "undefined") {
  // `capture` so it runs before any handler that might stop propagation, and
  // `once` per event so this costs one listener and then nothing. All three
  // events, because a phone sends pointer/touch and a keyboard player sends
  // neither.
  const open = () => primeAudio()
  for (const evt of ["pointerdown", "touchend", "keydown"] as const) {
    window.addEventListener(evt, open, { once: true, capture: true, passive: true })
  }
}

/**
 * The single node every cue is routed through.
 *
 * Created once and reused, because a GainNode per cue would leak one node per
 * answer for the length of a run. Its level is refreshed here rather than at
 * write time so a change to the stored volume is heard on the very next cue,
 * including one made in another tab.
 */
function output(ac: AudioContext): GainNode {
  if (!masterGain) {
    masterGain = ac.createGain()
    masterGain.connect(ac.destination)
  }
  masterGain.gain.value = getVolume()
  return masterGain
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
  out: AudioNode,
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

  osc.connect(amp).connect(out)
  osc.start(ac.currentTime + start)
  osc.stop(ac.currentTime + start + duration + 0.02)
}

/**
 * A duff-like frame-drum hit: a low body tone plus a very short filtered
 * noise transient for the skin. Cheap, and much warmer than a bare sine.
 */
function drum(ac: AudioContext, start: number, out: AudioNode, gain = 0.22): void {
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  osc.type = "sine"
  osc.frequency.setValueAtTime(180, ac.currentTime + start)
  osc.frequency.exponentialRampToValueAtTime(90, ac.currentTime + start + 0.16)
  amp.gain.setValueAtTime(0.0001, ac.currentTime + start)
  amp.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.01)
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + 0.22)
  osc.connect(amp).connect(out)
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
  noise.connect(filter).connect(noiseAmp).connect(out)
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

  // A suspended context has a clock that does not run, so anything scheduled
  // into it is not "played quietly" — it is lost. Resume first and emit when
  // the device is actually open. A browser that refuses the resume (because
  // this call is not inside a gesture) leaves the context untouched for the
  // next one rather than swallowing a cue and pretending it played.
  if (ac.state === "suspended") {
    void ac
      .resume()
      .then(() => {
        if (ac.state === "running") emit(ac, cue)
      })
      .catch(() => {
        /* refused: not inside a gesture. The unlock listener will get it. */
      })
    return
  }

  emit(ac, cue)
}

/** The cue itself, once the device is known to be open. */
function emit(ac: AudioContext, cue: SoundCue): void {
  try {
    const out = output(ac)
    switch (cue) {
      // Every press, anywhere in the game. This is the most frequent cue in
      // the app by a wide margin, so it is built to the same rule as the
      // `select` haptic it accompanies: nearly subliminal, or it becomes an
      // irritation by question three. One very short, very quiet click well
      // above the pitch of the reward cues, so it never reads as a verdict on
      // the answer — the grade arrives a round trip later and brings its own.
      case "tap":
        tone(ac, { freq: 1760.0, start: 0, duration: 0.035, gain: 0.035, type: "triangle" }, out)
        break

      // A short rising third. Affirming without being a fanfare, because it
      // fires up to twenty times in a single run.
      case "correct":
        tone(ac, { freq: 587.33, start: 0, duration: 0.16, gain: 0.16 }, out) // D5
        tone(ac, { freq: 880.0, start: 0.075, duration: 0.2, gain: 0.13 }, out) // A5
        break

      // Deliberately soft and low. A wrong answer already costs a life; the
      // sound should not also scold.
      case "wrong":
        tone(ac, { freq: 220.0, start: 0, duration: 0.22, gain: 0.13, type: "triangle" }, out)
        tone(ac, { freq: 174.61, start: 0.09, duration: 0.26, gain: 0.11, type: "triangle" }, out)
        break

      // The earned moment: drum, then a rising figure.
      case "levelComplete":
        drum(ac, 0, out)
        tone(ac, { freq: 587.33, start: 0.1, duration: 0.18, gain: 0.15 }, out)
        tone(ac, { freq: 739.99, start: 0.22, duration: 0.18, gain: 0.15 }, out)
        tone(ac, { freq: 880.0, start: 0.34, duration: 0.34, gain: 0.16 }, out)
        break

      // Rarer and fuller than a level: two drums and a wider flourish.
      case "rankUp":
        drum(ac, 0, out)
        drum(ac, 0.26, out)
        tone(ac, { freq: 440.0, start: 0.1, duration: 0.2, gain: 0.14 }, out)
        tone(ac, { freq: 659.25, start: 0.26, duration: 0.2, gain: 0.15 }, out)
        tone(ac, { freq: 880.0, start: 0.42, duration: 0.45, gain: 0.16 }, out)
        break

      // The multiplier stepping up, every third correct answer in a row.
      // Deliberately a bright two-note flick rather than a fanfare: it lands
      // right after the `correct` cue and must read as a flourish on top of
      // it, not as a competing event. Higher and quieter than `correct` so
      // the two stack rather than muddy.
      case "comboUp":
        tone(ac, { freq: 987.77, start: 0, duration: 0.1, gain: 0.1, type: "triangle" }, out) // B5
        tone(ac, { freq: 1318.51, start: 0.07, duration: 0.16, gain: 0.09, type: "triangle" }, out) // E6
        break

      // A streak carried into another day.
      //
      // Warm and rising rather than triumphant. A streak is not an
      // achievement the player just earned, it is one they have kept, so this
      // is a fifth opening upward over a single drum — the same frame-drum
      // body as the earned moments, but one hit instead of two, and no
      // fanfare on top. It has to sit comfortably under a screen the player
      // did not tap to reach.
      case "streak":
        drum(ac, 0, out, 0.16)
        tone(ac, { freq: 440.0, start: 0.06, duration: 0.18, gain: 0.12 }, out) // A4
        tone(ac, { freq: 659.25, start: 0.2, duration: 0.32, gain: 0.13 }, out) // E5
        break

      // The last seconds on the clock. Very quiet by design — this one
      // repeats, and a loud tick is the fastest way to make someone mute a game.
      case "tick":
        tone(ac, { freq: 1046.5, start: 0, duration: 0.05, gain: 0.05 }, out)
        break
    }
  } catch {
    /* a failed cue is never worth breaking a run over */
  }
}
