'use server';
/**
 * @fileOverview Drafts candidate quiz questions for human scholarly review.
 *
 * This flow NEVER writes to the database and NEVER marks anything as published.
 * It only produces candidates for the /admin/review queue. See project notes:
 * academic consensus (2025-2026) is that no current LLM is reliable enough for
 * unsupervised Islamic content generation, so every row this produces must be
 * gated behind a human scholar's approval (review_status starts at 'ai_drafted').
 *
 * - draftQuestions - drafts N candidate questions for a category/difficulty/language.
 * - DraftQuestionsInput / DraftQuestionsOutput - types for the above.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DraftQuestionsInputSchema = z.object({
  categoryName: z.string().describe('The knowledge category, e.g. "Quran", "Hadith", "Fiqh".'),
  count: z.number().min(1).max(20).describe('How many candidate questions to draft (max 20 per batch, keep batches small so a reviewer can actually check each citation).'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  language: z.enum(['ha', 'en', 'fr', 'ar', 'id', 'ms']).describe('ha=Hausa, en=English, fr=French, ar=Arabic, id=Bahasa Indonesia, ms=Bahasa Malaysia'),
});
export type DraftQuestionsInput = z.infer<typeof DraftQuestionsInputSchema>;

const DraftedQuestionSchema = z.object({
  questionText: z.string(),
  choices: z.array(z.string()).length(4).describe('Exactly 4 answer options.'),
  correctChoiceIndex: z.number().min(0).max(3),
  explanation: z.string().describe('Brief explanation of the correct answer.'),
  citationReference: z.string().describe('A SPECIFIC, real citation: either "Surah <name> <number>:<ayah>" for Quran, or "<Collection name> <book/hadith number>" for Hadith (e.g. "Sahih al-Bukhari 1"). Never invent a number you are not confident is real.'),
  madhabTag: z.enum(['hanafi', 'maliki', 'shafii', 'hanbali', 'agreed', 'na']).describe('"agreed" if this is uncontested across all four madhabs (or not a fiqh question at all -> use "na" for non-fiqh categories). Only use a specific madhab name if the ruling genuinely differs by school and this question is testing that specific school\'s position.'),
  confidenceFlag: z.enum(['confident', 'needs_scholar_verification']).describe('Mark "needs_scholar_verification" for anything you are not fully certain is accurate, rather than guessing.'),
});

const DraftQuestionsOutputSchema = z.object({
  questions: z.array(DraftedQuestionSchema),
});
export type DraftQuestionsOutput = z.infer<typeof DraftQuestionsOutputSchema>;

export async function draftQuestions(input: DraftQuestionsInput): Promise<DraftQuestionsOutput> {
  return draftQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'draftQuestionsPrompt',
  input: {schema: DraftQuestionsInputSchema},
  output: {schema: DraftQuestionsOutputSchema},
  prompt: `You are drafting multiple-choice quiz questions for an Islamic knowledge quiz app, category "{{categoryName}}", difficulty {{difficulty}}, target language {{language}}.

These drafts will be reviewed by a qualified human scholar before anything is shown to users. Your job is ONLY to produce well-sourced candidates, not final content. Follow these rules strictly:

1. Every question must be answerable from well-established, mainstream Islamic sources: the Quran, authentic Hadith collections (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Muwatta), or widely agreed seerah/history.
2. citationReference must be a SPECIFIC real reference (surah name + number:ayah, or hadith collection + number). If you are not confident the exact number is correct, still give your best real citation but set confidenceFlag to "needs_scholar_verification".
3. NEVER fabricate a citation to sound authoritative. If you cannot recall a real specific citation for a fact, do not include that question at all — produce fewer questions rather than an invented one.
4. For Fiqh questions specifically: if the ruling is agreed upon by all four Sunni madhabs, tag madhabTag as "agreed". If the ruling genuinely differs by school (e.g. some positions in Maliki vs Shafi'i fiqh), write the question so it is explicit about WHICH school's position is being asked about, and tag madhabTag accordingly. Do not present one school's ruling as universal.
5. For non-Fiqh categories, set madhabTag to "na".
6. Write the question, choices, and explanation in {{language}}. Keep tone respectful and educational, suitable for a general audience including children.
7. Draft up to {{count}} questions. It is fine to return fewer if you run out of citable, verifiable facts — quality and honesty over hitting the count.

Return only the structured output.`,
});

const draftQuestionsFlow = ai.defineFlow(
  {
    name: 'draftQuestionsFlow',
    inputSchema: DraftQuestionsInputSchema,
    outputSchema: DraftQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
