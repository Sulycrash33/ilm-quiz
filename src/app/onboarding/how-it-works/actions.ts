"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Records that this player has been shown how the game works.
 *
 * Best-effort on purpose: the explainer is already on screen by the time this
 * runs, so a failure means someone might be shown it once more — which is a
 * far better outcome than an error dialog over an onboarding screen. The
 * timestamp itself is latched in `mark_onboarding_seen` (migration 0025), so
 * repeated calls can't move it.
 */
export async function markOnboardingSeen(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.rpc("mark_onboarding_seen");
  } catch {
    /* nothing to recover — the player simply sees the explainer again */
  }
}
