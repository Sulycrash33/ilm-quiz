'use server';
/**
 * @fileOverview Rewrites the explanation shown after a question is answered.
 *
 * This flow NEVER writes to the database. It returns candidate text that the
 * caller stages in `questions.explanation_draft` (migration 0042), where no
 * player can see it until a person publishes it. That separation is the whole
 * point: the explanations being replaced were themselves drafted by a model
 * and published without review, which is how they ended up averaging 125
 * characters and mostly paraphrasing the answer.
 *
 * The register is fixed deliberately. English only, because the question bank
 * is English only. Four to five sentences, because the reveal panel scrolls
 * but a player is mid-run and will not read an essay.
 *
 * This flow is one way to fill the staging column, not the only one. Neither
 * the column nor the review screen cares what wrote a draft, so an explanation
 * can equally be composed directly and staged through
 * `admin_stage_explanation`, with no model call and no API key. The twenty
 * drafts seeding Contemporary Issues tier 1 were written that way, which is
 * also why the length guidance below is measured rather than assumed.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionToExplainSchema = z.object({
  id: z.string(),
  questionText: z.string(),
  choices: z.array(z.string()),
  correctChoice: z.string(),
  currentExplanation: z.string().optional(),
  citation: z.string().optional(),
  categoryName: z.string(),
  tier: z.number().min(1).max(9),
});

const DraftExplanationsInputSchema = z.object({
  questions: z.array(QuestionToExplainSchema).min(1).max(10)
    .describe('Up to 10 at a time. Small batches keep each explanation attentive to its own question and keep a reviewer able to read the whole batch.'),
});
export type DraftExplanationsInput = z.infer<typeof DraftExplanationsInputSchema>;

const DraftedExplanationSchema = z.object({
  id: z.string().describe('The id of the question this explanation belongs to, copied exactly from the input.'),
  explanation: z.string().describe('Four to five sentences of English prose.'),
  citationReference: z.string().optional()
    .describe('A specific real citation if and only if one genuinely supports the point. Omit rather than invent.'),
  confidenceFlag: z.enum(['confident', 'needs_scholar_verification']),
});

const DraftExplanationsOutputSchema = z.object({
  explanations: z.array(DraftedExplanationSchema),
});
export type DraftExplanationsOutput = z.infer<typeof DraftExplanationsOutputSchema>;

export async function draftExplanations(
  input: DraftExplanationsInput,
): Promise<DraftExplanationsOutput> {
  return draftExplanationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'draftExplanationsPrompt',
  input: { schema: DraftExplanationsInputSchema },
  output: { schema: DraftExplanationsOutputSchema },
  prompt: `You are rewriting the explanation a learner reads immediately after answering a multiple-choice question in an Islamic knowledge quiz. Write in English.

A qualified human reviewer reads every one of these before any learner sees it. Your job is a good candidate, not final content.

THE FAILURE TO AVOID
The explanations you are replacing almost all restate the correct answer in different words. Here is a real one:

  Question: Why can no classical ruling on halal meat be applied to lab-grown meat without further reasoning?
  Correct answer: Because classical rulings assume an animal was slaughtered according to specific conditions.
  Old explanation: "Classical halal-meat rulings assume a slaughter step that lab-cultivated meat, produced from multiplied cells in a bioreactor, does not involve."

That teaches nothing. A learner who answered correctly gains no new fact, and one who answered wrongly is simply told the right answer a second time. Never write an explanation that a reader could have produced by rephrasing the correct choice.

WHAT TO WRITE INSTEAD
Four to five sentences. Roughly 450 to 700 characters. That range is measured rather than guessed: a first pass of twenty hand-written explanations for this bank averaged 628 characters, and squeezing them shorter cost the sentence explaining why a wrong choice was tempting every time.

1. Confirm what is correct in one short clause, then move past it immediately.
2. Give the actual reason, evidence or mechanism. This is the sentence the old explanations were missing.
3. Add one concrete fact the learner did not have: a name, a date, a term and what it means, a worked consequence.
4. Where a wrong choice is genuinely tempting, say briefly why it is wrong. This is often the most useful sentence for the learner who got it wrong.
5. Where scholars genuinely differ, say so plainly and name the positions rather than presenting one as settled.

RULES
- Plain, warm, direct prose for a general audience that includes children and adults. No sales language, no "delve", no rhetorical questions.
- Do not use em dashes or en dashes. Use full stops, commas, colons or parentheses.
- Never fabricate a citation, a hadith number, a surah verse, a name or a date. If you cannot recall a specific real citation, omit citationReference entirely rather than inventing one. Omitting is correct behaviour and costs you nothing.
- If you are not fully confident the content is accurate, set confidenceFlag to "needs_scholar_verification". Use it freely. A flagged draft is useful; a confident wrong one is damaging.
- Do not address the reader as "you" more than once, and never open with "Great question" or similar.
- Do not mention that you are an AI, and do not refer to the quiz, the choices as "options", or to this task.
- Return one entry per input question, with the id copied exactly.

THE QUESTIONS
{{#each questions}}
---
id: {{this.id}}
category: {{this.categoryName}} (difficulty tier {{this.tier}} of 9)
question: {{this.questionText}}
correct answer: {{this.correctChoice}}
all choices: {{#each this.choices}}[{{this}}] {{/each}}
{{#if this.currentExplanation}}current explanation (too short, usually a paraphrase of the answer): {{this.currentExplanation}}{{/if}}
{{#if this.citation}}existing citation: {{this.citation}}{{/if}}
{{/each}}

Return only the structured output.`,
});

const draftExplanationsFlow = ai.defineFlow(
  {
    name: 'draftExplanationsFlow',
    inputSchema: DraftExplanationsInputSchema,
    outputSchema: DraftExplanationsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
