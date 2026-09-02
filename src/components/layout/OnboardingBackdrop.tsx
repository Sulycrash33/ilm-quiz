import { IslamicPattern } from "@/components/islamic-pattern"
import { NamesOfAllahBackdrop } from "@/components/layout/NamesOfAllahBackdrop"

/**
 * The background every onboarding screen shares.
 *
 * This existed already, but only on `/language`: the drifting names, two soft
 * glows and the khatim lattice were written inline on that one page. The four
 * screens that follow it — age, avatar, name, and the how-it-works explainer —
 * carried the names alone or nothing at all, so the ornament appeared on the
 * first screen of the flow and then vanished for the rest of it.
 *
 * Extracted rather than copied four times. A backdrop pasted into five files
 * is a backdrop that drifts apart in five files, and this repository has
 * already paid for that once with the palette.
 *
 * Not a client component: three divs, no state, no hooks. It ships no
 * JavaScript, and `NamesOfAllahBackdrop` is a server component too.
 *
 * Everything here is `fixed`, so the field stays put while a page that is
 * taller than the viewport scrolls over it. Page content must sit in a
 * positioned wrapper above it — the pages use `relative z-10` — because a
 * fixed element with `z-0` still paints above unpositioned in-flow siblings.
 */
export function OnboardingBackdrop() {
  return (
    <>
      <NamesOfAllahBackdrop />
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-1/2 -left-24 h-80 w-80 rounded-full bg-secondary/5 blur-[100px]" />
        <IslamicPattern variant="flat" />
      </div>
    </>
  )
}
