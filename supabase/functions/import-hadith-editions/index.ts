/**
 * Imports published editions of the narrations already in `hadiths` into the
 * app's other locales.
 *
 * ── This is an importer. It is emphatically not a translator ──────────────
 * Migration 0047 sets out at length why the daily hadith has no translation
 * pipeline, and nothing here weakens that. A narration is a claim about what
 * the Prophet ﷺ said; the question pipeline's guard — that a mistranslation
 * must not change which answer is correct — has no counterpart here, because
 * there is nothing to check a generated hadith against. So this calls no
 * model. It fetches text that a publisher already produced and a human already
 * authenticated, exactly as the English in 0050 arrived, and writes it
 * verbatim.
 *
 * For Arabic it is not even an import of a translation: it is the narration in
 * the language it was narrated in. That is the one locale where the app can
 * show a hadith with no translator standing between the player and the text.
 *
 * ── Why an edge function rather than a data migration ─────────────────────
 * 0050 embedded its English as SQL literals, which suits 391 rows of one
 * locale. The same shape for three more locales is the better part of a
 * megabyte of Arabic and French pasted through a tool that should not be
 * carrying scripture as a string literal. Fetching at run time from a pinned
 * tag keeps the provenance legible — the source and the tag are right here in
 * the code — and makes the whole thing re-runnable when an edition improves.
 *
 * ── Safety ────────────────────────────────────────────────────────────────
 * The only write is an insert that ignores conflicts. It cannot update and
 * cannot delete, so the English already present for all 391, and anything an
 * admin has typed by hand in `/admin/hadiths`, are both untouchable from here.
 * Re-running is a no-op. `verify_jwt` stays on: this is reachable only with a
 * service-role credential, never from a browser.
 *
 * One edition per invocation, by `edition` in the body. The Arabic Bukhari
 * alone is ~9.7MB of JSON, and parsing several of those in one run is how an
 * edge function meets its memory ceiling rather than its deadline.
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Pinned to the same tag migration 0050 used for the English.
 *
 * `@1` is the tag, not a floating branch. An edition that changes under us
 * would silently disagree with the English it sits beside.
 */
const BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

/** edition slug -> the locale it fills and the reference prefix it covers. */
const EDITIONS: Record<string, { locale: string; source: string }> = {
  "ara-bukhari": { locale: "ar", source: "bukhari" },
  "ara-nawawi": { locale: "ar", source: "nawawi" },
  "ara-qudsi": { locale: "ar", source: "qudsi" },
  "fra-bukhari": { locale: "fr", source: "bukhari" },
  "fra-nawawi": { locale: "fr", source: "nawawi" },
  "fra-qudsi": { locale: "fr", source: "qudsi" },
  "ind-bukhari": { locale: "id", source: "bukhari" },
};

/**
 * How each collection cites itself, per locale.
 *
 * `attribution` is what the card prints under the quotation, so it belongs in
 * the reader's language and script rather than being the English label copied
 * across. Arabic names the collections as Arabic names them.
 */
const ATTRIBUTION: Record<string, (n: number) => string> = {
  "ar:bukhari": (n) => `صحيح البخاري ${n}`,
  "ar:nawawi": (n) => `الأربعون النووية، حديث ${n}`,
  "ar:qudsi": (n) => `الأربعون القدسية، حديث ${n}`,
  "fr:bukhari": (n) => `Sahih al-Bukhari ${n}`,
  "fr:nawawi": (n) => `40 Hadiths an-Nawawi, Hadith ${n}`,
  "fr:qudsi": (n) => `40 Hadiths Qudsi, Hadith ${n}`,
  "id:bukhari": (n) => `Shahih Bukhari ${n}`,
};

Deno.serve(async (req) => {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    return new Response(JSON.stringify({ error: "supabase env missing" }), { status: 500 });
  }

  let edition = "";
  let dryRun = false;
  try {
    const body = await req.json();
    edition = String(body?.edition ?? "");
    dryRun = Boolean(body?.dryRun);
  } catch {
    /* handled by the check below */
  }

  const spec = EDITIONS[edition];
  if (!spec) {
    return new Response(
      JSON.stringify({ error: "unknown edition", known: Object.keys(EDITIONS) }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(url, serviceKey);

  // The narrations this app actually carries. Only these are imported: the
  // editions hold thousands more, and the rotation is a curated subset.
  const { data: hadiths, error: readError } = await supabase
    .from("hadiths")
    .select("id, reference");
  if (readError) {
    return new Response(JSON.stringify({ error: readError.message }), { status: 500 });
  }

  const byNumber = new Map<number, string>();
  for (const h of hadiths ?? []) {
    const [src, num] = String((h as { reference: string }).reference).split(":");
    if (src === spec.source) byNumber.set(Number(num), (h as { id: string }).id);
  }

  const res = await fetch(`${BASE}/${edition}.json`);
  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: `edition fetch failed: ${res.status}` }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
  const payload = await res.json();

  const attribute = ATTRIBUTION[`${spec.locale}:${spec.source}`];
  const rows: { hadith_id: string; locale: string; text: string; attribution: string }[] = [];
  let missingText = 0;

  for (const h of payload?.hadiths ?? []) {
    const n = Number(h?.hadithnumber);
    if (!Number.isInteger(n)) continue;
    const hadithId = byNumber.get(n);
    if (!hadithId) continue;
    const text = String(h?.text ?? "").trim();
    // An edition can carry a number with no text behind it. That row stays
    // English on the card, which is 0047's designed fallback — it is not an
    // error and must not become an empty quotation.
    if (!text) {
      missingText += 1;
      continue;
    }
    rows.push({
      hadith_id: hadithId,
      locale: spec.locale,
      text,
      attribution: attribute(n),
    });
  }

  const summary = {
    edition,
    locale: spec.locale,
    source: spec.source,
    carried: byNumber.size,
    matched: rows.length,
    skippedNoText: missingText,
    dryRun,
  };

  if (dryRun) {
    return new Response(JSON.stringify({ ...summary, inserted: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Insert only, conflicts ignored: English and any hand-entered locale are
  // beyond reach of this function by construction.
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    const { error, count } = await supabase
      .from("hadith_translations")
      .upsert(chunk, { onConflict: "hadith_id,locale", ignoreDuplicates: true, count: "exact" });
    if (error) {
      return new Response(
        JSON.stringify({ ...summary, inserted, error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
    inserted += count ?? 0;
  }

  return new Response(JSON.stringify({ ...summary, inserted }), {
    headers: { "Content-Type": "application/json" },
  });
});
