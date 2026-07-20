import { getCategoriesWithProgress } from "@/lib/quiz-service"
import { QuizCategoriesGrid } from "@/components/game/QuizCategoriesGrid"

export default async function KnowledgeCategoriesPage() {
  const categories = await getCategoriesWithProgress()
  return <QuizCategoriesGrid categories={categories} />
}
