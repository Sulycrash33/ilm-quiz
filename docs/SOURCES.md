# Source register

Written 2026-08-20. Every row was probed live from the **ILM full** environment on that
date, not recalled from memory. Status codes and payload notes are what actually came back.

Re-probe before trusting this if you are reading it months later. `scripts/probe-sources.sh`
in this repo re-runs the whole table.

## The decision that prompted this

`sunnah.com` is unusable and the handoff named it as the hadith backbone. This document
records what replaced it and what else the net actually offers.

## 1. Hadith — `fawazahmed0/hadith-api` is the backbone

Adopted at the owner's instruction. Served as static JSON from jsDelivr's CDN: no key, no
rate limit, no bot wall.

```
https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari.min.json
https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari/1.json   (per-section)
https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.json                 (index)
```

**Measured coverage — 36,472 English hadith across 9 collections:**

| collection | hadith | carry gradings | top graders |
|---|---:|---:|---|
| Sahih al-Bukhari | 7,589 | 0% | — (sahih by definition) |
| Sahih Muslim | 7,563 | 0% | — (sahih by definition) |
| Sunan an-Nasa'i | 5,765 | 100% | Al-Albani, Abu Ghuddah |
| Sunan Abu Dawud | 5,274 | 100% | Al-Albani, Zubair Ali Zai |
| Sunan Ibn Majah | 4,343 | 100% | Zubair Ali Zai, Abd al-Baqi |
| Jami' at-Tirmidhi | 3,998 | 99% | Zubair Ali Zai, Al-Albani |
| Muwatta Malik | 1,858 | 100% | Salim al-Hilali |
| Nawawi's 40 | 42 | 0% | — |
| Hadith Qudsi | 40 | 0% | — |

Each record carries `hadithnumber`, `arabicnumber`, `reference: {book, hadith}`, the text,
and a `grades` array of `{name, grade}` — **attributed to the named scholar**, which is
better for our schema than an unattributed grade. Arabic editions exist for all 9, plus
Urdu, Bengali, Indonesian, Turkish, French, Russian and Tamil.

**Not in the mirror:** Musnad Ahmad, Sunan ad-Darimi, Riyad as-Salihin, Bulugh al-Maram.
If a category needs those, it needs another source.

### What this means for the da'if format

The design needs weak narrations whose weakness is not contestable. Measured:

| | count |
|---|---:|
| hadith graded by more than one scholar | 19,207 |
| **every grader agrees weak or fabricated — the usable pool** | **2,621** |
| one grader says weak, another does not — **do not use** | 2,535 |
| grade assertions of `da'if` | 11,425 |
| grade assertions of `mawdu'` | 145 |

2,621 uncontested weak narrations is far more than the format needs. **The 2,535 contested
ones must be excluded** — a question whose answer depends on which scholar you follow is a
broken question, and Albani and Zubair Ali Zai disagree often enough to matter.

### Grade strings need normalising

There are **1,671 distinct grade strings**. They are not a clean vocabulary. Most frequent:

```
Sahih 32909 · Daif 9937 · Hasan 5631 · Hasan Sahih 3425 · Sahih - Agreed Upon 2002
Isnaad Hasan 1940 · Isnaad Sahih 1916 · Sahih Lighairihi 903 · Daif Isnaad 635
Very Daif 466 · Mauquf Sahih 481 · Maqtu Sahih 241 · Shadh 226 · Munkar 190
```

Three traps in that list:

- **`Isnaad Sahih` / `Daif Isnaad` grade the chain, not the text.** Different claim from
  `Sahih`. Do not collapse them.
- **`Mauquf` / `Maqtu`** mark a saying of a Companion or Successor, not of the Prophet
  (ﷺ). A question calling one a hadith of the Prophet is wrong regardless of its grade.
- **`Shadh` and `Munkar`** are specific defects, not synonyms for weak.

Write the normaliser against this vocabulary, and keep the raw string in the row alongside
the normalised value.

### Do not use UmmahAPI as a cross-check

`ummahapi.com/api/hadith/:collection/:n` returns 200 and looks like an independent second
opinion. It is not — its English text is byte-identical to fawazahmed0's, including the same
truncations, and it **collapses the scholar attributions into one `grade` string**. It is
the same data, degraded. Verifying fawazahmed0 against it proves nothing.

### Genuinely independent hadith sources, for cross-checking citations

| source | status | note |
|---|---|---|
| `mhashim6/Open-Hadith-Data` (raw.githubusercontent) | 200 | 9 books, Arabic, separate lineage |
| `ShathaTm/LK-Hadith-Corpus` (raw.githubusercontent) | 200 | Arabic + English, chain segmentation |
| `hadithapi.com` | 401 | works, but needs a free key |
| `api.sunnah.com` | 403 | key-gated; request via the `sunnah-com/api` GitHub repo |
| `sunnah.com` HTML | 403 | Cloudflare interstitial, persists with browser headers |
| `dorar.net` | 403 | Cloudflare. The handoff's grading source — gone |
| `api.hadith.gading.dev` | 502 | dead |

