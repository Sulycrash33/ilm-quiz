"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Spends real coins from the signed-in user's balance via a SECURITY
 * DEFINER Postgres function - the balance itself can no longer be updated
 * directly from a client call (see supabase/migrations), so this is the
 * only path that can actually change it.
 */
export async function purchaseStoreItem(price: number): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "You must be signed in." }

  const { data, error } = await supabase.rpc("purchase_store_item_rpc", { p_price: price })
  if (error) return { success: false, error: error.message || "Purchase failed." }

  const row = Array.isArray(data) ? data[0] : data
  if (!row) return { success: false, error: "Purchase failed." }
  if (!row.success) return { success: false, error: row.error ?? "Purchase failed." }

  return { success: true, newBalance: row.new_balance }
}
