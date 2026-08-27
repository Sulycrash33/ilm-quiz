'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * The register, and everything an administrator can do to a single account.
 *
 * Every mutation here is a thin call onto a guarded RPC (migrations 0031 and
 * 0032). The `requireAdmin` check below is deliberately duplicated in the
 * database: it is here so an unauthorised click gets a sentence instead of a
 * raw Postgres error, and there so that skipping this file entirely — a direct
 * POST to `/rest/v1/rpc/` — still gets refused.
 *
 * Delete, role change and suspension all write to `admin_audit_log` from
 * inside the database, so there is no way to perform one of them without
 * leaving a record, including from here.
 */

export interface AdminUser {
  id: string;
  email: string | null;
  displayName: string | null;
  role: string;
  totalXp: number;
  coins: number;
  streakCount: number;
  attempts: number;
  createdAt: string;
  lastSignInAt: string | null;
  /** True for the administrator doing the looking. The row renders without
   * destructive controls, matching the database rules that you cannot delete,
   * demote or suspend yourself. */
  isSelf: boolean;
  suspended: boolean;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not signed in.');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Not authorized. This page is restricted to administrators.');
  }

  return { supabase, userId: user.id };
}

function fail(e: unknown, fallback: string) {
  return { ok: false as const, error: e instanceof Error ? e.message : fallback };
}

export type ListUsersResult =
  | { ok: true; users: AdminUser[] }
  | { ok: false; error: string };

export async function listUsers(): Promise<ListUsersResult> {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.rpc('admin_list_users');
    if (error) return { ok: false, error: error.message };

    const rows = (data ?? []) as Array<Record<string, unknown>>;
    return {
      ok: true,
      users: rows.map((r) => ({
        id: String(r.o_id),
        email: (r.o_email as string | null) ?? null,
        displayName: (r.o_display_name as string | null) ?? null,
        role: String(r.o_role ?? 'user'),
        totalXp: Number(r.o_total_xp ?? 0),
        coins: Number(r.o_coins ?? 0),
        streakCount: Number(r.o_streak_count ?? 0),
        attempts: Number(r.o_attempts ?? 0),
        createdAt: String(r.o_created_at),
        lastSignInAt: (r.o_last_sign_in as string | null) ?? null,
        isSelf: Boolean(r.o_is_self),
        suspended: Boolean(r.o_suspended),
      })),
    };
  } catch (e) {
    return fail(e, 'Could not load users.');
  }
}

export type MutateUserResult =
  | { ok: true; email: string }
  | { ok: false; error: string };

/**
 * Removes an account and everything the foreign keys hang off it.
 *
 * Irreversible. The confirmation that makes it safe to offer lives in the
 * component, not here — an action that is called is an action that was meant.
 */
export async function deleteUser(userId: string): Promise<MutateUserResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!userId) return { ok: false, error: 'No account given.' };

    const { data, error } = await supabase.rpc('admin_delete_user', { p_user_id: userId });
    if (error) return { ok: false, error: error.message };

    revalidatePath('/admin/users');
    revalidatePath('/admin');
    return { ok: true, email: typeof data === 'string' ? data : 'that account' };
  } catch (e) {
    return fail(e, 'Could not remove that account.');
  }
}

export async function setUserRole(userId: string, role: string): Promise<MutateUserResult> {
  try {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase.rpc('admin_set_role', {
      p_user_id: userId,
      p_role: role,
    });
    if (error) return { ok: false, error: error.message };

    revalidatePath('/admin/users');
    return { ok: true, email: typeof data === 'string' ? data : 'that account' };
  } catch (e) {
    return fail(e, 'Could not change that role.');
  }
}

/**
 * The softer half of removal: the account and its history stay, the person
 * cannot sign in. Sets `auth.users.banned_until` — what Supabase's own auth
 * checks — and clears live sessions so it takes effect immediately.
 */
export async function setUserSuspended(
  userId: string,
  suspend: boolean,
): Promise<MutateUserResult> {
  try {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase.rpc('admin_set_suspended', {
      p_user_id: userId,
      p_suspend: suspend,
    });
    if (error) return { ok: false, error: error.message };

    revalidatePath('/admin/users');
    revalidatePath('/admin');
    return { ok: true, email: typeof data === 'string' ? data : 'that account' };
  } catch (e) {
    return fail(e, 'Could not change that account.');
  }
}

export type PlayerDetailResult =
  | { ok: true; detail: PlayerDetail }
  | { ok: false; error: string };

export interface PlayerDetail {
  profile: {
    id: string;
    email: string | null;
    display_name: string | null;
    role: string;
    total_xp: number;
    coins: number;
    streak_count: number;
    longest_streak: number;
    created_at: string;
    last_sign_in_at: string | null;
    suspended: boolean;
    preferred_language: string;
  };
  totals: {
    attempts: number;
    correct: number;
    xp_from_attempts: number;
    first_seen: string | null;
    last_seen: string | null;
  };
  categories: Array<{ name: string; attempts: number; correct: number; max_tier: number | null }>;
  runs: Array<{
    category: string | null;
    status: string;
    correct: number;
    wrong: number;
    xp_earned: number;
    created_at: string;
  }>;
  league: Array<{
    week_start: string;
    cohort: number;
    rank: number | null;
    promoted: boolean | null;
    relegated: boolean | null;
  }>;
}

/** Everything about one player in a single call. Four round trips to render
 * one page is four chances for the page to disagree with itself. */
export async function getPlayerDetail(userId: string): Promise<PlayerDetailResult> {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.rpc('admin_player_detail', { p_user_id: userId });
    if (error) return { ok: false, error: error.message };
    return { ok: true, detail: data as PlayerDetail };
  } catch (e) {
    return fail(e, 'Could not load that player.');
  }
}
