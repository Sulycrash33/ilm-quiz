import { createClient } from "@/lib/supabase/server";
import { HowItWorks } from "@/components/onboarding/HowItWorks";
import { TIER_MIN } from "@/lib/hunt-engine";

/**
 * The "how this works" explainer, shown once after signup.
 *
 * The starting category and its question count are read from the database
 * rather than hardcoded, so the screen can't promise a level that doesn't
 * exist or a count that's wrong — the first category by `sort_order` is
 * whatever the content ordering says it is.
 */
export default async function HowItWorksPage() {
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, slug, name, icon")
    .order("sort_order")
    .limit(1)
    .maybeSingle();

  let tierOneCount = 0;
  if (category) {
    const { count } = await supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("category_id", category.id)
      .eq("review_status", "published")
      .eq("tier", TIER_MIN);
    tierOneCount = count ?? 0;
  }

  return (
    <HowItWorks
      startSlug={category?.slug ?? "aqeedah"}
      startName={category?.name ?? "Creed (Aqeedah)"}
      startIcon={category?.icon ?? null}
      tierOneCount={tierOneCount}
    />
  );
}
