-- Migration 0004: Make sure quiz_room_questions_safe (added in 0003) is
-- actually usable, and document the remaining gap in this defense.
--
-- Context: 0003 created `quiz_room_questions_safe` specifically to hide
-- `correct_index` from players, but the app was still reading the raw
-- `quiz_room_questions` table directly (select *), which - combined with the
-- "Room participants can view questions" RLS policy on that table - let any
-- room participant read the correct answer before answering. The app code
-- has been fixed to read through the safe view instead (see
-- src/lib/multiplayer-service.ts). This migration makes sure that view is
-- actually grantable/queryable for signed-in players.

grant select on public.quiz_room_questions_safe to authenticated;

-- Residual risk (not closed by this migration): RLS is row-level, not
-- column-level. A player who bypasses the app and hits the base
-- `quiz_room_questions` table directly through Supabase's REST API with
-- their own session can still select `correct_index`, because the existing
-- "Room participants can view questions" policy permits reading the whole
-- row. Closing that fully means moving the grading read in
-- `src/app/(app)/multiplayer/answer-actions.ts` onto a service-role client
-- (which bypasses RLS/grants entirely) and then revoking column-level
-- SELECT on `correct_index` from `authenticated` on the base table. That's a
-- deliberate follow-up, not done here, because it requires wiring up
-- SUPABASE_SERVICE_ROLE_KEY in the app's environment first and should be
-- tested before locking the column down.