## 2. Qur'an — quran.com stays primary, with three real alternates

| source | status | what it gives |
|---|---|---|
| `api.quran.com/api/v4` | 200 | **primary.** Verses, `text_uthmani`, translations, tafsirs |
| `api.quran.com/api/v4/resources/tafsirs` | 200 | Ibn Kathir (abridged) and others, by id |
| `api.alquran.cloud/v1` | 200 | independent lineage — **use to cross-check** |
| `quranenc.com/api/v1` | 200 | translations with per-ayah footnotes |
| `cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1` | 200 | 400+ translations, no key |
| `tanzil.net/res/text/metadata/quran-data.xml` | 200 | canonical surah/juz/page metadata |
| `corpus.quran.com` | 200 | **word-by-word morphology and grammar** — HTML, no API |
| `api.globalquran.com` | 200 | another independent text lineage |
| `everyayah.com` | 200 | per-ayah recitation audio |

`corpus.quran.com` is the find worth noting. Word-level grammatical analysis is the kind of
thing tier 6–9 questions in a Qur'an category can be built on without drifting into trivia —
it is *hard*, not *obscure*, which is the distinction the handoff insists on.

## 3. Fiqh across the four schools

The handoff warned that `islamqa.info` has a distinct orientation. Note that **`islamqa.org`
is a different site** — it aggregates Q&A and lets you filter by school, which is closer to
what an app serving all four madhahib needs.

| source | status | note |
|---|---|---|
| `islamweb.net` (ar + en fatwa) | 200 | large fatwa corpus, cross-school |
| `islamqa.org` | 200 | **filterable by madhhab** — Hanafi-heavy but all four present |
| `dar-alifta.org` | 200 | Egyptian Dar al-Ifta |
| `seekersguidance.org/answers` | 200 | Hanafi + Shafi'i, answers cite their texts |
| `fiqh.us` | 200 | four-school comparison; AI-generated, **treat as a lead, not a citation** |
| `aliftaa.jo` | 301→200 | Jordanian Ifta |
| `islamqa.info` | 200 | reachable; orientation caveat from the handoff stands |
| `daruliftaa.com` | 522 | their server erroring, retry later |

**al-Jaziri's *al-Fiqh 'ala al-Madhahib al-Arba'a*** — the canonical four-school comparison —
is on archive.org **as 3.8 MB of plain text**, and it is the single most useful source found
in this whole scout. Volume I is *Modes of Islamic Worship*, covering the pillars.

```
https://archive.org/download/IslamicJurisprudenceAccordingToTheFourSunniSchoolsAlFiqhalaAlMadhahibAlArbaah/IslamicJurisprudenceAccordingToTheFourSunniSchoolsAlFiqhalaAlMadhahibAlArbaah_djvu.txt
```

**Follow redirects** (`curl -sSL`), or resolve the host from `archive.org/metadata/<item>`
first — a plain request returns zero bytes with no error. Scanning for passages naming three
or more schools yields 464 comparative windows.

