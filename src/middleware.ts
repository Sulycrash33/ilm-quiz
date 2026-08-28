import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/**
 * The matcher MUST be an inline literal.
 *
 * Next.js reads `config` by static analysis at build time and cannot follow an
 * imported identifier. Referencing a shared constant here — which is exactly
 * what the previous version did, to stop the test drifting from the real
 * pattern — made the build emit:
 *
 *     Next.js can't recognize the exported `config` field in route
 *     "/src/middleware": Unknown identifier "MIDDLEWARE_MATCHER"
 *
 * and then drop the matcher entirely, so the middleware ran on *every*
 * request. With the session check denying by default, that redirected every
 * static asset to /login for signed-out visitors — icons, the favicon, the
 * manifest, the service worker, and `/_next/static/chunks/*.js`, which meant
 * the login page could not hydrate and nobody could sign in.
 *
 * The build only warned; it still exited 0. So the value duplicated here is
 * checked against `MIDDLEWARE_MATCHER` by `npm run test:middleware`, which
 * reads this file and compares the two strings. Keep them identical.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|json|webmanifest|txt|xml)$).*)",
  ],
};
