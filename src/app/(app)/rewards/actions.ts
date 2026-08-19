"use server"

import { createClient } from "@/lib/supabase/server"

export interface LoginClaimResult {
  success: boolean
  error?: string
  alreadyClaimedToday?: boolean
  dayNumber?: number
  coinsAwarded?: number
  xpAwarded?: number
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
  if (row.o_already_claimed) return { success: false, alreadyClaimedToday: true, dayNumber: row.o_day_number }
  if (!row.o_success) return { success: false, error: row.o_error ?? "Could not claim today's reward." }

  return { success: true, dayNumber: row.o_day_number, coinsAwarded: row.o_coins_awarded, xpAwarded: row.o_xp_awarded }
}

export interface SpinResult {
  success: boolean
  error?: string
  nextAvailableAt?: string
  label?: string
  type?: "coins" | "xp"
  value?: number
}

/** Real weighted-random spin, computed inside the database via a SECURITY
 * DEFINER function so the outcome can't be seen or influenced client-side. */
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
