/**
 * Types and validation for the question bank.
 *
 * The bank is authored as data rather than hand-written SQL because at a few
 * hundred questions, hand-written SQL stops being reviewable: a mistyped
 * `correct_choice_index` or an apostrophe that breaks quoting is invisible in a
 * 3000-line file. Here every entry is type-checked at author time and run
 * through `validateBank` before any SQL is emitted.
 *
 * Shapes match the LIVE database, which was inspected directly rather than
 * assumed — see scripts/seed-content/emit.ts for the column list. Note in
 * particular that category slugs use underscores (`five_pillars`), not the
 * hyphens used by the legacy `CATEGORIES` array in src/lib/constants.ts.
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

/** Matches the `madhab_tag` enum. Anything outside fiqh should be 'na'; fiqh
 * that all four Sunni schools agree on is 'agreed'. A specific school is only
 * correct when the question explicitly asks about that school's position. */
export type MadhabTag = 'hanafi' | 'maliki' | 'shafii' | 'hanbali' | 'agreed' | 'na';

export interface SeedCategory {
  /** Underscore slug, as stored in the live `categories` table. */
  slug: string;
  name: string;
  description: string;
  icon: string;
  /** `categories.sort_order` is NOT NULL with no default, so it must be given. */
  sortOrder: number;
}

export interface SeedQuestion {
  category: string;
  difficulty: Difficulty;
  /** The question. Must end in '?' — enforced by the validator. */
  q: string;
  /** Exactly four options. The FIRST is always the correct one; `emit` shuffles
   * deterministically per question so the answer key isn't positionally
   * guessable, while staying reproducible across runs. */
  choices: [string, string, string, string];
  /** Why the answer is right. Shown after the player commits. */
  why: string;
  /** A specific, real reference. Never invent a number to sound authoritative:
   * a general but honest citation ("Standard seerah accounts") is correct where
   * a precise one isn't known. */
  cite: string;
  madhab?: MadhabTag;
}

export interface ValidationIssue {
  index: number;
  question: string;
  problem: string;
}

/**
 * Checks the bank for the mistakes that actually happen when authoring at
 * volume: duplicated questions, repeated or empty options, missing citations,
 * and questions pointed at a category that does not exist.
 */
export function validateBank(
  questions: SeedQuestion[],
  categories: SeedCategory[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const knownCategories = new Set(categories.map((c) => c.slug));
  const seenQuestions = new Set<string>();

  questions.forEach((question, index) => {
    const fail = (problem: string) =>
      issues.push({ index, question: question.q.slice(0, 70), problem });

    if (!knownCategories.has(question.category)) {
      fail(`unknown category "${question.category}"`);
    }
    if (!question.q.trim().endsWith('?')) {
      fail('question does not end in a question mark');
    }
    if (question.q.trim().length < 12) {
      fail('question text is suspiciously short');
    }

    const normalised = question.q.trim().toLowerCase().replace(/\s+/g, ' ');
    if (seenQuestions.has(normalised)) {
      fail('duplicate question text');
    }
    seenQuestions.add(normalised);

    if (question.choices.length !== 4) {
      fail(`expected 4 choices, got ${question.choices.length}`);
    }
    if (question.choices.some((c) => !c || !c.trim())) {
      fail('has an empty choice');
    }
    const uniqueChoices = new Set(question.choices.map((c) => c.trim().toLowerCase()));
    if (uniqueChoices.size !== question.choices.length) {
      fail('has duplicate choices');
    }
    if (!question.why || question.why.trim().length < 10) {
      fail('explanation missing or too short');
    }
    if (!question.cite || !question.cite.trim()) {
      fail('citation missing');
    }
  });

  return issues;
}

/**
 * Deterministic shuffle of the four options.
 *
 * Authoring is far less error-prone when the correct answer is always written
 * first, but shipping it that way would make every answer index 0. Seeding the
 * shuffle from the question text keeps the output stable — re-running the
 * generator produces identical SQL, so the file diffs cleanly — while spreading
 * correct answers across all four positions.
 */
export function placeChoices(question: SeedQuestion): {
  choices: string[];
  correctIndex: number;
} {
  let hash = 2166136261;
  for (let i = 0; i < question.q.length; i += 1) {
    hash ^= question.q.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }

  const correct = question.choices[0];
  const rest = question.choices.slice(1);
  const position = hash % 4;

  const choices = [...rest];
  choices.splice(position, 0, correct);

  return { choices, correctIndex: position };
}
