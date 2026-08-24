"use client"

import { useEffect } from "react"
import { registerServiceWorker } from "@/lib/service-worker"

/**
 * Registers the service worker once, on load, for every signed-in player.
 *
 * Mounted in the app layout rather than the root one: the worker exists to
 * serve the game, and the marketing and auth routes have nothing to cache.
 *
 * Renders nothing. Failures are swallowed inside `registerServiceWorker` —
 * a browser that will not register a worker is a browser that plays online,
 * not one that shows the player an error.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    void registerServiceWorker()
  }, [])

  return null
}
