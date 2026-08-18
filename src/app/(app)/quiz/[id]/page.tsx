import { notFound } from "next/navigation";
import { getCategoryBySlug, getPublishedQuizQuestions } from "@/lib/quiz-service";
import { getLifelinePrices } from "@/app/(app)/quiz/actions";
import { QuizRunner } from "@/components/game/QuizRunner";

interface CategoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { id } = await params;

  const category = await getCategoryBySlug(id);
  if (!category) {
    notFound();
  }

  // Prices come from the database, not from a constant baked into the client
  // bundle, so the number on a lifeline button is the number the server charges.
  const [questions, lifelinePrices] = await Promise.all([
    getPublishedQuizQuestions(id),
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
    />
  );
}
