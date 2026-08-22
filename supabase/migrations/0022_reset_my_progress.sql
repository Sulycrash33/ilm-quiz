-- Migration 0022: let a player wipe their own progress and start from zero.
--
-- WHAT THIS IS FOR
-- A learner who wants a clean run at the material — or who shared a device,
-- or who simply wants to start over — had no way to do it. The only route was
-- abandoning the account and making a new one, which loses their display name,
-- avatar and language, and leaves a dead profile behind.
--
-- WHY IT TAKES NO ARGUMENTS
-- This is the important part. The function resets `auth.uid()` and nothing
-- else. There is deliberately no `p_user_id` parameter, because a destructive
-- SECURITY DEFINER function that accepts a user id is one missing check away
-- from letting any signed-in caller wipe any other player. With no parameter
-- there is no such check to forget: the identity comes from the session, so
-- the worst a caller can do is erase themselves.
--
-- WHAT IT CLEARS  (personal progress and anything derived from it)
--   attempts                          the graded record of every answer
--   user_question_schedule            spaced-repetition state, derived
--   weekly_xp                         leaderboard XP, derived
--   leaderboard_cohorts               cohort placement, derived
--   hunt_runs                         run history
--   user_achievements                 unlocked achievements
--   user_daily_challenge_completions  daily challenge record
--   user_login_claims                 daily login reward claims
--   user_chest_opens                  chest history
--   user_inventory                    owned lifelines/items
--   profiles counters                 xp, coins, streaks, high score, spin
--
-- The derived tables have to be deleted by hand: the triggers on `attempts`
-- (accrue_weekly_xp, schedule_question_review, touch_streak_on_attempt) all
-- fire on INSERT only, so removing attempts does not unwind what they wrote.
--
-- WHAT IT DELIBERATELY KEEPS
--   display_name, avatar_id, preferred_language, age_range, role, created_at
--     — this is "start the game again", not "delete my account". Identity and
--       settings survive; only progress goes.
--   forum_topics, forum_replies, mentor_questions
--     — other people replied to these. Erasing one side of a public
--       conversation rewrites everyone else's thread, so a progress reset is
--       the wrong tool for it.
--   content_reports
--     — a moderation record has to outlive the reporter's game state, or a
--       reset becomes a way to erase your own report history.
--   quiz_room_players, quiz_room_answers
--     — shared match history with other players, like a scoreline. One player
--       resetting should not rewrite a game someone else also played.
--   study_circle_members, study_circles
--     — resetting your XP should not silently remove you from a group, or
--       delete a circle other members are still using.
--
-- The level-locked adventure path recomputes itself from `attempts`, so
-- clearing attempts is what re-locks tiers 2-9 and puts the learner back at
-- level 1 of every category. Nothing separate stores that.

create or replace function public.reset_my_progress()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cleared_attempts int;
  cleared_runs int;
  cleared_achievements int;
begin
  if uid is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;

  -- Counted before deletion so the caller can be told what actually went,
  -- rather than the UI guessing.
  select count(*) into cleared_attempts from public.attempts where user_id = uid;
  select count(*) into cleared_runs from public.hunt_runs where user_id = uid;
  select count(*) into cleared_achievements from public.user_achievements where user_id = uid;

  delete from public.attempts where user_id = uid;
  delete from public.user_question_schedule where user_id = uid;
  delete from public.weekly_xp where user_id = uid;
  delete from public.leaderboard_cohorts where user_id = uid;
  delete from public.hunt_runs where user_id = uid;
  delete from public.user_achievements where user_id = uid;
  delete from public.user_daily_challenge_completions where user_id = uid;
  delete from public.user_login_claims where user_id = uid;
  delete from public.user_chest_opens where user_id = uid;
  delete from public.user_inventory where user_id = uid;

  -- Back to the column defaults in 0001. current_rank_id is set explicitly
  -- as well as by the profiles_sync_rank trigger, so the row is correct even
  -- if that trigger is ever dropped.
  update public.profiles
  set total_xp = 0,
      coins = 0,
      current_rank_id = 1,
      streak_count = 0,
      longest_streak = 0,
      streak_freezes_available = 1,
      last_activity_date = null,
      high_score = 0,
      last_spin_at = null,
      updated_at = now()
  where id = uid;

  return jsonb_build_object(
    'ok', true,
    'attempts_cleared', cleared_attempts,
    'runs_cleared', cleared_runs,
    'achievements_cleared', cleared_achievements
  );
end;
$$;

-- Both halves, per the convention set in 0013: Postgres grants EXECUTE to
-- PUBLIC on every new function, and Supabase's default privilege grants it
-- directly to `anon`. Revoking from PUBLIC alone would leave `anon` holding it.
revoke all on function public.reset_my_progress() from public, anon;
grant execute on function public.reset_my_progress() to authenticated;
