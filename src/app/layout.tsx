import type React from "react"
import type { Metadata } from "next"
import { Amiri, PT_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const pt_sans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pt-sans",
})

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
})

export const metadata: Metadata = {
  title: "IlmHunt - Islamic Knowledge Journey",
  description:
    "Embark on a scholarly journey through Islamic knowledge with gamified learning.",
  keywords:
    "Islamic education, Quran, Hadith, Islamic quiz, Islamic learning, IlmHunt",
  openGraph: {
    title: "IlmHunt - Islamic Knowledge Journey",
    description:
      "Gamified Islamic education platform for learning Quran, Hadith, and more.",
    url: "https://ilmhunt.com",
    siteName: "IlmHunt",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IlmHunt - Islamic Knowledge Journey",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IlmHunt - Islamic Knowledge Journey",
    description:
      "Gamified Islamic education platform for learning Quran, Hadith, and more.",
    images: ["/og-image.png"],
  },
  themeColor: "#006B3C", // emerald
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
      className={`${pt_sans.variable} ${amiri.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
