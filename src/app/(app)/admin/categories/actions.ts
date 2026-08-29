'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * Managing the categories.
 *
 * `categories` has row level security on with a single `select` policy for
 * everyone and no insert, update or delete policy at all, so none of this can
 * be done from the client directly. Every write goes through a definer
 * function from migration 0040, which is what puts it in the audit log.
 */

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  questionCount: number;
}

export type CategoryResult = { ok: true } | { ok: false; error: string };

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

/** Every page that renders a category list, so a change is visible at once. */
function revalidateCategoryViews() {
  revalidatePath('/admin/categories');
  revalidatePath('/admin');
  revalidatePath('/quiz');
}

export async function createCategory(input: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}): Promise<CategoryResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc('admin_create_category', {
      p_name: input.name,
      p_slug: input.slug,
      p_description: input.description ?? null,
      p_icon: input.icon ?? null,
    });
    if (error) return { ok: false, error: error.message };
    revalidateCategoryViews();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not create that category.' };
  }
}

export async function updateCategory(input: {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}): Promise<CategoryResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc('admin_update_category', {
      p_id: input.id,
      p_name: input.name,
      p_description: input.description ?? null,
      p_icon: input.icon ?? null,
    });
    if (error) return { ok: false, error: error.message };
    revalidateCategoryViews();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not update that category.' };
  }
}

/**
 * Deleting is refused while anything still points at the category, and the
 * message says what and how many. That is not a limitation of this action: the
 * schema has `questions.category_id` as `on delete no action`, so the database
 * would refuse anyway. All 29 categories currently hold 180 questions each, so
 * in practice this succeeds only for a category you have just added.
 */
export async function deleteCategory(id: string): Promise<CategoryResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc('admin_delete_category', { p_id: id });
    if (error) return { ok: false, error: error.message };
    revalidateCategoryViews();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not delete that category.' };
  }
}

/**
 * Sends the whole desired order rather than "move this one up".
 *
 * Renumbering the full list from 1 is idempotent and cannot leave two
 * categories claiming the same position, which a pairwise swap can if two
 * edits race. It also repairs gaps left by an earlier delete.
 */
export async function reorderCategories(orderedIds: string[]): Promise<CategoryResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc('admin_reorder_categories', { p_ids: orderedIds });
    if (error) return { ok: false, error: error.message };
    revalidateCategoryViews();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save that order.' };
  }
}
