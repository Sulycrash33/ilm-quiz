"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from "react"
import { Locale, Translations, translations, t } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale, persistToProfile?: boolean) => void
  t: (key: keyof Translations, params?: Record<string, string | number>) => string
  dir: "ltr" | "rtl"
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

/** Writes the document-level language and writing direction. Kept in one
 * place so every path that changes the locale — restore-from-storage,
 * restore-from-profile, and an explicit pick — applies it identically. */
function applyDocumentLocale(next: Locale) {
  if (typeof document === "undefined") return
  document.documentElement.lang = next
  document.documentElement.dir = next === "ar" ? "rtl" : "ltr"
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")

  /** Set once the visitor has expressed a choice on this device — either by
   * restoring one from storage or by picking one. The profile lookup below is
   * asynchronous, and without this flag a pick made while it was still in
   * flight would be silently overwritten by the older stored value when it
   * landed. */
  const hasDeviceChoice = useRef(false)

  useEffect(() => {
    let cancelled = false

    // Load saved language from localStorage first (works before sign-in too)
    const saved = localStorage.getItem("ilm-locale") as Locale
    if (saved && translations[saved]) {
      hasDeviceChoice.current = true
      setLocaleState(saved)
      // This used to be missing on the restore path, so a returning Arabic
      // reader got their translated text laid out left-to-right until they
      // re-picked the language by hand.
      applyDocumentLocale(saved)
    }

    // Then check the real profile, so a language chosen on one device is
    // picked up by a device that has never chosen one.
    //
    // It fills a gap; it does not overrule. A stored choice is this device's
    // most recent instruction from the person holding it, and the profile
    // used to win unconditionally: pick Hausa, refresh, and the profile's
    // stale "en" put the whole app back into English. That looked like the
    // choice had not saved. It had — it was being overwritten on read.
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || cancelled || hasDeviceChoice.current) return
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("id", user.id)
        .single()
      const preferred = profile?.preferred_language as Locale | undefined
      if (cancelled || hasDeviceChoice.current) return
      if (preferred && translations[preferred]) {
        setLocaleState(preferred)
        localStorage.setItem("ilm-locale", preferred)
        applyDocumentLocale(preferred)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale, persistToProfile = true) => {
    hasDeviceChoice.current = true
    setLocaleState(newLocale)
    localStorage.setItem("ilm-locale", newLocale)
    applyDocumentLocale(newLocale)

    if (persistToProfile) {
      // A PostgREST query builder is lazy: it describes a request and sends
      // nothing until it is awaited. This update was built and dropped, so
      // every language a signed-in player ever chose was saved to the browser
      // and never to their profile. Awaiting it is the whole fix.
      void (async () => {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return
        const { error } = await supabase
          .from("profiles")
          .update({ preferred_language: newLocale })
          .eq("id", user.id)
        if (error) {
          console.error("Could not save preferred language to profile", error)
        }
      })()
    }
  }, [])

  const tFn = useCallback(
    (key: keyof Translations, params?: Record<string, string | number>) => t(key, locale, params),
    [locale],
  )

  const dir: "ltr" | "rtl" = locale === "ar" ? "rtl" : "ltr"

  /**
   * Memoised deliberately, and it is not only a performance nicety.
   *
   * This used to be a fresh object literal with a fresh `tFn` on every render,
   * so `t` was never referentially stable. Any consumer that put `t` in a
   * dependency array — a `useCallback`, or worse a `useEffect` — got a new
   * identity on every parent render and re-ran. For an effect that starts a
   * network request and aborts the previous one on cleanup, that is an endless
   * fetch-and-abort loop that never resolves. The prayer times card hit exactly
   * this and could never leave its loading state.
   *
   * With `locale` as the only real input, the value changes when the language
   * changes and at no other time.
   */
  const value = useMemo(
    () => ({ locale, setLocale, t: tFn, dir }),
    [locale, setLocale, tFn, dir],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
