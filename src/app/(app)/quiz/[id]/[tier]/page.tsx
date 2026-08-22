import { notFound, redirect } from "next/navigation";
import {
  getCategoryBySlug,
  getCategoryLevels,
  getPublishedQuizQuestionsForTier,
} from "@/lib/quiz-service";
import { getLifelinePrices } from "@/app/(app)/quiz/actions";
import { QuizRunner } from "@/components/game/QuizRunner";
import { TIER_MIN, TIER_MAX } from "@/lib/hunt-engine";

interface LevelRunPageProps {
  params: Promise<{ id: string; tier: string }>;
}

/**
 * One level of the adventure path: a run confined to a single tier.
 *
 * The unlock check happens here, server-side, against `getCategoryLevels` —
 * not just in the level map's UI — so a player can't reach a locked level by
 * typing its URL directly. `getCategoryLevels` itself derives "unlocked" from
 * `attempts`, the server-graded record, so this can't be spoofed by anything
 * the client claims about a prior run.
 */
export default async function LevelRunPage({ params }: LevelRunPageProps) {
  const { id, tier: tierParam } = await params;

  const tier = Number.parseInt(tierParam, 10);
  if (!Number.isInteger(tier) || tier < TIER_MIN || tier > TIER_MAX) {
    notFound();
  }

  const category = await getCategoryBySlug(id);
  if (!category) {
    notFound();
  }

  const levels = await getCategoryLevels(id);
  const level = levels.find((l) => l.tier === tier);
  if (!level || !level.unlocked) {
    redirect(`/quiz/${id}`);
  }

  const [questions, lifelinePrices] = await Promise.all([
    getPublishedQuizQuestionsForTier(id, tier),
    getLifelinePrices(),
  ]);

  return (
    <QuizRunner
      categoryName={category.name}
      categoryDescription={category.description}
      categoryIcon={category.icon}
      categoryId={category.id}
      questions={questions}
      lifelinePrices={lifelinePrices}
      tier={tier}
      backHref={`/quiz/${id}`}
    />
  );
}
