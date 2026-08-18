/**
 * The Hunt engine.
 *
 * A "hunt" is one run through a category: a fixed-length ladder of questions
 * whose difficulty adapts to how the seeker is actually doing, scored with a
 * combo multiplier and a speed bonus, and ended by either finishing the ladder
 * or running out of lives.
 *
 * This module is deliberately pure — no React, no Supabase, no `Date.now()`.
 * Every function takes the state it needs and returns new state, so the whole
 * run loop can be exercised without a browser or a database. The UI layer owns
 * the clock; the server still owns grading and the XP that actually lands on a
 * profile (see `submit_quiz_answer`). What the engine computes is the *run*:
 * which question comes next, what the combo is worth, and how the run ended.
 */

import type { QuizQuestion } from './types';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export const DIFFICULTY_ORDER: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

/** Tuning knobs for a run. Kept in one place so balance changes are one edit. */
export const HUNT_RULES = {
  /** Questions in a full run, when the category has enough published content. */
  runLength: 10,
  /** A run needs at least this many questions to be worth starting. */
  minRunLength: 3,
  /** Lives a seeker starts with. Wrong answers and timeouts cost one. */
  startingLives: 3,
  /** Seconds on the clock, per difficulty. Harder questions get more thinking time. */
  timeLimit: { Beginner: 25, Intermediate: 30, Advanced: 40 } as Record<Difficulty, number>,
  /** Correct answers in a row before the combo steps up. */
  comboStep: 3,
  /** Combo multiplier ceiling. Mirrors REWARD_RULES.maxStreakMultiplier. */
  maxCombo: 3,
  /**
   * Answering inside this fraction of the clock earns the full speed bonus;
   * the bonus decays linearly to zero at the buzzer.
   */
  speedBonusWindow: 0.5,
  /** Speed bonus as a fraction of the question's base points. */
  speedBonusMax: 0.5,
  /** Correct answers in a row before the ladder offers something harder. */
  promoteAfter: 2,
  /** Wrong answers in a row before the ladder eases off. */
  demoteAfter: 1,
} as const;

export interface HuntQuestion extends QuizQuestion {
  /** Position in the run, 1-based. */
  stage: number;
}

export type HuntStatus = 'idle' | 'playing' | 'won' | 'lost';

export interface HuntState {
  /** The questions chosen for this run, in order. */
  ladder: HuntQuestion[];
  /** Index into `ladder` of the question on screen. */
  stage: number;
  status: HuntStatus;
  lives: number;
  /** Consecutive correct answers. Resets to 0 on a miss or a timeout. */
  combo: number;
  /** Highest combo reached this run — what the summary brags about. */
  bestCombo: number;
  /** XP the server has credited so far this run. */
  xp: number;
  /**
   * Run score from answering fast. This is NOT profile XP — the server alone
   * decides what lands on a profile (see `submit_quiz_answer`), and anything
   * the client tallies is forgeable. It scores the run, nothing more.
   */
  speedScore: number;
  correct: number;
  wrong: number;
  /** Questions the clock ran out on. Counted separately from wrong answers. */
  timedOut: number;
  /** Lifeline ids already spent this run. Each is once per run. */
  lifelinesUsed: string[];
  /** Difficulty the ladder is currently offering. */
  tier: Difficulty;
  /** Rolling run of correct answers at the current tier, for promotion. */
  tierRun: number;
  /** Rolling run of misses, for demotion. */
  missRun: number;
}

/**
 * Mulberry32 — a small seedable PRNG. Seeding matters here: a run is built on
 * the client but has to be reproducible for tests, and `Math.random()` in
 * render would reshuffle the ladder on every re-render.
 */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates, non-mutating. */
export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Build the ladder for a run.
 *
 * The shape we want is a climb: mostly Beginner early, mostly Advanced late,
 * so a run has an arc instead of being a flat bag of questions. We take the
 * pool, split it by difficulty, shuffle each bucket, then fill each stage from
 * the difficulty that stage *wants* — falling back to the nearest bucket that
 * still has questions left, because most categories won't have a clean spread.
 */
export function buildLadder(
  pool: readonly QuizQuestion[],
  opts: { length?: number; rng?: () => number } = {},
): HuntQuestion[] {
  const rng = opts.rng ?? makeRng(Date.now());
  const target = Math.min(opts.length ?? HUNT_RULES.runLength, pool.length);
  if (target === 0) return [];

  const buckets: Record<Difficulty, QuizQuestion[]> = {
    Beginner: [],
    Intermediate: [],
    Advanced: [],
  };
  pool.forEach((q) => buckets[q.difficulty].push(q));
  DIFFICULTY_ORDER.forEach((d) => {
    buckets[d] = shuffle(buckets[d], rng);
  });

  const ladder: HuntQuestion[] = [];
  for (let i = 0; i < target; i += 1) {
    const wanted = curveDifficulty(i, target);
    const picked = takeNearest(buckets, wanted);
    if (!picked) break;
    ladder.push({ ...picked, stage: ladder.length + 1, timeLimit: timeLimitFor(picked.difficulty) });
  }
  return ladder;
}

