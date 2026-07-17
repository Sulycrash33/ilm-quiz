'use server';

import { createClient } from '@/lib/supabase/server';
import { draftQuestions } from '@/ai/flows/draft-questions';
import { revalidatePath } from 'next/cache';

async function requireReviewer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not signed in.');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'reviewer' && profile.role !== 'admin')) {
    throw new Error('Not authorized. This page is restricted to content reviewers.');
  }

  return { supabase, userId: user.id };
}

export type GenerateResult =
  | { ok: true; draftedCount: number }
  | { ok: false; error: string };

export async function generateDraftQuestions(formData: FormData): Promise<GenerateResult> {
  try {
    const { supabase, userId } = await requireReviewer();

    const categoryId = String(formData.get('categoryId') ?? '');
    const categoryName = String(formData.get('categoryName') ?? '');
    const count = Number(formData.get('count') ?? 5);
    const difficulty = String(formData.get('difficulty') ?? 'medium') as 'easy' | 'medium' | 'hard';
    const language = String(formData.get('language') ?? 'en') as 'ha' | 'en' | 'fr' | 'ar' | 'id' | 'ms';
    const autoPublish = formData.get('autoPublish') === 'true';

    if (!categoryId || !categoryName) {
      return { ok: false, error: 'Missing category.' };
    }

    const { questions } = await draftQuestions({ categoryName, count, difficulty, language });

    if (questions.length === 0) {
      return { ok: false, error: 'The model could not produce any citable questions for this batch. Try a smaller count or a different category.' };
    }

    const rows = questions.map(q => ({
      category_id: categoryId,
      difficulty,
      language,
      madhab_tag: q.madhabTag,
      question_text: q.questionText,
      choices: q.choices,
      correct_choice_index: q.correctChoiceIndex,
      explanation: q.explanation,
      citation_reference: q.citationReference + (q.confidenceFlag === 'needs_scholar_verification' ? ' [AI: please verify]' : ''),
      source_type: 'ai_drafted',
      review_status: autoPublish ? ('published' as const) : ('ai_drafted' as const),
      ...(autoPublish ? { reviewed_by: userId, reviewed_at: new Date().toISOString() } : {}),
    }));

    const { error } = await supabase.from('questions').insert(rows);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath('/admin/review');
    return { ok: true, draftedCount: rows.length };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error.' };
  }
}

export async function approveQuestion(
  questionId: string,
  edited: { questionText: string; choices: string[]; correctChoiceIndex: number; explanation: string; citationReference: string; madhabTag: string }
) {
  const { supabase, userId } = await requireReviewer();

  const { error } = await supabase
    .from('questions')
    .update({
      question_text: edited.questionText,
      choices: edited.choices,
      correct_choice_index: edited.correctChoiceIndex,
      explanation: edited.explanation,
      citation_reference: edited.citationReference,
      madhab_tag: edited.madhabTag,
      review_status: 'published',
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', questionId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/review');
}

export async function rejectQuestion(questionId: string) {
  const { supabase, userId } = await requireReviewer();

  const { error } = await supabase
    .from('questions')
    .update({
      review_status: 'rejected',
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', questionId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/review');
}
