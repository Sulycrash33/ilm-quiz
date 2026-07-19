export const REWARD_RULES = {
  pointsByDifficulty: { easy: 10, medium: 15, hard: 20 },
  streakMultiplierEvery: 3,
  maxStreakMultiplier: 3,
  coinMultiplier: 1,
  dailyMissionQuestions: 5,
  dailyMissionXp: 80,
} as const;

export function pointsForDifficulty(difficulty: string): number {
  return REWARD_RULES.pointsByDifficulty[difficulty as keyof typeof REWARD_RULES.pointsByDifficulty] ?? 10;
}

export function streakMultiplier(streak: number): number {
  return Math.min(
    Math.floor(streak / REWARD_RULES.streakMultiplierEvery) + 1,
    REWARD_RULES.maxStreakMultiplier,
  );
}

export function dailyMissionCopy(questionsToday: number, xpToday: number): string {
  if (questionsToday >= REWARD_RULES.dailyMissionQuestions) {
    return 'Daily mission complete. Come back tomorrow for a fresh challenge.';
  }
  const remaining = REWARD_RULES.dailyMissionQuestions - questionsToday;
  return `${remaining} question${remaining === 1 ? '' : 's'} to finish today’s mission`;
}
