import { NAMES_OF_ALLAH } from "@/data/names-of-allah"

/**
 * The ninety-nine names, drifting across the whole page.
 *
 * The first version was a single centred column, which left most of the screen
 * empty. This fills the width: several columns side by side, each carrying the
 * complete list, each offset to a different starting name and drifting at a
 * different speed so the eye never catches a repeating row across the page.
 *
 * Column count is driven by CSS columns rather than a media query in
 * JavaScript, so it adapts from a 320px phone to a desktop without this
 * component knowing anything about viewport size — and without becoming a
 * client component.
 *
 * THREE RULES, because of what the text is
 *
 * 1. A name is never clipped and never split. Every entry sits in its own
 *    centred row with `whitespace-nowrap`, and the columns are wide enough for
 *    the longest of them (Dhul-Jalāli wal-Ikrām). If a name cannot be rendered
 *    whole it is not rendered.
 * 2. Each column runs the list in order, first to last. Columns start at
 *    different points so the page is not uniform, but no column shuffles.
 * 3. `prefers-reduced-motion` stops the drift and leaves the names in place —
 *    never the other way round.
 *
 * Each column holds the list twice and translates by exactly -50%, which is
 * what makes the loop seamless: when the first copy has scrolled fully out, the
 * second sits precisely where the first began.
 *
 * `self-start` is load-bearing, and its absence was a real bug. The columns sit
 * in a flex row, so they were being stretched to the height of the viewport —
 * 844px on a phone — while their content was 17,105px. `-50%` resolves against
 * the element's own height, so the loop was translating by half a *viewport*,
 * 422px, and snapping back. Two things followed. The seam the comment above
 * claims does not exist was plainly visible as a jump every few minutes, and
 * each column only ever showed the first handful of names in its rotation, so
 * most of the ninety-nine were rendered into the page and never once seen.
 *
 * `self-start` opts out of the stretch and lets the height come from the
 * content, which is what `-50%` was always assuming. Because every row is
 * `whitespace-nowrap` at a fixed size, that height does not depend on viewport
 * width, so the translation stays exactly one copy at every breakpoint.
 */

/**
 * How visible the names are.
 *
 * These are the dial. They were 0.10 and 0.07, which on a dark background
 * read as almost nothing — the names were there but you had to look for
 * them. Roughly doubled so they register the way a patterned wallpaper does:
 * present, clearly the ninety-nine names, and still well under the contrast
 * where they would compete with the text in front of them.
 *
 * Applied as inline opacity rather than a Tailwind opacity suffix on purpose.
 * Tailwind only generates classes it can find as literal strings in the
 * source, so `text-primary/[${SOMETHING}]` would silently produce no CSS at
 * all. A number in a style attribute cannot fail that way.
 */
const ARABIC_OPACITY = 0.22
const LATIN_OPACITY = 0.13

/** How many independent drifting columns to lay down. Rendered at every size;
 * CSS hides the ones that will not fit. */
const COLUMNS = [
  { offset: 0, className: "names-col-a" },
  { offset: 23, className: "names-col-b hidden sm:flex" },
  { offset: 47, className: "names-col-c hidden lg:flex" },
  { offset: 71, className: "names-col-d hidden xl:flex" },
]

/** The list starting at `offset`, still in order, wrapping around. */
function rotated(offset: number) {
  return [...NAMES_OF_ALLAH.slice(offset), ...NAMES_OF_ALLAH.slice(0, offset)]
}

export function NamesOfAllahBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Fades the columns out at top and bottom so no name looks sliced off by
          the viewport edge. */}
      <div
        className="absolute inset-0 flex justify-center gap-6 sm:gap-10"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)",
        }}
      >
        {COLUMNS.map((column) => {
          const names = rotated(column.offset)
          return (
            <div
              key={column.className}
              className={`${column.className} w-full max-w-[15rem] flex-col items-center self-start`}
            >
              {[0, 1].map((copy) => (
                <div key={copy} className="flex w-full flex-col items-center">
                  {names.map((name) => (
                    <div
                      key={`${copy}-${name.transliteration}`}
                      className="flex w-full flex-col items-center justify-center py-4 text-center"
                    >
                      <span
                        dir="rtl"
                        lang="ar"
                        className="whitespace-nowrap text-xl leading-loose text-primary"
                        style={{ opacity: ARABIC_OPACITY }}
                      >
                        {name.arabic}
                      </span>
                      <span
                        className="whitespace-nowrap text-[0.6rem] uppercase tracking-[0.3em] text-on-surface"
                        style={{ opacity: LATIN_OPACITY }}
                      >
                        {name.transliteration}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
