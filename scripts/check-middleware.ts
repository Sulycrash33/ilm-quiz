/**
 * Guards the auth boundary.
 *
 * The middleware denies by default, which is the right way round but means a
 * mistake here has two failure modes and only one of them is loud. Listing a
 * route as public that should not be makes it reachable signed-out; failing to
 * exclude an asset from the matcher sends it to `/login`, which breaks the
 * service worker and the PWA manifest for signed-out visitors only — silently.
 *
 * Both rules are imported from `@/lib/auth-routes`, the same module the
 * middleware itself uses, so this cannot pass against a policy the app has
 * stopped using.
 */
import { readFileSync } from 'node:fs';
import { isPublicPath, MIDDLEWARE_MATCHER } from '../src/lib/auth-routes';

let failures = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'}: ${label}${ok ? '' : ` (got ${actual}, wanted ${expected})`}`);
}

// --- who may reach what, signed out -----------------------------------------
const PUBLIC: string[] = [
  '/',
  '/login',
  '/signup',
  '/language',
  '/onboarding',
  '/onboarding/name',
  '/onboarding/age',
  '/onboarding/avatar',
  '/onboarding/how-it-works',
];

const PRIVATE: string[] = [
  '/home',
  '/quiz',
  '/quiz/some-category',
  '/quiz/some-category/3',
  '/play/survival',
  '/profile',
  '/leaderboard',
  '/achievements',
  '/challenges',
  '/community',
  '/rewards',
  '/store',
  '/review',
  // All four of these were reachable signed-out under the old allow-by-default
  // list, which is the reason this file exists.
  '/multiplayer',
  '/admin',
  '/admin/users',
  '/admin/audit',
  '/admin/economy',
  '/admin/questions',
];

for (const p of PUBLIC) check(`public: ${p}`, isPublicPath(p), true);
for (const p of PRIVATE) check(`private: ${p}`, isPublicPath(p), false);

// A prefix must only match on a path boundary, or `/loginbait` becomes public.
for (const p of ['/loginsomething', '/signupfake', '/languages', '/onboardingx']) {
  check(`prefix does not over-match: ${p}`, isPublicPath(p), false);
}

// --- what the middleware runs on at all -------------------------------------
const matcher = new RegExp(`^${MIDDLEWARE_MATCHER}`);
const runs = (p: string) => matcher.test(p);

// Requested by the browser with no session. If the middleware intercepts these
// they are redirected to /login and the PWA quietly stops working.
for (const asset of [
  '/sw.js',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/og-image.png',
]) {
  check(`asset bypasses middleware: ${asset}`, runs(asset), false);
}

// Real pages must still go through it, or the deny-by-default does nothing.
for (const page of ['/home', '/admin', '/admin/users', '/profile', '/quiz/a/1']) {
  check(`page goes through middleware: ${page}`, runs(page), true);
}

// --- the matcher must be an inline literal in src/middleware.ts ------------
// Next.js reads `config` by static analysis and cannot follow an import. When
// it could not, it dropped the matcher and ran the middleware on everything,
// redirecting every static asset — including the JS chunks the login page
// needs — to /login for signed-out visitors. The build only warned and still
// exited 0, so nothing failed. This is that missing failure.
{
  const src = readFileSync(new URL('../src/middleware.ts', import.meta.url), 'utf8');

  const literalPresent = src.includes(JSON.stringify(MIDDLEWARE_MATCHER));
  check('middleware.ts inlines the matcher literal', literalPresent, true);

  const configBlock = src.slice(src.indexOf('export const config'));
  const referencesIdentifier = /matcher:\s*\[\s*[A-Za-z_$]/.test(configBlock);
  check('config.matcher is not an imported identifier', referencesIdentifier, false);
}

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
