import { cache } from "react"

import { createClient } from "@/lib/supabase/server"

/**
 * When this player's day starts and ends.
 *
 * ── Why this exists at all ────────────────────────────────────────────────
 * Four screens used to work out what day it was by themselves, each with the
 * same line: `new Date().toISOString().slice(0, 10)`. That is the **UTC**
 * date, and the database was keyed on the UTC date too, so they agreed — right
 * up until migration 0064 moved the day to the player's own midnight. From
 * that point a page computing its own date would have been asking about a
 * different day than the RPC it was rendering, which is the failure this
 * project keeps paying for: two definitions of one idea, quietly disagreeing.
 *
 * So there is one definition and it lives in Postgres. `my_day_bounds()`
 * derives all three values from `profiles.timezone`, and this reads them.
 *
 * ── Why the client is not asked ───────────────────────────────────────────
 * The browser knows the player's zone and could simply send today's date with
 * each request. It must not. A date taken from the request is a date the player
 * controls, and a player who controls the date can mint a fresh daily challenge
 * on demand — the same shape as the replay bug that migration 0059 closed. The
 * browser gets to report its *zone*, once, through `set_my_timezone_rpc`; every
 * date after that is the server's.
 */
export interface DayBounds {
  /** The player's local calendar date, `YYYY-MM-DD`. */
  localDate: string
  /** The instant their day began, ISO. */
  dayStart: string
  /** The instant their next day begins, ISO — what a countdown counts to. */
  nextMidnight: string
}

/** The UTC day, used only when the RPC cannot be reached. */
function utcFallback(now: Date = new Date()): DayBounds {
  const startMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const start = new Date(startMs)
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
  return {
    localDate: start.toISOString().slice(0, 10),
    dayStart: start.toISOString(),
    nextMidnight: next.toISOString(),
  }
}

/**
 * Wrapped in React's `cache`, so the round trip happens **once per render** no
 * matter how many callers ask. `/rewards` asks directly and then calls
 * `getDailyChallenge`, which asks again; without this the page would pay for
 * the same answer twice, and the whole point of PR #89 was to stop paying for
 * round trips it did not need.
 */
export const getMyDayBounds = cache(async function getMyDayBounds(): Promise<DayBounds> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("my_day_bounds")
  const row = Array.isArray(data) ? data[0] : data

  // A page that cannot reach the RPC falls back to UTC rather than rendering
  // nothing. It will be an hour or two out for a player far from Greenwich,
  // which is exactly what this change fixed — but a slightly wrong countdown
  // beats a blank Rewards Center, and the *server* still decides what pays.
  if (error || !row?.o_local_date) return utcFallback()

  return {
    localDate: String(row.o_local_date).slice(0, 10),
    dayStart: new Date(row.o_day_start).toISOString(),
    nextMidnight: new Date(row.o_next_midnight).toISOString(),
  }
})

/**
 * The calendar day before `localDate`, as `YYYY-MM-DD`.
 *
 * Plain calendar arithmetic on a date with no time and no zone: parsed at UTC
 * midnight purely so the subtraction cannot be dragged across a boundary by
 * the server's own offset. The result is a label, never an instant.
 */
export function previousLocalDate(localDate: string): string {
  const d = new Date(`${localDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}
