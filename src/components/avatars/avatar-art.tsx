import type { SVGProps } from "react"

/**
 * The avatar set.
 *
 * HOW THESE ARE BUILT
 * Every avatar is the same four-layer stack, so the set reads as one family
 * rather than sixteen separate drawings:
 *
 *   1. the field  — the disc behind everything
 *   2. the body   — shoulders with a real scooped neckline, a collar band,
 *                   a lit shoulder and a shaded one
 *   3. the head   — a skull that tapers to a jaw and a chin, never an ellipse,
 *                   with a neck that widens into the shoulders
 *   4. the dress  — scarf, cap, turban, ghutra, hood; the only thing that
 *                   differs between avatars, which is the point
 *
 * Light comes from the upper left in all sixteen. That single rule is most of
 * what stops flat vector art looking like clip art: the same edge is bright in
 * every avatar and the same edge is dark.
 *
 * WHAT THE SCARVES DO
 * A headscarf is not a dome. Each one is a silhouette that falls past the
 * shoulders and stops at a hem, with the dress visible below and beside it, a
 * front edge band framing the face (the piece that actually makes it read as a
 * hijab rather than a hood), an under-cap at the hairline, and on some a
 * draped end over one shoulder.
 *
 * ON FACES
 * No eyes, nose or mouth. Views among Muslims differ on depicting animate
 * beings and facial features are where the disagreement sits; leaving them off
 * costs nothing here, because every distinguishing thing is in the dress.
 *
 * ON ARCS
 * There is not one SVG arc command in this file. An arc whose chord equals
 * twice its radius is degenerate — browsers close the subpath with a straight
 * line — and that mistake cost five separate rounds of debugging across this
 * component and the brand mark. Every curve below is a cubic.
 *
 * WHAT THIS IS NOT
 * Careful hand-written SVG, not a commissioned illustration set. If the bar is
 * "never touch it again", the honest route is to license or commission
 * artwork; the picker takes an id and renders a component, so swapping the art
 * touches this file and nothing else.
 */

export type AvatarGender = "female" | "male"

export interface AvatarDefinition {
  id: string
  gender: AvatarGender
  /** The Arabic letter that labels this avatar. */
  letter: string
  /** Its name, romanised. */
  letterName: string
  /** What they are wearing. The tile's title and accessible label. */
  style: string
}

const SKIN = {
  light: "#f0d0ae",
  warm: "#dcac82",
  tan: "#bd8853",
  deep: "#94603a",
  rich: "#6b4225",
} as const

const FIELD = "#1b2540"

/** One light direction for the whole set: upper left. */
const LIT = "rgba(255,255,255,0.16)"
const SHADE = "rgba(0,0,0,0.15)"
const DEEPSHADE = "rgba(0,0,0,0.26)"

/* ------------------------------------------------------------------ head -- */

/** The skull, tapering to a jaw and a chin. */
const HEAD_D =
  "M50 22.6C40 22.6 33.2 29.4 33.2 39.4C33.2 46.8 35.2 53 39.1 57.9" +
  "C42.4 62 46.1 64.2 50 64.2C53.9 64.2 57.6 62 60.9 57.9" +
  "C64.8 53 66.8 46.8 66.8 39.4C66.8 29.4 60 22.6 50 22.6Z"

/** The opening a scarf leaves — inset from the skull all the way round. */
const FACE_D =
  "M50 25.6C41.4 25.6 35.6 31.6 35.6 40.6C35.6 47.4 37.4 53.2 40.6 57.6" +
  "C43.4 61.4 46.6 63.4 50 63.4C53.4 63.4 56.6 61.4 59.4 57.6" +
  "C62.6 53.2 64.4 47.4 64.4 40.6C64.4 31.6 58.6 25.6 50 25.6Z"

function Head({ skin, ears = false }: { skin: string; ears?: boolean }) {
  return (
    <>
      {ears && (
        <>
          <path d="M33.9 43.6C31.6 43.4 30.6 45.5 31.1 47.7C31.6 49.9 33.2 51.4 35.2 51.3Z" fill={skin} />
          <path d="M66.1 43.6C68.4 43.4 69.4 45.5 68.9 47.7C68.4 49.9 66.8 51.4 64.8 51.3Z" fill={skin} />
          <path d="M66.1 43.6C68.4 43.4 69.4 45.5 68.9 47.7C68.4 49.9 66.8 51.4 64.8 51.3Z" fill={SHADE} />
        </>
      )}
      <path d={HEAD_D} fill={skin} />
      {/* Shadow down the right of the face, light coming from the upper left. */}
      <path
        d="M57.9 24.4C63.3 27.6 66.8 33 66.8 39.4C66.8 46.8 64.8 53 60.9 57.9C59.4 59.8 57.9 61.2 56.3 62.2C59.7 56.8 61.5 50 61.5 42.6C61.5 35.6 60.2 29.2 57.9 24.4Z"
        fill={SHADE}
      />
    </>
  )
}

