"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Spends real coins from the signed-in user's balance. This genuinely
 * persists to `profiles.coins` - there is currently no separate inventory
 * table, so a successful purchase means the coins are really spent, but
 * nothing is unlocked/owned yet beyond that. Fails honestly if the user
 * doesn't have enough coins, instead of letting the balance go negative.
 */
export async function purchaseStoreItem(price: number): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "You must be signed in." }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("coins")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) return { success: false, error: "Could not load your balance." }
  if (profile.coins < price) return { success: false, error: "Not enough coins." }

  const newBalance = profile.coins - price
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ coins: newBalance })
    .eq("id", user.id)

  if (updateError) return { success: false, error: "Purchase failed. Please try again." }

  return { success: true, newBalance }
}
