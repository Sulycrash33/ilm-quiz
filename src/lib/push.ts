/**
 * Browser-side plumbing for streak reminders.
 *
 * Push notification is the only thing in the app that can reach a player who
 * has closed the tab, which makes it both the highest-leverage retention
 * feature and the easiest one to abuse. The posture here matches the sound:
 * off until asked for, one message a day at most, and only when a streak is
 * genuinely about to break.
 *
 * Every function is defensive. Push is unavailable in more situations than
 * people expect — iOS Safari outside an installed PWA, private windows,
 * Firefox with the feature disabled, any insecure origin — and none of them
 * should surface as an error the player has to deal with.
 */

import { registerServiceWorker } from "@/lib/service-worker"

export type PushSupport = "ready" | "unsupported" | "denied" | "no-key"

/** The VAPID public key identifies this server to the push service. It is
 *  public by design — it travels in every subscription request. */
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""

export function pushSupport(): PushSupport {
  if (typeof window === "undefined") return "unsupported"
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return "unsupported"
  }
  if (!VAPID_PUBLIC_KEY) return "no-key"
  if (Notification.permission === "denied") return "denied"
  return "ready"
}

/**
 * The push service sends the key as a URL-safe base64 string; the browser
 * wants raw bytes. This conversion is the one piece of the flow with no
 * sensible fallback — a malformed key produces an opaque subscribe error, so
 * it throws loudly rather than returning something subtly wrong.
 */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const normalised = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = window.atob(normalised)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i)
  return output
}

// Registration itself lives in `service-worker.ts`, because the worker is no
// longer push's alone — it registers on load for every player, whether or not
// reminders are configured. Calling it again here is harmless and keeps the
// subscribe path working when a player enables reminders mid-session.
const registration = registerServiceWorker

export interface PushKeys {
  endpoint: string
  p256dh: string
  auth: string
}

function encodeKey(sub: PushSubscription, name: "p256dh" | "auth"): string {
  const key = sub.getKey(name)
  if (!key) return ""
  return window.btoa(String.fromCharCode(...new Uint8Array(key)))
}

/**
 * Asks permission, registers the worker, and subscribes.
 *
 * Returns the subscription's keys for the caller to persist, or null if the
 * player declined or the browser cannot do this. Never throws: a refused
 * permission is an ordinary answer, not a failure.
 */
export async function subscribeToPush(): Promise<PushKeys | null> {
  if (pushSupport() !== "ready") return null

  try {
    const permission = await Notification.requestPermission()
    if (permission !== "granted") return null

    const reg = await registration()
    if (!reg) return null

    // An existing subscription is reused rather than replaced. Unsubscribing
    // and re-subscribing would hand out a new endpoint and orphan the stored
    // row for no gain.
    const existing = await reg.pushManager.getSubscription()
    const sub =
      existing ??
      (await reg.pushManager.subscribe({
        // Required by every browser now: a push that doesn't show a
        // notification is not allowed, which is the behaviour we want anyway.
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }))

    const p256dh = encodeKey(sub, "p256dh")
    const auth = encodeKey(sub, "auth")
    if (!p256dh || !auth) return null

    return { endpoint: sub.endpoint, p256dh, auth }
  } catch {
    return null
  }
}

/**
 * Drops the browser's subscription.
 *
 * The database row is removed separately by the caller. Both are attempted
 * even if one fails: a browser still holding a subscription whose row is gone
 * simply receives nothing, which is the intended state.
 */
export async function unsubscribeFromPush(): Promise<void> {
  try {
    if (!("serviceWorker" in navigator)) return
    const reg = await navigator.serviceWorker.getRegistration()
    const sub = await reg?.pushManager.getSubscription()
    await sub?.unsubscribe()
  } catch {
    /* the row is what actually stops the sending */
  }
}

/** Whether this browser currently holds a push subscription. */
export async function hasPushSubscription(): Promise<boolean> {
  try {
    if (!("serviceWorker" in navigator)) return false
    const reg = await navigator.serviceWorker.getRegistration()
    const sub = await reg?.pushManager.getSubscription()
    return Boolean(sub)
  } catch {
    return false
  }
}
