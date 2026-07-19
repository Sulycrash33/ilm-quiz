"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Locale, Translations, translations, t } from "@/lib/i18n"

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: keyof Translations, params?: Record<string, string | number>) => string
  dir: "ltr" | "rtl"
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")

  useEffect(() => {
    // Load saved language from localStorage
    const saved = localStorage.getItem("ilm-locale") as Locale
    if (saved && translations[saved]) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("ilm-locale", newLocale)
    document.documentElement.lang = newLocale
    document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr"
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
