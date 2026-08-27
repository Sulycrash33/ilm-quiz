'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * The register, and the one destructive thing an administrator can do to it.
 *
 * Both go through `admin_list_users()` and `admin_delete_user()` (migration
 * 0031) rather than touching tables here. The email lives on `auth.users`,
 * which no ordinary role may read, and the delete has to cascade through a
 * dozen tables — neither is something a page query can do.
 *
 * The `requireAdmin` check below is deliberately duplicated in the database.
 * It is here so an unauthorised click gets a sentence instead of a raw
 * Postgres error, and there so that skipping this file entirely — a direct
 * POST to `/rest/v1/rpc/admin_delete_user` — still gets refused.
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
  /** True for the administrator doing the looking. The row renders without a
   * delete button, matching the database rule that you cannot remove
   * yourself. */
  isSelf: boolean;
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
      })),
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not load users.' };
  }
}

export type DeleteUserResult =
  | { ok: true; email: string }
  | { ok: false; error: string };

/**
 * Removes an account and everything the foreign keys hang off it.
 *
 * Irreversible. The confirmation that makes it safe to offer lives in the
 * component, not here — an action that is called is an action that was meant.
 */
export async function deleteUser(userId: string): Promise<DeleteUserResult> {
  try {
    const { supabase } = await requireAdmin();

    if (!userId) return { ok: false, error: 'No account given.' };

    const { data, error } = await supabase.rpc('admin_delete_user', { p_user_id: userId });
    if (error) return { ok: false, error: error.message };

    revalidatePath('/admin/users');
    revalidatePath('/admin');

    return { ok: true, email: typeof data === 'string' ? data : 'that account' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not remove that account.' };
  }
}
