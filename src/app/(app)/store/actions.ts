"use server"

import { createClient } from "@/lib/supabase/server"

/** A catalogue entry as the store renders it. `nameKey`/`descKey` are i18n keys,
 * so the copy stays translated; the price comes from the database. */
export interface StoreCatalogueItem {
  id: string
  nameKey: string
  descKey: string
  icon: string
  price: number
  tab: "lifelines" | "powerups" | "cosmetics" | "bundles"
  category: "avatar" | "theme" | "power-up" | "badge"
  consumable: boolean
  inStock: boolean
  /** How many the signed-in player owns. 0 when signed out or never bought. */
  owned: number
}

/**
 * The store catalogue, with the signed-in player's owned quantities merged in.
 *
 * Reads from `store_items` (migration 0006) rather than a TypeScript constant.
 * There used to be two hardcoded catalogues - `src/data/store-items.ts` and an
 * inline map in StorePageClient - which disagreed on price for the same item id.
 * One table means there is nothing left to drift.
 */
export async function getStoreCatalogue(): Promise<StoreCatalogueItem[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: items, error } = await supabase
    .from("store_items")
    .select("id, name_key, desc_key, icon, price_coins, tab, category, consumable, in_stock")
    .order("sort_order")

  if (error || !items) return []

  const ownedByItem = new Map<string, number>()
  if (user) {
    const { data: inventory } = await supabase
      .from("user_inventory")
      .select("item_id, quantity")
      .eq("user_id", user.id)
    ;(inventory ?? []).forEach((row: { item_id: string; quantity: number }) => {
      ownedByItem.set(row.item_id, row.quantity)
    })
  }

  return items.map((row: any) => ({
    id: row.id as string,
    nameKey: row.name_key as string,
    descKey: row.desc_key as string,
    icon: row.icon as string,
    price: row.price_coins as number,
    tab: row.tab as StoreCatalogueItem["tab"],
    category: row.category as StoreCatalogueItem["category"],
    consumable: row.consumable as boolean,
    inStock: row.in_stock as boolean,
    owned: ownedByItem.get(row.id as string) ?? 0,
  }))
}

export interface PurchaseResult {
  success: boolean
  error?: string
  newBalance?: number
  /** What the server actually charged. */
  price?: number
  /** How many the player owns after this purchase. */
  quantity?: number
}

/**
 * Buys one store item.
 *
 * Takes an item id, NOT a price. The previous version accepted the amount to
 * deduct straight from the caller, which meant anything able to reach the API
 * could buy a 3000-coin item for nothing - or pass a negative price and mint
 * coins. The price now lives in `store_items` and is read server-side; see
 * migration 0006.
 *
 * Also, unlike before, the purchase is recorded in `user_inventory`, so buying
 * something leaves a trace instead of only deducting coins and showing a toast.
 */
export async function purchaseStoreItem(itemId: string): Promise<PurchaseResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "You must be signed in." }

  const { data, error } = await supabase.rpc("purchase_store_item_rpc", { p_item_id: itemId })
  if (error) return { success: false, error: error.message || "Purchase failed." }

  const row = Array.isArray(data) ? data[0] : data
  if (!row) return { success: false, error: "Purchase failed." }
  if (!row.success) {
    return {
      success: false,
      error: row.error ?? "Purchase failed.",
      newBalance: row.new_balance ?? undefined,
      price: row.price ?? undefined,
    }
  }

  return {
    success: true,
    newBalance: row.new_balance,
    price: row.price,
    quantity: row.quantity,
  }
}
