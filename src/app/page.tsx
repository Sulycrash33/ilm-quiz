import Link from "next/link"
import { NamesOfAllahBackdrop } from "@/components/layout/NamesOfAllahBackdrop"
import { IlmHuntMark } from "@/components/icons/IlmHuntMark"

/**
 * The landing screen.
 *
 * THREE THINGS WERE WRONG HERE, AND THEY COMPOUNDED
 *
 * 1. A fake progress bar. `progress + 2` every 50ms is fifty ticks — two and a
 *    half seconds of nothing before "Begin Your Journey" appeared, while
 *    nothing was actually loading. Gone.
 *
 * 2. The call to action could not paint until JavaScript had run. Every block
 *    was a framer-motion component, and those render their `initial` state into
 *    the HTML: `opacity: 0`. So even with the fake bar removed, the button was
 *    invisible until React had downloaded, parsed and hydrated. That is the
 *    part that actually made this feel slow on a phone. The entrance animations
 *    are now CSS, which runs off the stylesheet at first paint.
 *
 *    With framer-motion gone this page ships no client JavaScript at all — it
 *    is a server component, and the only interactive things on it are two
 *    links.
 *
 * 3. The layout overlapped on phones. The quote sat in `position: fixed` at
 *    `bottom-12` while the button sat in normal flow at the end of a centred
 *    column, so on a short viewport they printed on top of each other.
 *    Everything is one flow column now, so overlap is not expressible.
 *    `min-height: max(884px, 100dvh)` on `body`, which forced the page taller
 *    than the phone it was on, went with it.
 *
 * A dead `dangerouslySetInnerHTML` script also went: it attached a global
 * mousemove listener to parallax `.logo-container`, an element that does not
 * exist anywhere in the codebase.
 */
export default function LandingScreen() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-background">
      <NamesOfAllahBackdrop />

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -left-24 top-1/2 h-80 w-80 rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 px-5 py-10">
        <div className="settle-in relative flex flex-col items-center">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="pulse-effect h-56 w-56 rounded-full border border-primary/20" />
            <div
              className="pulse-effect absolute h-72 w-72 rounded-full border border-primary/10"
              style={{ animationDelay: "1s" }}
            />
          </div>

          <div className="relative flex flex-col items-center gap-4 rounded-full border border-primary/15 bg-surface-container/40 p-6 shadow-[0_10px_40px_-10px_rgba(240,205,109,0.25)] backdrop-blur-2xl">
            <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary-container/20 sm:h-44 sm:w-44">
              <IlmHuntMark className="h-24 w-24 text-primary sm:h-28 sm:w-28" />
            </div>

            <div className="pt-1 text-center">
              <h1 className="font-display-lg-mobile text-display-lg-mobile tracking-tight text-primary">
                ILM Hunt
              </h1>
              <span className="font-label-caps text-label-caps mt-1 block uppercase tracking-widest text-on-surface-variant/70">
                Digital Sanctuary
              </span>
            </div>
          </div>
        </div>

        <div className="rise-in delay-1 flex w-full flex-col items-center gap-4">
          <Link
            href="/language"
            className="btn-primary glow-effect haptic-feedback w-full max-w-xs rounded-full px-10 py-4 text-center text-lg font-bold shadow-lg"
          >
            Begin Your Journey
          </Link>
          <p className="text-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="rise-in delay-2 mt-2 w-full max-w-md text-center">
          <blockquote className="font-quote-italic text-quote-italic italic leading-relaxed text-on-surface/80">
            &ldquo;Seek knowledge from the cradle to the grave.&rdquo;
          </blockquote>
          <div className="mx-auto mt-4 h-px w-8 bg-primary/25" />
        </div>
      </main>
    </div>
  )
}
