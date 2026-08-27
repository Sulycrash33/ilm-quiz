import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

/**
 * The default model for "Ask the Imam" and question drafting.
 *
 * This said `gemini-3.5-flash`, which is not a model. The installed plugin —
 * `@genkit-ai/googleai@1.19.1` — knows no 3.x model at all; its newest flash
 * is `gemini-2.5-flash`, which is what this now uses. The wrong id would have
 * failed at call time rather than at build, so nothing caught it, and both
 * features that depend on it also need `GEMINI_API_KEY` to be set, which
 * hides the failure further.
 *
 * If you bump `@genkit-ai/googleai`, check what model ids the new version
 * actually ships before changing this line — the id is a string, so a typo
 * here is a runtime error in a feature nobody exercises daily.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
