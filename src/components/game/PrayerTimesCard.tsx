"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MapPin, AlertCircle, RefreshCw } from "lucide-react"
import {
  FajrIcon,
  DhuhrIcon,
  AsrIcon,
  MaghribIcon,
  IshaIcon,
  SunriseIcon,
} from "@/components/icons/prayer-time-icons"
import { useLanguage } from "@/contexts/LanguageContext"

/**
 * Prayer times, as a countdown to the next salah.
 *
 * The card used to be a six-across grid of times and nothing else. On a phone
 * — which is what nearly every player uses — `grid-cols-2` made that three
 * rows of small type, and it answered the wrong question: a worshipper wants
 * to know how long is left, not to read six clock faces and do the
 * subtraction. So the headline is now "Dhuhr in 45m", ticking, and the six
 * times are a secondary strip beneath it.
 *
 * Three things worth knowing about the implementation:
 *
 * The month calendar is fetched once and cached in `localStorage`, keyed by
 * month and rounded coordinates. The old version re-fetched a whole month of
 * times on every single mount of the home page. The cache also gives tomorrow's
 * Fajr for free, which is needed the moment Isha has passed — otherwise the
 * countdown has nothing to count to for the rest of the night.
 *
 * Sunrise is shown in the strip but never counted down to. It marks the end of
 * Fajr's window rather than a prayer in its own right, so "Sunrise in 20m"
 * would be telling the worshipper the wrong thing.
 *
 * The calculation method is ISNA (`method=2`), inherited from the previous
 * version. That is a real choice, not a neutral default — Nigeria, Malaysia
 * and Indonesia commonly use different conventions, and the resulting times
 * differ by minutes. It is pulled out as a constant so it can be made a user
 * setting; until it is, some players will see times that disagree with their
 * local mosque.
 */

/** ISNA. See the note above — this should become a user setting. */
const CALCULATION_METHOD = 2

/** The five prayers, in order. Sunrise is deliberately not among them. */
const SALAH = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const
type Salah = (typeof SALAH)[number]

/** What the strip shows, which does include Sunrise as a boundary marker. */
const STRIP = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const
type StripKey = (typeof STRIP)[number]

type Timings = Record<string, string>

interface DayEntry {
  timings: Timings
  date: { hijri: { day: string; month: { en: string }; year: string } }
}

const ICONS: Record<StripKey, React.FC<React.SVGProps<SVGSVGElement>>> = {
  Fajr: FajrIcon,
  Sunrise: SunriseIcon,
  Dhuhr: DhuhrIcon,
  Asr: AsrIcon,
  Maghrib: MaghribIcon,
  Isha: IshaIcon,
}

/** Aladhan returns times as "05:12 (WAT)". Keep the clock, drop the zone. */
function parseClock(raw: string | undefined): { h: number; m: number } | null {
  if (!raw) return null
  const match = /^(\d{1,2}):(\d{2})/.exec(raw.trim())
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  if (!Number.isFinite(h) || !Number.isFinite(m) || h > 23 || m > 59) return null
  return { h, m }
}

function at(base: Date, clock: { h: number; m: number }): Date {
  const d = new Date(base)
  d.setHours(clock.h, clock.m, 0, 0)
  return d
}

