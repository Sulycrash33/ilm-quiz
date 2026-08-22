/**
 * Generates a VAPID key pair for Web Push.
 *
 * Run once per environment: `npm run vapid:keys`
 *
 * The pair is generated here rather than shipped in the repository because the
 * private key is a signing credential — anyone holding it can send push
 * notifications that browsers will accept as coming from this app. It is
 * printed to the terminal and never written to disk; paste it straight into
 * the two places that need it and don't keep a copy anywhere else.
 *
 * VAPID keys are plain P-256 ECDSA keys in the uncompressed point / raw
 * private scalar form, base64url-encoded. Node's webcrypto produces exactly
 * that with the `raw` and `pkcs8`→`jwk` exports, so there is no dependency to
 * install for this.
 */

import { webcrypto } from "node:crypto"

function toBase64Url(bytes) {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

const pair = await webcrypto.subtle.generateKey(
  { name: "ECDSA", namedCurve: "P-256" },
  true,
  ["sign", "verify"],
)

// The public key is the uncompressed EC point (65 bytes, 0x04 prefix) — this
// is the exact form `pushManager.subscribe` expects as applicationServerKey.
const publicRaw = await webcrypto.subtle.exportKey("raw", pair.publicKey)

// The private key is the `d` scalar from the JWK, already base64url-encoded.
const privateJwk = await webcrypto.subtle.exportKey("jwk", pair.privateKey)

console.log(`
VAPID key pair generated. Neither key is saved to disk.

1. Public key — safe to commit and to expose in the browser.
   Set as a Vercel environment variable (all environments):

     NEXT_PUBLIC_VAPID_PUBLIC_KEY=${toBase64Url(new Uint8Array(publicRaw))}

2. Private key — a signing credential. Never commit it, never put it in
   NEXT_PUBLIC_ anything. Set it as a Supabase edge function secret:

     supabase secrets set VAPID_PRIVATE_KEY=${privateJwk.d}
     supabase secrets set VAPID_PUBLIC_KEY=${toBase64Url(new Uint8Array(publicRaw))}
     supabase secrets set VAPID_SUBJECT=mailto:you@yourdomain.com

If you ever rotate these, every existing browser subscription stops working
and every player has to switch reminders on again — the push service ties a
subscription to the key that created it.
`)
