import type { SVGProps } from "react"

/**
 * The avatar set.
 *
 * WHY THESE REPLACED WHAT WAS HERE
 * The old avatars were URLs pointing at avatar.iran.liara.run, a third-party
 * generator. That service stopped answering, which is why the picker rendered a
 * grid of fallback letters. Beyond being broken it was also a privacy leak — an
 * external host learning the IP of every user who reached onboarding — and the
 * pictures it returned were generic cartoons with no connection to the app.
 * These are drawn in-repo: no network request, no third party, crisp at any
 * size, and they inherit the gold palette.
 *
 * WHY THEY HAVE NO FACES
 * Deliberate, and worth stating plainly. Views among Muslims differ on
 * depicting animate beings, and facial features are where most of the
 * disagreement sits. Faceless avatars work for everyone: someone who avoids
 * such images is not asked to pick one, and nobody else loses anything, because
 * all the character here lives in the dress rather than the face. It is also
 * simply better design — no eyes to look slightly wrong at 40px.
 *
 * The range runs deliberately wide in both directions, from contemporary to
 * fully covered, because a Nigerian teenager and a Gulf grandmother should both
 * find themselves in the same grid without either being the odd one out.
 */

export type AvatarGender = "female" | "male"

export interface AvatarDefinition {
  id: string
  gender: AvatarGender
  /** Shown to screen readers and as the tile's title. */
  label: string
}

/* Palette. Skin tones span a real range on purpose — this app is Hausa-first
   and reaches Malaysia and Indonesia, so a single default tone would be wrong
   for most of the people using it. */
const SKIN = ["#e8c9a8", "#d2a479", "#a9714a", "#7c4b2a", "#5c3620"]
const BG = "#1b2540"

function Base({ skin, children }: { skin: string; children: React.ReactNode }) {
  return (
    <>
      <circle cx="50" cy="50" r="50" fill={BG} />
      {/* neck */}
      <path d="M42 62h16v12H42z" fill={skin} />
      {children}
    </>
  )
}

/* ---------------------------------------------------------------- female -- */

function HijabBase({
  skin,
  cloth,
  trim,
  shoulder,
}: {
  skin: string
  cloth: string
  trim: string
  shoulder: string
}) {
  return (
    <Base skin={skin}>
      {/* shoulders / garment */}
      <path d="M18 100c0-16 14-26 32-26s32 10 32 26z" fill={shoulder} />
      {/* headscarf outer */}
      <path d="M50 14c-16 0-26 12-26 28 0 12 4 20 8 26 3 5 4 10 4 14h28c0-4 1-9 4-14 4-6 8-14 8-26 0-16-10-28-26-28z" fill={cloth} />
      {/* face opening */}
      <ellipse cx="50" cy="44" rx="15" ry="18" fill={skin} />
      {/* trim along the opening */}
      <path d="M35 44a15 18 0 0 1 30 0" fill="none" stroke={trim} strokeWidth="2.5" />
    </Base>
  )
}

