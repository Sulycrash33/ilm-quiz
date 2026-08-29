-- Migration 0036: A player enters a room as themselves.
--
-- WHAT WAS WRONG
-- Two halves of the same mistake, in a subsystem that has never been run:
-- `quiz_rooms` and `quiz_room_players` are at zero rows and always have been.
--
-- First, the name. `join_room_rpc(p_room_code, p_user_name)` took the display
-- name from the caller and wrote it straight into `quiz_room_players`. The
-- host's row is worse: `createRoom` inserts it from the client directly, with
-- a name the client chose. Nothing anywhere checked that the name in a room
-- belonged to the account playing under it, so a player could sit in a lobby
-- as anyone — including as another player already in the room.
--
-- Second, the face. Every avatar in a lobby rendered as the generic
-- silhouette, because the lobby reads `quiz_room_players.avatar_url` and
-- nothing has ever written that column. It is also the wrong name for the
-- thing: onboarding stores a *choice* in `profiles.avatar_id` — "m-3" — and
-- the art for it lives in the client. There is no URL, and there never was.
--
-- WHAT THIS DOES
-- Identity in a room is not something a caller states. A trigger stamps both
-- the name and the avatar from `profiles`, on insert and on update, whatever
-- the caller supplied. That closes the host's direct insert and the joining
-- player's RPC in one rule, rather than fixing the RPC and leaving the insert
-- open — which is the shape of hole this project keeps finding: a check on one
-- of two doors into the same room.
--
-- The column is renamed to `avatar_id` to say what it holds. Renaming a column
-- with rows in it would be a migration in its own right; this table has none,
-- and never has, which is exactly why now is the moment.
--
-- `p_user_name` then has nothing left to do and is removed rather than
-- ignored: a parameter that is quietly discarded reads, to the next person, as
-- a parameter that works. That was how `p_lifeline_used` survived in
-- `submit_quiz_answer` long enough to become migration 0034's problem.

alter table public.quiz_room_players
  drop column if exists avatar_url;

alter table public.quiz_room_players
  add column if not exists avatar_id text;

comment on column public.quiz_room_players.avatar_id is
  'The avatar chosen in onboarding, e.g. "m-3" — the id, not a URL. Stamped '
  'from profiles by trigger; a caller cannot set it. See migration 0036.';
comment on column public.quiz_room_players.user_name is
  'Stamped from profiles.display_name by trigger; a caller cannot set it. '
  'See migration 0036.';


create or replace function public.stamp_room_player_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_avatar text;
begin
  select p.display_name, p.avatar_id
    into v_name, v_avatar
    from public.profiles p
   where p.id = new.user_id;

  -- A player with no display name set yet is not refused entry; they are
  -- simply a Seeker, which is what the rest of the app calls them.
  new.user_name := coalesce(nullif(trim(v_name), ''), 'Seeker');
  new.avatar_id := v_avatar;
  return new;
end;
$$;

drop trigger if exists quiz_room_players_identity on public.quiz_room_players;
create trigger quiz_room_players_identity
  before insert or update on public.quiz_room_players
  for each row execute function public.stamp_room_player_identity();


-- ---------------------------------------------------------------------------
-- join_room_rpc: the code is the only thing a joining player gets to say.
-- ---------------------------------------------------------------------------
-- Dropped and recreated rather than replaced: changing the parameter list with
-- `create or replace` leaves an overload, and the overload here would be the
-- vulnerable one. Same trap as 0030, 0034.
drop function if exists public.join_room_rpc(text, text);

create function public.join_room_rpc(p_room_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_room record;
begin
  if v_user_id is null then raise exception 'You must be signed in.'; end if;

  select id, status, current_players, max_players into v_room
    from public.quiz_rooms where code = upper(p_room_code);
  if not found then raise exception 'Room not found'; end if;
  if v_room.status <> 'waiting' then raise exception 'Room is not accepting players'; end if;
  if v_room.current_players >= v_room.max_players then raise exception 'Room is full'; end if;

  if exists (select 1 from public.quiz_room_players where room_id = v_room.id and user_id = v_user_id) then
    raise exception 'Already in this room';
  end if;

  -- user_name and avatar_id are omitted on purpose: the trigger fills them in
  -- from the account doing the joining. `user_name` is not null, so a value
  -- has to be present by the time the row lands — which it is, stamped.
  insert into public.quiz_room_players (room_id, user_id)
  values (v_room.id, v_user_id);

  update public.quiz_rooms set current_players = current_players + 1 where id = v_room.id;

  return v_room.id;
end;
$$;

revoke all on function public.join_room_rpc(text) from public, anon;
grant execute on function public.join_room_rpc(text) to authenticated;
