-- Migration 0032: An audit trail, and the player controls that need one.
--
-- WHY AN AUDIT TRAIL FIRST
-- Migration 0031 gave an administrator a delete button that removes an
-- account and cascades through a dozen tables, and recorded nothing. There
-- was no way to answer "who removed this player, and when" — not from the
-- database, not from the app. Every live-ops console treats this as table
-- stakes, and account actions in particular are the ones a person later has
-- to justify. So the log lands in the same migration as the controls that
-- write to it, rather than being promised for later.
--
-- Nothing may write to `admin_audit_log` directly. It has RLS on, a read
-- policy for administrators, and no insert policy at all — rows arrive only
-- through `log_admin_action`, which is `SECURITY DEFINER` and granted to
-- nobody. A log an administrator can edit is not a log.
--
-- SUSPENSION USES THE MECHANISM POSTGRES ALREADY HAS
-- `auth.users.banned_until` is what Supabase's own auth checks on sign-in, so
-- suspension sets that rather than inventing a `suspended` column the login
-- path would have to learn about. Suspending also deletes the account's
-- sessions, because a ban that leaves someone signed in until their token
-- expires is not a ban.
--
-- WHAT CANNOT BE DONE, AND WHY
-- An administrator may not change their own role or suspend themselves. Both
-- are lockout paths: the account you would need in order to undo the change
-- is the one the change disables. Demoting the last administrator is refused
-- for the same reason, and unlike the dead backstop in 0031 this one can
-- genuinely fire — an admin demoting *another* admin when only two exist
-- leaves one, but an admin demoting themselves is caught by the self-check
-- first, so the count is the guard that matters when roles move.

