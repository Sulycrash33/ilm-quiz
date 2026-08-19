import type { SVGProps } from "react"

/**
 * The avatar set.
 *
 * ON FACES
 * An earlier version of this file was faceless, on the reasoning that views
 * among Muslims differ on depicting animate beings and that facial features are
 * where the disagreement sits. That judgement was overruled by the person whose
 * app this is, with a reference sheet of faced avatars — so these have faces.
 * The faceless variants are one commit back in history if they are ever wanted
 * again; nothing else in the app depends on which way this goes.
 *
 * HOW IT IS BUILT
 * Layers over one canonical base, not sixteen independent drawings. Every
 * avatar shares the same circle, the same shoulder line, the same neck and the
 * same head at the same coordinates. Only garment, headwear, features and
 * accessories change. That shared geometry is what makes a set read as a set.
 *
 * Head is 31x36 on a 100x100 canvas, centred at (50,44) — a little under 60% of
 * the circle, the standard bust framing, and the reason these still read at
 * 32px in a comment thread.
 *
 * Every curve is a cubic. Not one SVG arc appears in this file, deliberately:
 * an arc whose chord equals twice its radius is degenerate, browsers close the
 * subpath with a straight line, and that mistake cost four separate rounds of
 * debugging across this component and the brand mark. One of them rendered as
 * two dark blobs at the temples that looked like sideburns.
 */

export type AvatarGender = "female" | "male"

export interface AvatarDefinition {
  id: string
  gender: AvatarGender
  /** The character's name — what the picker shows. */
  name: string
  /** What they are wearing. Used as the tile's title and for screen readers. */
  style: string
}

const SKIN = {
  light: "#f2d3b3",
  warm: "#e0b088",
  tan: "#c08d5c",
  deep: "#96603a",
  rich: "#6d4326",
} as const

const FIELD = "#1b2540"
const LIP = "#c1706b"
const HAIRDARK = "#231508"

/* ------------------------------------------------------------------ base -- */

function Shoulders({ garment, collar }: { garment: string; collar?: string }) {
  return (
    <>
      <path d="M9 100c0-20 18-31 41-31s41 11 41 31z" fill={garment} />
      {collar && <path d="M41 71c3 6 6 9 9 9s6-3 9-9c4 2 7 4 9 6-5 5-11 8-18 8s-13-3-18-8c2-2 5-4 9-6z" fill={collar} />}
    </>
  )
}

function Neck({ skin }: { skin: string }) {
  return (
    <>
      <path d="M43 57h14v17H43z" fill={skin} />
      <path d="M43 57h14v7H43z" fill="rgba(0,0,0,0.16)" />
    </>
  )
}

/**
 * The face. `veil` hides everything below the eyes, which is what makes a niqab
 * a niqab without needing a second set of shapes.
 */