**Prefer it over Wikipedia for any school attribution.** Used against Five Pillars tier 8 it
corrected a question already written: Wikipedia called the intention in wudu "a formal
obligation" in three schools, where al-Jaziri distinguishes a *condition of validity*
(Hanbali) from a *pillar* (Maliki, Shafi'i) from an emulation of the Sunnah that is neither
(Hanafi). That is exactly the precision tier 8 needs and Wikipedia does not carry.

## 4. Classical Arabic texts

| source | status | note |
|---|---|---|
| `shamela.ws` | 200 | browse and search both work |
| `waqfeya.net` | 200 | PDF library |
| `OpenITI/RELEASE` via raw.githubusercontent | 200 | **machine-readable Islamicate corpus** |
| `ar.wikisource.org` REST | 200 | clean text of many classical works |
| `archive.org/advancedsearch.php` | 200 | JSON search across the whole library |
| `al-maktaba.org` | 403 | Cloudflare |

Note: `api.github.com` is **403 for this session** because GitHub access is scoped to
attached repos. `raw.githubusercontent.com` and `cdn.jsdelivr.net` are not — fetch OpenITI
and the hadith corpora through those, not the API.

## 5. Secular categories — geography, science, history

| source | status | use |
|---|---|---|
| `en.wikipedia.org/w/api.php` | 200 | full-text search + plaintext extracts |
| `ar.wikipedia.org` REST | 200 | Arabic-side facts |
| `wikidata.org` + SPARQL endpoint | 200 | structured facts; SPARQL needs `--data-urlencode` |
| `restcountries.com/v3.1` | 301→200 | **follow redirects (`curl -L`)** |
| `api.geonames.org` | 200 | place data; `username=demo` is throttled, register one |
| `api.nasa.gov` | 200 | `DEMO_KEY` works, rate-limited |
| `earthquake.usgs.gov/fdsnws` | 200 | geology/science facts |
| `openlibrary.org/search.json` | 200 | bibliographic verification |
| `api.crossref.org` | 200 | academic citation verification |
| `api.worldbank.org/v2` | 200 | country statistics |

## 6. Prayer times and the Islamic calendar

`api.aladhan.com` is fully open and directly answers an outstanding item in the handoff.

```
/v1/gToH/20-08-2026                                        → Gregorian→Hijri
/v1/methods                                                → all calculation methods
/v1/calendarByCity/2026/8?city=Keffi&country=Nigeria&method=2
```

`/v1/methods` returns every calculation method with its Fajr/Isha angles. The handoff notes
prayer times are hardcoded to ISNA while the owner is in Nigeria; this endpoint is what a
fix would be built on. **Not actioned — flagging only, it is outside the question bank.**

## 7. Sources that must NOT be used

`opentdb.com` and `the-trivia-api.com` both return 200 and both serve ready-made
multiple-choice questions. **Do not touch either.** The handoff settled this: a curated
question bank is a protected compilation, rephrasing is derivative work, and it imports
other people's errors. They are listed here so that a future session recognises them as
prohibited rather than convenient.

The same reasoning bars scraping question sets out of any existing quiz app.

## 8. Rate limits are a real constraint at 4,500 questions

This surfaced while probing, not in theory. **Wikimedia throttles this environment's shared
egress IP.** `en.wikipedia.org` and `ar.wikipedia.org` both returned 200 repeatedly, then
started returning 429 once probed in quick succession — on both the REST v1 and the
`action=query` endpoints. They recover after a pause.

Authoring 4,500 questions means thousands of source lookups. Anything hitting Wikimedia in
a loop must:

- pace requests (a few hundred ms apart is enough) and back off on 429;
- send a real `User-Agent` identifying the app with a contact address — Wikimedia's policy
  requires it and generic agents get throttled harder;
- prefer `action=query` with `maxlag=5`, and batch titles in one call rather than one call
  per title.

`cdn.jsdelivr.net` (both hadith and Qur'an mirrors) showed no throttling under the same
pressure — another reason it is the right backbone for bulk work. Pull whole editions once
and query them locally rather than fetching per-hadith.

## 9. Standing cautions

- **Cloudflare is the pattern**, not the exception: sunnah.com, dorar.net and
  al-maktaba.org all fail the same way. Full network access does not defeat a bot wall.
  When a source 403s with "Just a moment…", say so plainly rather than engineering around
  it.
- **A mirror is not the authority.** fawazahmed0 is a community mirror. It is good enough
  to author from and its gradings are attributed, but where a question turns on an exact
  reference number or an exact grading, cross-check against an independent lineage
  (Open-Hadith-Data, LK-Hadith-Corpus) — not against UmmahAPI.
- Nothing here has been scholar-reviewed. It is a map of where text can be obtained, not a
  warrant that any particular text is sound.

## quran.com tafsir API — endpoint shape (added 2026-08-20)

Three **English** tafsirs are available and were used for the Quran Commentary category:

| id | work | author |
|---:|---|---|
| 169 | Ibn Kathir (Abridged) | Hafiz Ibn Kathir |
| 168 | Ma'arif al-Qur'an | Mufti Muhammad Shafi |
| 817 | Tazkirul Quran | Maulana Wahiduddin Khan |

`GET /api/v4/resources/tafsirs` lists all 20, including Arabic (al-Tabari 15, al-Qurtubi 90,
al-Baghawi 94, al-Sa'di 91, Ibn Kathir 14) and Bengali, Urdu, Russian and Kurdish works.

**Working endpoint for a single verse:**

    /api/v4/tafsirs/{tafsir_id}/by_ayah/{verse_key}     e.g. .../169/by_ayah/3:7

**The trap.** `/api/v4/quran/tafsirs/{id}?verse_key=3:7` looks correct and returns **HTTP 200**
with `{"tafsirs":[],"meta":{...}}` — an empty success, not an error. A fetch loop that only
checks the status code will record twenty successful requests and no content.

**Fetch with `curl`, not Python `urllib`.** Through this environment's agent proxy, `urllib`
received **403 Forbidden** on every request while `curl` to the identical URL succeeded. Do not
disable TLS verification or unset `HTTPS_PROXY` to work around it — just use `curl`.
