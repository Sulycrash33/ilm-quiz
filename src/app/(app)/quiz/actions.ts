'use server';

import { createClient } from '@/lib/supabase/server';
import type { EarnedAchievement, GradeResult } from '@/lib/types';

interface SubmitOptions { usedHint?: boolean; responseTimeMs?: number; doublePoints?: boolean; lifelineUsed?: string; }

/** Server-authoritative grading and reward calculation - delegated to a
 * SECURITY DEFINER Postgres function (submit_quiz_answer) so the actual
 * coin/XP mutation can't be replayed or forged by a direct client call;
 * see supabase/migrations for details. */
export async function submitAnswer(
  questionId: string,
  choiceIndex: number,
  opts: SubmitOptions = {},
): Promise<GradeResult & { streakMultiplier: number; newAchievements: EarnedAchievement[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to answer.');
  if (!Number.isInteger(choiceIndex) || choiceIndex < 0) throw new Error('Invalid answer.');

  const { data, error } = await supabase.rpc('submit_quiz_answer', {
    p_question_id: questionId,
    p_choice_index: choiceIndex,
    p_used_hint: opts.usedHint ?? false,
    p_response_time_ms: opts.responseTimeMs ?? null,
    p_double_points: opts.doublePoints ?? false,
    p_lifeline_used: opts.lifelineUsed ?? null,
  });

  if (error) throw new Error(error.message || 'Could not submit your answer.');
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Could not submit your answer.');

  // Columns are `o_`-prefixed: the RPC's OUT parameters were renamed in
  // migration 0016. Named plainly, `explanation` collided with the column of
  // the same name on `questions` and the function raised 42702 on every call,
  // so no answer in the game was ever recorded.
  return {
    correct: row.o_correct,
    correctIndex: row.o_correct_index,
    explanation: row.o_explanation ?? '',
    citation: row.o_citation ?? '',
    xpEarned: row.o_xp_earned,
    streakMultiplier: row.o_streak_multiplier,
    newAchievements: await awardAchievements(supabase),
  };
}

/**
 * Hands the database the job of deciding what has just been earned.
 *
 * This runs after every graded answer, which is the whole point: achievements
 * used to be detected only when someone happened to open the profile page, so
 * a badge could arrive days after the run that earned it — or never. The
 * criteria live in `award_achievements()` (migration 0023) rather than being
 * re-implemented here, because two copies of the rules is how they drift.
 *
 * Best-effort by design. The answer is already graded and the XP already
 * banked by the time this is called, so a failure here costs a congratulation,
 * not a point. Never let it throw into the answer path.
 */
async function awardAchievements(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<EarnedAchievement[]> {
  try {
    const { data, error } = await supabase.rpc('award_achievements');
    if (error || !Array.isArray(data)) return [];
    return data.map((row: { o_slug: string; o_name: string; o_description: string | null; o_icon: string | null }) => ({
      slug: row.o_slug,
      name: row.o_name,
      description: row.o_description ?? '',
      icon: row.o_icon ?? '\u2b50',
    }));
  } catch {
    return [];
  }
}

export async function fiftyFifty(questionId: string): Promise<number[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in.');
  const { data: q, error } = await supabase
    .from('questions')
    .select('correct_choice_index, choices, review_status')
    .eq('id', questionId)
    .single();
  if (error || !q || q.review_status !== 'published') throw new Error('Question not found.');
  const total = ((q.choices ?? []) as string[]).length;
  const wrong: number[] = [];
  for (let i = 0; i < total; i += 1) if (i !== q.correct_choice_index) wrong.push(i);
  for (let i = wrong.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [wrong[i], wrong[j]] = [wrong[j], wrong[i]];
  }
  return wrong.slice(0, 2);
}

/** Lifelines, as the dock renders them. `cost` always comes from the database
 * (`lifeline_prices`) — the display copy lives in the i18n bundle keyed by id. */
export interface LifelinePrice {
  id: string;
  cost: number;
  sortOrder: number;
  /** How many the player owns from the store. A stocked lifeline is spent from
   * inventory instead of coins, so the dock shows it as free. */
  owned: number;
}

/**
 * Fallback prices, used only when `lifeline_prices` isn't reachable (most
 * likely: migration 0005 hasn't been applied to this environment yet). They
 * mirror the migration's seed values so the dock still renders sensible
 * numbers. Note this is display-only — `spendLifeline` never falls back, so a
 * missing table means lifelines can't be bought, not that they become free.
 */
const FALLBACK_LIFELINE_PRICES: LifelinePrice[] = [
  { id: 'fifty-fifty', cost: 50, sortOrder: 1, owned: 0 },
  { id: 'ask-imam', cost: 75, sortOrder: 2, owned: 0 },
  { id: 'skip', cost: 25, sortOrder: 3, owned: 0 },
  { id: 'double-points', cost: 100, sortOrder: 4, owned: 0 },
  { id: 'time-boost', cost: 30, sortOrder: 5, owned: 0 },
];

export async function getLifelinePrices(): Promise<LifelinePrice[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('lifeline_prices')
    .select('id, cost, sort_order')
    .eq('enabled', true)
    .order('sort_order');

  if (error || !data || data.length === 0) return FALLBACK_LIFELINE_PRICES;

  // Store items that map to a lifeline (migration 0008) are spendable stock:
  // owning one means the lifeline costs nothing this run.
  const ownedByLifeline = new Map<string, number>();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: stock } = await supabase
      .from('user_inventory')
      .select('quantity, store_items!inner(lifeline_id)')
      .eq('user_id', user.id)
      .gt('quantity', 0);

    (stock ?? []).forEach((row: any) => {
      const lifelineId = row.store_items?.lifeline_id;
      if (lifelineId) {
        ownedByLifeline.set(lifelineId, (ownedByLifeline.get(lifelineId) ?? 0) + row.quantity);
      }
    });
  }

  return data.map((row: { id: string; cost: number; sort_order: number }) => ({
    id: row.id,
    cost: row.cost,
    sortOrder: row.sort_order,
    owned: ownedByLifeline.get(row.id) ?? 0,
  }));
}

