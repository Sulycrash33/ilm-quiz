"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import type { Translations } from "@/lib/i18n"

/**
 * A one-line centred notice whose text comes from the translation bundle.
 *
 * This exists because the pages that show these notices — profile, rewards,
 * store, achievements — are async **server** components, which cannot call
 * `useLanguage` themselves. Rendering the notice through this small client
 * component is what lets a server page's "please sign in" message follow the
 * selected language like everything else.
 */
export function TranslatedNotice({ messageKey }: { messageKey: keyof Translations }) {
  const { t, dir } = useLanguage()
  return (
    <div dir={dir} className="flex min-h-[100dvh] items-center justify-center px-6 text-center">
      <p className="text-on-surface-variant">{t(messageKey)}</p>
    </div>
  )
}
