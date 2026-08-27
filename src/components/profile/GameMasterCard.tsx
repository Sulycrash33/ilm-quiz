"use client"

import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

/**
 * The way in to `/admin`.
 *
 * Seven admin pages have existed since the first admin pass and nothing in the
 * app has ever linked to any of them — not the bottom nav, not the profile,
 * not the home screen. The only route in was typing the URL, so the owner
 * reasonably concluded there was no admin area at all.
 *
 * It sits on the profile beside the other account-level cards rather than in
 * the bottom nav, because the nav is a player surface and this concerns one
 * account. Rendered only when the viewer is actually an administrator; the
 * pages behind it check again on the server, so hiding it is presentation,
 * not protection.
 */
export function GameMasterCard() {
  const { t, dir } = useLanguage()

  return (
    <div dir={dir} className="rounded-xl border border-primary/30 bg-primary/5 p-5">
      <div className="mb-2 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
        <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
          {t("gameMasterTitle")}
        </h3>
      </div>

      <p className="mb-4 text-sm text-on-surface-variant">{t("gameMasterDesc")}</p>

      <Link
        href="/admin"
        className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
      >
        {t("gameMasterOpen")}
      </Link>
    </div>
  )
}