/** Which difficulty stage `index` of a `length`-question run should aim for. */
export function curveDifficulty(index: number, length: number): Difficulty {
  const progress = length <= 1 ? 0 : index / (length - 1);
  if (progress < 0.34) return 'Beginner';
  if (progress < 0.72) return 'Intermediate';
  return 'Advanced';
}

/**
 * Pull a question of `wanted` difficulty, or the closest available. Walking
 * outward by distance keeps a Beginner-only category playable instead of
 * producing a half-length run.
 */
function takeNearest(
  buckets: Record<Difficulty, QuizQuestion[]>,
  wanted: Difficulty,
): QuizQuestion | null {
  const from = DIFFICULTY_ORDER.indexOf(wanted);
  const byDistance = DIFFICULTY_ORDER.map((d, i) => ({ d, dist: Math.abs(i - from) })).sort(
    (a, b) => a.dist - b.dist || DIFFICULTY_ORDER.indexOf(a.d) - DIFFICULTY_ORDER.indexOf(b.d),
  );
  for (const { d } of byDistance) {
    const q = buckets[d].pop();
    if (q) return q;
  }
  return null;
}

export function timeLimitFor(difficulty: Difficulty): number {
  return HUNT_RULES.timeLimit[difficulty] ?? 30;
}

/** Combo multiplier for a given run of consecutive correct answers. */
export function comboMultiplier(combo: number): number {
  return Math.min(Math.floor(combo / HUNT_RULES.comboStep) + 1, HUNT_RULES.maxCombo);
}

/**
 * Speed bonus for answering with `msLeft` of `limitSeconds` still on the clock.
 * Full bonus inside the fast window, then a linear decay to nothing at the
 * buzzer — so hesitating costs something but never punishes a correct answer.
 */
export function speedBonus(basePoints: number, msLeft: number, limitSeconds: number): number {
  if (limitSeconds <= 0 || msLeft <= 0) return 0;
  const fraction = Math.min(1, msLeft / (limitSeconds * 1000));
  const { speedBonusWindow: windowSize, speedBonusMax } = HUNT_RULES;
  const scale = fraction >= windowSize ? 1 : fraction / windowSize;
  return Math.round(basePoints * speedBonusMax * scale);
}

export function initialState(ladder: HuntQuestion[]): HuntState {
  return {
    ladder,
    stage: 0,
    status: ladder.length === 0 ? 'idle' : 'playing',
    lives: HUNT_RULES.startingLives,
    combo: 0,
    bestCombo: 0,
    xp: 0,
    speedScore: 0,
    correct: 0,
    wrong: 0,
    timedOut: 0,
    lifelinesUsed: [],
    tier: ladder[0]?.difficulty ?? 'Beginner',
    tierRun: 0,
    missRun: 0,
  };
}

export function currentQuestion(state: HuntState): HuntQuestion | null {
  return state.ladder[state.stage] ?? null;
}

export interface AnswerOutcome {
  correct: boolean;
  /** XP the server credited for this answer. */
  xpEarned: number;
  /** Milliseconds still on the clock when the answer was committed. */
  msLeft: number;
}

/**
 * Fold one graded answer into the run.
 *
 * The server has already decided `correct` and `xpEarned`; the engine's job is
 * the run-level consequences — combo, lives, the difficulty ladder, and whether
 * the run is over.
 */
export function applyAnswer(state: HuntState, outcome: AnswerOutcome): HuntState {
  const question = currentQuestion(state);
  if (!question || state.status !== 'playing') return state;

  const next: HuntState = { ...state, lifelinesUsed: [...state.lifelinesUsed] };

  if (outcome.correct) {
    next.correct += 1;
    next.combo = state.combo + 1;
    next.bestCombo = Math.max(state.bestCombo, next.combo);
    next.xp += outcome.xpEarned;
    next.speedScore += speedBonus(question.points, outcome.msLeft, question.timeLimit);
    next.tierRun = state.tierRun + 1;
    next.missRun = 0;
  } else {
    next.wrong += 1;
    next.combo = 0;
    next.lives = Math.max(0, state.lives - 1);
    next.tierRun = 0;
    next.missRun = state.missRun + 1;
  }

  return advance(next);
}

