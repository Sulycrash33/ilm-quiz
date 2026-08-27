'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * The record of what administrators have done.
 *
 * Read-only by construction: `admin_audit_log` has a select policy for admins
 * and no insert, update or delete policy at all. Rows arrive only from
 * `log_admin_action`, which is granted to nobody and runs inside the other
 * definer functions. There is deliberately no action in this file that writes
 * or clears anything — a log an administrator can edit is not a log.
 */

export interface AuditEntry {
  id: number;
  actorEmail: string | null;
  action: string;
  targetType: string | null;
  targetLabel: string | null;
  detail: Record<string, unknown>;
  createdAt: string;
}

export type AuditResult =
  | { ok: true; entries: AuditEntry[]; total: number }
  | { ok: false; error: string };

export async function getAuditFeed(limit = 100, offset = 0): Promise<AuditResult> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('admin_audit_feed', {
      p_limit: limit,
      p_offset: offset,
    });
    if (error) return { ok: false, error: error.message };

    const rows = (data ?? []) as Array<Record<string, unknown>>;
    return {
      ok: true,
      total: rows.length > 0 ? Number(rows[0].o_total ?? 0) : 0,
      entries: rows.map((r) => ({
        id: Number(r.o_id),
        actorEmail: (r.o_actor_email as string | null) ?? null,
        action: String(r.o_action),
        targetType: (r.o_target_type as string | null) ?? null,
        targetLabel: (r.o_target_label as string | null) ?? null,
        detail: (r.o_detail as Record<string, unknown>) ?? {},
        createdAt: String(r.o_created_at),
      })),
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not load the audit log.' };
  }
}
