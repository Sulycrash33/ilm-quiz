import type { SVGProps } from "react"

/**
 * The avatar set.
 *
 * WHY THIS IS A REWRITE
 * The first version drew each avatar independently, so nothing lined up: heads
 * sat at different heights, one had nine units of bare neck between the jaw and
 * the collar, and the beards came out of an arithmetic expression rather than a
 * drawn shape. That is what made them look unfinished.
 *
 * This is built the way avatar systems that work are built — as layers over one
 * canonical base. Every avatar uses the same circle, the same shoulder line,
 * the same neck and the same head at the same coordinates; only the garment and
 * the headwear change. Consistency across the set is the thing that reads as
 * "properly made", far more than detail in any single one.
 *
 * PROPORTIONS
 * 100x100 canvas. Head centred at (50,42), 32 wide and 38 tall, which puts it
 * at a little under 60% of the circle and leaves real padding at the crown —
 * the standard head-and-shoulders bust framing, and the reason these still read
 * at 32px in a comment thread.
 *
 * WHY THEY HAVE NO FACES
 * Deliberate. Views among Muslims differ on depicting animate beings, and
 * facial features are where most of the disagreement sits. Faceless works for
 * everyone: someone who avoids such images is not asked to pick one, and nobody
 * else loses anything, because all the character here is in the dress. It is
 * also better design — no eyes to sit slightly wrong at small sizes.
 *
 * The range runs deliberately wide, contemporary through fully covered, in both
 * directions. A Kano teenager and a Gulf grandmother should both find
 * themselves in the same grid without either being the odd one out.
 */

export type AvatarGender = "female" | "male"

export interface AvatarDefinition {
  id: string
  gender: AvatarGender
  label: string
}

/* Skin tones span a real range on purpose: this app is Hausa-first and reaches
   Malaysia and Indonesia, so a single default would be wrong for most of the
   people using it. */
const SKIN = {
  light: "#efd0ae",
  warm: "#d9a97a",
  tan: "#b8814f",
  deep: "#8a5630",
  rich: "#5f3a20",
} as const

const FIELD = "#1b2540"

/* ------------------------------------------------------------------ base -- */

/** Background, garment, neck. Everything else is drawn on top of this. */
function Base({ garment, skin }: { garment: string; skin: string }) {
  return (
    <>
      <circle cx="50" cy="50" r="50" fill={FIELD} />
      {/* Shoulders. One curve, used by every avatar, so the whole set shares a
          horizon line. */}
      <path d="M10 100c0-19 18-30 40-30s40 11 40 30z" fill={garment} />
      {/* Neck, with a shadow where the jaw meets it — the only shading in the
          set, and enough to stop the head reading as a sticker. */}
      <path d="M43 56h14v18H43z" fill={skin} />
      <path d="M43 56h14v7H43z" fill="rgba(0,0,0,0.18)" />
    </>
  )
}

/** The head, ears optional (a scarf covers them). */
function Head({ skin, ears = false }: { skin: string; ears?: boolean }) {
  return (
    <>
      {ears && (
        <>
          <circle cx="33" cy="45" r="4" fill={skin} />
          <circle cx="67" cy="45" r="4" fill={skin} />
        </>
      )}
      <ellipse cx="50" cy="42" rx="16" ry="19" fill={skin} />
    </>
  )
}

/**
 * A head covering: a dome over the crown that falls to the shoulders, with an
 * opening cut for the face. `opening` controls how much of the face shows —
 * this is what separates a wrapped hijab from a niqab from a full covering,
 * using the same two shapes each time.
 */
function Covering({
  cloth,
  skin,
  trim,
  opening,
}: {
  cloth: string
  skin: string
  trim?: string
  opening: "face" | "eyes" | "none"
}) {
  return (
    <>
      <path d="M22 56 19 100h62L78 56z" fill={cloth} />
      <ellipse cx="50" cy="44" rx="29" ry="31" fill={cloth} />
      {opening === "face" && (
        <>
          <ellipse cx="50" cy="43" rx="15" ry="18" fill={skin} />
          {trim && (
            <path d="M35 43C35 25 65 25 65 43" fill="none" stroke={trim} strokeWidth="2.5" strokeLinecap="round" />
          )}
        </>
      )}
      {opening === "eyes" && (
        <>
          <rect x="36" y="38" width="28" height="9" rx="4.5" fill={skin} />
          {trim && <path d="M34 38C34 21 66 21 66 38" fill="none" stroke={trim} strokeWidth="2" strokeLinecap="round" />}
        </>
      )}
    </>
  )
}

/** A beard, as three drawn variants rather than a formula. */
function Beard({ color, length }: { color: string; length: "stubble" | "short" | "full" | "long" }) {
  const d = {
    stubble: "M34 44c0 10 7 17 16 17s16-7 16-17c0 6-6 10-16 10s-16-4-16-10z",
    short: "M34 43c0 13 7 21 16 21s16-8 16-21c0 7-6 12-16 12s-16-5-16-12z",
    full: "M33 42c0 18 8 28 17 28s17-10 17-28c0 8-7 14-17 14s-17-6-17-14z",
    long: "M33 42c0 26 8 38 17 38s17-12 17-38c0 9-7 15-17 15s-17-6-17-15z",
  }[length]
  return <path d={d} fill={color} />
}

