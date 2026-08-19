import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Source_Serif_4 } from "next/font/google"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from "@/contexts/LanguageContext"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
})

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-source-serif",
})

export const viewport: Viewport = {
  themeColor: "#0b1326",
  width: "device-width",
  initialScale: 1,
  // Lets the page paint into the notch and home-indicator areas, which is what
  // makes env(safe-area-inset-*) non-zero. The layout then pads itself back
  // out per device rather than guessing a fixed number.
  viewportFit: "cover",
  // Deliberately no maximumScale or userScalable: blocking pinch zoom is an
  // accessibility failure, and this app is used by children and elders.
}

export const metadata: Metadata = {
  title: "ILM Hunt - Premium Islamic Learning",
  description:
    "Embark on a premium journey through Islamic knowledge with gamified learning, achievements, and a beautiful experience.",
  keywords:
    "Islamic education, Quran, Hadith, Islamic quiz, Islamic learning, ILM Hunt, premium Islamic app",
  openGraph: {
    title: "ILM Hunt - Premium Islamic Learning",
    description:
      "Premium gamified Islamic education platform for learning Quran, Hadith, and more.",
    url: "https://ilmhunt.com",
    siteName: "ILM Hunt",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ILM Hunt - Premium Islamic Learning",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ILM Hunt - Premium Islamic Learning",
    description:
      "Premium gamified Islamic education platform for learning Quran, Hadith, and more.",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${sourceSerif.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh] font-body-md antialiased bg-background text-on-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
