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
 * The Saudi flag carries the shahada. Rendering the testimony of faith as a
 * crude approximation of Arabic calligraphy, scaled to 24px, would be worse
 * than not rendering it — so this draws the green field and the sword and
 * stops there. It is deliberately not a facsimile of the national flag. If an
 * exact flag is ever wanted it should come from a proper source, not from this
 * file.
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

/** Arabic. Green field and sword only — see the note at the top of this file. */
function FlagAR(props: FlagProps) {
  return (
    <Flag {...props}>
      <rect width="60" height="40" fill="#165D31" />
      <path d="M12 27h34" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M46 27l-5-3v6z" fill="#fff" />
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
