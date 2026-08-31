import { cn } from "@/lib/utils";

/**
 * The khatim field.
 *
 * This component used to be an empty div containing the comment
 * "Placeholder for Islamic pattern". It rendered nothing, it was imported by
 * nothing, and the actual ornament lived in a `.mashrabiya-pattern` class
 * that five files applied by hand. So the app had a named component for its
 * motif that drew no motif, beside a raw class that did.
 *
 * It is the real thing now, and the one place the motif is named. The
 * geometry itself is in `globals.css`, since a repeating background is a
 * stylesheet's job and inlining a data URI per instance would ship the same
 * kilobyte five times.
 *
 * `variant`:
 *  - `masked` (default) fades toward the bottom. For a full-bleed backdrop
 *    behind scrolling content, where the ornament should recede as the eye
 *    travels down into the text.
 *  - `flat` holds an even field. For a decorative corner or a short panel,
 *    where a vertical fade just looks like a rendering fault.
 *
 * Not a client component: it renders one div with no state, no handlers and
 * no hooks, so it costs nothing on the server and ships no JavaScript.
 */
export function IslamicPattern({
  className,
  variant = "masked",
}: {
  className?: string;
  variant?: "masked" | "flat";
}) {
  return (
    <div
      // Ornament carries no information. It is hidden from assistive
      // technology rather than described, because "decorative star lattice" is
      // noise in a screen reader, not context.
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0",
        variant === "masked" ? "mashrabiya-pattern" : "mashrabiya-overlay",
        className,
      )}
    />
  );
}
