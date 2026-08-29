/**
 * Which routes a signed-out visitor may reach, and which requests the auth
 * middleware runs on at all.
 *
 * This lives on its own, with no imports, for two reasons. Both the middleware
 * entry point and its Supabase session helper need it, and — more usefully —
 * `npm run test:middleware` can import it without pulling in `next/server`.
 * A copy of these rules inside a test would be a copy that drifts, and the one
 * thing worse than an untested auth boundary is a test that passes against
 * rules the app no longer uses.
 */

/**
 * Public route prefixes. Everything not matched here requires a session.
 *
 * It used to be the other way round: a hardcoded list of *protected* prefixes,
 * plus a `pathname.startsWith("/(app)")` test that could never match, because
 * route groups are a folder convention and never appear in a URL. That clause
 * was dead from the day it was written.
 *
 * With protection opt-in, a page went unguarded unless somebody remembered to
 * add it, and several had been forgotten: `/admin`, `/multiplayer`,
 * `/onboarding` and `/language` were all absent. That was not an open door —
 * the admin pages each re-check the role server-side and the data behind the
 * rest is under row level security — but it is the wrong default for an app
 * that keeps growing pages. Forgetting to list a route now makes it *too*
 * protected, which someone notices immediately, rather than not protected at
 * all, which nobody notices.
 *
 * `/onboarding` is public deliberately: it is the tail of the signup flow, and
 * depending on how a session settles after sign-up, gating it can strand a new
 * player between having an account and being able to finish setting one up.
 * Those pages write through RLS, so a signed-out visitor can look and not much
 * else.
 */
export const PUBLIC_PREFIXES = [
  '/login',
  '/signup',
  '/onboarding',
  '/language',
  // Both halves of password recovery. `/reset-password` in particular is
  // reached from an email by someone who cannot sign in, which is the whole
  // reason they are there: gating it behind a session would send them to the
  // login page they are locked out of.
  '/forgot-password',
  '/reset-password',
] as const;

/** `/` is public exactly; the rest match as a prefix but only on a boundary,
 * so `/loginsomething` is not mistaken for `/login`. */
export function isPublicPath(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * What the middleware runs on.
 *
 * The exclusions carry more weight than they used to. The session check denies
 * by default now, so anything reaching it without a session is redirected to
 * `/login` — and the previous pattern excluded only image extensions. That
 * would have sent `/sw.js` and `/manifest.webmanifest` to a login page: the
 * service worker would fail to register, taking the groundwork for offline
 * play with it, and the PWA manifest would not load. Both silently, and only
 * for signed-out visitors, which is the hardest kind of bug to notice.
 */
export const MIDDLEWARE_MATCHER =
  '/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|json|webmanifest|txt|xml)$).*)';
