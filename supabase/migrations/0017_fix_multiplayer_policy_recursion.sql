-- Make the multiplayer tables readable again.
--
-- Every signed-in read of any of the four `quiz_room*` tables failed with:
--
--   ERROR 42P17: infinite recursion detected in policy for relation "quiz_room_players"
--
-- The cause is one policy. `quiz_room_players`' own SELECT policy asks
-- `quiz_room_players` which rooms you are in:
--
--   (user_id = auth.uid())
--   OR (room_id IN (SELECT p.room_id FROM quiz_room_players p WHERE p.user_id = auth.uid()))
--
-- Evaluating the policy requires reading the table, which requires evaluating
-- the policy. Postgres detects the cycle and aborts. Because the SELECT
-- policies on `quiz_rooms`, `quiz_room_questions` and `quiz_room_answers` all
-- probe `quiz_room_players` to decide membership, the same error propagates to
-- all four — so the whole multiplayer feature was unreachable, not just the
-- roster.
--
-- The fix is the pattern already used for `is_moderator()` in migration 0014:
-- move the membership lookup into a SECURITY DEFINER function. Inside it the
-- read runs as the table owner, which is not subject to the policy (these
-- tables use ENABLE ROW LEVEL SECURITY, not FORCE), so the cycle is broken at
-- the one point that creates it.
--
-- `my_room_ids()` is safe to expose: it takes no arguments and is hardwired to
-- `auth.uid()`, so a caller can only ever learn which rooms they are already
-- in. It cannot be pointed at another user.
--
-- Policy semantics are otherwise preserved exactly:
--   * rooms       — visible while `waiting`, or if you are in them
--   * players     — yourself, or anyone sharing a room with you
--   * questions   — participants only
--   * answers     — participants only
--
-- Note the `quiz_room_questions` SELECT policy still exposes `correct_index`
-- to participants; the `quiz_room_questions_safe` view from migration 0004 is
-- what clients are meant to read. That is unchanged here — this migration only
-- removes the recursion.

create or replace function public.my_room_ids()
returns setof uuid
language sql
stable
security definer
set search_path to 'public'
as $$
  select p.room_id
    from public.quiz_room_players p
   where p.user_id = auth.uid();
$$;

revoke execute on function public.my_room_ids() from public, anon;
grant  execute on function public.my_room_ids() to authenticated;

-- players ------------------------------------------------------------------
drop policy if exists "Players can see teammates in their active rooms" on public.quiz_room_players;
create policy "Players can see teammates in their active rooms"
  on public.quiz_room_players
  for select
  using (
    user_id = auth.uid()
    or room_id in (select public.my_room_ids())
  );

-- rooms --------------------------------------------------------------------
drop policy if exists "Rooms are viewable by everyone if waiting, or explicitly joined" on public.quiz_rooms;
create policy "Rooms are viewable by everyone if waiting, or explicitly joined"
  on public.quiz_rooms
  for select
  using (
    status = 'waiting'
    or id in (select public.my_room_ids())
  );

-- questions ----------------------------------------------------------------
drop policy if exists "Room participants can view questions" on public.quiz_room_questions;
create policy "Room participants can view questions"
  on public.quiz_room_questions
  for select
  using (room_id in (select public.my_room_ids()));

-- answers ------------------------------------------------------------------
drop policy if exists "Room participants can view answers" on public.quiz_room_answers;
create policy "Room participants can view answers"
  on public.quiz_room_answers
  for select
  using (room_id in (select public.my_room_ids()));
