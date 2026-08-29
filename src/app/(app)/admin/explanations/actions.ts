'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { draftExplanations } from '@/ai/flows/draft-explanations';

/**
 * The explanations project.
 *
 * Drafts are staged in `questions.explanation_draft`, which nothing
 * player-facing reads, and reach a player only when a person publishes them.
 * The explanations being replaced were drafted by a model and published in one
 * step, which is how they ended up averaging 125 characters and mostly
 * paraphrasing the answer; doing that again with better prose would be the
 * same mistake.
 */

const MODEL_LABEL = 'gemini-2.5-flash';

export interface DraftRow {
  id: string;
  question: string;
  correct: string;
  category: string;
  tier: number;
  current: string | null;
  currentChars: number;
  draft: string;
  draftChars: number;
  draftedBy: string | null;
}

export type ActionResult = { ok: true } | { ok: false; error: string };
export type GenerateResult =
  | { ok: true; drafted: number; skipped: number; flagged: number }
  | { ok: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in.');
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    throw new Error('Not authorized. This page is restricted to administrators.');
  }
  return { supabase };
}

export async function listDrafts(
  categoryId?: string,
  limit = 25,
  offset = 0,
): Promise<{ ok: true; rows: DraftRow[]; total: number } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.rpc('admin_list_explanation_drafts', {
      p_category_id: categoryId || null,
      p_limit: limit,
      p_offset: offset,
    });
    if (error) return { ok: false, error: error.message };
    const rows = (data ?? []) as any[];
    return {
      ok: true,
      total: rows[0]?.o_total ?? 0,
      rows: rows.map((r) => ({
        id: r.o_id,
        question: r.o_question,
        correct: r.o_correct,
        category: r.o_category,
        tier: r.o_tier,
        current: r.o_current,
        currentChars: r.o_current_chars,
        draft: r.o_draft,
        draftChars: r.o_draft_chars,
        draftedBy: r.o_drafted_by,
      })),
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not load the drafts.' };
  }
}

/**
 * Drafts explanations for one batch of questions in a category.
 *
 * Deliberately small and repeatable rather than a single run over 5,220. A
 * batch that fails costs one batch, the reviewer sees output early enough to
 * stop if the register is wrong, and `GEMINI_API_KEY` rate limits are a
 * problem for a long single run.
 *
 * Questions that already have a draft waiting are skipped, so pressing the
 * button twice does not overwrite text a reviewer is part-way through reading.
 */
export async function generateDrafts(
  categoryId: string,
  batchSize = 10,
): Promise<GenerateResult> {
  try {
    const { supabase } = await requireAdmin();

    const { data: rows, error } = await supabase
      .from('questions')
      .select('id, question_text, choices, correct_choice_index, explanation, citation_reference, tier, categories(name)')
      .eq('category_id', categoryId)
      .eq('review_status', 'published')
      .is('explanation_draft', null)
      .order('tier')
      .limit(Math.max(1, Math.min(batchSize, 10)));

    if (error) return { ok: false, error: error.message };
    if (!rows || rows.length === 0) {
      return { ok: true, drafted: 0, skipped: 0, flagged: 0 };
    }

    const input = rows.map((r: any) => ({
      id: r.id as string,
      questionText: r.question_text as string,
      choices: (r.choices ?? []) as string[],
      correctChoice: (r.choices ?? [])[r.correct_choice_index] ?? '',
      currentExplanation: r.explanation ?? undefined,
      citation: r.citation_reference ?? undefined,
      categoryName: r.categories?.name ?? 'General',
      tier: r.tier ?? 1,
    }));

    const out = await draftExplanations({ questions: input });

    let drafted = 0;
    let flagged = 0;
    const wanted = new Set(input.map((q) => q.id));

    for (const e of out.explanations) {
      // The model echoes the id back. An id it invented, or one from another
      // batch, must not be written: that would put an explanation on the wrong
      // question, which is worse than no explanation at all.
      if (!wanted.has(e.id)) continue;
      if (!e.explanation?.trim()) continue;

      const { error: stageError } = await supabase.rpc('admin_stage_explanation', {
        p_question_id: e.id,
        p_draft: e.explanation,
        p_model: e.confidenceFlag === 'needs_scholar_verification'
          ? `${MODEL_LABEL} (needs verification)`
          : MODEL_LABEL,
      });
      if (stageError) continue;
      drafted += 1;
      if (e.confidenceFlag === 'needs_scholar_verification') flagged += 1;
    }

    revalidatePath('/admin/explanations');
    return { ok: true, drafted, skipped: input.length - drafted, flagged };
  } catch (e) {
    // The most likely failure by far is a missing or rejected GEMINI_API_KEY,
    // so the real message is passed through rather than replaced.
    return { ok: false, error: e instanceof Error ? e.message : 'Could not draft explanations.' };
  }
}

export async function publishDraft(questionId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc('admin_publish_explanation', { p_question_id: questionId });
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/explanations');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not publish that draft.' };
  }
}

export async function discardDraft(questionId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc('admin_discard_explanation', { p_question_id: questionId });
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/explanations');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not discard that draft.' };
  }
}

/** Editing the draft before accepting it: the reviewer's own words win. */
export async function reviseDraft(questionId: string, text: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc('admin_stage_explanation', {
      p_question_id: questionId,
      p_draft: text,
      p_model: 'edited by hand',
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/explanations');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save that revision.' };
  }
}
