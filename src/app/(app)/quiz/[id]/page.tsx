import { CATEGORIES, QUESTIONS } from '@/lib/constants';
import { QuizView } from '@/components/game/QuizView';
import { notFound } from 'next/navigation';

interface QuizPageProps {
  params: {
    id: string;
  };
}

export default function QuizInstancePage({ params }: QuizPageProps) {
  const category = CATEGORIES.find((c) => c.id === params.id);
  const questions = QUESTIONS[params.id] || [];

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <QuizView questions={questions} categoryTitle={category.title} />
    </div>
  );
}

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    id: category.id,
  }));
}
