import type { SVGProps } from "react"

/**
 * The nine rank emblems.
 *
 * The ranks used to borrow nine icons from the lucide set — a sprout, two
 * books, a pair of scales, a scroll, a *magnifying glass*, a mosque, a crown
 * and a flame. Three problems with that, in order of how much they matter.
 *
 *   1. Half of them said nothing about the rank. A magnifying glass for
 *      Mufassir is a search box; a crown for Imam is a monarch, which is very
 *      nearly the opposite of what an imam is. The owner's objection was
 *      exact: each tier should carry "something that will accurately depict
 *      them".
 *   2. Two of the nine were books drawn by the same hand at the same weight,
 *      and at the size the rank chip actually renders — 14px beside a name —
 *      `BookOpen` and `BookMarked` are one icon.
 *   3. They were a general-purpose set doing duty as regalia. A rank is the
 *      one badge a player wears, and it should look like it was made for this
 *      app rather than picked from a list.
 *
 * So: nine drawn here, one hand, one idea each, taken from the tools and
 * dress of the tradition the ranks are named after.
 *
 *   Mubtadi   beginner     the lawh — the board a child learns to write on
 *   Talib     student      the qalam — the cut pen
 *   Hafiz     memoriser    a heart with the text inside it
 *   Faqih     jurist       the mizan — scales
 *   Muhaddith traditionist the isnad — the chain a hadith comes down
 *   Mufassir  exegete      the miftah — the key
 *   Shaykh    elder        the 'imamah — the turban
 *   Imam      leader       the minbar — the pulpit steps
 *   Mujaddid  reviver      a sun rising over the horizon
 *
 * The key for Mufassir is not a stretch reached for after a lamp failed to
 * draw — though a lamp did fail to draw, twice. Al-Razi called his tafsir
 * *Mafatih al-Ghayb*, the Keys to the Unseen. Tafsir is what opens a text.
 *
 * ── The constraint every one of these is drawn to ────────────────────────
 * The smallest place a rank emblem renders is the chip beside the player's
 * name on the home screen, at 14px. That is the size that decides the
 * drawing, not the 40px one on the profile: nine emblems that are gorgeous at
 * 40 and identical smudges at 14 would be a worse set than the one being
 * replaced.
 *
 * So none of these was designed and shipped. Each was rendered in a real
 * browser at 14, 20, 28 and 40px and **looked at** —
 * `scripts/render-rank-emblems.mjs`, which reads the paths out of this file so
 * the picture is always of what is actually shipping — and four rounds of that
 * changed the set substantially:
 *
 *   - The slate was drawn three wrong ways before it was drawn right. A
 *     rectangle with a peg on top is a **clipboard**. Give it an arched top
 *     and a plinth and it is a **headstone**. Turn it landscape and move the
 *     peg off-centre and it is an **ID badge**. What finally reads as a
 *     written board is no handle at all and *wavy* script lines: straight bars
 *     inside a rectangle are a form to fill in, and a scalloped line is
 *     writing. None of that is visible in the path data.
 *   - The mosque lamp came out a **lightbulb**, and the flared-rim second
 *     attempt came out a **trophy** — which is the worst possible misreading
 *     inside a game full of awards. The key replaced it and needed one pass.
 *   - The chain was moved from two diagonal links to two stacked ones to stop
 *     it reading as a hyperlink, and that read as a **figure 8**: links only
 *     look like a chain where they visibly interlock. Moved back.
 *
 * They are therefore **silhouette-first**: each has an outline no other one in
 * the set shares — an upright rectangle, a diagonal, a heart, a T, two ovals,
 * a key, a dome, a staircase, a disc with rays. That is what survives at 14px
 * when the interior detail stops resolving.
 *
 * Stroked, not filled, at 1.75 — the weight of the lucide icons they sit
 * beside everywhere else in the app, so the rank chip does not read as heavier
 * than the nav. Single `currentColor`, no gradient, no glow: the colour comes
 * from `Rank.theme` at the call site, which is what makes the ladder read as a
 * cool-to-warm climb.
 */

type EmblemProps = SVGProps<SVGSVGElement>

