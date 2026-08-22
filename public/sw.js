/**
 * ILM Hunt service worker.
 *
 * Deliberately minimal: it exists to receive push messages and to open the
 * app when one is tapped. It does not cache anything. Offline play is a
 * separate, much larger piece of work, and a half-built cache is worse than
 * none — a stale shell serving a stale question bank is the kind of bug that
 * is invisible in development and infuriating in the field.
 */

self.addEventListener("install", () => {
  // Take over immediately rather than waiting for every tab to close. Nothing
  // here is cached, so there is no old version whose data could conflict.
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("push", (event) => {
  // The payload is JSON written by the sender. A push with no body, or with a
  // body that isn't ours, still shows something sensible rather than nothing:
  // a notification the browser cannot render is a notification the user was
  // promised and did not get.
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = {}
  }

  const title = payload.title || "ILM Hunt"
  const options = {
    body: payload.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    lang: payload.lang || "en",
    dir: payload.lang === "ar" ? "rtl" : "ltr",
    // One tag, so a second reminder replaces the first instead of stacking.
    // Nobody should wake up to four notifications about one streak.
    tag: "ilm-streak-reminder",
    renotify: false,
    data: { url: payload.url || "/home" },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const target = (event.notification.data && event.notification.data.url) || "/home"

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      // Reuse a tab that already has the app open rather than opening a
      // second one — the player almost always has one in the background.
      for (const client of windows) {
        if ("focus" in client) {
          client.navigate(target)
          return client.focus()
        }
      }
      return self.clients.openWindow(target)
    }),
  )
})