export interface SpendResult {
  success: boolean;
  error?: string;
  newBalance?: number;
  cost?: number;
  /** 'inventory' when a stocked copy was consumed, 'coins' when it was bought. */
  paidWith?: 'inventory' | 'coins';
  /** Copies of this lifeline still on the shelf afterwards. */
  remaining?: number;
}

/**
 * Charges the signed-in seeker for one lifeline.
 *
 * This closes a real hole: lifelines used to be free unless the player then
 * committed to an answer, because the only thing that ever reached the server
 * was `p_lifeline_used` on `submitAnswer`. Skip and Time Boost never got that
 * far. The price is decided by the database, never sent from here.
 *
 * Fails closed on purpose. If the RPC is missing or errors, the caller must
 * treat the lifeline as unavailable — granting the effect anyway would put the
 * free-lifeline bug straight back.
 */
export async function spendLifeline(lifelineId: string): Promise<SpendResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'You must be signed in.' };

  const { data, error } = await supabase.rpc('spend_lifeline_rpc', { p_lifeline_id: lifelineId });
  if (error) return { success: false, error: error.message || 'Could not use that lifeline.' };

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { success: false, error: 'Could not use that lifeline.' };
  if (!row.success) {
    return { success: false, error: row.error ?? 'Not enough coins.', newBalance: row.new_balance ?? undefined };
  }

  return {
    success: true,
    newBalance: row.new_balance,
    cost: row.cost,
    paidWith: row.paid_with ?? 'coins',
    remaining: row.remaining ?? 0,
  };
}

export interface HuntRunRecord {
  categoryId: string | null;
  status: 'won' | 'lost';
  stages: number;
  correct: number;
  wrong: number;
  timedOut: number;
  bestCombo: number;
  livesLeft: number;
  lifelinesUsed: number;
  xpEarned: number;
  speedScore: number;
}

/**
 * Files a finished run in the journal.
 *
 * Everything here is self-reported by the client, which is why `hunt_runs` is
 * display-only and grants nothing — see the table comment in migration 0005.
 * The authoritative record of what was answered is `attempts`, written by
 * `submit_quiz_answer`. Best-effort: a failure to record must never block the
 * summary screen, because the XP is already banked by then.
 */
export async function recordHuntRun(run: HuntRunRecord): Promise<{ recorded: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { recorded: false };

  const { error } = await supabase.from('hunt_runs').insert({
    user_id: user.id,
    category_id: run.categoryId,
    status: run.status,
    stages: run.stages,
    correct: run.correct,
    wrong: run.wrong,
    timed_out: run.timedOut,
    best_combo: run.bestCombo,
    lives_left: run.livesLeft,
    lifelines_used: run.lifelinesUsed,
    xp_earned: run.xpEarned,
    speed_score: run.speedScore,
  });

  return { recorded: !error };
}
