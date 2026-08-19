import { getDueReviewQuestions, getReviewStatus } from "./actions";
import { getLifelinePrices } from "@/app/(app)/quiz/actions";
import { ReviewRunner } from "@/components/game/ReviewRunner";

/**
 * The review session.
 *
 * Reuses the Hunt run loop rather than building a second one — a review is the
 * same game, just with a differently chosen set of questions. What changes is
 * where the questions come from: the SM-2 schedule rather than a category.
 */
export default async function ReviewPage() {
  const [questions, status, lifelinePrices] = await Promise.all([
    getDueReviewQuestions(),
    getReviewStatus(),
    getLifelinePrices(),
  ]);

  return (
    <ReviewRunner questions={questions} status={status} lifelinePrices={lifelinePrices} />
  );
}
