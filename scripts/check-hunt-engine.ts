/**
 * Hunt engine checks.
 *
 * The engine decides what a run *is* — ladder composition, combo, lives, the
 * adaptive re-point — and none of that is visible in a screenshot, so it gets
 * asserted here instead of eyeballed. Pure functions only; no DOM, no network.
 *
 *   npm run test:engine
 */

import {
  buildLadder, initialState, applyAnswer, applyTimeout, applySkip, summarize,
  comboMultiplier, speedBonus, currentQuestion, makeRng, HUNT_RULES, curveDifficulty,
} from '../src/lib/hunt-engine';
import type { QuizQuestion } from '../src/lib/types';

let failures = 0;
function check(name: string, cond: boolean, extra?: unknown) {
  if (!cond) { failures += 1; console.log('FAIL:', name, extra ?? ''); }
  else console.log('ok  :', name);
}

const pool: QuizQuestion[] = [];
(['Beginner', 'Intermediate', 'Advanced'] as const).forEach((d, di) => {
  for (let i = 0; i < 8; i += 1) {
    pool.push({ id: `${d}-${i}`, text: `q ${d} ${i}`, options: ['a', 'b', 'c', 'd'], difficulty: d, points: 10 + di * 5, timeLimit: 30 });
  }
});

// --- ladder composition
const rng = makeRng(42);
const ladder = buildLadder(pool, { rng });
check('ladder is runLength long', ladder.length === HUNT_RULES.runLength, ladder.length);
check('ladder has no duplicates', new Set(ladder.map((q) => q.id)).size === ladder.length);
check('stages are 1..n', ladder.every((q, i) => q.stage === i + 1));
check('starts easy', ladder[0].difficulty === 'Beginner', ladder[0].difficulty);
check('ends hard', ladder[ladder.length - 1].difficulty === 'Advanced', ladder[ladder.length - 1].difficulty);
check('time limits follow difficulty', ladder.every((q) => q.timeLimit === HUNT_RULES.timeLimit[q.difficulty]));

// small pool -> shorter ladder, no crash
const tiny = buildLadder(pool.slice(0, 2), { rng: makeRng(1) });
check('tiny pool yields 2', tiny.length === 2, tiny.length);
check('empty pool yields 0', buildLadder([], { rng: makeRng(1) }).length === 0);

// beginner-only pool still fills a full run
const beginnerOnly = pool.filter((q) => q.difficulty === 'Beginner');
const bl = buildLadder(beginnerOnly, { rng: makeRng(7) });
check('single-difficulty pool fills what it can', bl.length === Math.min(HUNT_RULES.runLength, beginnerOnly.length), bl.length);
check('single-difficulty no dupes', new Set(bl.map((q) => q.id)).size === bl.length);

// --- curve
check('curve starts Beginner', curveDifficulty(0, 10) === 'Beginner');
check('curve ends Advanced', curveDifficulty(9, 10) === 'Advanced');
check('curve of length 1 is Beginner', curveDifficulty(0, 1) === 'Beginner');

// --- combo
check('combo 0 -> x1', comboMultiplier(0) === 1);
check('combo 2 -> x1', comboMultiplier(2) === 1);
check('combo 3 -> x2', comboMultiplier(3) === 2);
check('combo 6 -> x3', comboMultiplier(6) === 3);
check('combo caps at max', comboMultiplier(99) === HUNT_RULES.maxCombo);

// --- speed bonus
check('full bonus when fast', speedBonus(10, 30000, 30) === 5, speedBonus(10, 30000, 30));
check('half window still full', speedBonus(10, 15000, 30) === 5, speedBonus(10, 15000, 30));
check('quarter window decays', speedBonus(10, 7500, 30) === 3, speedBonus(10, 7500, 30));
check('no time left, no bonus', speedBonus(10, 0, 30) === 0);
check('guards zero limit', speedBonus(10, 5000, 0) === 0);

