-- Migration 0031: Let an administrator see and remove players.
--
-- WHAT WAS WRONG
-- `/admin/users` has existed since the first admin pass and has never once
-- worked. It selects `email` from `public.profiles`, and `profiles` has no
-- such column — the address lives on `auth.users`. PostgREST rejects the
-- select, the page does `users ?? []` without ever looking at `error`, and an
-- administrator is told "No users found" over a full register. The page is
-- also read-only: it lists, searches and filters, and offers no action at all.
--
-- So clearing a test account meant going to the Supabase dashboard, which is
-- exactly the thing the owner should not have to do to run their own game.
--
-- WHY AN RPC RATHER THAN THE ADMIN API
-- The obvious alternative is a server action holding a service role key and
-- calling `auth.admin.deleteUser`. That would put a new secret in the deploy
-- and make this feature dormant until it was set — the same shape as the
-- streak reminders, built and waiting on a credential for weeks. Every other
-- privileged mutation in this schema is a guarded `SECURITY DEFINER` function
-- and this is no different, so it goes where the others are and works the
-- moment it is applied.
--
-- WHAT GUARDS IT
-- Both functions refuse anyone whose `profiles.role` is not `admin`, read
-- from the database against `auth.uid()` — never from anything the caller
-- sends. `admin_delete_user` additionally refuses two deletions that would
-- lock the game out of its own administration:
--
--   * deleting yourself — an administrator cannot remove their own account,
--     because the account they would need to undo it with is the one going
--     away;
--   * deleting the last administrator — a backstop, and one that cannot fire
--     today: the caller has already been proven an admin and proven not to be
--     the target, so at least one admin always remains. It is kept because it
--     states the invariant the self-check currently happens to imply, and the
--     day someone relaxes the self-check is the day it starts earning its
--     keep. Do not read it as an active guard.
--
-- Both are enforced here rather than in the server action. The action checks
-- too, but a check that only exists in TypeScript is a check that a direct
-- REST call walks straight past.

-- ---------------------------------------------------------------------------
-- Who is asking, and are they allowed
-- ---------------------------------------------------------------------------
-- Split out because both functions need the identical check and two copies of
-- an authorisation rule is how the two copies drift apart.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.profiles p
     where p.id = auth.uid()
       and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- The register, as an administrator needs to see it
-- ---------------------------------------------------------------------------
-- `security definer` because the email and the last sign-in are on
-- `auth.users`, which no ordinary role may read. That is the whole reason this
-- function exists rather than the page querying `profiles` directly, so the
-- admin check below is not optional — without it this hands every signed-in
-- player the email address of every other player.
create or replace function public.admin_list_users()
returns table (
  o_id            uuid,
  o_email         text,
  o_display_name  text,
  o_role          text,
  o_total_xp      integer,
  o_coins         integer,
  o_streak_count  integer,
  o_attempts      integer,
  o_created_at    timestamptz,
  o_last_sign_in  timestamptz,
  o_is_self       boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  return query
    select
      p.id,
      u.email::text,
      p.display_name,
      p.role::text,
      p.total_xp,
      p.coins,
      p.streak_count,
      (select count(*) from public.attempts a where a.user_id = p.id)::integer,
      p.created_at,
      u.last_sign_in_at,
      (p.id = auth.uid())
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;

revoke all on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;

-- ---------------------------------------------------------------------------
-- Removing a player
-- ---------------------------------------------------------------------------
-- Deletes the auth user and lets the foreign keys take the rest: profile,
-- attempts, runs, weekly XP, achievements, inventory, review schedule. That
-- cascade is the point — a player who is removed should leave no half-row
-- behind holding their display name in a leaderboard.
--
-- Returns the email it removed so the caller can name it back to the
-- administrator; a delete that silently affects nothing looks identical to a
-- delete that worked.
create or replace function public.admin_delete_user(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller  uuid := auth.uid();
  v_email   text;
  v_role    app_role;
  v_admins  integer;
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  if p_user_id is null then
    raise exception 'No account given.';
  end if;

  if p_user_id = v_caller then
    raise exception 'You cannot delete your own account.';
  end if;

  select u.email::text, p.role
    into v_email, v_role
    from auth.users u
    join public.profiles p on p.id = u.id
   where u.id = p_user_id;

  if not found then
    raise exception 'That account no longer exists.';
  end if;

  -- Counted excluding the target, so this asks the real question: after this
  -- delete, is anyone left who can administer the game?
  select count(*)
    into v_admins
    from public.profiles p
   where p.role = 'admin'
     and p.id <> p_user_id;

  if v_admins = 0 then
    raise exception 'This is the last administrator. Promote someone else first.';
  end if;

  delete from auth.users where id = p_user_id;

  return v_email;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;