const FEMALE_ART: Record<string, React.ReactNode> = {
  "f-1": (
    // Contemporary wrapped scarf.
    <HijabBase skin={SKIN[1]} cloth="#c8a227" trim="#ffe9ad" shoulder="#8a6b1c" />
  ),
  "f-2": (
    // Scarf over a visible underscarf cap.
    <>
      <HijabBase skin={SKIN[0]} cloth="#7fd4b0" trim="#1f5a44" shoulder="#1f5a44" />
      <path d="M36 34a14 14 0 0 1 28 0z" fill="#b8f2d8" />
    </>
  ),
  "f-3": (
    // Turban-style wrap.
    <>
      <Base skin={SKIN[2]}>
        <path d="M16 100c0-19 15-30 34-30s34 11 34 30z" fill="#5a4a2c" />
        <path d="M38 68h24v8H38z" fill="#dcc9a4" />
        <ellipse cx="50" cy="46" rx="17" ry="19" fill={SKIN[2]} />
        <path d="M31 38c0-12 8-22 19-22s19 10 19 22c0 4-3 5-6 3-5-3-9-4-13-4s-8 1-13 4c-3 2-6 1-6-3z" fill="#dcc9a4" />
        <path d="M33 30c6-4 28-4 34 0" fill="none" stroke="#f6e6c4" strokeWidth="2.5" />
      </Base>
    </>
  ),
  "f-4": (
    // Khimar: cape-length covering over the shoulders.
    <>
      <Base skin={SKIN[3]}>
        <path d="M50 14c-17 0-28 13-28 30 0 20 6 34 8 56h40c2-22 8-36 8-56 0-17-11-30-28-30z" fill="#2f3f6b" />
        <ellipse cx="50" cy="46" rx="14" ry="17" fill={SKIN[3]} />
        <path d="M36 46a14 17 0 0 1 28 0" fill="none" stroke="#8fa6e0" strokeWidth="2.5" />
      </Base>
    </>
  ),
  "f-5": (
    // Abaya and shayla with a patterned edge.
    <>
      <HijabBase skin={SKIN[4]} cloth="#3a2c4f" trim="#c8a227" shoulder="#2a1f3a" />
      <path d="M30 74h40" stroke="#c8a227" strokeWidth="2" strokeDasharray="3 3" />
    </>
  ),
  "f-6": (
    // Niqab: face veil, eye band open.
    <>
      <Base skin={SKIN[1]}>
        <path d="M18 100c0-16 14-26 32-26s32 10 32 26z" fill="#23324f" />
        <path d="M50 14c-16 0-26 12-26 28 0 12 4 20 8 26 3 5 4 10 4 14h28c0-4 1-9 4-14 4-6 8-14 8-26 0-16-10-28-26-28z" fill="#2c3d5e" />
        {/* eye band */}
        <rect x="36" y="40" width="28" height="8" rx="4" fill={SKIN[1]} />
        <path d="M34 40a16 16 0 0 1 32 0" fill="none" stroke="#4a628f" strokeWidth="2" />
      </Base>
    </>
  ),
  "f-7": (
    // Full covering with a woven grille.
    <>
      <Base skin={SKIN[2]}>
        <path d="M50 12c-18 0-29 14-29 32 0 22 5 34 6 56h46c1-22 6-34 6-56 0-18-11-32-29-32z" fill="#4a5d3f" />
        <rect x="39" y="34" width="22" height="16" rx="3" fill="#38492f" />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="39" y1={37 + i * 4} x2="61" y2={37 + i * 4} stroke="#6e8560" strokeWidth="1" />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={41 + i * 4.5} y1="34" x2={41 + i * 4.5} y2="50" stroke="#6e8560" strokeWidth="1" />
        ))}
      </Base>
    </>
  ),
  "f-8": (
    // Scholar: scarf with a book-ribbon collar.
    <>
      <HijabBase skin={SKIN[0]} cloth="#8a1f3d" trim="#f0cd6d" shoulder="#5c1428" />
      <path d="M42 76v18M58 76v18" stroke="#f0cd6d" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
}

/* ------------------------------------------------------------------ male -- */

function MaleBase({
  skin,
  shoulder,
  children,
}: {
  skin: string
  shoulder: string
  children?: React.ReactNode
}) {
  return (
    <Base skin={skin}>
      <path d="M18 100c0-16 14-26 32-26s32 10 32 26z" fill={shoulder} />
      <ellipse cx="50" cy="44" rx="17" ry="19" fill={skin} />
      {/* ears */}
      <circle cx="32" cy="46" r="3.5" fill={skin} />
      <circle cx="68" cy="46" r="3.5" fill={skin} />
      {children}
    </Base>
  )
}

/** A beard as a chin-hugging shape; `length` pushes it further down the chest. */
function Beard({ color, length }: { color: string; length: number }) {
  return (
    <path
      d={`M33 44c0 12 6 ${18 + length} 17 ${18 + length}s17-${6 + length / 2} 17-${18 + length} c0 0-4 12-17 12s-17-12-17-12z`}
      fill={color}
    />
  )
}

