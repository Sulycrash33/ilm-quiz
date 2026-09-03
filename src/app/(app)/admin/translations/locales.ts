/**
 * The five target languages, and the types the translation admin passes about.
 *
 * A separate module from `actions.ts` because that file is `"use server"`, and
 * a server-actions module may only export async functions. Exporting the
 * `LOCALES` array from it compiled cleanly and then failed the build at page
 * data collection with "Failed to collect configuration for
 * /admin/translations" — which names the page, not the cause.
 */

export type Locale = "ha" | "fr" | "ar" | "id" | "ms"

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "ha", label: "Hausa" },
  { code: "fr", label: "French" },
  { code: "ar", label: "Arabic" },
  { code: "id", label: "Indonesian" },
  { code: "ms", label: "Malay" },
]

export interface QueueCell {
  locale: string
  status: string
  count: number
}

export interface TranslationRow {
  locale: string
  questionText: string
  choices: string[]
  explanation: string | null
  source: string
  isStale: boolean
  updatedAt: string
}

export interface FailedRow {
  questionId: string
  locale: string
  questionText: string
  lastError: string | null
  attempts: number
}