/** A neck that widens into the shoulders instead of sitting there as a bar. */
function Neck({ skin }: { skin: string }) {
  return (
    <>
      <path d="M43.6 54C43.6 62 42.6 67.2 40.2 70.4C45 73 55 73 59.8 70.4C57.4 67.2 56.4 62 56.4 54Z" fill={skin} />
      {/* The jaw casts onto the throat. */}
      <path d="M43.6 54C43.6 58.4 43.4 61.8 42.8 64.6C48 66.4 52 66.4 57.2 64.6C56.6 61.8 56.4 58.4 56.4 54Z" fill={DEEPSHADE} />
      <path d="M56.4 54C56.4 62 57.4 67.2 59.8 70.4C58.2 71.3 56.2 71.9 54.2 72.2C56 68.6 56.9 62.6 56.9 54Z" fill={SHADE} />
    </>
  )
}

/* ------------------------------------------------------------------ body -- */

const BODY_D =
  "M4 100C4 85.4 11.6 74 24.2 68.2C30 65.6 36.4 63.8 42.2 62.8" +
  "C43.4 70 46.4 73.6 50 73.6C53.6 73.6 56.6 70 57.8 62.8" +
  "C63.6 63.8 70 65.6 75.8 68.2C88.4 74 96 85.4 96 100Z"

function Body({ garment, collar, placket }: { garment: string; collar?: string; placket?: string }) {
  return (
    <>
      <path d={BODY_D} fill={garment} />
      <path
        d="M4 100C4 85.4 11.6 74 24.2 68.2C30 65.6 36.4 63.8 42.2 62.8L42.9 66.9C37.4 67.9 31.5 69.6 26.2 72C15.2 77.1 8.6 87 7.4 100Z"
        fill={LIT}
      />
      <path
        d="M96 100C96 85.4 88.4 74 75.8 68.2C70 65.6 63.6 63.8 57.8 62.8L57.1 66.9C62.6 67.9 68.5 69.6 73.8 72C84.8 77.1 91.4 87 92.6 100Z"
        fill={SHADE}
      />
      {collar && (
        <path
          d="M42.2 62.8C43.4 70 46.4 73.6 50 73.6C53.6 73.6 56.6 70 57.8 62.8L61.6 63.6C60.2 72 55.6 78.2 50 78.2C44.4 78.2 39.8 72 38.4 63.6Z"
          fill={collar}
        />
      )}
      {placket && (
        <>
          <path d="M50 78.4V100" stroke={placket} strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="86" r="1.6" fill={placket} />
          <circle cx="50" cy="94" r="1.6" fill={placket} />
        </>
      )}
    </>
  )
}

/* ---------------------------------------------------------------- female -- */

/** Falls to the shoulder and stops — the dress shows below and beside it. */
const SCARF_SHORT_D =
  "M50 12C33.4 12 22.4 23.4 22.4 41.6C22.4 48 22 53 21.2 58" +
  "C20.6 62 21 66 22.6 69.6C29 72.4 38.6 73.8 50 73.8" +
  "C61.4 73.8 71 72.4 77.4 69.6C79 66 79.4 62 78.8 58" +
  "C78 53 77.6 48 77.6 41.6C77.6 23.4 66.6 12 50 12Z"

/** A khimar: past the shoulders to a hem, still short of the frame. */
const SCARF_LONG_D =
  "M50 12C33.4 12 22 23.4 22 41.6C22 50 21.2 57 20.2 64" +
  "C19.4 70 19 76 19.4 82.6C27.6 85.4 37.4 86.8 50 86.8" +
  "C62.6 86.8 72.4 85.4 80.6 82.6C81 76 80.6 70 79.8 64" +
  "C78.8 57 78 50 78 41.6C78 23.4 66.6 12 50 12Z"

/** The band of cloth that frames the face. Without this it reads as a hood. */
const FRONT_EDGE_D =
  "M50 23.2C39.9 23.2 33.2 30.3 33.2 40.6C33.2 48.1 35.2 54.6 38.9 59.5L41.8 56.8" +
  "C38.7 52.5 37.1 47 37.1 40.6C37.1 32.5 42.4 27.3 50 27.3C57.6 27.3 62.9 32.5 62.9 40.6" +
  "C62.9 47 61.3 52.5 58.2 56.8L61.1 59.5C64.8 54.6 66.8 48.1 66.8 40.6C66.8 30.3 60.1 23.2 50 23.2Z"

