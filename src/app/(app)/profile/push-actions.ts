"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Stores the browser's push subscription against the signed-in player.
 *
 * The endpoint and keys come from the browser's PushManager and are opaque to
 * us — they are a capability to deliver one message to one device, not
 * personal data we can read. `save_push_subscription` (migration 0026) does
 * the upsert, keyed on the endpoint, because a device that re-subscribes must
 * replace its row rather than add one.
 */
export async function savePushSubscription(
  endpoint: string,
  p256dh: string,
  auth: string,
): Promise<{ saved: boolean }> {
  if (!endpoint || !p256dh || !auth) return { saved: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { saved: false };

  const { error } = await supabase.rpc("save_push_subscription", {
    p_endpoint: endpoint,
    p_p256dh: p256dh,
    p_auth: auth,
  });

  return { saved: !error };
}

/**
 * Turns reminders off and forgets every device.
 *
 * Deleting all of the player's subscriptions rather than just this browser's
 * is deliberate: someone turning reminders off means "stop messaging me", not
 * "stop messaging me on this one device".
 */
export async function disablePushReminders(): Promise<{ disabled: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { disabled: false };

  const { error } = await supabase.rpc("disable_push_reminders");
  return { disabled: !error };
}

/** Whether the player has reminders switched on, for the toggle's initial state. */
export async function getReminderPreference(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("streak_reminders_enabled")
    .eq("id", user.id)
    .single();

  return Boolean(data?.streak_reminders_enabled);
}
