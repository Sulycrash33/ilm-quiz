"use server"

import { createClient } from "@/lib/supabase/server"

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}
function yesterdayUTC(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

export interface LoginClaimResult {
  success: boolean
  error?: string
  alreadyClaimedToday?: boolean
  dayNumber?: number
  coinsAwarded?: number
  xpAwarded?: number
}

/** Real daily login claim: one per calendar day, real 7-day cycle that resets if a day is missed. */
export async function claimDailyLogin(): Promise<LoginClaimResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "You must be signed in." }

  const today = todayUTC()

  const { data: existingToday } = await supabase
    .from("user_login_claims")
    .select("day_number")
    .eq("user_id", user.id)
    .eq("claim_date", today)
    .maybeSingle()

  if (existingToday) return { success: false, alreadyClaimedToday: true, dayNumber: existingToday.day_number }

  const { data: yesterdayClaim } = await supabase
    .from("user_login_claims")
    .select("day_number")
    .eq("user_id", user.id)
    .eq("claim_date", yesterdayUTC())
    .maybeSingle()

  const nextDay = yesterdayClaim ? (yesterdayClaim.day_number % 7) + 1 : 1

  const { data: reward } = await supabase
    .from("daily_login_rewards")
    .select("coins, xp")
    .eq("day_number", nextDay)
    .single()

  if (!reward) return { success: false, error: "Reward catalog is missing that day." }

  const { error: claimError } = await supabase
    .from("user_login_claims")
    .insert({ user_id: user.id, claim_date: today, day_number: nextDay })
  if (claimError) return { success: false, error: "Could not record your claim." }

  const { data: profile } = await supabase.from("profiles").select("coins, total_xp").eq("id", user.id).single()
  if (profile) {
    await supabase
      .from("profiles")
      .update({ coins: profile.coins + reward.coins, total_xp: profile.total_xp + reward.xp })
      .eq("id", user.id)
  }

  return { success: true, dayNumber: nextDay, coinsAwarded: reward.coins, xpAwarded: reward.xp }
}

export interface SpinResult {
  success: boolean
  error?: string
  nextAvailableAt?: string
  label?: string
  type?: "coins" | "xp"
  value?: number
}

const SPIN_COOLDOWN_MS = 4 * 60 * 60 * 1000 // 4 hours, matches the original UI copy

/** Real weighted-random spin, computed server-side so the outcome can't be seen or influenced client-side. */
export async function spinWheel(): Promise<SpinResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "You must be signed in." }

  const { data: profile } = await supabase.from("profiles").select("last_spin_at, coins, total_xp").eq("id", user.id).single()
  if (!profile) return { success: false, error: "Could not load your profile." }

  if (profile.last_spin_at) {
    const elapsed = Date.now() - new Date(profile.last_spin_at).getTime()
    if (elapsed < SPIN_COOLDOWN_MS) {
      return {
        success: false,
        error: "Your next free spin isn't ready yet.",
        nextAvailableAt: new Date(new Date(profile.last_spin_at).getTime() + SPIN_COOLDOWN_MS).toISOString(),
      }
    }
  }

  const { data: rewards } = await supabase.from("spin_rewards").select("label, type, value, weight")
  if (!rewards || rewards.length === 0) return { success: false, error: "Spin rewards aren't set up yet." }

  const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0)
  let roll = Math.random() * totalWeight
  let picked = rewards[rewards.length - 1]
  for (const r of rewards) {
    if (roll < r.weight) {
      picked = r
      break
    }
    roll -= r.weight
  }

  const updates: { last_spin_at: string; coins?: number; total_xp?: number } = {
    last_spin_at: new Date().toISOString(),
  }
  if (picked.type === "coins") updates.coins = profile.coins + picked.value
  else updates.total_xp = profile.total_xp + picked.value

  await supabase.from("profiles").update(updates).eq("id", user.id)

  return { success: true, label: picked.label, type: picked.type as "coins" | "xp", value: picked.value }
}

export interface ChestOpenResult {
  success: boolean
  error?: string
  coinsAwarded?: number
  xpAwarded?: number
}

/** Real purchase-and-open: deducts the chest price, then rolls a real reward within that tier's real range. */
export async function purchaseAndOpenChest(tier: "bronze" | "silver" | "gold" | "diamond"): Promise<ChestOpenResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "You must be signed in." }

  const { data: chestType } = await supabase
    .from("chest_types")
    .select("price_coins, min_coins, max_coins, min_xp, max_xp")
    .eq("tier", tier)
    .single()
  if (!chestType) return { success: false, error: "That chest type doesn't exist." }

  const { data: profile } = await supabase.from("profiles").select("coins, total_xp").eq("id", user.id).single()
  if (!profile) return { success: false, error: "Could not load your balance." }
  if (profile.coins < chestType.price_coins) return { success: false, error: "Not enough coins." }

  const coinsAwarded = Math.floor(Math.random() * (chestType.max_coins - chestType.min_coins + 1)) + chestType.min_coins
  const xpAwarded = Math.floor(Math.random() * (chestType.max_xp - chestType.min_xp + 1)) + chestType.min_xp

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      coins: profile.coins - chestType.price_coins + coinsAwarded,
      total_xp: profile.total_xp + xpAwarded,
    })
    .eq("id", user.id)
  if (updateError) return { success: false, error: "Purchase failed." }

  await supabase.from("user_chest_opens").insert({
    user_id: user.id,
    tier,
    coins_awarded: coinsAwarded,
    xp_awarded: xpAwarded,
  })

  return { success: true, coinsAwarded, xpAwarded }
}