/** The under-cap showing at the hairline. */
const CAP_EDGE_D =
  "M50 27.3C42.4 27.3 37.1 32.5 37.1 40.6C37.1 41.8 37.2 43 37.4 44.2" +
  "C39.2 36.5 44.1 32.4 50 32.4C55.9 32.4 60.8 36.5 62.6 44.2" +
  "C62.8 43 62.9 41.8 62.9 40.6C62.9 32.5 57.6 27.3 50 27.3Z"

function Scarf({
  cloth,
  shade,
  edge,
  capEdge,
  drape,
  long = false,
}: {
  cloth: string
  shade: string
  edge: string
  capEdge?: string
  drape?: string
  long?: boolean
}) {
  const d = long ? SCARF_LONG_D : SCARF_SHORT_D
  const foldLow = long ? 78 : 66
  return (
    <>
      <path d={d} fill={cloth} />
      {/* Lit side and shaded side of one continuous piece of cloth. */}
      <path
        d={
          long
            ? "M50 12C33.4 12 22 23.4 22 41.6C22 50 21.2 57 20.2 64C19.4 70 19 76 19.4 82.6L25.8 84.4C25.4 78 25.8 72 26.6 66.2C27.6 59.4 28.2 52.2 28.2 43.4C28.2 28.4 36.6 18.4 50 16.6Z"
            : "M50 12C33.4 12 22.4 23.4 22.4 41.6C22.4 48 22 53 21.2 58C20.6 62 21 66 22.6 69.6L28.8 71.2C27.4 67.8 27.2 64.2 27.8 60.6C28.4 56 28.8 51.2 28.8 44C28.8 29.2 36.8 18.6 50 16.6Z"
        }
        fill={LIT}
      />
      <path
        d={
          long
            ? "M50 12C66.6 12 78 23.4 78 41.6C78 50 78.8 57 79.8 64C80.6 70 81 76 80.6 82.6L72.6 84.8C73.2 77.8 72.8 71 71.8 64.6C70.6 57.2 69.8 50 69.8 41.6C69.8 27.4 62 17.6 50 15.4Z"
            : "M50 12C66.6 12 77.6 23.4 77.6 41.6C77.6 48 78 53 78.8 58C79.4 62 79 66 77.4 69.6L69.6 71.6C71.2 67.6 71.6 63.6 71 59.4C70.4 54.4 70 48.4 70 41.6C70 27.4 62 17.6 50 15.4Z"
        }
        fill={SHADE}
      />
      {/* Folds: gathered cloth, not a smooth shell. */}
      <path d={`M32.4 44C32.6 52 32.2 60 31 ${foldLow}`} fill="none" stroke="rgba(0,0,0,0.11)" strokeWidth="1.5" strokeLinecap="round" />
      <path d={`M67.6 44C67.4 52 67.8 60 69 ${foldLow}`} fill="none" stroke="rgba(0,0,0,0.11)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M34.6 28.6C37.8 23.6 43.2 20.4 50 19.6" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
      {long && (
        <path d="M27.4 84.6C36 86.4 44 87 50 87C56 87 64 86.4 72.6 84.6" fill="none" stroke="rgba(0,0,0,0.13)" strokeWidth="1.6" strokeLinecap="round" />
      )}
      {/* The face opening, then the band that frames it. */}
      <path d={FRONT_EDGE_D} fill={edge} />
      {capEdge && <path d={CAP_EDGE_D} fill={capEdge} />}
      {drape && (
        <>
          <path
            d="M72.6 61.4C78.2 65.2 81.4 70.8 81.8 78C82 82 81.4 86 80.2 89.6L70.6 87C71.6 83.8 72 80.6 71.8 77.6C71.4 72.2 69.4 67.2 66.2 63.4Z"
            fill={drape}
          />
          <path d="M74.8 68.4C76.8 72 77.6 76.4 77.2 81.6" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </>
  )
}

function Woman({
  skin,
  cloth,
  shade,
  edge,
  garment,
  collar,
  capEdge,
  drape,
  placket,
  long = false,
  extra,
}: {
  skin: string
  cloth: string
  shade: string
  edge: string
  garment: string
  collar?: string
  capEdge?: string
  drape?: string
  placket?: string
  long?: boolean
  extra?: React.ReactNode
}) {
  return (
    <>
      <circle cx="50" cy="50" r="50" fill={FIELD} />
      <Body garment={garment} collar={collar} placket={placket} />
      <Neck skin={skin} />
      <path d={HEAD_D} fill={skin} />
      <Scarf cloth={cloth} shade={shade} edge={edge} capEdge={capEdge} drape={drape} long={long} />
      <path d={FACE_D} fill={skin} />
      {/* The cap edge shades the top of the forehead. */}
      <path
        d="M50 25.6C41.4 25.6 35.6 31.6 35.6 40.6C35.6 41.5 35.7 42.4 35.8 43.3C37.7 35.9 42.9 31.6 50 31.6C57.1 31.6 62.3 35.9 64.2 43.3C64.3 42.4 64.4 41.5 64.4 40.6C64.4 31.6 58.6 25.6 50 25.6Z"
        fill={DEEPSHADE}
      />
      {extra}
    </>
  )
}

/** Face veil. The opening is a shadowed recess, not a bar of skin. */
function Niqab({ cloth, shade }: { cloth: string; shade: string }) {
  return (
    <>
      <path d="M36 45.6C40.8 42.4 59.2 42.4 64 45.6C59.2 48.8 40.8 48.8 36 45.6Z" fill="#2b3348" />
      <path
        d="M35.2 43.8C35.2 32.6 41.8 25 50 25C58.2 25 64.8 32.6 64.8 43.8L64 45.6C59.2 42.4 40.8 42.4 36 45.6Z"
        fill={cloth}
      />
      <path d="M35.2 43.8C35.2 32.6 41.8 25 50 25V28.8C44.2 28.8 39.4 34.6 39.2 43.2Z" fill={LIT} />
      <path d="M64.8 43.8C64.8 32.6 58.2 25 50 25V28.8C55.8 28.8 60.6 34.6 60.8 43.2Z" fill={shade} />
      <path
        d="M35 45.9L36 45.6C40.8 48.8 59.2 48.8 64 45.6L65 45.9C65 55.8 61.8 63.4 56.8 67.6C54.6 69.4 52.4 70.4 50 70.4C47.6 70.4 45.4 69.4 43.2 67.6C38.2 63.4 35 55.8 35 46Z"
        fill={cloth}
      />
      <path d="M35 45.9L36 45.6C38.2 47.1 41 48.1 44.2 48.6C43.4 56.6 44.4 63 46.8 68C45.5 67.9 44.2 68.4 43.2 67.6C38.2 63.4 35 55.8 35 46Z" fill={LIT} />
      <path d="M65 45.9L64 45.6C61.8 47.1 59 48.1 55.8 48.6C56.6 56.6 55.6 63 53.2 68C54.5 67.9 55.8 68.4 56.8 67.6C61.8 63.4 65 55.8 65 46Z" fill={shade} />
      <path d="M50 49.6V70.2" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1.4" strokeLinecap="round" />
    </>
  )
}

const FEMALE_ART: Record<string, React.ReactNode> = {
  "f-1": (
    <Woman skin={SKIN.warm} cloth="#d4762f" shade="#a8571d" edge="#e08c48" capEdge="#a8571d" garment="#1f5f6b" collar="#2d7e8e" drape="#c76c28" />
  ),
  "f-2": (
    <Woman skin={SKIN.light} cloth="#7fbde2" shade="#5896bd" edge="#9dd0ee" capEdge="#5f9dc4" garment="#5a3d6b" collar="#77518c" placket="#e6d6f2" drape="#6fadd2" />
  ),
  "f-3": (
    <Woman
      skin={SKIN.tan}
      cloth="#262a34"
      shade="#171a22"
      edge="#3a4050"
      capEdge="#171a22"
      garment="#101319"
      collar="#1c212b"
      long
      extra={
        <>
          <path d="M27.6 84.6C36 86.4 44 87 50 87C56 87 64 86.4 72.4 84.6" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeDasharray="3.4 3" strokeLinecap="round" />
          <path d="M33.4 40.6C33.6 30.4 40 23.2 50 23.2C60 23.2 66.4 30.4 66.6 40.6" fill="none" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" />
        </>
      }
    />
  ),
  "f-4": (
    // Turban: bands wrapped at angles, with a knot, and a braid over one shoulder.
    <>
      <circle cx="50" cy="50" r="50" fill={FIELD} />
      <Body garment="#3f7fb3" collar="#61a0d0" />
      <path d="M64.6 50C71.4 55 75 63.6 75.2 75.4C75.3 80.6 74.7 85.8 73.4 91L64 88.8C65.2 84 65.8 79.4 65.7 75.2C65.5 65.4 63 58 58.6 54.2Z" fill="#2a1c0c" />
      {[0, 1, 2, 3].map((i) => (
        <ellipse
          key={i}
          cx={67 + i * 0.9}
          cy={58 + i * 8.4}
          rx="5.4"
          ry="3.8"
          fill="#3d2a12"
          transform={`rotate(${-24 + i * 5} ${67 + i * 0.9} ${58 + i * 8.4})`}
        />
      ))}
      <Neck skin={SKIN.warm} />
      <Head skin={SKIN.warm} />
      <path
        d="M31.2 40C31.2 25.4 39.6 15 50 15C60.4 15 68.8 25.4 68.8 40C68.8 43.6 65.8 45.2 62.2 43.6C58.2 41.8 54.2 40.8 50 40.8C45.8 40.8 41.8 41.8 37.8 43.6C34.2 45.2 31.2 43.6 31.2 40Z"
        fill="#2f9e8f"
      />
      <path d="M31.2 40C31.2 25.4 39.6 15 50 15V19C42.6 19 36 27.6 36 40C36 41 36.2 41.8 36.6 42.4C33.4 43.8 31.2 42.6 31.2 40Z" fill={LIT} />
      <path d="M68.8 40C68.8 25.4 60.4 15 50 15V19C57.4 19 64 27.6 64 40C64 41 63.8 41.8 63.4 42.4C66.6 43.8 68.8 42.6 68.8 40Z" fill={SHADE} />
      <path d="M31.4 37.6C36.6 26 56.4 19.4 68.2 27.2" fill="none" stroke="#54c4b4" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M33 29.6C39.4 21 57.8 16.6 67.4 23.4" fill="none" stroke="#1f7a6e" strokeWidth="3" strokeLinecap="round" />
      <path d="M36.6 22.6C42.4 17.4 57.6 16.2 63.6 19.6" fill="none" stroke="#54c4b4" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="32.6" cy="36" rx="4.4" ry="3.4" fill="#28897b" transform="rotate(-28 32.6 36)" />
    </>
  ),
  "f-5": (
    <Woman skin={SKIN.light} cloth="#9ed6bd" shade="#71b395" edge="#b6e4cf" capEdge="#71b395" garment="#efe6d2" collar="#dccbaa" placket="#b7a481" drape="#8ecbb0" />
  ),
  "f-6": (
    <>
      <circle cx="50" cy="50" r="50" fill={FIELD} />
      <Body garment="#87aec8" collar="#9cc0d6" />
      <Neck skin={SKIN.warm} />
      <path d={HEAD_D} fill={SKIN.warm} />
      <Scarf cloth="#b3d3e8" shade="#87aec8" edge="#cae2f0" long />
      <Niqab cloth="#b3d3e8" shade="#87aec8" />
    </>
  ),
  "f-7": (
    <>
      <circle cx="50" cy="50" r="50" fill={FIELD} />
      <Body garment="#123e31" collar="#1a5240" />
      <Neck skin={SKIN.deep} />
      <path d={HEAD_D} fill={SKIN.deep} />
      <Scarf cloth="#1f5f4a" shade="#123e31" edge="#2b7c62" long />
      <Niqab cloth="#1f5f4a" shade="#123e31" />
    </>
  ),
  "f-8": (
    <Woman skin={SKIN.rich} cloth="#f0e4cb" shade="#c9b48f" edge="#fff6e4" capEdge="#c9b48f" garment="#a32338" collar="#bd3049" placket="#f0cd6d" drape="#e5d7ba" />
  ),
}

/* ------------------------------------------------------------------ male -- */

/** Each beard carries a lit top edge so it is not one flat mass. */
const BEARDS = {
  stubble: {
    d: "M35 44C35 51.2 36.8 57 40 61.2C43 65 46.4 67 50 67C53.6 67 57 65 60 61.2C63.2 57 65 51.2 65 44C64 49.4 58.6 53 50 53C41.4 53 36 49.4 35 44Z",
    lit: "M36.4 48.4C39 51.6 44 53.4 50 53.4",
  },
  short: {
    d: "M34.5 43C34.5 52.6 36.3 60 39.7 65.2C42.9 70 46.5 72.4 50 72.4C53.5 72.4 57.1 70 60.3 65.2C63.7 60 65.5 52.6 65.5 43C64.3 49.6 58.9 53.6 50 53.6C41.1 53.6 35.7 49.6 34.5 43Z",
    lit: "M36 48.2C38.9 52 44 54 50 54",
  },
  full: {
    d: "M34 42C34 55.6 35.8 66 39.4 73.4C42.6 80 46.4 83.4 50 83.4C53.6 83.4 57.4 80 60.6 73.4C64.2 66 66 55.6 66 42C64.6 49.6 59.2 54.2 50 54.2C40.8 54.2 35.4 49.6 34 42Z",
    lit: "M35.6 47.6C38.6 52 44 54.6 50 54.6",
  },
  long: {
    d: "M34 42C34 58 35.6 70 39 78.6C41.6 85.4 45.4 89.6 50 89.6C54.6 89.6 58.4 85.4 61 78.6C64.4 70 66 58 66 42C64.6 50 59.2 54.8 50 54.8C40.8 54.8 35.4 50 34 42Z",
    lit: "M35.6 47.6C38.6 52.4 44 55.2 50 55.2",
  },
} as const

function Beard({ color, length, edge = "rgba(255,255,255,0.14)" }: { color: string; length: keyof typeof BEARDS; edge?: string }) {
  const { d, lit } = BEARDS[length]
  return (
    <>
      <path d={d} fill={color} />
      <path d={lit} fill="none" stroke={edge} strokeWidth="1.8" strokeLinecap="round" />
    </>
  )
}

function Cap({ fill, band }: { fill: string; band: string }) {
  return (
    <>
      <path d="M32.2 31C32.2 20.4 40.2 13 50 13C59.8 13 67.8 20.4 67.8 31C61.4 28.6 38.6 28.6 32.2 31Z" fill={fill} />
      <path d="M32.2 31C32.2 20.4 40.2 13 50 13V16.8C42.6 16.8 37 22.6 36.6 30.4Z" fill={LIT} />
      <path d="M67.8 31C67.8 20.4 59.8 13 50 13V16.8C57.4 16.8 63 22.6 63.4 30.4Z" fill={SHADE} />
      <path d="M31 29.4C37.6 26.8 62.4 26.8 69 29.4C69 33.4 69 34.6 69 36C62.4 38.6 37.6 38.6 31 36Z" fill={band} />
      <path d="M31 34C37.6 36.6 62.4 36.6 69 34C69 35 69 35.4 69 36C62.4 38.6 37.6 38.6 31 36Z" fill={SHADE} />
    </>
  )
}

function Man({
  skin,
  garment,
  collar,
  placket,
  beard,
  beardColor = "#241a08",
  beardEdge,
  headwear,
  ears = true,
}: {
  skin: string
  garment: string
  collar?: string
  placket?: string
  beard?: keyof typeof BEARDS
  beardColor?: string
  beardEdge?: string
  headwear?: React.ReactNode
  ears?: boolean
}) {
  return (
    <>
      <circle cx="50" cy="50" r="50" fill={FIELD} />
      <Body garment={garment} collar={collar} placket={placket} />
      <Neck skin={skin} />
      <Head skin={skin} ears={ears} />
      {beard && <Beard color={beardColor} length={beard} edge={beardEdge} />}
      {headwear}
    </>
  )
}

/** Cropped hair with a fade, rather than a black blob. */
function Hair({ dark, fade }: { dark: string; fade: string }) {
  return (
    <>
      <path
        d="M33.4 41.6C33.4 29.6 40.8 21.2 50 21.2C59.2 21.2 66.6 29.6 66.6 41.6C66.6 34.6 59.2 31.4 50 31.4C40.8 31.4 33.4 34.6 33.4 41.6Z"
        fill={dark}
      />
      <path d="M33.4 41.6C33.4 37.8 35.2 35.2 38.2 33.5C37.4 36 37 39 37 42.4C34.8 43.6 33.4 43.4 33.4 41.6Z" fill={fade} />
      <path d="M66.6 41.6C66.6 37.8 64.8 35.2 61.8 33.5C62.6 36 63 39 63 42.4C65.2 43.6 66.6 43.4 66.6 41.6Z" fill={fade} />
      <path d="M33.4 41.6C33.4 29.6 40.8 21.2 50 21.2V24.8C43.2 24.8 37.6 31 37.2 39.6Z" fill="rgba(255,255,255,0.09)" />
    </>
  )
}

const MALE_ART: Record<string, React.ReactNode> = {
  "m-1": <Man skin={SKIN.warm} garment="#2f4a7a" collar="#4d6a9e" placket="#7d94bd" headwear={<Hair dark="#241a08" fade="#4a3a20" />} />,
  "m-2": <Man skin={SKIN.deep} garment="#1f6b52" collar="#2f8e6f" beard="stubble" headwear={<Cap fill="#2f9e8f" band="#7fd8c8" />} />,
  "m-3": <Man skin={SKIN.tan} garment="#c9b48b" collar="#e0d0af" placket="#8a7449" beard="full" headwear={<Cap fill="#e0b12f" band="#ffe9ad" />} />,
  "m-4": (
    <Man
      skin={SKIN.deep}
      garment="#4a3562"
      collar="#66497f"
      beard="long"
      beardColor="#e9e9e9"
      beardEdge="rgba(0,0,0,0.14)"
      ears={false}
      headwear={
        <>
          {/* Imamah: a wound turban with a tail down the back. */}
          <path d="M69.6 34.6C74.6 40.2 75.8 48.4 72.6 55.6L67.4 52.4C69.4 47.6 68.8 42.2 65.8 37.8Z" fill="#f2e2c2" />
          <path d="M28.4 32.4C28.4 19.8 38 11 50 11C62 11 71.6 19.8 71.6 32.4C64 28.4 36 28.4 28.4 32.4Z" fill="#f2e2c2" />
          <path d="M26.6 30.6C34.6 24.6 65.4 24.6 73.4 30.6C75.4 32.2 75.4 35.6 73.4 36.8C65.4 41.4 34.6 41.4 26.6 36.8C24.6 35.6 24.6 32.2 26.6 30.6Z" fill="#ffffff" />
          <path d="M26.6 30.6C34.6 24.6 65.4 24.6 73.4 30.6L71.6 32.8C64.4 27.8 35.6 27.8 28.4 32.8Z" fill="rgba(0,0,0,0.06)" />
          <path d="M27 34.4C35 38.6 65 38.6 73 34.4" fill="none" stroke="#ddd2ba" strokeWidth="1.3" />
          <path d="M26.6 36.8C34.6 41.4 65.4 41.4 73.4 36.8C73.4 38.4 73.4 38.8 73.4 39.6C65.4 44.2 34.6 44.2 26.6 39.6Z" fill="rgba(0,0,0,0.1)" />
        </>
      }
    />
  ),
  "m-5": (
    <>
      <circle cx="50" cy="50" r="50" fill={FIELD} />
      <Body garment="#e8dcc2" collar="#ffffff" />
      {/* Ghutra: falls behind the shoulders, framing rather than swallowing the face. */}
      <path d="M27 34C27 55 30 68 32.4 80.4C39 82.4 61 82.4 67.6 80.4C70 68 73 55 73 34Z" fill="#f2ede0" />
      <path d="M27 34C27 55 30 68 32.4 80.4C35 81.2 38.4 81.7 42 82C39.4 69 37 55.4 37 34Z" fill="#ffffff" />
      <path d="M73 34C73 55 70 68 67.6 80.4C65 81.2 61.6 81.7 58 82C60.6 69 63 55.4 63 34Z" fill="rgba(0,0,0,0.07)" />
      <Neck skin={SKIN.light} />
      <path d={HEAD_D} fill={SKIN.light} />
      <Beard color="#241a08" length="short" />
      <path d="M28.6 32.6C28.6 20.4 38 12 50 12C62 12 71.4 20.4 71.4 32.6C62 28.6 38 28.6 28.6 32.6Z" fill="#ffffff" />
      <path d="M28.6 32.6C28.6 20.4 38 12 50 12V15.8C41 15.8 33.6 22.6 33 31.6Z" fill="rgba(0,0,0,0.05)" />
      {/* The agal: two black cords. */}
      <path d="M28.4 26.8C36 21.2 64 21.2 71.6 26.8" fill="none" stroke="#1b2540" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M28.8 33.4C36.4 28 63.6 28 71.2 33.4" fill="none" stroke="#1b2540" strokeWidth="3" strokeLinecap="round" />
      <path d="M28.6 30.2C36.2 25 63.8 25 71.4 30.2" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1" strokeLinecap="round" />
    </>
  ),
  "m-6": (
    <Man
      skin={SKIN.rich}
      garment="#243b52"
      collar="#35566f"
      placket="#6f8497"
      beard="stubble"
      headwear={
        <>
          <path d="M37 30.4C37 30.4 38.6 12.8 38.6 12.8C43.4 11.4 56.6 11.4 61.4 12.8C61.4 12.8 63 30.4 63 30.4C57.4 32 42.6 32 37 30.4Z" fill="#9b2335" />
          <path d="M37 30.4C37 30.4 38.6 12.8 38.6 12.8C40.4 12.3 43.4 11.9 46.4 11.7C45.2 18.4 44.6 25 44.8 31.4C41.6 31.2 38.8 30.9 37 30.4Z" fill="rgba(255,255,255,0.13)" />
          <path d="M36.2 28.6C42.4 26.8 57.6 26.8 63.8 28.6C63.8 31.4 63.8 32.4 63.8 33.8C57.6 35.6 42.4 35.6 36.2 33.8Z" fill="#6d1524" />
          <path d="M50 11.6V6.6" stroke="#2a1108" strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="6" r="1.8" fill="#2a1108" />
        </>
      }
    />
  ),
  "m-7": <Man skin={SKIN.tan} garment="#2c3038" collar="#4a515c" placket="#8a939f" beard="short" headwear={<Hair dark="#2a1c0c" fade="#4d3a1d" />} />,
  "m-8": (
    <Man
      skin={SKIN.deep}
      garment="#2a3760"
      collar="#40528a"
      beard="stubble"
      ears={false}
      headwear={
        <>
          {/* Hood: a wide opening around the face, and the shoulders it sits on. */}
          <path d="M12 100C13.6 82.6 21.4 71.4 30.4 67.6L38 78.6H62L69.6 67.6C78.6 71.4 86.4 82.6 88 100Z" fill="#5d6fb4" />
          <path d="M12 100C13.6 82.6 21.4 71.4 30.4 67.6L32.8 71.2C25 75.6 18.6 85.4 16.8 100Z" fill="rgba(255,255,255,0.1)" />
          <path
            d="M22.6 48.4C22.6 29.4 34.8 15 50 15C65.2 15 77.4 29.4 77.4 48.4C77.4 55.4 76 62 73.4 67.4L65.6 63.8C67.4 59.4 68.4 54.2 68.4 48.4C68.4 34.6 60.2 24.4 50 24.4C39.8 24.4 31.6 34.6 31.6 48.4C31.6 54.2 32.6 59.4 34.4 63.8L26.6 67.4C24 62 22.6 55.4 22.6 48.4Z"
            fill="#5d6fb4"
          />
          <path d="M22.6 48.4C22.6 29.4 34.8 15 50 15V20.6C37.4 20.6 27.6 32.6 27.4 48.4C27.4 53.2 28 57.6 29.2 61.4L26.6 67.4C24 62 22.6 55.4 22.6 48.4Z" fill="rgba(255,255,255,0.1)" />
          <path d="M77.4 48.4C77.4 29.4 65.2 15 50 15V20.6C62.6 20.6 72.4 32.6 72.6 48.4C72.6 53.2 72 57.6 70.8 61.4L73.4 67.4C76 62 77.4 55.4 77.4 48.4Z" fill="rgba(0,0,0,0.12)" />
        </>
      }
    />
  ),
}

/* The Arabic alphabet, in order, as the labels. */
export const AVATARS: AvatarDefinition[] = [
  { id: "f-1", gender: "female", letter: "ا", letterName: "Alif", style: "Rust scarf, teal dress" },
  { id: "f-2", gender: "female", letter: "ب", letterName: "Ba", style: "Powder blue scarf" },
  { id: "f-3", gender: "female", letter: "ت", letterName: "Ta", style: "Black khimar, gold trim" },
  { id: "f-4", gender: "female", letter: "ث", letterName: "Tha", style: "Teal turban and braid" },
  { id: "f-5", gender: "female", letter: "ج", letterName: "Jim", style: "Mint scarf" },
  { id: "f-6", gender: "female", letter: "ح", letterName: "Ha", style: "Powder blue niqab" },
  { id: "f-7", gender: "female", letter: "خ", letterName: "Kha", style: "Deep green niqab" },
  { id: "f-8", gender: "female", letter: "د", letterName: "Dal", style: "Cream scarf, crimson dress" },
  { id: "m-1", gender: "male", letter: "ذ", letterName: "Dhal", style: "Fade and bomber" },
  { id: "m-2", gender: "male", letter: "ر", letterName: "Ra", style: "Kufi cap" },
  { id: "m-3", gender: "male", letter: "ز", letterName: "Zay", style: "Taqiyah and thobe" },
  { id: "m-4", gender: "male", letter: "س", letterName: "Sin", style: "Imamah, elder" },
  { id: "m-5", gender: "male", letter: "ش", letterName: "Shin", style: "Ghutra and agal" },
  { id: "m-6", gender: "male", letter: "ص", letterName: "Sad", style: "Tarboosh" },
  { id: "m-7", gender: "male", letter: "ض", letterName: "Dad", style: "Jacket and collar" },
  { id: "m-8", gender: "male", letter: "ط", letterName: "Ta", style: "Hood up" },
]

const ART: Record<string, React.ReactNode> = { ...FEMALE_ART, ...MALE_ART }

export function isKnownAvatar(id: string | null | undefined): boolean {
  return Boolean(id && id in ART)
}

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