-- ---------------------------------------------------------------------------
-- The log
-- ---------------------------------------------------------------------------
create table if not exists public.admin_audit_log (
  id            bigint generated always as identity primary key,
  actor_id      uuid references auth.users(id) on delete set null,
  -- Denormalised on purpose. The whole point of this table is to survive the
  -- deletion of the people it describes; a foreign key that nulls out would
  -- take the answer with it.
  actor_email   text,
  action        text not null,
  target_type   text,
  target_id     text,
  target_label  text,
  detail        jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

drop policy if exists "Admins read the audit log" on public.admin_audit_log;
create policy "Admins read the audit log"
  on public.admin_audit_log
  for select
  using (public.is_admin());

-- No insert, update or delete policy exists, deliberately. Writes come only
-- from the definer function below.
revoke all on table public.admin_audit_log from public, anon;
grant select on table public.admin_audit_log to authenticated;

-- ---------------------------------------------------------------------------
-- Writing to it
-- ---------------------------------------------------------------------------
-- Granted to nobody: this is called from inside the other definer functions,
-- which run as the owner and so may execute it regardless of grants. Exposing
-- it would let any caller forge an entry.
create or replace function public.log_admin_action(
  p_action       text,
  p_target_type  text default null,
  p_target_id    text default null,
  p_target_label text default null,
  p_detail       jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  select u.email::text into v_email from auth.users u where u.id = auth.uid();

  insert into public.admin_audit_log (
    actor_id, actor_email, action, target_type, target_id, target_label, detail
  )
  values (
    auth.uid(), v_email, p_action, p_target_type, p_target_id, p_target_label,
    coalesce(p_detail, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.log_admin_action(text, text, text, text, jsonb)
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Reading it back
-- ---------------------------------------------------------------------------
create or replace function public.admin_audit_feed(
  p_limit  integer default 100,
  p_offset integer default 0
)
returns table (
  o_id           bigint,
  o_actor_email  text,
  o_action       text,
  o_target_type  text,
  o_target_label text,
  o_detail       jsonb,
  o_created_at   timestamptz,
  o_total        bigint
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
    select l.id, l.actor_email, l.action, l.target_type, l.target_label,
           l.detail, l.created_at,
           count(*) over ()
      from public.admin_audit_log l
     order by l.created_at desc, l.id desc
     limit greatest(1, least(coalesce(p_limit, 100), 200))
    offset greatest(0, coalesce(p_offset, 0));
end;
$$;

revoke all on function public.admin_audit_feed(integer, integer) from public, anon;
grant execute on function public.admin_audit_feed(integer, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Deleting a player, now recorded
-- ---------------------------------------------------------------------------
-- Replaces the 0031 body. The counts are gathered before the delete, because
-- afterwards there is nothing left to count and "removed an account" without
-- saying what went with it is a poor record.
create or replace function public.admin_delete_user(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller   uuid := auth.uid();
  v_email    text;
  v_name     text;
  v_role     app_role;
  v_admins   integer;
  v_attempts integer;
  v_xp       integer;
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

  select u.email::text, p.display_name, p.role, p.total_xp
    into v_email, v_name, v_role, v_xp
    from auth.users u
    join public.profiles p on p.id = u.id
   where u.id = p_user_id;

  if not found then
    raise exception 'That account no longer exists.';
  end if;

  select count(*) into v_admins
    from public.profiles p
   where p.role = 'admin' and p.id <> p_user_id;

  if v_admins = 0 then
    raise exception 'This is the last administrator. Promote someone else first.';
  end if;

  select count(*) into v_attempts
    from public.attempts a where a.user_id = p_user_id;

  perform public.log_admin_action(
    'user.delete', 'user', p_user_id::text, v_email,
    jsonb_build_object(
      'display_name', v_name,
      'role', v_role::text,
      'attempts_removed', v_attempts,
      'xp_removed', v_xp
    )
  );

  delete from auth.users where id = p_user_id;

  return v_email;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Changing someone's role
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_role(p_user_id uuid, p_role text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_email  text;
  v_old    app_role;
  v_new    app_role;
  v_admins integer;
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  if p_role not in ('user', 'reviewer', 'admin') then
    raise exception 'Unknown role.';
  end if;
  v_new := p_role::app_role;

  if p_user_id = v_caller then
    raise exception 'You cannot change your own role.';
  end if;

  select u.email::text, p.role
    into v_email, v_old
    from auth.users u
    join public.profiles p on p.id = u.id
   where u.id = p_user_id;

  if not found then
    raise exception 'That account no longer exists.';
  end if;

  if v_old = v_new then
    return v_email;
  end if;

  -- Only meaningful when demoting an administrator: if this is the last one,
  -- the game loses its administration. Unlike the equivalent line in 0031
  -- this is reachable, because the caller keeps their own admin role here.
  if v_old = 'admin' and v_new <> 'admin' then
    select count(*) into v_admins
      from public.profiles p
     where p.role = 'admin' and p.id <> p_user_id;

    if v_admins = 0 then
      raise exception 'This is the last administrator. Promote someone else first.';
    end if;
  end if;

  update public.profiles set role = v_new, updated_at = now() where id = p_user_id;

  perform public.log_admin_action(
    'user.role', 'user', p_user_id::text, v_email,
    jsonb_build_object('from', v_old::text, 'to', v_new::text)
  );

  return v_email;
end;
$$;

revoke all on function public.admin_set_role(uuid, text) from public, anon;
grant execute on function public.admin_set_role(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Suspending without deleting
-- ---------------------------------------------------------------------------
-- The softer half of removal: keeps the account and its history, stops the
-- person using it. Sets `banned_until` far enough out to be indefinite —
-- Supabase's auth checks that column on sign-in, so nothing new has to learn
-- about suspension — and clears live sessions so it takes effect now rather
-- than when a token happens to expire.
create or replace function public.admin_set_suspended(p_user_id uuid, p_suspend boolean)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_email  text;
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  if p_user_id = v_caller then
    raise exception 'You cannot suspend your own account.';
  end if;

  select u.email::text into v_email from auth.users u where u.id = p_user_id;

  if not found then
    raise exception 'That account no longer exists.';
  end if;

  if coalesce(p_suspend, false) then
    update auth.users
       set banned_until = timestamptz '2400-01-01 00:00:00+00'
     where id = p_user_id;

    delete from auth.sessions where user_id = p_user_id;
  else
    update auth.users set banned_until = null where id = p_user_id;
  end if;

  perform public.log_admin_action(
    case when coalesce(p_suspend, false) then 'user.suspend' else 'user.restore' end,
    'user', p_user_id::text, v_email, '{}'::jsonb
  );

  return v_email;
end;
$$;

revoke all on function public.admin_set_suspended(uuid, boolean) from public, anon;
grant execute on function public.admin_set_suspended(uuid, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- The register, now carrying suspension state
-- ---------------------------------------------------------------------------
-- Replaces the 0031 body: same shape plus `o_suspended`, so the page can show
-- who is locked out without a second round trip.
--
-- Dropped rather than replaced. Adding a column to a `returns table` changes
-- the function's return type, and `create or replace` refuses that with
-- "cannot change return type of existing function" — the same trap migration
-- 0030 hit from the other direction, where adding a parameter created an
-- overload instead of a replacement.
drop function if exists public.admin_list_users();

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
  o_is_self       boolean,
  o_suspended     boolean
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
      (p.id = auth.uid()),
      (u.banned_until is not null and u.banned_until > now())
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;

revoke all on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;

-- ---------------------------------------------------------------------------
-- One player, in full
-- ---------------------------------------------------------------------------
-- The "unified player context" a support decision needs: who they are, what
-- they have actually played, and where their attention went. Returned as one
-- json document because the caller wants all of it or none of it, and four
-- round trips to render one page is four chances to disagree with itself.
create or replace function public.admin_player_detail(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  select jsonb_build_object(
    'profile', (
      select jsonb_build_object(
        'id', p.id,
        'email', u.email::text,
        'display_name', p.display_name,
        'role', p.role::text,
        'total_xp', p.total_xp,
        'coins', p.coins,
        'streak_count', p.streak_count,
        'longest_streak', p.longest_streak,
        'created_at', p.created_at,
        'last_sign_in_at', u.last_sign_in_at,
        'suspended', (u.banned_until is not null and u.banned_until > now()),
        'preferred_language', p.preferred_language::text
      )
      from public.profiles p
      join auth.users u on u.id = p.id
      where p.id = p_user_id
    ),
    'totals', (
      select jsonb_build_object(
        'attempts', count(*),
        'correct', count(*) filter (where a.is_correct),
        'xp_from_attempts', coalesce(sum(a.xp_earned), 0),
        'first_seen', min(a.created_at),
        'last_seen', max(a.created_at)
      )
      from public.attempts a where a.user_id = p_user_id
    ),
    'categories', coalesce((
      select jsonb_agg(x order by x->>'name')
      from (
        select jsonb_build_object(
          'name', c.name,
          'attempts', count(*),
          'correct', count(*) filter (where a.is_correct),
          'max_tier', max(q.tier)
        ) as x
        from public.attempts a
        join public.questions q on q.id = a.question_id
        join public.categories c on c.id = q.category_id
        where a.user_id = p_user_id
        group by c.name
      ) s
    ), '[]'::jsonb),
    'runs', coalesce((
      select jsonb_agg(x order by x->>'created_at' desc)
      from (
        select jsonb_build_object(
          'category', c.name,
          'status', h.status,
          'correct', h.correct,
          'wrong', h.wrong,
          'xp_earned', h.xp_earned,
          'created_at', h.created_at
        ) as x
        from public.hunt_runs h
        left join public.categories c on c.id = h.category_id
        where h.user_id = p_user_id
        order by h.created_at desc
        limit 20
      ) s
    ), '[]'::jsonb),
    'league', coalesce((
      select jsonb_agg(x order by x->>'week_start' desc)
      from (
        select jsonb_build_object(
          'week_start', lc.week_start,
          'cohort', lc.cohort_number,
          'rank', lc.rank_in_cohort,
          'promoted', lc.promoted,
          'relegated', lc.relegated
        ) as x
        from public.leaderboard_cohorts lc
        where lc.user_id = p_user_id
        order by lc.week_start desc
        limit 10
      ) s
    ), '[]'::jsonb)
  ) into v_result;

  if v_result->'profile' is null or v_result->'profile' = 'null'::jsonb then
    raise exception 'That account no longer exists.';
  end if;

  return v_result;
end;
$$;

revoke all on function public.admin_player_detail(uuid) from public, anon;
grant execute on function public.admin_player_detail(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Numbers the dashboard can actually stand behind
-- ---------------------------------------------------------------------------
-- Two cards were wrong:
--
--   "Active Today" ran `.select('user_id', { count: 'exact', head: true })`
--   with a date filter, which counts attempt *rows*. One player answering
--   eighty questions read as eighty active users.
--
--   "Accuracy Rate" was computed from the most recent hundred attempts and
--   labelled as though it covered all of them.
--
-- Both are counted here over the whole table, which is also what keeps them
-- clear of the 1,000-row cap that PostgREST puts on an unbounded select.
create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  return jsonb_build_object(
    'total_users', (select count(*) from public.profiles),
    'suspended_users', (
      select count(*) from auth.users
       where banned_until is not null and banned_until > now()
    ),
    'active_today', (
      select count(distinct a.user_id) from public.attempts a
       where a.created_at >= date_trunc('day', now())
    ),
    'active_week', (
      select count(distinct a.user_id) from public.attempts a
       where a.created_at >= now() - interval '7 days'
    ),
    'total_questions', (select count(*) from public.questions),
    'published_questions', (
      select count(*) from public.questions where review_status = 'published'
    ),
    'scholar_approved', (
      select count(*) from public.questions where source_type = 'scholar_approved'
    ),
    'total_attempts', (select count(*) from public.attempts),
    'accuracy_pct', (
      select case when count(*) = 0 then 0
             else round(100.0 * count(*) filter (where is_correct) / count(*))::int
             end
      from public.attempts
    ),
    'attempts_today', (
      select count(*) from public.attempts
       where created_at >= date_trunc('day', now())
    )
  );
end;
$$;

revoke all on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_dashboard_stats() to authenticated;
