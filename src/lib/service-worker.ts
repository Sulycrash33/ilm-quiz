/**
 * Registering the service worker.
 *
 * This used to happen only inside the push-permission flow, which is gated
 * behind `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. With no key set, `pushSupport()`
 * returns "no-key" and the subscribe path is never taken — so the worker was
 * never registered at all, on any device. That was fine while the worker only
 * handled push. It stops being fine the moment anything offline depends on it,
 * because a worker that is never registered can never cache anything.
 *
 * So registration lives here, on its own, and runs for every player on load.
 * Push still calls it before subscribing; it no longer owns it.
 *
 * `register` is idempotent — calling it again with the same URL resolves to
 * the existing registration rather than installing a second worker — so the
 * layout and the push flow can both call this freely.
 */

export function serviceWorkerSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator
}

/**
 * Registers `/sw.js` and resolves once a worker is actually active.
 *
 * `register()` resolves as soon as the worker is registered, which can be
 * before it controls anything; `ready` is what guarantees an active worker.
 * Returns null rather than throwing — registration fails in ordinary
 * situations (insecure origin, private windows, a browser with the feature
 * switched off) and none of them should surface to the player.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!serviceWorkerSupported()) return null
  try {
    await navigator.serviceWorker.register("/sw.js")
    return await navigator.serviceWorker.ready
  } catch {
    return null
  }
}
