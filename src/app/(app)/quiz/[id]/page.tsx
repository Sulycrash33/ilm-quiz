
import { notFound } from "next/navigation";
import { CATEGORY_DETAILS, QUESTIONS } from "@/lib/constants";
import type { CategoryDetails } from "@/lib/types";
import { CategoryDetailClient } from "@/components/game/CategoryDetailClient";

interface CategoryDetailPageProps {
  params: {
    id: string;
  };
}

export default function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const category: CategoryDetails | undefined = CATEGORY_DETAILS[params.id];

  if (!category) {
    notFound();
  }

  const questions = QUESTIONS[params.id] || [];

  return <CategoryDetailClient category={category} questions={questions} />;
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_DETAILS).map((id) => ({
    id,
  }));
}
