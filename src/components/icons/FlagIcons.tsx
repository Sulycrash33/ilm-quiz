import type { SVGProps } from "react"

/**
 * Flags, drawn locally.
 *
 * These replaced `https://flagcdn.com/{code}.svg`. Three reasons, in order of
 * how much they matter:
 *
 *   1. It is a third-party host on the critical path of onboarding. The avatar
 *      set in this app was already broken once by exactly that — a remote
 *      generator that stopped answering — and this app is used on connections
 *      where six extra requests before the first screen is a real cost.
 *   2. Every user's IP went to a host that has nothing to do with this app.
 *   3. They are six flat shapes. There was never much to fetch.
 *
 * A NOTE ON THE ARABIC ENTRY
 * Arabic gets the Arab League flag rather than a national one. That is the
 * better answer on two counts: Arabic is spoken across some twenty-two
 * countries, so no single national flag represents the language, and the Saudi
 * flag — the usual default — carries the shahada, which should not be reduced
 * to approximated calligraphy at 24px.
 *
 * The emblem is simplified to what survives at this size: the white crescent,
 * the gold chain ring and the laurel wreath. The Arabic legend inside the
 * crescent reads "League of Arab States" on the real flag and is omitted here,
 * because at 24px it would be an illegible smudge that merely suggests writing.
 *
 * All are drawn on a 60x40 canvas so they share proportions in the row.
 */

type FlagProps = SVGProps<SVGSVGElement>

function Flag({ children, ...props }: FlagProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      {children}
      {/* A hairline keeps the white-edged flags from bleeding into a light
          surface. */}
      <rect x="0.5" y="0.5" width="59" height="39" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1" rx="1" />
    </svg>
  )
}

/** United Kingdom. Simplified: the counterchange of the Patrick saltire is
 * approximated, which is invisible below about 64px. */
function FlagGB(props: FlagProps) {
  return (
    <Flag {...props}>
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0L60 40M60 0L0 40" stroke="#fff" strokeWidth="8" />
      <path d="M0 0L60 40M60 0L0 40" stroke="#C8102E" strokeWidth="4" />
      <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="13" />
      <path d="M30 0v40M0 20h60" stroke="#C8102E" strokeWidth="8" />
    </Flag>
  )
}

/** Nigeria. */
function FlagNG(props: FlagProps) {
  return (
    <Flag {...props}>
      <rect width="60" height="40" fill="#008751" />
      <rect x="20" width="20" height="40" fill="#fff" />
    </Flag>
  )
}

/** France. */
function FlagFR(props: FlagProps) {
  return (
    <Flag {...props}>
      <rect width="60" height="40" fill="#fff" />
      <rect width="20" height="40" fill="#002395" />
      <rect x="40" width="20" height="40" fill="#ED2939" />
    </Flag>
  )
}

