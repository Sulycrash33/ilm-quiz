"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/** Set once per browser session, so a page-to-page walk does not re-ask. */
const SESSION_KEY = "ilm-hunt:timezone-synced";

/**
 * Tells the server which zone this player is in. Renders nothing.
 *
 * ── Why the server needs telling at all ───────────────────────────────────
 * Since migration 0064 the daily challenge, the login reward, the day's task
 * and the study streak all turn over at **the player's own midnight** rather
 * than at 00:00 UTC. Postgres works that out from `profiles.timezone`, and it
 * has no other way to learn what that is: a database has no idea where the
 * person on the other end of the request is standing.
 *
 * So the browser reports it — `Intl.DateTimeFormat().resolvedOptions()` is the
 * zone the operating system already resolved, no permission prompt, no
 * geolocation, nothing sent anywhere but this app's own database.
 *
 * ── What is deliberately *not* sent ───────────────────────────────────────
 * **Not the date, and not the time.** Only the zone name, and only through
 * `set_my_timezone_rpc`, which validates it against `pg_timezone_names` and
 * rate limits changes to one per twenty hours. Every date the game acts on is
 * then derived server-side from the stored value.
 *
 * That distinction is the whole security property. A client that could say
 * what *day* it is could mint a fresh daily challenge on demand, which is the
 * same shape as the replay bug migration 0059 closed. A client that can only
 * say what *zone* it is in can, at worst, reach tomorrow's rewards up to a day
 * early — it can never collect one day twice, because everything here is keyed
 * on a calendar date and a date pays once. Measured, not assumed; 0064 shows
 * the numbers.
 *
 * ── Failure is silent on purpose ──────────────────────────────────────────
 * A refusal (rate limited, offline, signed out) leaves the stored zone alone,
 * and the stored zone defaults to UTC — which is exactly the behaviour the app
 * had before this existed. Nothing about this is load-bearing enough to
 * interrupt a player over.
 */
export function TimezoneSync() {
  useEffect(() => {
    let cancelled = false;

    async function sync() {
      try {
        if (sessionStorage.getItem(SESSION_KEY)) return;
      } catch {
        // Private mode, or site data blocked. Fall through and just ask again;
        // the RPC is a no-op when the zone has not changed.
      }

      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz) return;

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      // Errors are read, not thrown: `timezone_change_rate_limited` is an
      // expected answer, not a fault.
      await supabase.rpc("set_my_timezone_rpc", { p_timezone: tz });
      if (cancelled) return;

      try {
        sessionStorage.setItem(SESSION_KEY, tz);
      } catch {
        // See above.
      }
    }

    void sync();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
