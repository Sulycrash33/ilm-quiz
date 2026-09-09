/**
 * How long until something unlocks, written for a player rather than a clock.
 *
 * Extracted from `RewardsPageClient`, where it was defined inline for the spin
 * wheel. The daily challenge needs the identical string for the identical
 * reason, and this repository has paid repeatedly for two copies of one rule —
 * the spin cooldown itself said "every 4 hours" in six languages while the
 * server refused anything inside twenty-four.
 *
 * `nowLabel` is passed in rather than imported so this stays free of the
 * language context and can be called from a server component if it ever needs
 * to be.
 */
export function formatCountdown(ms: number, nowLabel: string): string {
  if (ms <= 0) return nowLabel;
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}h ${pad(minutes)}m ${pad(seconds)}s` : `${minutes}m ${pad(seconds)}s`;
}

/*
 * `nextDailyResetAt` lived here and is gone.
 *
 * It computed the next **UTC** midnight, and its own doc comment carried the
 * warning: *"if the rollover should follow the player's own midnight instead,
 * that is a different change and a bigger one."* Migration 0064 is that
 * change. The reset instant is now derived in Postgres from
 * `profiles.timezone` and read through `getMyDayBounds`, so there is nothing
 * left for this side to compute — and nothing left to disagree with the
 * server about.
 *
 * The countdown copy still never names an hour, for a different reason than
 * before: it is now genuinely the player's midnight, but a fixed midnight is
 * only ever exactly 24 hours away at the instant it flips, so promising a
 * number would be promising the wrong one for most of the day.
 */