/** Arabic — the Arab League. See the note at the top of this file. */
function FlagAR(props: FlagProps) {
  return (
    <Flag {...props}>
      <rect width="60" height="40" fill="#137a3f" />
      <g transform="translate(30 20) scale(0.92) translate(-30 -20)">
        {/* Crescent, opening upward, as on the emblem. Drawn as one circle with
            a second offset above it removed — the same construction used for
            the brand mark, for the same reason: an arc whose chord equals twice
            its radius is degenerate and browsers close it with a straight
            line. */}
        <path
          fillRule="evenodd"
          d="M30 11a9 9 0 1 1 0 18 9 9 0 1 1 0-18Z M30 6.5a8 8 0 1 1 0 16 8 8 0 1 1 0-16Z"
          fill="#ffffff"
        />
        {/* Gold chain ring. */}
        <circle cx="30" cy="20" r="10.4" fill="none" stroke="#d4af37" strokeWidth="1.1" strokeDasharray="1.6 1.4" />
        {/* Laurel wreath, open at the top and tied at the foot. */}
        <g fill="#ffffff">
          <ellipse cx="28.00" cy="31.33" rx="2.6" ry="1.25" transform="rotate(190.0 28.00 31.33)" /><ellipse cx="24.47" cy="30.08" rx="2.6" ry="1.25" transform="rotate(208.8 24.47 30.08)" /><ellipse cx="21.52" cy="27.77" rx="2.6" ry="1.25" transform="rotate(227.5 21.52 27.77)" /><ellipse cx="19.47" cy="24.63" rx="2.6" ry="1.25" transform="rotate(246.2 19.47 24.63)" /><ellipse cx="18.54" cy="21.00" rx="2.6" ry="1.25" transform="rotate(265.0 18.54 21.00)" /><ellipse cx="18.83" cy="17.27" rx="2.6" ry="1.25" transform="rotate(283.8 18.83 17.27)" /><ellipse cx="20.30" cy="13.82" rx="2.6" ry="1.25" transform="rotate(302.5 20.30 13.82)" /><ellipse cx="22.80" cy="11.03" rx="2.6" ry="1.25" transform="rotate(321.2 22.80 11.03)" /><ellipse cx="26.07" cy="9.19" rx="2.6" ry="1.25" transform="rotate(340.0 26.07 9.19)" />
          <ellipse cx="32.00" cy="31.33" rx="2.6" ry="1.25" transform="rotate(-10.0 32.00 31.33)" /><ellipse cx="35.53" cy="30.08" rx="2.6" ry="1.25" transform="rotate(-28.8 35.53 30.08)" /><ellipse cx="38.48" cy="27.77" rx="2.6" ry="1.25" transform="rotate(-47.5 38.48 27.77)" /><ellipse cx="40.53" cy="24.63" rx="2.6" ry="1.25" transform="rotate(-66.2 40.53 24.63)" /><ellipse cx="41.46" cy="21.00" rx="2.6" ry="1.25" transform="rotate(-85.0 41.46 21.00)" /><ellipse cx="41.17" cy="17.27" rx="2.6" ry="1.25" transform="rotate(-103.8 41.17 17.27)" /><ellipse cx="39.70" cy="13.82" rx="2.6" ry="1.25" transform="rotate(-122.5 39.70 13.82)" /><ellipse cx="37.20" cy="11.03" rx="2.6" ry="1.25" transform="rotate(-141.2 37.20 11.03)" /><ellipse cx="33.93" cy="9.19" rx="2.6" ry="1.25" transform="rotate(-160.0 33.93 9.19)" />
        </g>
        <path d="M27 32.6h6l-1.6 2.6h-2.8z" fill="#ffffff" />
      </g>
    </Flag>
  )
}

/** Malaysia. Fourteen stripes, canton, crescent and star. */
function FlagMY(props: FlagProps) {
  const stripe = 40 / 14
  return (
    <Flag {...props}>
      <rect width="60" height="40" fill="#fff" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} y={i * 2 * stripe} width="60" height={stripe} fill="#CC0001" />
      ))}
      <rect width="30" height={stripe * 8} fill="#010066" />
      <path
        d="M15.5 5.7a5.7 5.7 0 1 0 0 11.4 6.6 6.6 0 1 1 0-11.4Z"
        fill="#FFCC00"
      />
      <path
        d="M20.6 8.1l.9 2.7h2.8l-2.3 1.7.9 2.7-2.3-1.7-2.3 1.7.9-2.7-2.3-1.7h2.8z"
        fill="#FFCC00"
      />
    </Flag>
  )
}

/** Indonesia. */
function FlagID(props: FlagProps) {
  return (
    <Flag {...props}>
      <rect width="60" height="40" fill="#fff" />
      <rect width="60" height="20" fill="#CE1126" />
    </Flag>
  )
}

const FLAGS: Record<string, (props: FlagProps) => React.JSX.Element> = {
  gb: FlagGB,
  ng: FlagNG,
  fr: FlagFR,
  sa: FlagAR,
  my: FlagMY,
  id: FlagID,
}

export function FlagIcon({ code, ...props }: { code: string } & FlagProps) {
  const Component = FLAGS[code]
  if (!Component) return null
  return <Component {...props} />
}
