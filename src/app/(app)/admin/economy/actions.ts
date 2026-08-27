'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * Tuning the economy without a deploy.
 *
 * The standing rule in this schema is that a multiplier, a price or a reward
 * must never arrive as an argument — migration 0006 fixed a store that took
 * its price from the caller. These setters take exactly those numbers, and
 * that is not a contradiction: the rule is about a *player* naming a number
 * that pays them. This is the configuration surface itself, reachable only by
 * an administrator, bounded in the database so a typo cannot mint a fortune,
 * and audited with before and after. The player-facing RPCs still take none
 * of it.
 */

export interface EconomySnapshot {
  lifelines: Array<{ id: string; cost: number; enabled: boolean; sort_order: number }>;
  store: Array<{ id: string; name_key: string; icon: string | null; price_coins: number; in_stock: boolean; tab: string | null }>;
  spin: Array<{ id: number; label: string; type: string; value: number; weight: number }>;
  chests: Array<{ tier: string; price_coins: number; reward_coins: number; reward_xp: number }>;
  modes: Array<{ mode: string; xp_numerator: number; xp_denominator: number; lives: number | null; run_seconds: number | null; per_question_timer: number | null; endless: boolean | null }>;
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in.');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'admin') {
    throw new Error('Not authorized. This page is restricted to administrators.');
  }
  return { supabase };
}

export type SnapshotResult =
  | { ok: true; economy: EconomySnapshot }
  | { ok: false; error: string };

export async function getEconomy(): Promise<SnapshotResult> {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.rpc('admin_economy_snapshot');
    if (error) return { ok: false, error: error.message };
    return { ok: true, economy: data as EconomySnapshot };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not load the economy.' };
  }
}

export type TuneResult = { ok: true } | { ok: false; error: string };

function done(): TuneResult {
  revalidatePath('/admin/economy');
  return { ok: true };
}

function oops(e: unknown): TuneResult {
  return { ok: false, error: e instanceof Error ? e.message : 'Could not save that change.' };
}

export async function setLifelinePrice(id: string, cost: number, enabled: boolean): Promise<TuneResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc('admin_update_lifeline_price', {
      p_id: id, p_cost: cost, p_enabled: enabled,
    });
    return error ? { ok: false, error: error.message } : done();
  } catch (e) { return oops(e); }
}

export async function setStoreItem(id: string, price: number, inStock: boolean): Promise<TuneResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc('admin_update_store_item', {
      p_id: id, p_price_coins: price, p_in_stock: inStock,
    });
    return error ? { ok: false, error: error.message } : done();
  } catch (e) { return oops(e); }
}

export async function setSpinReward(id: number, value: number, weight: number): Promise<TuneResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc('admin_update_spin_reward', {
      p_id: id, p_value: value, p_weight: weight,
    });
    return error ? { ok: false, error: error.message } : done();
  } catch (e) { return oops(e); }
}

export async function setChest(tier: string, price: number, coins: number, xp: number): Promise<TuneResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc('admin_update_chest_type', {
      p_tier: tier, p_price_coins: price, p_reward_coins: coins, p_reward_xp: xp,
    });
    return error ? { ok: false, error: error.message } : done();
  } catch (e) { return oops(e); }
}

export async function setGameMode(mode: string, numerator: number, denominator: number): Promise<TuneResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc('admin_update_game_mode', {
      p_mode: mode, p_xp_numerator: numerator, p_xp_denominator: denominator,
    });
    return error ? { ok: false, error: error.message } : done();
  } catch (e) { return oops(e); }
}
