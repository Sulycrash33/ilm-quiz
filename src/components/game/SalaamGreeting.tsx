"use client"

import { useProfile } from "@/hooks/use-profile"
import { useLanguage } from "@/contexts/LanguageContext"
import { rankProgress } from "@/lib/ranks"

/**
 * The home page greeting.
 *
 * Replaces "Welcome Back", which had two problems. It was the wrong words —
 * the greeting between Muslims is the salaam, not a generic welcome — and it
 * was marked `hidden sm:block`. Tailwind's `sm` is a 640px *width* breakpoint,
 * which no phone reaches in portrait, so on the devices almost every player
 * uses the greeting was not merely generic, it was absent.
 *
 * One line, not two. It first showed the Arabic script with a romanisation
 * beneath it, which said the same thing twice and cost two lines of a phone
 * screen. Arabic readers get the script; everyone else gets the romanisation.
 * The greeting itself is not translated — it is the same phrase everywhere.
 *
 * The rank is derived from `total_xp` by the same thresholds the database
 * uses, so what is shown here agrees with `profiles.current_rank_id` and with
 * the rank-based achievement criteria.
 */
export function SalaamGreeting() {
  const { profile, loading } = useProfile()
  const { t, dir } = useLanguage()

  const arabic = t("salaamArabic")
  const latin = t("salaamLatin")
  const { rank, next, percent, xpToNext, isMax } = rankProgress(profile?.totalXp ?? 0)
  const RankIcon = rank.icon

  if (loading) {
    return (
      <section className="pt-2 pb-1">
        <div className="h-6 w-56 rounded bg-white/5 animate-pulse" />
        <div className="mt-2 h-7 w-40 rounded bg-white/5 animate-pulse" />
      </section>
    )
  }

  return (
    <section className="pt-2 pb-1">
      {/* The greeting, in one form only: script for Arabic readers, the
          romanisation for everyone else. */}
      {latin ? (
        <p dir="ltr" className="text-primary/90 text-[13px] uppercase tracking-[0.1em] leading-relaxed">
          {latin}
        </p>
      ) : (
        <p dir="rtl" className="text-primary/90 text-[15px] leading-relaxed">
          {arabic}
        </p>
      )}

      <div dir={dir} className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <h1 className="font-headline-md text-headline-md text-on-surface leading-tight">
          {profile?.displayName ?? "—"}
        </h1>

        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1"
          title={
            isMax
              ? rank.title
              : `${rank.title} · ${xpToNext} XP to ${next?.title ?? ""}`
          }
        >
          <RankIcon className="h-3.5 w-3.5 text-primary" aria-hidden />
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
            {rank.title}
          </span>
        </span>
      </div>

      {/* How far into the current rank, and what is left. Hidden at Mujaddid,
          where there is nothing left to climb. */}
      {!isMax && (
        <div className="mt-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-primary/70 transition-[width] duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
          {/* "500 XP → Talib" beside a MUBTADI badge read as though the
              seeker held two ranks at once. Saying "to" makes it a target. */}
          <p className="mt-1 text-[11px] text-on-surface-variant/60">
            {xpToNext} XP to {next?.title}
          </p>
        </div>
      )}
    </section>
  )
}
