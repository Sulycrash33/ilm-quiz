"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar"
import type { Translations } from "@/lib/i18n"

const navItems: { labelKey: keyof Translations; href: string; icon: React.ReactNode }[] = [
  {
    labelKey: "home" as keyof Translations,
    href: "/home",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    labelKey: "learning" as keyof Translations,
    href: "/quiz",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
      </svg>
    ),
  },
  {
    labelKey: "rankings" as keyof Translations,
    href: "/leaderboard",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z" />
      </svg>
    ),
  },
  {
    labelKey: "shop" as keyof Translations,
    href: "/store",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.78 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
      </svg>
    ),
  },
  {
    labelKey: "profile" as keyof Translations,
    href: "/profile",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
]

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { t, dir } = useLanguage()

  return (
    <div dir={dir} className="relative min-h-[100dvh] bg-background">
      <ServiceWorkerRegistrar />

      {/* Background Accents */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-secondary/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 mashrabiya-pattern" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 pb-nav-safe md:pb-8">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around items-center py-2 pb-safe">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex flex-col items-center justify-center
                    px-3 py-2 rounded-xl
                    transition-all duration-200
                    ${isActive
                      ? "bg-primary-container/20 text-primary"
                      : "text-on-surface-variant/70 hover:bg-white/5"
                    }
                  `}
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={isActive ? "text-primary" : ""}
                  >
                    {item.icon}
                  </motion.div>
                  <span className="font-label-caps text-label-caps mt-1">
                    {t(item.labelKey)}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 w-8 h-1 bg-primary rounded-full"
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
