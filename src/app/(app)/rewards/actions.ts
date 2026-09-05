"use server"

import { createClient } from "@/lib/supabase/server"

export interface LoginClaimResult {
  success: boolean
  error?: string
  alreadyClaimedToday?: boolean
  dayNumber?: number
  coinsAwarded?: number
  xpAwarded?: number
  /** The day's task, reported by the same function that enforces it. */
  taskRequired?: number
  taskAnswered?: number
  /** The claim was refused because today's questions are not done yet. */
  taskIncomplete?: boolean
}

export interface DailyTaskProgress {
  required: number
  answered: number
  done: boolean
}

/**
 * Today's questions, for the screen.
 *
 * Read through `daily_task_progress()` rather than counted here, so the number
 * the player is shown and the number the claim is judged against come from one
 * place. Counting attempts again in TypeScript is how the two drift, and a
 * progress bar that says 5/5 beside a button that refuses is worse than no
 * progress bar.
 */
export async function getDailyTaskProgress(): Promise<DailyTaskProgress> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("daily_task_progress")
  const row = Array.isArray(data) ? data[0] : data
  if (error || !row) return { required: 0, answered: 0, done: false }
  const required = Number(row.o_required ?? 0)
  const answered = Number(row.o_answered ?? 0)
  return { required, answered, done: required > 0 && answered >= required }
}

/** Real daily login claim via a SECURITY DEFINER function - see
 * supabase/migrations for why this can't be done with a direct table write. */
export async function claimDailyLogin(): Promise<LoginClaimResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "You must be signed in." }

  const { data, error } = await supabase.rpc("claim_daily_login_rpc")
  if (error) return { success: false, error: error.message || "Could not claim today's reward." }

  const row = Array.isArray(data) ? data[0] : data
  if (!row) return { success: false, error: "Could not claim today's reward." }

  // Columns are `o_`-prefixed: the RPC's OUT parameters were renamed in
  // migration 0016 because `day_number` collided with the identically-named
  // column on `user_login_claims`, which made the function raise at call time.
  const taskRequired = row.o_task_required ?? undefined
  const taskAnswered = row.o_task_answered ?? undefined

  if (row.o_already_claimed) {
    return { success: false, alreadyClaimedToday: true, dayNumber: row.o_day_number, taskRequired, taskAnswered }
  }
  // 0053 gates the claim on answering the day's questions. The sentinel is
  // matched rather than shown: the copy belongs in the string table, in six
  // languages, not in an error string coming out of Postgres.
  if (row.o_error === "daily_task_incomplete") {
    return { success: false, taskIncomplete: true, taskRequired, taskAnswered }
  }
  if (!row.o_success) return { success: false, error: row.o_error ?? "Could not claim today's reward.", taskRequired, taskAnswered }

  return {
    success: true,
    dayNumber: row.o_day_number,
    coinsAwarded: row.o_coins_awarded,
    xpAwarded: row.o_xp_awarded,
    taskRequired,
    taskAnswered,
  }
}

export interface SpinResult {
  success: boolean
  error?: string
  nextAvailableAt?: string
  label?: string
  type?: "coins" | "xp"
  value?: number
}

/**
 * Today's gift, chosen and awarded inside the database.
 *
 * **Not weighted-random**, whatever the `weight` column on `spin_rewards`
 * suggests — this comment used to say it was, and it has been wrong since
 * migration 0008. That migration took the randomness out of the wheel and the
 * chests on loot-box grounds, and replaced the roll with a rota: the reward is
 * `(day number) % (number of rewards)`, so every player gets the same gift on
 * the same day and `weight` is dead data. Read 0008 before adding a roll back.
 *
 * The cadence is **once every 24 hours**, not the four the UI claimed for a
 * long time. `SPIN_COOLDOWN_MS` in `RewardsPageClient` is the client's copy of
 * that number; the server is the one that enforces it.
 *
 * Still SECURITY DEFINER, and the outcome still cannot be influenced from the
 * client: the prize is awarded and `last_spin_at` is stamped in the same
 * statement that picks it.
 */
export async function spinWheel(): Promise<SpinResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "You must be signed in." }

  const { data, error } = await supabase.rpc("spin_wheel_rpc")
  if (error) return { success: false, error: error.message || "Could not spin right now." }

  const row = Array.isArray(data) ? data[0] : data
  if (!row) return { success: false, error: "Could not spin right now." }
  if (!row.success) return { success: false, error: row.error ?? "Could not spin right now.", nextAvailableAt: row.next_available_at ?? undefined }

  return { success: true, label: row.label, type: row.reward_type as "coins" | "xp", value: row.value }
}

export interface ChestOpenResult {
  success: boolean
  error?: string
  coinsAwarded?: number
  xpAwarded?: number
}

/** Real purchase-and-open via a SECURITY DEFINER function - deducts the
 * chest price and rolls a reward within that tier's real range, atomically. */
export async function purchaseAndOpenChest(tier: "bronze" | "silver" | "gold" | "diamond"): Promise<ChestOpenResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "You must be signed in." }

  const { data, error } = await supabase.rpc("open_chest_rpc", { p_tier: tier })
  if (error) return { success: false, error: error.message || "Could not open that chest." }

  const row = Array.isArray(data) ? data[0] : data
  if (!row) return { success: false, error: "Could not open that chest." }
  if (!row.success) return { success: false, error: row.error ?? "Could not open that chest." }

  return { success: true, coinsAwarded: row.coins_awarded, xpAwarded: row.xp_awarded }
}