/** Shared frame. Everything below is geometry on a 24×24 grid. */
function Emblem({ children, ...props }: EmblemProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

/**
 * Mubtadi — the lawh.
 *
 * The board a child is given on the first day, washed and rewritten every
 * lesson. Deliberately handle-less and deliberately scribbled: see the note at
 * the top of this file for the three drawings that had a handle and read as
 * office stationery instead. An upright rectangle is the plainest silhouette
 * in the set, which is right for the rank everyone starts at.
 */
export function LawhEmblem(props: EmblemProps) {
  return (
    <Emblem {...props}>
      <path d="M6.6 2.6h10.8a2.6 2.6 0 0 1 2.6 2.6v13.6a2.6 2.6 0 0 1-2.6 2.6H6.6A2.6 2.6 0 0 1 4 18.8V5.2a2.6 2.6 0 0 1 2.6-2.6Z" />
      <path d="M7.4 8.4c.9-1 1.8-1 2.7 0s1.8 1 2.7 0 1.8-1 2.7 0" />
      <path d="M7.4 13c.9-1 1.8-1 2.7 0s1.8 1 2.7 0 1.8-1 2.7 0" />
      <path d="M7.4 17.6c.9-1 1.8-1 2.7 0" />
    </Emblem>
  )
}

/**
 * Talib — the qalam.
 *
 * A reed cut to a nib, which is what the owner asked this rank to carry. The
 * cut is the whole difference between this and a pencil: a symmetrical point
 * renders as stationery, an obliquely cut one with a slit renders as a pen.
 */
export function QalamEmblem(props: EmblemProps) {
  return (
    <Emblem {...props}>
      <path d="M17.9 3.6a2.1 2.1 0 0 1 2.5 2.5l-9.4 9.8-4.6 1.6-2.8 2.8 2.8-2.8 1.6-4.6Z" />
      <path d="m14.4 6.5 3.1 3.1" />
      <path d="m6.4 17.5 2.5-2.5" />
    </Emblem>
  )
}

/**
 * Hafiz — the text in the heart.
 *
 * A hafiz carries the Qur'an in the chest, not on a shelf, so the emblem is
 * not a book. The two bars inside are the same script marks as the slate,
 * which is the point: the first rank writes them on wood, this one keeps them
 * somewhere that cannot be washed off.
 */
export function HeartEmblem(props: EmblemProps) {
  return (
    <Emblem {...props}>
      <path d="M12 21c-1.4-1-8-5.4-8-10.4A4.6 4.6 0 0 1 12 7.4a4.6 4.6 0 0 1 8 3.2c0 5-6.6 9.4-8 10.4Z" />
      <path d="M8.9 11.6h6.2" />
      <path d="M10.4 14.8h3.2" />
    </Emblem>
  )
}

/**
 * Faqih — the mizan.
 *
 * Scales, because fiqh weighs. Two pans on a beam is the one shape in this set
 * that needed no invention; it has meant judgement for four thousand years.
 */
export function MizanEmblem(props: EmblemProps) {
  return (
    <Emblem {...props}>
      <path d="M12 4.4v15.2" />
      <path d="M7.6 21h8.8" />
      <path d="M4.4 8h15.2" />
      <path d="M10.4 6a1.6 1.6 0 0 1 3.2 0 1.6 1.6 0 0 1-3.2 0Z" />
      <path d="M4.4 8 1.8 14h5.2Z" />
      <path d="M19.6 8 17 14h5.2Z" />
    </Emblem>
  )
}

/**
 * Muhaddith — the isnad.
 *
 * A hadith is only as good as the chain it came down, so the emblem is the
 * chain. Two links crossing on the diagonal, because that is where they
 * visibly interlock — stacked vertically they stop being a chain and become a
 * figure 8, which is the version this briefly shipped in draft.
 */
export function IsnadEmblem(props: EmblemProps) {
  return (
    <Emblem {...props}>
      <path d="M9.8 14.2a3.6 3.6 0 0 0 5.4.4l2.9-2.9a3.6 3.6 0 0 0-5.1-5.1l-1.7 1.7" />
      <path d="M14.2 9.8a3.6 3.6 0 0 0-5.4-.4l-2.9 2.9a3.6 3.6 0 0 0 5.1 5.1l1.7-1.7" />
    </Emblem>
  )
}

/**
 * Mufassir — the miftah.
 *
 * The key. Tafsir opens a text that was closed, which is what the most famous
 * tafsir of all is named after. Drawn with the bit pointing down and back
 * along the shaft so the whole thing is one diagonal object with a ring — the
 * one shape in the set that has a hole in it.
 */
export function MiftahEmblem(props: EmblemProps) {
  return (
    <Emblem {...props}>
      <path d="M19.6 4.4a4.6 4.6 0 0 1-6 7L4.6 20.4H2.4v-2.2l1.6-1.6 1.8 1.8 1.8-1.8-1.8-1.8 5.8-5.8a4.6 4.6 0 0 1 6.2-6.6Z" />
      <path d="M17.2 6.8h.01" />
    </Emblem>
  )
}

/**
 * Shaykh — the 'imamah.
 *
 * A turban: the dome of the cap, the cloth wrapped round it, and the tail
 * falling to the right. It shares a semicircular silhouette with the dawn at
 * the top of the ladder, which is the one collision in the set; the tail and
 * the absence of rays are what separate them, and both were checked at 14px.
 */
export function TurbanEmblem(props: EmblemProps) {
  return (
    <Emblem {...props}>
      <path d="M3.4 17.4a8.6 8.6 0 0 1 17.2 0Z" />
      <path d="M4.2 13.9c2 1.7 4.7 2.7 7.8 2.7s5.8-1 7.8-2.7" />
      <path d="M8 10.2a5.8 5.8 0 0 1 8 0" />
      <path d="M19.4 17.4c1.2 1.1 1.9 2.4 2 3.8" />
    </Emblem>
  )
}

/**
 * Imam — the minbar.
 *
 * The pulpit steps, with the crescent finial that stands on the real ones. An
 * imam leads and speaks; a crown — which is what this rank used to carry —
 * says the opposite thing about the office.
 */
export function MinbarEmblem(props: EmblemProps) {
  return (
    <Emblem {...props}>
      <path d="M2.6 21.4h18.8" />
      <path d="M4.4 21.4v-3.5h3.9v-3.5h3.9v-3.5h3.9" />
      <path d="M16.1 10.9V7.7a2.7 2.7 0 0 1 5.4 0v13.7" />
    </Emblem>
  )
}

/**
 * Mujaddid — the dawn.
 *
 * The reviver of the age. Not a flame — a fire is destruction as readily as
 * renewal — but a sun coming up over a line, which is the only thing in the
 * set that is about *time*, and the right note for the rank at the top.
 */
export function DawnEmblem(props: EmblemProps) {
  return (
    <Emblem {...props}>
      <path d="M2.6 19.4h18.8" />
      <path d="M7 19.4a5 5 0 0 1 10 0" />
      <path d="M12 3v2.6" />
      <path d="m5.2 6.6 1.9 1.9" />
      <path d="m18.8 6.6-1.9 1.9" />
      <path d="M2.6 13.6h2.6" />
      <path d="M18.8 13.6h2.6" />
    </Emblem>
  )
}

/**
 * The ladder, in order, by the slug `rank_tiers` uses.
 *
 * Keyed by slug rather than by index so that adding a tier to the database
 * cannot silently shift eight emblems onto the wrong ranks. `RANKS` in
 * `constants.ts` is the one caller; it fails to compile if a slug here stops
 * matching one there.
 */
export const RANK_EMBLEMS = {
  mubtadi: LawhEmblem,
  talib: QalamEmblem,
  hafiz: HeartEmblem,
  faqih: MizanEmblem,
  muhaddith: IsnadEmblem,
  mufassir: MiftahEmblem,
  shaykh: TurbanEmblem,
  imam: MinbarEmblem,
  mujaddid: DawnEmblem,
} as const satisfies Record<string, (props: EmblemProps) => React.ReactElement>

export type RankSlug = keyof typeof RANK_EMBLEMS

/**
 * The emblem for a rank slug read out of the database.
 *
 * `rank_tiers` is the authority on which ranks exist, and it is editable, so a
 * slug can arrive here that this file has never heard of. That must render as
 * a badge with no emblem rather than throwing on the profile page, which is
 * why callers get `null` and not a fallback picture: a wrong emblem on a real
 * rank is worse than none.
 */
export function emblemForRank(slug: string | null | undefined) {
  if (!slug) return null
  return RANK_EMBLEMS[slug as RankSlug] ?? null
}
