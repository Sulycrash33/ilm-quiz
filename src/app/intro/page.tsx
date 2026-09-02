import { createClient } from "@supabase/supabase-js";
import { GameIntro } from "@/components/onboarding/GameIntro";

/**
 * What ILM Hunt is, for somebody who has not decided to sign up yet.
 *
 * The three numbers on this screen are counted in the database on every
 * request rather than written into the copy. That is the whole reason this is
 * a server component. A landing claim that hardens into a string is a claim
 * that goes stale silently: "over 5,000 questions" survives the day somebody
 * unpublishes a category, and nobody notices until a player does. Counted, the
 * page can only ever overstate the bank by the length of one request.
 *
 * `head: true` with an exact count, never a select. An unbounded PostgREST
 * select stops at 1,000 rows, which has already produced two wrong numbers in
 * this codebase — the category grid and the admin question console — and a
 * marketing page claiming 1,000 questions when there are 5,220 would be the
 * third and the most embarrassing.
 *
 * Every count is allowed to fail. A signed-out visitor reads this through row
 * level security, and if any of the three does not come back the panel simply
 * drops its figure and keeps its sentence. An intro screen that renders
 * "0 questions" is worse than one that renders none.
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

  const [questions, categories, explanations] = await Promise.all([
    supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("review_status", "published"),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("review_status", "published")
      .not("explanation", "is", null),
  ]);

  return (
    <GameIntro
      questionCount={questions.count ?? 0}
      categoryCount={categories.count ?? 0}
      explanationCount={explanations.count ?? 0}
    />
  );
}
