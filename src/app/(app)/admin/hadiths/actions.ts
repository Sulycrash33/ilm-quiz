"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
// Constants and types live in a plain module: a `"use server"` file may only
// export async functions, and exporting them from here breaks the build at
// page-data collection while compiling perfectly well.
import type { HadithLocale, HadithRow, HadithText } from "./hadith-locales"

/**
 * The hadith importer.
 *
 * Deliberately an importer and no more. Every other kind of content in this
 * app is machine-translated and published without review; a narration is not,
 * and migration 0047 sets out why at length — it is a claim about what the
 * Prophet ﷺ said, published translations already exist and are what people
 * cite, and the pipeline's guard against a mistranslation changing which
 * answer is correct has no counterpart here, because there is nothing to check
 * the output against.
 *
 * So there is no "translate this" button on this page, and its absence is the
 * feature. Text is pasted from a published edition or it is not there, and a
 * locale nobody has filled in reads as English on the card.
 *
 * Every write goes through a SECURITY DEFINER function that checks the caller
 * is an admin. Neither table carries an insert, update or delete policy at
 * all, so an admin's own browser session cannot write to them directly either.
 */

/** Every narration, for the list. Admin-gated in the database. */
export async function listHadiths(): Promise<
  { ok: true; rows: HadithRow[] } | { ok: false; error: string }
> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("admin_list_hadiths")
  if (error) return { ok: false, error: error.message }
  return {
    ok: true,
    rows: (data ?? []).map((r: any) => ({
      id: r.o_id as string,
      reference: r.o_reference as string,
      position: Number(r.o_position),
      isActive: Boolean(r.o_is_active),
      locales: (r.o_locales ?? []) as string[],
      english: (r.o_english ?? null) as string | null,
    })),
  }
}

/** Every locale of one narration, for the editor. */
export async function getHadithTexts(hadithId: string): Promise<
  { ok: true; texts: Partial<Record<HadithLocale, HadithText>> } | { ok: false; error: string }
> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("admin_hadith_translations", {
    p_hadith_id: hadithId,
  })
  if (error) return { ok: false, error: error.message }

  const texts: Partial<Record<HadithLocale, HadithText>> = {}
  for (const r of (data ?? []) as any[]) {
    texts[r.o_locale as HadithLocale] = {
      text: (r.o_text ?? "") as string,
      attribution: (r.o_attribution ?? "") as string,
    }
  }
  return { ok: true, texts }
}

/**
 * Creates or updates one narration together with the locales supplied.
 *
 * A locale left blank in the form is *omitted*, not blanked. Saving the Hausa
 * tab must not be able to wipe French that someone entered an hour ago, and
 * "I have nothing for this language yet" is a different statement from "this
 * language should show an empty quotation".
 */
export async function saveHadith(input: {
  id?: string
  reference: string
  position?: number
  isActive?: boolean
  texts: Partial<Record<HadithLocale, HadithText>>
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const reference = input.reference.trim()
  if (!reference) {
    return { ok: false, error: "A hadith needs a reference, such as bukhari:6029." }
  }

  // English is the fallback every other locale reads through. A narration
  // without it would show nothing at all to a player in any language whose
  // text has not been entered yet, which on the home screen is a blank card
  // where the one non-numeric thing on the page should be.
  const english = input.texts.en?.text?.trim()
  if (!input.id && !english) {
    return { ok: false, error: "English is required: it is what every other language falls back to." }
  }

  const payload: Record<string, HadithText> = {}
  for (const [locale, value] of Object.entries(input.texts)) {
    if (!value?.text?.trim()) continue
    payload[locale] = {
      text: value.text.trim(),
      attribution: value.attribution?.trim() || reference,
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("admin_upsert_hadith", {
    p_reference: reference,
    p_texts: payload,
    p_id: input.id ?? null,
    p_position: input.position ?? null,
    p_is_active: input.isActive ?? null,
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath("/admin/hadiths")
  revalidatePath("/home")
  return { ok: true, id: data as string }
}

/** Removes one language's text. English is refused in the database. */
export async function deleteHadithLocale(
  hadithId: string,
  locale: HadithLocale,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const { error } = await supabase.rpc("admin_delete_hadith_locale", {
    p_hadith_id: hadithId,
    p_locale: locale,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/hadiths")
  revalidatePath("/home")
  return { ok: true }
}
