import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { GenerateForm } from './GenerateForm';
import { QuestionReviewCard, type ReviewQuestion } from './QuestionReviewCard';
import { ShieldCheck } from 'lucide-react';

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'reviewer' && profile.role !== 'admin')) {
    redirect('/home');
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('sort_order');

  const { data: pending } = await supabase
    .from('questions')
    .select('id, question_text, choices, correct_choice_index, explanation, citation_reference, madhab_tag, difficulty, language, category_id, categories(name)')
    .eq('review_status', 'ai_drafted')
    .order('created_at', { ascending: true });

  const reviewQuestions: ReviewQuestion[] = (pending ?? []).map((row: any) => ({
    id: row.id,
    question_text: row.question_text,
    choices: row.choices,
    correct_choice_index: row.correct_choice_index,
    explanation: row.explanation,
    citation_reference: row.citation_reference,
    madhab_tag: row.madhab_tag,
    difficulty: row.difficulty,
    language: row.language,
    categoryName: row.categories?.name ?? 'Unknown',
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pb-24">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">Content review</h1>
      </div>
      <p className="text-sm text-muted-foreground -mt-4">
        AI-drafted questions land here first. Nothing reaches players until a reviewer approves it. Check every citation before publishing.
      </p>

      <GenerateForm categories={categories ?? []} />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Pending review ({reviewQuestions.length})
        </h2>
        {reviewQuestions.length === 0 && (
          <p className="text-sm text-muted-foreground italic">Nothing waiting. Draft a batch above to get started.</p>
        )}
        {reviewQuestions.map(q => (
          <QuestionReviewCard key={q.id} q={q} />
        ))}
      </div>
    </div>
  );
}
