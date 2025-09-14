'use server';
/**
 * @fileOverview An AI-powered lifeline assistance for providing hints during quizzes.
 *
 * - askTheImam - A function that provides AI-generated hints based on Islamic teachings.
 * - AskTheImamInput - The input type for the askTheImam function.
 * - AskTheImamOutput - The return type for the askTheImam function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskTheImamInputSchema = z.object({
  question: z.string().describe('The quiz question.'),
  options: z.array(z.string()).describe('The possible answers to the question.'),
});
export type AskTheImamInput = z.infer<typeof AskTheImamInputSchema>;

const AskTheImamOutputSchema = z.object({
  hint: z.string().describe('The AI-generated hint based on Islamic teachings.'),
});
export type AskTheImamOutput = z.infer<typeof AskTheImamOutputSchema>;

export async function askTheImam(input: AskTheImamInput): Promise<AskTheImamOutput> {
  return askTheImamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askTheImamPrompt',
  input: {schema: AskTheImamInputSchema},
  output: {schema: AskTheImamOutputSchema},
  prompt: `You are an Imam providing helpful hints to a user answering a quiz question about Islamic knowledge.

  Provide a hint to help the user answer the following question:
  Question: {{{question}}}
  Options: {{#each options}}{{{this}}}, {{/each}}

  The hint should be concise and based on Islamic teachings.  Do not provide the answer directly, but guide the user towards the correct answer.
  `,
});

const askTheImamFlow = ai.defineFlow(
  {
    name: 'askTheImamFlow',
    inputSchema: AskTheImamInputSchema,
    outputSchema: AskTheImamOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