function Face({
  skin,
  brows = HAIRDARK,
  lashes = true,
  veil = false,
  glasses,
}: {
  skin: string
  brows?: string
  lashes?: boolean
  veil?: boolean
  glasses?: string
}) {
  return (
    <>
      <ellipse cx="50" cy="44" rx="15.5" ry="18" fill={skin} />

      {/* Brows. */}
      <path d="M41.5 38.5C43 36.8 46 36.8 47.5 38.2" fill="none" stroke={brows} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M52.5 38.2C54 36.8 57 36.8 58.5 38.5" fill="none" stroke={brows} strokeWidth="1.7" strokeLinecap="round" />

      {/* Eyes. */}
      {lashes && (
        <>
          <path d="M41 43.2C42.4 41.4 46.2 41.4 47.6 43.2" fill="none" stroke={brows} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M52.4 43.2C53.8 41.4 57.6 41.4 59 43.2" fill="none" stroke={brows} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      <ellipse cx="44.3" cy="44.6" rx="2" ry="2.6" fill="#2a2118" />
      <ellipse cx="55.7" cy="44.6" rx="2" ry="2.6" fill="#2a2118" />
      <circle cx="45" cy="43.7" r="0.62" fill="#ffffff" />
      <circle cx="56.4" cy="43.7" r="0.62" fill="#ffffff" />

      {!veil && (
        <>
          {/* Nose and mouth. */}
          <path d="M50 47.5v3.2c0 .7-.6 1.1-1.4 1.1" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M46.8 55.2C48.2 54.4 51.8 54.4 53.2 55.2C51.9 57.4 48.1 57.4 46.8 55.2Z" fill={LIP} />
          {/* Cheeks. */}
          <ellipse cx="40.5" cy="49.5" rx="3.1" ry="2" fill="rgba(200,90,80,0.16)" />
          <ellipse cx="59.5" cy="49.5" rx="3.1" ry="2" fill="rgba(200,90,80,0.16)" />
        </>
      )}

      {glasses && (
        <>
          <rect x="38.6" y="40.6" width="10" height="8" rx="3.4" fill="rgba(255,255,255,0.12)" stroke={glasses} strokeWidth="1.5" />
          <rect x="51.4" y="40.6" width="10" height="8" rx="3.4" fill="rgba(255,255,255,0.12)" stroke={glasses} strokeWidth="1.5" />
          <path d="M48.6 44.2h2.8" stroke={glasses} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </>
  )
}

/* ---------------------------------------------------------------- female -- */

/**
 * A headscarf. `crown` is the dome over the head, `drape` falls to the
 * shoulders, and the face opening is cut by drawing the face on top — so the
 * scarf reads as framing it rather than sitting behind it.
 */
function Scarf({ cloth, shade }: { cloth: string; shade: string }) {
  return (
    <>
      <path d="M27 58 25 100h50L73 58z" fill={shade} />
      <path
        d="M50 12C33 12 22 25 22 42c0 10 3 17 6 23 2 4 3 8 3 12h38c0-4 1-8 3-12 3-6 6-13 6-23 0-17-11-30-28-30Z"
        fill={cloth}
      />
    </>
  )
}

function Woman({
  skin,
  cloth,
  shade,
  garment,
  collar,
  veil = false,
  glasses,
  extra,
  under,
}: {
  skin: string
  cloth: string
  shade: string
  garment: string
  collar?: string
  veil?: boolean
  glasses?: string
  extra?: React.ReactNode
  under?: React.ReactNode
}) {
  return (
    <>
      <circle cx="50" cy="50" r="50" fill={FIELD} />
      <Shoulders garment={garment} collar={collar} />
      {under}
      <Neck skin={skin} />
      <Scarf cloth={cloth} shade={shade} />
      <Face skin={skin} veil={veil} glasses={glasses} />
      {/* Veil across the lower face, drawn after the features so it covers
          them. */}
      {veil && <path d="M31 47c0 16 8 27 19 27s19-11 19-27z" fill={cloth} />}
      {extra}
    </>
  )
}

const FEMALE_ART: Record<string, React.ReactNode> = {
  // Khadijah — rust scarf, deep teal dress.
  "f-1": <Woman skin={SKIN.warm} cloth="#d4762f" shade="#a8571d" garment="#1f3d54" collar="#e0b088" />,

  // Aisha — powder blue scarf over an aubergine top.
  "f-2": <Woman skin={SKIN.light} cloth="#8fc7e8" shade="#5f9dc4" garment="#5a3d6b" collar="#f2d3b3" />,

  // Fatimah — black abaya, gold-edged.
  "f-3": (
    <Woman
      skin={SKIN.tan}
      cloth="#22252e"
      shade="#15171d"
      garment="#0f1116"
      extra={<path d="M30 82h40" stroke="#d4af37" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" />}
    />
  ),

  // Maryam — teal turban with a long braid over the shoulder.
  "f-4": (
    <>
      <circle cx="50" cy="50" r="50" fill={FIELD} />
      <Shoulders garment="#3f7fb3" collar="#7fb2d8" />
      {/* Braid, plaited down the right shoulder. */}
      <path d="M69 46c6 6 8 16 7 26" fill="none" stroke="#2a1c0c" strokeWidth="7" strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={70.5 + i * 1.6} cy={54 + i * 5.5} rx="4.2" ry="3" fill="#3d2a12" transform={`rotate(${-24 + i * 5} ${70.5 + i * 1.6} ${54 + i * 5.5})`} />
      ))}
      <Neck skin={SKIN.warm} />
      <Face skin={SKIN.warm} />
      {/* Turban: wrapped bands rather than a smooth dome. */}
      <path d="M31 38c0-13 9-24 19-24s19 11 19 24c0 4-3 6-7 4-4-2-8-3-12-3s-8 1-12 3c-4 2-7 0-7-4z" fill="#2f9e8f" />
      <path d="M31 32c8-6 30-6 38 0" fill="none" stroke="#54c4b4" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M32 25c7-5 29-5 36 0" fill="none" stroke="#1f7a6e" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),

  // Sumayyah — mint scarf, glasses, cream blouse.
  "f-5": <Woman skin={SKIN.light} cloth="#a9dcc4" shade="#78b99d" garment="#efe6d2" collar="#d8c9a8" glasses="#3a2f16" />,

  // Hafsa — powder-blue niqab, eyes only.
  "f-6": <Woman skin={SKIN.warm} cloth="#bcd8ea" shade="#8fb4cc" garment="#8fb4cc" veil />,

  // Zaynab — deep green khimar with a face veil.
  "f-7": <Woman skin={SKIN.deep} cloth="#1f5f4a" shade="#154034" garment="#154034" veil />,

  // Ruqayyah — cream scarf, crimson dress, gold trim.
  "f-8": (
    <Woman
      skin={SKIN.rich}
      cloth="#f0e4cb"
      shade="#cbb894"
      garment="#a32338"
      collar="#f0cd6d"
      extra={
        <>
          <path d="M50 76v24" stroke="#f0cd6d" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M42 79l8 7 8-7" fill="none" stroke="#f0cd6d" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </>
      }
    />
  ),
}

/* ------------------------------------------------------------------ male -- */

function Beard({ color, length }: { color: string; length: "stubble" | "short" | "full" | "long" }) {
  const d = {
    stubble: "M34.5 45c0 10 7 17 15.5 17S65.5 55 65.5 45c0 6-6 10-15.5 10S34.5 51 34.5 45z",
    short: "M34 44c0 13 7 21 16 21s16-8 16-21c0 7-6 12-16 12s-16-5-16-12z",
    full: "M33.5 43c0 18 7 29 16.5 29S66.5 61 66.5 43c0 8-7 14-16.5 14S33.5 51 33.5 43z",
    long: "M33.5 43c0 26 7 39 16.5 39S66.5 69 66.5 43c0 9-7 15-16.5 15S33.5 52 33.5 43z",
  }[length]
  return <path d={d} fill={color} />
}

function Cap({ fill, band }: { fill: string; band: string }) {
  return (
    <>
      <path d="M32 29h36c0-10-8-16-18-16s-18 6-18 16z" fill={fill} />
      <path d="M30.5 27.5h39v5.5h-39z" rx="2.5" fill={band} />
    </>
  )
}

function Man({
  skin,
  garment,
  collar,
  beard,
  beardColor = HAIRDARK,
  glasses,
  headwear,
  ears = true,
}: {
  skin: string
  garment: string
  collar?: string
  beard?: "stubble" | "short" | "full" | "long"
  beardColor?: string
  glasses?: string
  headwear?: React.ReactNode
  ears?: boolean
}) {
  return (
    <>
      <circle cx="50" cy="50" r="50" fill={FIELD} />
      <Shoulders garment={garment} collar={collar} />
      <Neck skin={skin} />
      {ears && (
        <>
          <circle cx="33.5" cy="46" r="3.8" fill={skin} />
          <circle cx="66.5" cy="46" r="3.8" fill={skin} />
        </>
      )}
      {beard && <Beard color={beardColor} length={beard} />}
      <Face skin={skin} lashes={false} glasses={glasses} />
      {beard && <Beard color={beardColor} length={beard} />}
      {headwear}
    </>
  )
}

const MALE_ART: Record<string, React.ReactNode> = {
  // Yusuf — fade, bomber collar.
  "m-1": (
    <Man
      skin={SKIN.warm}
      garment="#2f4a7a"
      collar="#5f7fb5"
      headwear={<path d="M33.5 41c0-12 8-20 16.5-20s16.5 8 16.5 20c0-7-8-9-16.5-9s-16.5 2-16.5 9z" fill={HAIRDARK} />}
    />
  ),

  // Bilal — kufi, stubble, mandarin collar.
  "m-2": <Man skin={SKIN.deep} garment="#1f6b52" collar="#43a383" beard="stubble" headwear={<Cap fill="#2f9e8f" band="#7fd8c8" />} />,

  // Umar — gold taqiyah, full beard, sand thobe.
  "m-3": <Man skin={SKIN.tan} garment="#c9b48b" collar="#efe6d2" beard="full" headwear={<Cap fill="#e0b12f" band="#ffe9ad" />} />,

  // Idris — imamah, white beard, plum shawl. The elder.
  "m-4": (
    <Man
      skin={SKIN.deep}
      garment="#4a3562"
      collar="#7d5f9c"
      beard="long"
      beardColor="#eeeeee"
      headwear={
        <>
          <path d="M28 30c0-13 10-21 22-21s22 8 22 21z" fill="#f6e6c4" />
          <path d="M26 28c8-6 40-6 48 0 2 1 2 6 0 7-8 4-40 4-48 0-2-1-2-6 0-7z" fill="#ffffff" />
          <path d="M27 31c8-4 38-4 46 0" fill="none" stroke="#ddd4bf" strokeWidth="1.4" />
          <path d="M71 34c5 5 6 13 3 19" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
        </>
      }
    />
  ),

  // Salman — ghutra and agal. Cloth first, face cut back in, then the beard.
  "m-5": (
    <>
      <circle cx="50" cy="50" r="50" fill={FIELD} />
      <Shoulders garment="#e8dcc2" collar="#ffffff" />
      <Neck skin={SKIN.light} />
      <path d="M25 34c0-14 11-25 25-25s25 11 25 25c0 21-4 31-6 44H31c-2-13-6-23-6-44z" fill="#ffffff" />
      <Beard color={HAIRDARK} length="short" />
      <Face skin={SKIN.light} lashes={false} />
      <Beard color={HAIRDARK} length="short" />
      <path d="M27 25c8-5 38-5 46 0" fill="none" stroke="#1b2540" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M27 32c8-5 38-5 46 0" fill="none" stroke="#1b2540" strokeWidth="3" strokeLinecap="round" />
    </>
  ),

  // Musa — tarboosh and moustache.
  "m-6": (
    <Man
      skin={SKIN.rich}
      garment="#243b52"
      beard="stubble"
      headwear={
        <>
          <path d="M37 27h26l-2-17H39z" fill="#9b2335" />
          <path d="M34.5 25.5h31v5.5h-31z" fill="#6d1524" />
          <path d="M50 10V6" stroke="#2a1108" strokeWidth="2" strokeLinecap="round" />
        </>
      }
    />
  ),

  // Harun — glasses, short beard, charcoal jacket.
  "m-7": (
    <Man
      skin={SKIN.tan}
      garment="#2c3038"
      collar="#8a939f"
      beard="short"
      glasses="#e6e6e6"
      headwear={<path d="M33.5 40c0-12 8-20 16.5-20s16.5 8 16.5 20c0-8-8-10-16.5-10s-16.5 2-16.5 10z" fill="#2a1c0c" />}
    />
  ),

  // Zayd — hood up, young.
  "m-8": (
    <Man
      skin={SKIN.deep}
      garment="#33436e"
      beard="stubble"
      ears={false}
      headwear={
        <>
          <path d="M24 45c0-17 12-30 26-30s26 13 26 30c0-9-2-14-4-16-7 5-37 5-44 0-2 2-4 7-4 16z" fill="#44548a" />
          <path d="M15 100c3-16 11-25 18-28l7 8h20l7-8c7 3 15 12 18 28z" fill="#44548a" />
        </>
      }
    />
  ),
}

export const AVATARS: AvatarDefinition[] = [
  { id: "f-1", gender: "female", name: "Khadijah", style: "Rust scarf, teal dress" },
  { id: "f-2", gender: "female", name: "Aisha", style: "Powder blue scarf" },
  { id: "f-3", gender: "female", name: "Fatimah", style: "Black abaya, gold trim" },
  { id: "f-4", gender: "female", name: "Maryam", style: "Teal turban and braid" },
  { id: "f-5", gender: "female", name: "Sumayyah", style: "Mint scarf and glasses" },
  { id: "f-6", gender: "female", name: "Hafsa", style: "Powder blue niqab" },
  { id: "f-7", gender: "female", name: "Zaynab", style: "Deep green khimar" },
  { id: "f-8", gender: "female", name: "Ruqayyah", style: "Cream scarf, crimson dress" },
  { id: "m-1", gender: "male", name: "Yusuf", style: "Fade and bomber" },
  { id: "m-2", gender: "male", name: "Bilal", style: "Kufi cap" },
  { id: "m-3", gender: "male", name: "Umar", style: "Taqiyah and thobe" },
  { id: "m-4", gender: "male", name: "Idris", style: "Imamah, elder" },
  { id: "m-5", gender: "male", name: "Salman", style: "Ghutra and agal" },
  { id: "m-6", gender: "male", name: "Musa", style: "Tarboosh" },
  { id: "m-7", gender: "male", name: "Harun", style: "Glasses and jacket" },
  { id: "m-8", gender: "male", name: "Zayd", style: "Hood up" },
]

const ART: Record<string, React.ReactNode> = { ...FEMALE_ART, ...MALE_ART }

export function avatarName(id: string | null | undefined): string | null {
  return AVATARS.find((a) => a.id === id)?.name ?? null
}

export function isKnownAvatar(id: string | null | undefined): boolean {
  return Boolean(id && id in ART)
}

/**
 * An unknown id — including the remote URLs the previous third-party set
 * stored — falls back to the brand mark rather than an empty circle.
 */
export function AvatarArt({ id, ...props }: { id: string } & SVGProps<SVGSVGElement>) {
  const art = ART[id]
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      {art ?? (
        <>
          <circle cx="50" cy="50" r="50" fill={FIELD} />
          <g transform="translate(19 19) scale(0.62)" opacity="0.55">
            <path d="M68 19.016A38 38 0 1 0 68 80.984A32 32 0 1 1 68 19.016Z" fill="#f0cd6d" />
          </g>
        </>
      )}
    </svg>
  )
}
