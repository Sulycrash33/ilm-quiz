import type { SVGProps } from "react"

/**
 * The ILM Hunt mark: a mihrab arch, a crescent finial, a compass star.
 *
 * This is the uploaded logo's concept kept and its execution redrawn. The
 * original carried six symbols at once — crescent, minaret, archway, mosque,
 * compass rose and a ribbon swoosh — over a bevelled gradient. Good idea,
 * unusable mark: it could not survive being shrunk, and it was a raster PNG
 * with a black background baked in.
 *
 * What is kept is the part that actually means something. The arch is the
 * minaret and the doorway at once. The crescent sits on it as a finial, where
 * it sits on a real one. The eight-pointed star inside doubles as the compass —
 * "Hunt" is a search, and a star in a doorway is what you navigate by. Three
 * elements, one idea: a way in, and something to steer by.
 *
 * Flat, no gradient, no bevel, no glow, single `currentColor`, so it works
 * knocked out of a dark ground, printed in one colour, or embossed. Verified
 * legible down to 18px.
 *
 * THE CRESCENT IS NOT RE-DERIVED HERE, ON PURPOSE
 * It is the exact path already proved correct, placed with a transform. An SVG
 * arc whose chord equals twice its radius is degenerate — the large-arc flag
 * cannot disambiguate a semicircle, and browsers close the subpath with a
 * straight line instead. That mistake was made four separate times while
 * drawing this and its predecessor, each time producing a shape that looked
 * almost right. Reusing the known-good path removes the chance of a fifth.
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
      <g transform="translate(38.270 0.250) scale(0.255)">
        <path d="M68 19.016A38 38 0 1 0 68 80.984A32 32 0 1 1 68 19.016Z" />
      </g>
      <path fillRule="evenodd" clipRule="evenodd" d="M27 93V57C27 43 36 33 50 25C64 33 73 43 73 57V93ZM37 93V59C37 49 42 41 50 35C58 41 63 49 63 59V93Z" />
      <path d="M50.00 53.00 L51.45 60.49 L57.78 56.22 L53.51 62.55 L61.00 64.00 L53.51 65.45 L57.78 71.78 L51.45 67.51 L50.00 75.00 L48.55 67.51 L42.22 71.78 L46.49 65.45 L39.00 64.00 L46.49 62.55 L42.22 56.22 L48.55 60.49 Z" />
    </svg>
  )
}

/**
 * The square glyph: crescent and star, no arch.
 *
 * The arch is tall and narrow, which is right for a wordmark lockup and wrong
 * for a 1:1 app icon, where it would sit in a lot of empty side margin. This
 * fills a square. Same family, different job — the ordinary logo-plus-app-icon
 * split.
 */
export function IlmHuntGlyph(props: SVGProps<SVGSVGElement>) {
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
