"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Locale, Translations, translations, t } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale, persistToProfile?: boolean) => void
  t: (key: keyof Translations, params?: Record<string, string | number>) => string
  dir: "ltr" | "rtl"
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")

  useEffect(() => {
    // Load saved language from localStorage first (works before sign-in too)
    const saved = localStorage.getItem("ilm-locale") as Locale
    if (saved && translations[saved]) {
      setLocaleState(saved)
    }

    // Then check the real profile - a signed-in user's saved preference
    // takes precedence, so language follows them across devices.
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("id", user.id)
        .single()
      const preferred = profile?.preferred_language as Locale | undefined
      if (preferred && translations[preferred]) {
        setLocaleState(preferred)
        localStorage.setItem("ilm-locale", preferred)
        document.documentElement.lang = preferred
        document.documentElement.dir = preferred === "ar" ? "rtl" : "ltr"
      }
    })
  }, [])

  const setLocale = (newLocale: Locale, persistToProfile = true) => {
    setLocaleState(newLocale)
    localStorage.setItem("ilm-locale", newLocale)
    document.documentElement.lang = newLocale
    document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr"

    if (persistToProfile) {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase.from("profiles").update({ preferred_language: newLocale }).eq("id", user.id)
        }
      })
    }
  }

  const tFn = (key: keyof Translations, params?: Record<string, string | number>) => {
    return t(key, locale, params)
  }

  const dir = locale === "ar" ? "rtl" : "ltr"

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: tFn, dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
