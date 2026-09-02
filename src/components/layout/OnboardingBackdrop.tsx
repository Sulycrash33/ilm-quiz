import { AppBackdrop } from "@/components/layout/AppBackdrop"
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
 * It is now the game's own backdrop plus the names, rather than a second
 * implementation of the same glows: the glows and the lattice had already
 * drifted apart from the copy in `(app)/layout.tsx`, which is the fault this
 * component was extracted to prevent, repeated one level up. The names are the
 * only thing onboarding adds — see `AppBackdrop` for why they stop here.
 *
 * Not a client component: `NamesOfAllahBackdrop` and `AppBackdrop` are both
 * server components, so this ships no JavaScript.
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
      <AppBackdrop />
    </>
  )
}
