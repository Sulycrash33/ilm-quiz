import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  // Use a real, currently-available Gemini model. `gemini-3.5-flash` does not
  // exist and was throwing at runtime. Bump this deliberately when you verify a
  // newer model id against the @genkit-ai/googleai version in package.json.
  model: 'googleai/gemini-2.0-flash',
});
