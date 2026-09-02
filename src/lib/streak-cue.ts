/**
 * Noticing that a streak went up.
 *
 * The database owns `profiles.streak_count` and advances it as part of
 * answering; nothing in the app has ever told the player the moment it moved.
 * The number on the home screen is simply larger than it was yesterday, which
 * is information rather than a reward, and the one counter in the game that is
 * about persistence was the one with no feedback attached to it.
 *
 * This is the smallest honest way to catch that moment: remember the last
 * streak this browser saw, and treat an increase as the event. No schema, no
 * new column, no round trip. The cost is that the cue is per-device — sign in
 * somewhere new and the first advance there goes unheard — which is the right
 * trade for a celebration. A missed flourish is nothing; a false one is a lie
 * about the player's own record.
 *
 * Three cases deliberately stay silent:
 *
 *  - **Nothing stored yet.** Otherwise everyone with an existing streak gets a
 *    fanfare the first time they open the app after this ships, for something
 *    they did days ago.
 *  - **A streak that fell.** A break is not this cue's news to deliver, and a
 *    sound on a loss would be the same mistake the wrong-answer haptic exists
 *    to avoid.
 *  - **Zero.** There is no streak to celebrate.
 */

const STORAGE_KEY = "ilm-streak-last-seen"

/**
 * Whether `current` is an advance on the last streak this browser saw, and
 * record it either way.
 *
 * Named `take` because it consumes: calling it twice for the same advance
 * returns true once. That matters because React runs effects twice in
 * development's strict mode, and a celebration that fires on the second run
 * as well is the same doubled-cue bug this repository has now hit three times
 * in state updaters.
 */
export function takeStreakAdvance(current: number): boolean {
  if (typeof window === "undefined") return false
  if (!Number.isFinite(current) || current <= 0) return false

  let previous: number | null = null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = Number.parseInt(raw, 10)
      if (Number.isFinite(parsed)) previous = parsed
    }
    window.localStorage.setItem(STORAGE_KEY, String(current))
  } catch {
    // Private windows and blocked site data throw on access. Without storage
    // there is no "last seen", so there is no advance to detect — staying
    // silent is correct, and far better than celebrating on every render.
    return false
  }

  if (previous === null) return false
  return current > previous
}
