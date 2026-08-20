#!/usr/bin/env bash
# Re-probe every source in docs/SOURCES.md and print what actually comes back.
#
# The source table goes stale: sites put up bot walls, mirrors get abandoned,
# free tiers start demanding keys. Run this before trusting docs/SOURCES.md.
#
#   bash scripts/probe-sources.sh            # everything
#   bash scripts/probe-sources.sh hadith     # one section
#
# Exit code is 1 if any source marked REQUIRED is not reachable.

set -uo pipefail

UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
FILTER="${1:-}"
required_failed=0
section=""

section() {
  section="$1"
  [[ -n "$FILTER" && "$FILTER" != "$1" ]] && return
  printf '\n\033[1m%s\033[0m\n' "$1"
}

# probe <required|optional|blocked> <name> <url>
probe() {
  local kind="$1" name="$2" url="$3" code colour
  [[ -n "$FILTER" && "$FILTER" != "$section" ]] && return

  code=$(curl -sSL -o /dev/null --max-time 25 -A "$UA" -w '%{http_code}' "$url" 2>/dev/null) || code="000"

  # 429 means we are probing too fast, not that the source is down.
  # Back off once and re-ask before calling it a failure.
  if [[ "$code" == 429 ]]; then
    sleep 5
    code=$(curl -sSL -o /dev/null --max-time 25 -A "$UA" -w '%{http_code}' "$url" 2>/dev/null) || code="000"
  fi

  sleep 0.4   # be a polite citizen; these are free services

  case "$kind:$code" in
    blocked:*)         colour=90 ;;                      # expected to fail
    *:200|*:301|*:302) colour=32 ;;
    *:429)             colour=33 ;;                      # throttled, not down
    *)                 colour=31 ;;
  esac

  printf '  \033[%sm%-6s\033[0m %-30s %s\n' "$colour" "$code" "$name" "$url"

  # 429 after a back-off is this environment's shared IP being throttled
  # (Wikimedia does this readily). The source is up; we are being told to slow
  # down. That is not an authoring blocker.
  if [[ "$kind" == required && "$code" != 200 && "$code" != 429 ]]; then
    required_failed=1
  fi
}

section quran
probe required "quran.com v4"        "https://api.quran.com/api/v4/chapters/1"
probe required "quran.com verses"    "https://api.quran.com/api/v4/verses/by_chapter/1?fields=text_uthmani"
probe optional "quran.com tafsirs"   "https://api.quran.com/api/v4/resources/tafsirs"
probe optional "alquran.cloud"       "https://api.alquran.cloud/v1/surah/1"
probe optional "quranenc"            "https://quranenc.com/api/v1/translation/sura/english_saheeh/1"
probe optional "fawazahmed0 quran"   "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions.json"
probe optional "tanzil metadata"     "https://tanzil.net/res/text/metadata/quran-data.xml"
probe optional "quran corpus"        "https://corpus.quran.com/wordbyword.jsp?chapter=1&verse=1"
probe optional "globalquran"         "https://api.globalquran.com/surah/1/quran-simple"

section hadith
probe required "fawazahmed0 index"   "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.json"
probe required "fawazahmed0 bukhari" "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari/1.json"
probe required "fawazahmed0 graded"  "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-abudawud/1.json"
probe optional "Open-Hadith-Data"    "https://raw.githubusercontent.com/mhashim6/Open-Hadith-Data/master/README.md"
probe optional "LK-Hadith-Corpus"    "https://raw.githubusercontent.com/ShathaTm/LK-Hadith-Corpus/master/README.md"
probe blocked  "sunnah.com API"      "https://api.sunnah.com/v1/collections"
probe blocked  "sunnah.com HTML"     "https://sunnah.com/bukhari:1"
probe blocked  "dorar.net"           "https://dorar.net/dorar_api.json?skey=test"

section fiqh
probe optional "islamweb"            "https://www.islamweb.net/ar/"
probe optional "islamqa.org"         "https://islamqa.org/"
probe optional "dar-alifta"          "https://www.dar-alifta.org/en"
probe optional "seekersguidance"     "https://seekersguidance.org/answers/"
probe optional "aliftaa.jo"          "https://aliftaa.jo/"

section texts
probe optional "shamela"             "https://shamela.ws/"
probe optional "waqfeya"             "https://waqfeya.net/"
probe optional "OpenITI (raw)"       "https://raw.githubusercontent.com/OpenITI/RELEASE/master/README.md"
probe optional "ar.wikisource"       "https://ar.wikisource.org/api/rest_v1/page/summary/%D8%A7%D9%84%D9%85%D9%88%D8%B7%D8%A3"
probe optional "archive.org search"  "https://archive.org/advancedsearch.php?q=subject%3Afiqh&rows=1&output=json"
probe blocked  "al-maktaba.org"      "https://al-maktaba.org/"

section secular
probe required "wikipedia API"       "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=Hajj&format=json"
probe optional "ar.wikipedia"        "https://ar.wikipedia.org/api/rest_v1/page/summary/%D8%A7%D9%84%D8%B2%D9%83%D8%A7%D8%A9"
probe optional "wikidata"            "https://www.wikidata.org/wiki/Special:EntityData/Q100.json"
probe optional "restcountries"       "https://restcountries.com/v3.1/alpha/ng"
probe optional "openlibrary"         "https://openlibrary.org/search.json?q=islamic+history&limit=1"
probe optional "crossref"            "https://api.crossref.org/works?query=fiqh&rows=1"
probe optional "worldbank"           "https://api.worldbank.org/v2/country/NG?format=json"

section calendar
probe optional "aladhan g2h"         "https://api.aladhan.com/v1/gToH/20-08-2026"
probe optional "aladhan methods"     "https://api.aladhan.com/v1/methods"

printf '\n\033[90mgrey = expected to fail (documented in docs/SOURCES.md)\033[0m'
printf '  \033[33myellow = throttled, retry later\033[0m\n'

if [[ $required_failed -eq 1 ]]; then
  printf '\033[31mA REQUIRED source is unreachable — authoring is blocked until it is back.\033[0m\n'
  exit 1
fi
printf '\033[32mAll required sources reachable.\033[0m\n'
