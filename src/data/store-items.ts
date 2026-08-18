/**
 * Store item TYPES only.
 *
 * The catalogue itself now lives in the `store_items` table (migration 0006),
 * read through `getStoreCatalogue()`. The hardcoded `STORE_ITEMS` array that
 * used to sit here has been removed: it was a second price list that disagreed
 * with the one the store actually rendered (item 1 was 50 coins here and 100 in
 * StorePageClient), and nothing imported it. Two catalogues that can drift is
 * precisely how a store ends up charging a price nobody intended.
 *
 * These interfaces stay because StoreItemCard and BundleCard use them for props.
 */
export interface StoreItem {
  id: number;
  name: string;
  description: string;
  icon: string;
  price: number;
  inStock: boolean;
  popular?: boolean;
}

export interface Bundle {
  id: number;
  name: string;
  description: string;
  icon: string;
  price: number;
  originalPrice: number;
  items: string[];
}
