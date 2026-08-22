import { notFound } from "next/navigation";
import { getCategoryBySlug, getCategoryLevels } from "@/lib/quiz-service";
import { LevelPath } from "@/components/game/LevelPath";

interface CategoryLevelMapPageProps {
  params: Promise<{ id: string }>;
}

/**
 * The adventure path for one category: nine level nodes, locked in sequence.
 * A run itself lives at `/quiz/[id]/[tier]`; this page only shows what is
 * unlocked and lets a seeker choose where to start.
 */
export default async function CategoryLevelMapPage({ params }: CategoryLevelMapPageProps) {
  const { id } = await params;

  const category = await getCategoryBySlug(id);
  if (!category) {
    notFound();
  }

  const levels = await getCategoryLevels(id);

  return (
    <LevelPath
      categorySlug={id}
      categoryName={category.name}
      categoryDescription={category.description}
      categoryIcon={category.icon}
      levels={levels}
    />
  );
}