/* ---------------------------------------------------------------- female -- */

function Woman({
  skin,
  cloth,
  garment,
  trim,
  opening = "face",
  extra,
}: {
  skin: string
  cloth: string
  garment: string
  trim?: string
  opening?: "face" | "eyes" | "none"
  extra?: React.ReactNode
}) {
  return (
    <>
      <Base garment={garment} skin={skin} />
      <Head skin={skin} />
      <Covering cloth={cloth} skin={skin} trim={trim} opening={opening} />
      {extra}
    </>
  )
}

const FEMALE_ART: Record<string, React.ReactNode> = {
  "f-1": <Woman skin={SKIN.warm} cloth="#c9a227" garment="#8a6b1c" trim="#ffe9ad" />,
  "f-2": (
    <Woman
      skin={SKIN.light}
      cloth="#6fc7a3"
      garment="#1f5a44"
      trim="#2f7d5f"
      extra={<path d="M36 32C36 18 64 18 64 32Z" fill="#b8f2d8" />}
    />
  ),
  "f-3": (
    // Turban wrap: the covering stops at the crown, so the collar has to come
    // up to meet the jaw or the neck reads as a giraffe. It does.
    <>
      <Base garment="#5a4a2c" skin={SKIN.tan} />
      <Head skin={SKIN.tan} ears />
      <path d="M38 62h24v14H38z" fill="#5a4a2c" />
      <path d="M38 62h24v4H38z" fill="rgba(0,0,0,0.2)" />
      <path d="M30 38c0-12 9-22 20-22s20 10 20 22c0 4-3 6-7 4-4-2-8-3-13-3s-9 1-13 3c-4 2-7 0-7-4z" fill="#dcc9a4" />
      <path d="M31 31c7-5 31-5 38 0" fill="none" stroke="#f6e6c4" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  "f-4": <Woman skin={SKIN.deep} cloth="#33436e" garment="#232f4f" trim="#8fa6e0" />,
  "f-5": (
    <Woman
      skin={SKIN.rich}
      cloth="#3d2d53"
      garment="#2a1f3a"
      trim="#c9a227"
      extra={<path d="M28 80h44" stroke="#c9a227" strokeWidth="2.5" strokeDasharray="3 4" strokeLinecap="round" />}
    />
  ),
  "f-6": <Woman skin={SKIN.warm} cloth="#2c3d5e" garment="#23324f" trim="#4a628f" opening="eyes" />,
  "f-7": (
    // Full covering, with a woven grille.
    <>
      <Base garment="#3d4f33" skin={SKIN.tan} />
      <Head skin={SKIN.tan} />
      <Covering cloth="#4a5d3f" skin={SKIN.tan} opening="none" />
      <rect x="39" y="32" width="22" height="16" rx="3" fill="#33422b" />
      {[0, 1, 2, 3].map((i) => (
        <line key={`h${i}`} x1="39" y1={35 + i * 4} x2="61" y2={35 + i * 4} stroke="#7d9470" strokeWidth="0.9" />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={`v${i}`} x1={41.5 + i * 4.5} y1="32" x2={41.5 + i * 4.5} y2="48" stroke="#7d9470" strokeWidth="0.9" />
      ))}
    </>
  ),
  "f-8": (
    <Woman
      skin={SKIN.light}
      cloth="#8a1f3d"
      garment="#5c1428"
      trim="#f0cd6d"
      extra={<path d="M43 76v20M57 76v20" stroke="#f0cd6d" strokeWidth="3" strokeLinecap="round" />}
    />
  ),
}

/* ------------------------------------------------------------------ male -- */

function Man({
  skin,
  garment,
  beard,
  beardColor = "#241a05",
  headwear,
}: {
  skin: string
  garment: string
  beard?: "stubble" | "short" | "full" | "long"
  beardColor?: string
  headwear?: React.ReactNode
}) {
  return (
    <>
      <Base garment={garment} skin={skin} />
      <Head skin={skin} ears />
      {beard && <Beard color={beardColor} length={beard} />}
      {headwear}
    </>
  )
}

/** A brimless cap sitting on the crown. */
function Cap({ fill, band }: { fill: string; band: string }) {
  return (
    <>
      <path d="M32 30h36c0-9-8-15-18-15s-18 6-18 15z" fill={fill} />
      <rect x="30" y="28" width="40" height="5" rx="2.5" fill={band} />
    </>
  )
}

const MALE_ART: Record<string, React.ReactNode> = {
  "m-1": (
    <Man
      skin={SKIN.warm}
      garment="#33436e"
      headwear={<path d="M33 40c0-11 8-19 17-19s17 8 17 19c0-7-8-9-17-9s-17 2-17 9z" fill="#241a05" />}
    />
  ),
  "m-2": <Man skin={SKIN.light} garment="#1f5a44" beard="stubble" beardColor="#4a3a1c" headwear={<Cap fill="#6fc7a3" band="#b8f2d8" />} />,
  "m-3": <Man skin={SKIN.tan} garment="#5a4a2c" beard="full" headwear={<Cap fill="#f0cd6d" band="#ffe9ad" />} />,
  "m-4": (
    // Imamah over a cap, white beard — the elder.
    <Man
      skin={SKIN.deep}
      garment="#3d2d53"
      beard="long"
      beardColor="#ededed"
      headwear={
        <>
          <path d="M28 30c0-12 10-20 22-20s22 8 22 20z" fill="#f6e6c4" />
          <path d="M26 28c8-5 40-5 48 0 2 1 2 6 0 7-8 4-40 4-48 0-2-1-2-6 0-7z" fill="#ffffff" />
          <path d="M27 31c8-4 38-4 46 0" fill="none" stroke="#dcd3bd" strokeWidth="1.4" />
          <path d="M71 33c5 5 6 12 3 18" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
        </>
      }
    />
  ),
  "m-5": (
    // Ghutra with agal. The cloth is drawn over the head, then the face is cut
    // back in, then the beard — order matters or the cloth covers the beard.
    <>
      <Base garment="#8a6b1c" skin={SKIN.light} />
      <path d="M25 34c0-14 11-24 25-24s25 10 25 24c0 20-4 30-6 42H31c-2-12-6-22-6-42z" fill="#ffffff" />
      <ellipse cx="50" cy="43" rx="15" ry="18" fill={SKIN.light} />
      <Beard color="#241a05" length="short" />
      <path d="M27 26c8-5 38-5 46 0" fill="none" stroke="#1b2540" strokeWidth="4.5" />
      <path d="M27 33c8-5 38-5 46 0" fill="none" stroke="#1b2540" strokeWidth="3" />
    </>
  ),
  "m-6": (
    <Man
      skin={SKIN.rich}
      garment="#23324f"
      beard="short"
      beardColor="#1a1208"
      headwear={
        <>
          <path d="M37 28h26l-2-16H39z" fill="#8a1f3d" />
          <rect x="35" y="26" width="30" height="5" rx="2" fill="#5c1428" />
          <path d="M50 12v-4" stroke="#1a1208" strokeWidth="2" strokeLinecap="round" />
        </>
      }
    />
  ),
  "m-7": (
    <Man
      skin={SKIN.tan}
      garment="#dcc9a4"
      beard="long"
      beardColor="#3a2f16"
      headwear={
        <>
          <Cap fill="#5a4a2c" band="#7a663c" />
          <path d="M18 88c9-7 20-10 32-10s23 3 32 10" fill="none" stroke="#8a6b1c" strokeWidth="5" strokeLinecap="round" />
        </>
      }
    />
  ),
  "m-8": (
    <Man
      skin={SKIN.deep}
      garment="#2a3550"
      beard="stubble"
      beardColor="#1a1208"
      headwear={
        <>
          <path d="M24 44c0-16 12-28 26-28s26 12 26 28c0-9-2-13-4-15-7 4-37 4-44 0-2 2-4 6-4 15z" fill="#3c4a72" />
          <path d="M16 100c3-14 11-23 18-26l6 7h20l6-7c7 3 15 12 18 26z" fill="#3c4a72" />
        </>
      }
    />
  ),
}

export const AVATARS: AvatarDefinition[] = [
  { id: "f-1", gender: "female", label: "Wrapped hijab" },
  { id: "f-2", gender: "female", label: "Hijab and underscarf" },
  { id: "f-3", gender: "female", label: "Turban wrap" },
  { id: "f-4", gender: "female", label: "Khimar" },
  { id: "f-5", gender: "female", label: "Abaya and shayla" },
  { id: "f-6", gender: "female", label: "Niqab" },
  { id: "f-7", gender: "female", label: "Full covering" },
  { id: "f-8", gender: "female", label: "Scholar" },
  { id: "m-1", gender: "male", label: "Short hair" },
  { id: "m-2", gender: "male", label: "Kufi cap" },
  { id: "m-3", gender: "male", label: "Taqiyah and beard" },
  { id: "m-4", gender: "male", label: "Imamah, elder" },
  { id: "m-5", gender: "male", label: "Ghutra and agal" },
  { id: "m-6", gender: "male", label: "Tarboosh" },
  { id: "m-7", gender: "male", label: "Thobe and shawl" },
  { id: "m-8", gender: "male", label: "Hooded, modern" },
]

const ART: Record<string, React.ReactNode> = { ...FEMALE_ART, ...MALE_ART }

export function avatarLabel(id: string | null | undefined): string | null {
  return AVATARS.find((a) => a.id === id)?.label ?? null
}

export function isKnownAvatar(id: string | null | undefined): boolean {
  return Boolean(id && id in ART)
}

/**
 * An unknown id — including the remote URLs the previous third-party set
 * stored — falls back to the brand mark rather than an empty circle, so an old
 * profile degrades to something deliberate.
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
