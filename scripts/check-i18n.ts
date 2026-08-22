/**
 * i18n coverage checks.
 *
 * The failure this guards against is the one that shipped: a screen that
 * looks finished in English but keeps its English text when the reader picks
 * Hausa, because the string was written straight into the JSX instead of
 * going through `t()`. That is invisible in a screenshot taken in English,
 * so it gets asserted here instead of eyeballed.
 *
 *   npx tsx scripts/check-i18n.ts
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { translations, type Locale, type Translations } from "../src/lib/i18n";

let failures = 0;
function check(name: string, cond: boolean, extra?: unknown) {
  if (!cond) {
    failures += 1;
    console.log("FAIL:", name, extra ?? "");
  } else {
    console.log("ok  :", name);
  }
}

// ---------------------------------------------------------------- key parity
const LOCALES = Object.keys(translations) as Locale[];
const enKeys = Object.keys(translations.en) as (keyof Translations)[];

check("six locales are present", LOCALES.length === 6, LOCALES);

for (const loc of LOCALES) {
  const keys = Object.keys(translations[loc]);
  const missing = enKeys.filter((k) => !(k in translations[loc]));
  const extra = keys.filter((k) => !enKeys.includes(k as keyof Translations));
  check(`${loc}: has every key`, missing.length === 0, missing.slice(0, 8));
  check(`${loc}: has no stray key`, extra.length === 0, extra.slice(0, 8));
}

// No empty strings — an empty value renders as nothing at all, which reads as
// a missing label rather than an untranslated one.
for (const loc of LOCALES) {
  const empties = enKeys.filter((k) => {
    const v = translations[loc][k];
    // salaamLatin is deliberately empty in Arabic: the script line says it.
    if (loc === "ar" && k === "salaamLatin") return false;
    return typeof v !== "string" || v.trim() === "";
  });
  check(`${loc}: no empty values`, empties.length === 0, empties.slice(0, 8));
}

// Interpolation placeholders must match English, or a value silently drops.
for (const loc of LOCALES) {
  if (loc === "en") continue;
  const mismatched: string[] = [];
  for (const k of enKeys) {
    const ph = (s: string) => (s.match(/\{(\w+)\}/g) ?? []).sort().join(",");
    if (ph(translations.en[k]) !== ph(translations[loc][k])) mismatched.push(k);
  }
  check(`${loc}: placeholders match English`, mismatched.length === 0, mismatched.slice(0, 8));
}

// ------------------------------------------------------- no new hardcoded UI
/**
 * Walk the app's own components looking for JSX text nodes that are plainly
 * English prose. Admin screens are internal-only and exempt; so is the brand
 * name and the sample address used as an email placeholder.
 */
const SRC = join(process.cwd(), "src");
const EXEMPT_DIRS = new Set(["admin"]);
const ALLOWED = [/^ILM Hunt$/, /^example@ilmhunt\.com$/];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      if (!EXEMPT_DIRS.has(entry)) walk(p, out);
    } else if (entry.endsWith(".tsx")) {
      out.push(p);
    }
  }
  return out;
}

const offenders: string[] = [];
for (const file of walk(SRC)) {
  const rel = relative(process.cwd(), file);
  const src = readFileSync(file, "utf8");
  // JSX text node: >Some English words<
  for (const m of src.matchAll(/>\s*([A-Z][^<>{}\n]{2,}?)\s*</g)) {
    const text = m[1].trim();
    if (ALLOWED.some((re) => re.test(text))) continue;
    // needs at least one space to be prose rather than an identifier/enum
    if (!/[a-z]/.test(text)) continue;
    offenders.push(`${rel}: ${text.slice(0, 60)}`);
  }
}
check("no hardcoded English JSX text outside admin", offenders.length === 0, offenders.slice(0, 12));

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
