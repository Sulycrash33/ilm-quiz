import { notFound } from "next/navigation";
import { getCategoryBySlug, getPublishedQuizQuestions } from "@/lib/quiz-service";
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

  const questions = await getPublishedQuizQuestions(id);

  return (
    <QuizRunner
      categoryName={category.name}
      categoryDescription={category.description}
      categoryIcon={category.icon}
      questions={questions}
    />
  );
}
