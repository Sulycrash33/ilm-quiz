import type { SVGProps } from "react"

/**
 * The ILM Hunt mark: a crescent with an eight-pointed star in its opening.
 *
 * Built to one rule — it has to survive being small. This is the app icon, the
 * favicon, the splash mark and the auth-page mark, and the smallest of those is
 * 16px. So: two shapes, no gradient, no bevel, no glow, no inner detail, and a
 * single `currentColor` so it inherits whatever it sits on and still reads in a
 * monochrome context. Checked by rendering it at 160, 64, 32, 24 and 16px.
 *
 * HOW THE CRESCENT IS CONSTRUCTED, AND THE TWO WAYS THAT DO NOT WORK
 *
 * The shape is the region inside a circle at (46,50) r38 but outside one at
 * (60,50) r32. Two obvious encodings of that are both wrong:
 *
 *   Two circles in one path with `fill-rule: evenodd`. The cutting circle has
 *   to extend past the outer one to make horns at all, and evenodd then fills
 *   that overhang too — you get a ring, not a crescent.
 *
 *   A `<mask>`. Geometrically right, but it needs an id, and ids in SVG are
 *   document-global, so two of these on one page collide. `useId` fixes that
 *   at the cost of making a static picture a client component.
 *
 * What is used instead is the crescent's actual outline: the major arc of the
 * outer circle from one horn to the other, then the major arc of the cutting
 * circle back. The horns are where the two circles intersect, at x=68,
 * y=50±√960 — computed rather than eyeballed. One path, no id, no hooks, safe
 * in a server component.
 *
 * (Arcs are safe here because the chord between the horns is ~62, comfortably
 * short of either diameter. An arc whose chord equals the diameter is
 * degenerate — the large-arc flag cannot disambiguate a semicircle and browsers
 * close the subpath with a straight line, which is its own way of getting a
 * flat edge across the crescent.)
 */
export function IlmHuntMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ILM Hunt"
      {...props}
    >
      <path d="M68 19.016A38 38 0 1 0 68 80.984A32 32 0 1 1 68 19.016Z" />
      <path d="M66.00 38.00 L67.84 45.57 L74.49 41.51 L70.43 48.16 L78.00 50.00 L70.43 51.84 L74.49 58.49 L67.84 54.43 L66.00 62.00 L64.16 54.43 L57.51 58.49 L61.57 51.84 L54.00 50.00 L61.57 48.16 L57.51 41.51 L64.16 45.57 Z" />
    </svg>
  )
}