const MALE_ART: Record<string, React.ReactNode> = {
  "m-1": (
    // Young, clean-shaven, short hair.
    <MaleBase skin={SKIN[1]} shoulder="#2f3f6b">
      <path d="M33 40c0-11 8-18 17-18s17 7 17 18c0-6-8-8-17-8s-17 2-17 8z" fill="#241a05" />
    </MaleBase>
  ),
  "m-2": (
    // Kufi cap, light stubble.
    <MaleBase skin={SKIN[0]} shoulder="#1f5a44">
      <Beard color="#3a2f16" length={0} />
      <path d="M31 32h38v-2c0-8-9-13-19-13s-19 5-19 13z" fill="#7fd4b0" />
      <rect x="30" y="30" width="40" height="5" rx="2.5" fill="#b8f2d8" />
    </MaleBase>
  ),
  "m-3": (
    // Taqiyah and a full beard.
    <MaleBase skin={SKIN[2]} shoulder="#5a4a2c" >
      <Beard color="#241a05" length={6} />
      <path d="M31 31h38c0-9-9-15-19-15s-19 6-19 15z" fill="#f0cd6d" />
      <rect x="30" y="29" width="40" height="5" rx="2.5" fill="#ffe9ad" />
    </MaleBase>
  ),
  "m-4": (
    // Imamah over a cap, long beard — the sheikh.
    <MaleBase skin={SKIN[3]} shoulder="#3a2c4f">
      <Beard color="#e8e8e8" length={10} />
      <path d="M28 32c0-12 10-20 22-20s22 8 22 20z" fill="#f6e6c4" />
      <path d="M27 30c8-5 38-5 46 0 2 1 2 5 0 6-8 4-38 4-46 0-2-1-2-5 0-6z" fill="#ffffff" />
      <path d="M27 33c8-4 38-4 46 0" fill="none" stroke="#dcc9a4" strokeWidth="1.5" />
      <path d="M70 34c4 4 5 10 3 15" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
    </MaleBase>
  ),
  "m-5": (
    // Ghutra with agal.
    <MaleBase skin={SKIN[0]} shoulder="#8a6b1c">
      <Beard color="#241a05" length={3} />
      <path d="M26 34c0-13 11-22 24-22s24 9 24 22c0 18-4 28-6 40H32c-2-12-6-22-6-40z" fill="#ffffff" />
      <ellipse cx="50" cy="46" rx="15" ry="17" fill={SKIN[0]} />
      <path d="M28 28c8-5 36-5 44 0" fill="none" stroke="#1b2540" strokeWidth="4" />
      <path d="M28 34c8-5 36-5 44 0" fill="none" stroke="#1b2540" strokeWidth="3" />
    </MaleBase>
  ),
  "m-6": (
    // Tarboosh.
    <MaleBase skin={SKIN[4]} shoulder="#23324f">
      <Beard color="#1a1208" length={2} />
      <path d="M36 30h28l-2-16H38z" fill="#8a1f3d" />
      <rect x="34" y="28" width="32" height="5" rx="2" fill="#5c1428" />
      <path d="M50 14v-4" stroke="#1a1208" strokeWidth="2" />
    </MaleBase>
  ),
  "m-7": (
    // Thobe with a shoulder shawl and a long beard.
    <MaleBase skin={SKIN[2]} shoulder="#dcc9a4">
      <Beard color="#3a2f16" length={9} />
      <path d="M32 32h36c0-9-8-15-18-15s-18 6-18 15z" fill="#5a4a2c" />
      <path d="M22 84c8-6 18-8 28-8s20 2 28 8" fill="none" stroke="#8a6b1c" strokeWidth="4" />
    </MaleBase>
  ),
  "m-8": (
    // Modern, hooded, short beard.
    <MaleBase skin={SKIN[3]} shoulder="#2a3550">
      <Beard color="#1a1208" length={1} />
      <path d="M24 44c0-16 12-28 26-28s26 12 26 28c0-8-2-12-4-14-6 4-38 4-44 0-2 2-4 6-4 14z" fill="#39466b" />
      <path d="M20 100c2-14 10-22 16-25l6 6h16l6-6c6 3 14 11 16 25z" fill="#39466b" />
    </MaleBase>
  ),
}

export const AVATARS: AvatarDefinition[] = [
  { id: "f-1", gender: "female", label: "Wrapped hijab" },
  { id: "f-2", gender: "female", label: "Hijab with underscarf" },
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
 * Renders one avatar. An unknown id — including the old stored URLs from the
 * previous third-party set — falls back to the brand mark rather than an empty
 * circle, so existing profiles degrade to something deliberate.
 */
export function AvatarArt({
  id,
  ...props
}: { id: string } & SVGProps<SVGSVGElement>) {
  const art = ART[id]

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      {art ?? (
        <>
          <circle cx="50" cy="50" r="50" fill={BG} />
          <path d="M68 19.016A38 38 0 1 0 68 80.984A32 32 0 1 1 68 19.016Z" fill="#f0cd6d" opacity="0.5" transform="scale(0.62) translate(31 31)" />
        </>
      )}
    </svg>
  )
}
