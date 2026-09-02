import { createClient } from "@supabase/supabase-js";
import { GameIntro } from "@/components/onboarding/GameIntro";

/**
 * What ILM Hunt is, for somebody who has not decided to sign up yet.
 *
 * Shown straight after the language choice, so every word of it lands in a
 * language the reader actually picked. It ran before that choice for one
 * revision, which quietly wasted five of the six translations:
 * `LanguageContext` starts at English and only moves for a stored preference
 * or a signed in profile, and a first time visitor has neither. Every stranger
 * read the English copy, whoever they were. The language screen is the one
 * page in this app that needs no translation to work, since every option is
 * written in its own language, which is exactly why it belongs first.
 *
 * The one number on this screen is counted in the database on every request
 * rather than written into the copy. That is the whole reason this is a server
 * component. A landing claim that hardens into a string goes stale silently:
 * "over 25 subjects" survives the day somebody adds five more, and nobody
 * notices until a player does.
 *
 * It counts subjects and nothing else. The question and explanation totals
 * were here and were deliberately removed: a total tells a player where the
 * game ends, and this app would rather it felt open. See the note in
 * `GameIntro` before adding a count back.
 *
 * `head: true` with an exact count, never a select. An unbounded PostgREST
 * select stops at 1,000 rows, which has already produced two wrong numbers in
 * this codebase: the category grid and the admin question console.
 *
 * The count is allowed to fail. A signed-out visitor reads this through row
 * level security, and if it does not come back the panel drops its figure and
 * keeps its sentence. An intro screen that renders "0 subjects" is worse than
 * one that renders none.
 *
 * ── Why this does not use the app's server client ─────────────────────────
 * `@/lib/supabase/server` reads cookies, and reading cookies opts a route out
 * of static rendering for good. Measured, that cost 500ms on every single
 * load, against 5ms for the static screens on either side of it — half a
 * second of nothing behind the landing page's only call to action, on the
 * first thing a stranger ever clicks.
 *
 * This page has no session to read. Nothing on it is per player and every
 * figure is public, so it takes a plain anonymous client and no cookies, which
 * lets it render once and be served from the edge. `revalidate` re-counts it
 * hourly: these numbers move when an admin publishes a category, not between
 * one visitor and the next, and an hour old count is a truer claim than a
 * hardcoded one could ever be.
 */
export const revalidate = 3600;
export default async function IntroPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const categories = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true });

  return <GameIntro categoryCount={categories.count ?? 0} />;
}