/** A question the clock ran out on: costs a life, breaks the combo, no XP. */
export function applyTimeout(state: HuntState): HuntState {
  if (state.status !== 'playing' || !currentQuestion(state)) return state;
  const next: HuntState = {
    ...state,
    lifelinesUsed: [...state.lifelinesUsed],
    timedOut: state.timedOut + 1,
    combo: 0,
    lives: Math.max(0, state.lives - 1),
    tierRun: 0,
    missRun: state.missRun + 1,
  };
  return advance(next);
}

/**
 * Skip the current question. Costs no life and breaks no combo — the coins the
 * lifeline charges are the price — but it does not count as a correct answer,
 * so it can't be used to farm the ladder.
 */
export function applySkip(state: HuntState): HuntState {
  if (state.status !== 'playing' || !currentQuestion(state)) return state;
  return advance({ ...state, lifelinesUsed: [...state.lifelinesUsed] });
}

export function spendLifeline(state: HuntState, lifelineId: string): HuntState {
  if (state.lifelinesUsed.includes(lifelineId)) return state;
  return { ...state, lifelinesUsed: [...state.lifelinesUsed, lifelineId] };
}

/**
 * Move to the next stage and settle the run's status.
 *
 * Out of lives ends the run as `lost` even mid-ladder; reaching the end of the
 * ladder with a life left is a `won` run. Both land on the summary screen —
 * the difference is what it says and what it pays.
 */
function advance(state: HuntState): HuntState {
  const next = { ...state, stage: state.stage + 1 };

  if (next.lives <= 0) {
    return { ...next, status: 'lost' };
  }
  if (next.stage >= next.ladder.length) {
    return { ...next, status: 'won' };
  }

  // Re-point the remaining stages first, then read the tier off whatever
  // actually ended up next — otherwise the badge shows the pre-swap difficulty.
  const tuned = { ...next, ...retune(next) };
  return { ...tuned, tier: tuned.ladder[tuned.stage].difficulty };
}

/**
 * The adaptive part.
 *
 * A pre-built ladder alone isn't adaptive — it plays the same whether the
 * seeker is cruising or drowning. So after each answer we look at the run and
 * re-point the *remaining* stages: a hot streak pulls harder questions forward,
 * repeated misses pushes them back. We only ever swap questions that haven't
 * been seen yet, so the run never repeats or skips content.
 */
function retune(state: HuntState): Pick<HuntState, 'ladder'> {
  const remaining = state.ladder.slice(state.stage);
  if (remaining.length < 2) return { ladder: state.ladder };

  const promoting = state.tierRun >= HUNT_RULES.promoteAfter;
  const demoting = state.missRun >= HUNT_RULES.demoteAfter;
  if (promoting === demoting) return { ladder: state.ladder };

  const rank = (q: HuntQuestion) => DIFFICULTY_ORDER.indexOf(q.difficulty);
  const sorted = remaining
    .slice()
    .sort((a, b) => (promoting ? rank(b) - rank(a) : rank(a) - rank(b)));

  // Only the very next stage is re-pointed. Reordering the whole tail would
  // flatten the run's arc; moving one question keeps the climb but makes it
  // respond to how this particular run is going.
  if (sorted[0].id === remaining[0].id) return { ladder: state.ladder };

  const reordered = [sorted[0], ...remaining.filter((q) => q.id !== sorted[0].id)];
  const ladder = [
    ...state.ladder.slice(0, state.stage),
    ...reordered.map((q, i) => ({ ...q, stage: state.stage + i + 1 })),
  ];
  return { ladder };
}

export interface RunSummary {
  status: Exclude<HuntStatus, 'idle' | 'playing'>;
  answered: number;
  correct: number;
  wrong: number;
  timedOut: number;
  /** Percent of answered questions that were right, 0–100. */
  accuracy: number;
  /** XP the server actually credited to the profile over this run. */
  xp: number;
  /** Points earned for pace. Scores the run; never credited as XP. */
  speedScore: number;
  /** Headline number for the summary: credited XP plus pace points. */
  runScore: number;
  bestCombo: number;
  livesLeft: number;
  /** True when every question in the ladder was answered correctly. */
  flawless: boolean;
  lifelinesUsed: number;
}

export function summarize(state: HuntState): RunSummary {
  const answered = state.correct + state.wrong + state.timedOut;
  return {
    status: state.status === 'won' ? 'won' : 'lost',
    answered,
    correct: state.correct,
    wrong: state.wrong,
    timedOut: state.timedOut,
    accuracy: answered === 0 ? 0 : Math.round((state.correct / answered) * 100),
    xp: state.xp,
    speedScore: state.speedScore,
    runScore: state.xp + state.speedScore,
    bestCombo: state.bestCombo,
    livesLeft: state.lives,
    flawless: state.ladder.length > 0 && state.correct === state.ladder.length,
    lifelinesUsed: state.lifelinesUsed.length,
  };
}