/** "1h 12m", "45m", "30s" — the unit a worshipper actually wants. */
function formatGap(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${s}s`
}

function cacheKey(lat: number, lon: number, year: number, month: number) {
  // Two decimals is ~1km, far finer than prayer times vary.
  return `ilm-prayer:${lat.toFixed(2)}:${lon.toFixed(2)}:${year}-${month}`
}

export function PrayerTimesCard() {
  const { t } = useLanguage()
  const [days, setDays] = useState<DayEntry[] | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  // An error *code*, never a translated string. Storing the message would put
  // `t` in `load`'s dependency array, and `load` drives an effect whose cleanup
  // aborts the in-flight request — an unstable `t` then means fetch, abort,
  // fetch, abort, forever. Translate at render instead, where re-running costs
  // nothing.
  const [errored, setErrored] = useState(false)
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => new Date())
  const abort = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setErrored(false)

    if (!("geolocation" in navigator)) {
      setErrored(true)
      setLoading(false)
      return
    }

    let coords: GeolocationCoordinates
    try {
      coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (p) => resolve(p.coords),
          reject,
          { maximumAge: 30 * 60 * 1000, timeout: 15000 },
        )
      })
    } catch {
      setErrored(true)
      setLoading(false)
      return
    }

    const { latitude, longitude } = coords
    const today = new Date()
    const key = cacheKey(latitude, longitude, today.getFullYear(), today.getMonth() + 1)

    try {
      const cached = localStorage.getItem(key)
      if (cached) {
        const parsed = JSON.parse(cached) as { days: DayEntry[]; location: string | null }
        setDays(parsed.days)
        setLocation(parsed.location)
        setLoading(false)
        return
      }
    } catch {
      // A corrupt cache entry must not stop the fetch below.
    }

    abort.current?.abort()
    abort.current = new AbortController()

    try {
      const res = await fetch(
        `https://api.aladhan.com/v1/calendar/${today.getFullYear()}/${today.getMonth() + 1}` +
          `?latitude=${latitude}&longitude=${longitude}&method=${CALCULATION_METHOD}`,
        { signal: abort.current.signal },
      )
      if (!res.ok) throw new Error(`aladhan ${res.status}`)
      const body = (await res.json()) as { data: DayEntry[] }

      let place: string | null = null
      try {
        const geo = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client` +
            `?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          { signal: abort.current.signal },
        )
        if (geo.ok) {
          const g = (await geo.json()) as { city?: string; countryCode?: string }
          place = [g.city, g.countryCode].filter(Boolean).join(", ") || null
        }
      } catch {
        // The place name is decoration. Times are the point.
      }

      setDays(body.data)
      setLocation(place)
      try {
        localStorage.setItem(key, JSON.stringify({ days: body.data, location: place }))
      } catch {
        // Storage full or blocked: run without the cache.
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setErrored(true)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    return () => abort.current?.abort()
  }, [load])

  // One tick a second. The countdown is the whole point of the card, and a
  // minute-resolution clock would sit visibly wrong for up to 59 seconds.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const today = days?.[now.getDate() - 1]
  const tomorrow = days?.[now.getDate()] ?? days?.[0]

  const stripTimes = useMemo(() => {
    if (!today) return null
    return STRIP.map((key) => {
      const clock = parseClock(today.timings[key])
      return { key, clock, at: clock ? at(now, clock) : null }
    })
  }, [today, now])

  /** The next salah, rolling over to tomorrow's Fajr once Isha has passed. */
  const next = useMemo(() => {
    if (!today) return null
    for (const name of SALAH) {
      const clock = parseClock(today.timings[name])
      if (!clock) continue
      const when = at(now, clock)
      if (when.getTime() > now.getTime()) return { name: name as Salah, when }
    }
    const fajr = parseClock((tomorrow ?? today).timings.Fajr)
    if (!fajr) return null
    const when = at(new Date(now.getTime() + 24 * 60 * 60 * 1000), fajr)
    return { name: "Fajr" as Salah, when }
  }, [today, tomorrow, now])

  const hijri = today?.date?.hijri

  if (loading) {
    return (
      <div className="rounded-2xl border border-primary/15 bg-surface-container/50 p-4">
        <div className="h-7 w-44 animate-pulse rounded bg-white/5" />
        <div className="mt-3 flex gap-2 overflow-hidden">
          {STRIP.map((k) => (
            <div key={k} className="h-16 w-14 shrink-0 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    )
  }

  if (errored || !today || !next) {
    return (
      <div className="rounded-2xl border border-primary/15 bg-surface-container/50 p-4">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant/70" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-on-surface-variant">{t("enableLocationForPrayer")}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary"
            >
              <RefreshCw className="h-3 w-3" aria-hidden />
              {t("tryAgain")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const gap = next.when.getTime() - now.getTime()
  const NextIcon = ICONS[next.name]
  const imminent = gap <= 10 * 60 * 1000

  return (
    <div className="rounded-2xl border border-primary/15 bg-surface-container/50 p-4">
      {/* The countdown. Everything else on this card is secondary to it. */}
      <div className="flex items-center gap-3">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
            imminent ? "bg-primary/25" : "bg-primary/12"
          }`}
        >
          <NextIcon className="h-5 w-5 text-primary" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-on-surface-variant/60">
            {t("prayerTimesTitle")}
          </p>
          <p className="truncate font-headline-md text-headline-md leading-tight text-on-surface">
            {t("nextPrayerIn")
              .replace("{prayer}", next.name)
              .replace("{time}", formatGap(gap))}
          </p>
        </div>
        <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-primary">
          {next.when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* All six, scrolling sideways rather than wrapping to three rows. */}
      <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stripTimes?.map(({ key, clock, at: when }) => {
          const Icon = ICONS[key]
          const isNext = key === next.name
          const passed = when ? when.getTime() <= now.getTime() : false
          return (
            <div
              key={key}
              className={`flex w-[4.25rem] shrink-0 flex-col items-center gap-1 rounded-xl border px-1.5 py-2 ${
                isNext
                  ? "border-primary/40 bg-primary/12"
                  : passed
                    ? "border-white/5 bg-white/[0.02] opacity-55"
                    : "border-white/5 bg-white/[0.03]"
              }`}
            >
              <Icon className={`h-4 w-4 ${isNext ? "text-primary" : "text-on-surface-variant/70"}`} aria-hidden />
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  isNext ? "text-primary" : "text-on-surface-variant/80"
                }`}
              >
                {key}
              </span>
              <span className="text-[11px] tabular-nums text-on-surface-variant/70">
                {clock ? `${String(clock.h).padStart(2, "0")}:${String(clock.m).padStart(2, "0")}` : "—"}
              </span>
            </div>
          )
        })}
      </div>

      {(location || hijri) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-on-surface-variant/55">
          {location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden />
              {location}
            </span>
          )}
          {hijri && (
            <span>
              {hijri.day} {hijri.month.en} {hijri.year} AH
            </span>
          )}
        </div>
      )}
    </div>
  )
}
