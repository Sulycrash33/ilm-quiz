import { NAMES_OF_ALLAH } from "@/data/names-of-allah"

/**
 * The ninety-nine names, drifting behind the landing page.
 *
 * Deliberately quiet: this sits at the same visual weight as the mashrabiya
 * grid lines it replaces, so it reads as texture rather than as something
 * competing with the content in front of it.
 *
 * THREE RULES, because of what the text is
 *
 * 1. A name is never clipped. Each sits in its own centred row with room to
 *    spare, so no name is ever cut off by the column edge or split across
 *    lines. If it cannot be rendered whole it is not rendered.
 * 2. The list runs in order, first name to last, once per pass. It is not
 *    shuffled and not sampled — the sequence is the point.
 * 3. It respects `prefers-reduced-motion`. The animation stops; the names stay.
 *
 * The column is duplicated once and translated by exactly -50%, which is what
 * makes the loop seamless: at the moment the first copy has scrolled fully out,
 * the second is in precisely the position the first started from.
 */
export function NamesOfAllahBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Fades the column into the background at both ends so names do not
          appear to be sliced off by the viewport edge. */}
      <div
        className="absolute inset-0 flex justify-center"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
        }}
      >
        <div className="names-scroll flex w-full max-w-md flex-col items-center">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex w-full flex-col items-center">
              {NAMES_OF_ALLAH.map((name) => (
                <div
                  key={`${copy}-${name.transliteration}`}
                  className="flex w-full flex-col items-center justify-center py-5 text-center"
                >
                  <span
                    dir="rtl"
                    lang="ar"
                    className="whitespace-nowrap text-2xl leading-loose text-primary/[0.09]"
                  >
                    {name.arabic}
                  </span>
                  <span className="whitespace-nowrap text-[0.7rem] uppercase tracking-[0.35em] text-on-surface/[0.07]">
                    {name.transliteration}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
