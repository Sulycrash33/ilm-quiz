/**
 * Locales and row shapes for the hadith importer.
 *
 * A plain module rather than part of `actions.ts`, for the reason the
 * translation admin already learned the hard way: a `"use server"` file may
 * only export async functions, and exporting a constant array from one
 * compiled perfectly and then failed the build at page-data collection with
 * "Failed to collect configuration for /admin/translations" — an error that
 * names the page and says nothing about the cause.
 *
 * Unlike the question pipeline's `LOCALES`, English is in this list. There it
 * is the source being translated from; here it is a row in the same table as
 * the others, and the importer has to be able to correct it.
 */

export type HadithLocale = "en" | "ha" | "fr" | "ar" | "id" | "ms"

export const HADITH_LOCALES: { code: HadithLocale; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ha", label: "Hausa", dir: "ltr" },
  { code: "fr", label: "French", dir: "ltr" },
  { code: "ar", label: "Arabic", dir: "rtl" },
  { code: "id", label: "Indonesian", dir: "ltr" },
  { code: "ms", label: "Malay", dir: "ltr" },
]

export interface HadithRow {
  id: string
  reference: string
  position: number
  isActive: boolean
  /** Locale codes that have text entered. English is always among them. */
  locales: string[]
  /** The English text, for the list. */
  english: string | null
}

export interface HadithText {
  text: string
  attribution: string
}