// --- a winning run
let s = initialState(ladder);
check('starts playing', s.status === 'playing');
check('starts with lives', s.lives === HUNT_RULES.startingLives);
for (let i = 0; i < ladder.length; i += 1) {
  const q = currentQuestion(s);
  if (!q) { check('question available at stage ' + i, false); break; }
  s = applyAnswer(s, { correct: true, xpEarned: q.points, msLeft: q.timeLimit * 1000 });
}
check('perfect run wins', s.status === 'won', s.status);
let sum = summarize(s);
check('perfect run is flawless', sum.flawless, sum);
check('perfect run accuracy 100', sum.accuracy === 100);
check('perfect run keeps lives', sum.livesLeft === HUNT_RULES.startingLives);
check('perfect run earned pace points', sum.speedScore > 0, sum.speedScore);
check('runScore is xp + pace', sum.runScore === sum.xp + sum.speedScore);
check('best combo is run length', sum.bestCombo === ladder.length, sum.bestCombo);

// --- a losing run
let l = initialState(buildLadder(pool, { rng: makeRng(9) }));
l = applyAnswer(l, { correct: false, xpEarned: 0, msLeft: 5000 });
check('miss costs a life', l.lives === HUNT_RULES.startingLives - 1, l.lives);
check('miss breaks combo', l.combo === 0);
l = applyTimeout(l);
check('timeout costs a life', l.lives === HUNT_RULES.startingLives - 2, l.lives);
l = applyAnswer(l, { correct: false, xpEarned: 0, msLeft: 1000 });
check('run ends at zero lives', l.status === 'lost', l.status);
const lsum = summarize(l);
check('lost run counts timeouts separately', lsum.timedOut === 1 && lsum.wrong === 2, lsum);
check('lost run accuracy 0', lsum.accuracy === 0);
check('lost run not flawless', !lsum.flawless);
check('answers after loss are ignored', applyAnswer(l, { correct: true, xpEarned: 99, msLeft: 1000 }).xp === l.xp);

// --- skip
let k = initialState(buildLadder(pool, { rng: makeRng(3) }));
const before = currentQuestion(k)!.id;
k = applySkip(k);
check('skip advances', currentQuestion(k)!.id !== before);
check('skip costs no life', k.lives === HUNT_RULES.startingLives);
check('skip is not a correct answer', k.correct === 0);

// --- adaptivity: a hot streak should pull harder questions forward
let hot = initialState(buildLadder(pool, { rng: makeRng(11) }));
const plannedThird = hot.ladder[2].difficulty;
hot = applyAnswer(hot, { correct: true, xpEarned: 10, msLeft: 20000 });
hot = applyAnswer(hot, { correct: true, xpEarned: 10, msLeft: 20000 });
const actualThird = currentQuestion(hot)!.difficulty;
const rank = (d: string) => ['Beginner', 'Intermediate', 'Advanced'].indexOf(d);
check('streak does not make it easier', rank(actualThird) >= rank(plannedThird), { plannedThird, actualThird });
check('tier tracks the live question', hot.tier === actualThird);
check('retune keeps ladder intact', new Set(hot.ladder.map((q) => q.id)).size === hot.ladder.length);
check('retune keeps ladder length', hot.ladder.length === HUNT_RULES.runLength);
check('retune renumbers stages', hot.ladder.every((q, i) => q.stage === i + 1));

// misses should ease off
let cold = initialState(buildLadder(pool, { rng: makeRng(11) }));
cold = applyAnswer(cold, { correct: true, xpEarned: 10, msLeft: 1000 });
cold = applyAnswer(cold, { correct: false, xpEarned: 0, msLeft: 1000 });
check('miss run recorded', cold.missRun === 1);
check('cold ladder still intact', new Set(cold.ladder.map((q) => q.id)).size === cold.ladder.length);

// --- determinism
const a = buildLadder(pool, { rng: makeRng(123) }).map((q) => q.id).join(',');
const b = buildLadder(pool, { rng: makeRng(123) }).map((q) => q.id).join(',');
check('same seed -> same ladder', a === b);
check('different seed -> different ladder', a !== buildLadder(pool, { rng: makeRng(124) }).map((q) => q.id).join(','));

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
