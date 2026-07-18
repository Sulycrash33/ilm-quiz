
import { notFound } from "next/navigation";
import { CATEGORY_DETAILS, QUESTIONS } from "@/lib/constants";
import type { CategoryDetails } from "@/lib/types";
import { CategoryDetailClient } from "@/components/game/CategoryDetailClient";

interface CategoryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { id } = await params;
  const category: CategoryDetails | undefined = CATEGORY_DETAILS[id];

  if (!category) {
    notFound();
  }

  const questions = QUESTIONS[id] || [];

  return <CategoryDetailClient category={category} questions={questions} />;
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_DETAILS).map((id) => ({
    id,
  }));
}
