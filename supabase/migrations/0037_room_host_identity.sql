-- Migration 0037: the host's name is stamped too.
--
-- 0036 closed the two doors into `quiz_room_players` — the joining player's
-- RPC and the host's direct insert — and left a third one open beside them.
-- `quiz_rooms.host_name` is written straight from the client by `createRoom`,
-- so a room could still be *advertised* under a name its creator does not
-- hold, even though the player row inside it now says who they really are.
--
-- It is a smaller lie than the one 0036 fixed: it labels a room rather than a
-- player, and `host_id` beside it has always been authoritative. But it is the
-- same rule, and half of it is not a rule. This project has now found the same
-- shape of hole often enough to say it plainly: a check on one of two ways in
-- is not a check.
--
-- The table is empty and always has been.

create or replace function public.stamp_room_host_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  select p.display_name into v_name
    from public.profiles p
   where p.id = new.host_id;

  new.host_name := coalesce(nullif(trim(v_name), ''), 'Seeker');
  return new;
end;
$$;

drop trigger if exists quiz_rooms_host_identity on public.quiz_rooms;
create trigger quiz_rooms_host_identity
  before insert or update on public.quiz_rooms
  for each row execute function public.stamp_room_host_identity();

comment on column public.quiz_rooms.host_name is
  'Stamped from profiles.display_name by trigger; a caller cannot set it. '
  'See migration 0037.';
