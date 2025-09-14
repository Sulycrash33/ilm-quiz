"use server";

import { askTheImam, type AskTheImamInput } from "@/ai/flows/ai-powered-lifeline-assistance";

export async function getAIHint(input: AskTheImamInput): Promise<{ hint: string } | { error: string }> {
  try {
    const result = await askTheImam(input);
    return result;
  } catch (e) {
    console.error(e);
    return { error: "Sorry, the Imam is currently unavailable. Please try again later." };
  }
}
