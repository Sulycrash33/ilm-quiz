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

/**
 * The instant the daily challenge rolls over, as a timestamp.
 *
 * **This is the database's midnight, not the player's.** The challenge is keyed
 * on `current_date` in Postgres and the database runs in **UTC**, checked
 * rather than assumed (`current_setting('TimeZone')` returns `UTC`). So the day
 * turns at 00:00 UTC for everyone on earth at the same instant, which is 01:00
 * for a player in Nigeria and 08:00 for one in Malaysia.
 *
 * A countdown that promised "midnight" would therefore be a lie on the screen
 * for almost every player, which is the exact class of bug this project has
 * spent itself removing. So the copy says *when the next challenge arrives*
 * and never names an hour, and this function computes the real instant.
 *
 * If the rollover should follow the player's own midnight instead, that is a
 * different change and a bigger one: the daily is the same five questions for
 * everyone on a given day, and a per-player date breaks that promise unless
 * every reader of `current_date` learns a timezone.
 */
export function nextDailyResetAt(from: Date = new Date()): Date {
  return new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + 1, 0, 0, 0, 0)
  );
}
