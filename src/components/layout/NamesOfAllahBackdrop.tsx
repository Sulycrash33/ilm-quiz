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
 */

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
              className={`${column.className} w-full max-w-[15rem] flex-col items-center`}
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
                        className="whitespace-nowrap text-xl leading-loose text-primary/[0.10]"
                      >
                        {name.arabic}
                      </span>
                      <span className="whitespace-nowrap text-[0.6rem] uppercase tracking-[0.3em] text-on-surface/[0.07]">
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
