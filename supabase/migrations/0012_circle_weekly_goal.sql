-- Migration 0012: Give study circles something to actually do together.
--
-- WHAT WAS THERE
-- `study_circles` and `study_circle_members` existed and worked: a player could
-- create a circle, join one, leave one. That is the whole feature. A circle was
-- a name, a description, and a list of people — nothing a member could do
-- *inside* it, and nothing that changed if they never came back.
--
-- WHAT THIS ADDS
-- A shared weekly XP goal. The circle has a target; every member's XP for the
-- current week counts towards it; each member can see what everyone contributed.
-- Weeks close on the same Monday boundary as the leagues (migration 0011) and
-- the closed weeks accumulate into a circle streak — consecutive weeks the
-- circle hit its goal.
--
-- WHY THERE IS NO REWARD ATTACHED
-- Deliberate. The goal is set by the circle's own creator, and anyone can create
-- a circle. Paying coins or XP for hitting a self-declared target in a
-- self-created circle is the same unbounded loop the store bundles had
-- (migration 0008, section 4): set the floor goal, hit it, get paid, repeat.
-- What a circle earns here is a record — the streak — which is worth something
-- socially and worth nothing to the economy. If a payout is ever wanted it needs
-- goals that a player cannot set for themselves.
--
-- WHY THERE IS NO SCHEDULED JOB
-- Same as 0011: this project has no cron. Past weeks are closed lazily on the
-- first read after they end, and the close is idempotent, so concurrent readers
-- converge on the same rows.

-- ---------------------------------------------------------------------------
-- 1. The goal
-- ---------------------------------------------------------------------------

alter table public.study_circles
  add column if not exists weekly_xp_goal int not null default 500;

comment on column public.study_circles.weekly_xp_goal is
  'XP the circle''s members must earn between Monday and Sunday, together, for the week to count. Set by the creator within the bounds below.';

alter table public.study_circles
  drop constraint if exists study_circles_weekly_xp_goal_range;
alter table public.study_circles
  add constraint study_circles_weekly_xp_goal_range
  check (weekly_xp_goal between 100 and 100000);

-- ---------------------------------------------------------------------------
-- 2. The record of finished weeks
-- ---------------------------------------------------------------------------
-- A row per circle per completed week. Written once and then frozen: the goal
-- and the total are whatever they were when the week was closed, so raising the
-- goal later cannot retroactively fail a week that was already recorded, and
-- someone joining later cannot inflate one.

create table if not exists public.study_circle_weeks (
  circle_id  uuid not null references public.study_circles(id) on delete cascade,
  week_start date not null,
  goal       int  not null,
  xp         int  not null default 0,
  met        boolean not null default false,
  closed_at  timestamptz not null default now(),
  primary key (circle_id, week_start)
);

comment on table public.study_circle_weeks is
  'One row per circle per completed week: what the goal was, what the circle earned, and whether it got there. Written by close_circle_weeks() on first read after the week ends.';

create index if not exists study_circle_weeks_circle_week_idx
  on public.study_circle_weeks (circle_id, week_start desc);

-- Supabase grants every new public table full CRUD to anon and authenticated by
-- default (`alter default privileges ... grant all on tables`). RLS still gates
-- it, but the grant should not be there at all — this table is written only by
-- the security-definer functions below.
grant select on public.study_circle_weeks to authenticated, anon;
revoke insert, update, delete, truncate, references, trigger
  on public.study_circle_weeks from authenticated, anon;

alter table public.study_circle_weeks enable row level security;
drop policy if exists "Circle week history is public" on public.study_circle_weeks;
create policy "Circle week history is public"
  on public.study_circle_weeks for select using (true);

-- ---------------------------------------------------------------------------
-- 3. What a circle earned in a given week
-- ---------------------------------------------------------------------------
-- Reads `weekly_xp`, the same table the leagues rank on, which the
-- `attempts_accrue_weekly_xp` trigger fills. So a circle's progress and a
-- player's league position are the same number counted twice, which is the
-- point: one session of play moves both.
--
-- Members who joined after the week ended do not count towards it. Without that
-- clause a dormant circle could be "completed" retroactively by recruiting.

create or replace function public.circle_week_xp(p_circle_id uuid, p_week_start date)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(wx.xp), 0)::int
  from public.study_circle_members m
  join public.weekly_xp wx
    on wx.user_id = m.user_id
   and wx.week_start = p_week_start
  where m.circle_id = p_circle_id
    and m.joined_at < (p_week_start + 7)::timestamptz;
$$;

revoke all on function public.circle_week_xp(uuid, date) from public;
grant execute on function public.circle_week_xp(uuid, date) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Closing past weeks
-- ---------------------------------------------------------------------------
-- Walks from the week after the last one recorded (or the week the circle was
-- created, whichever is later) up to but not including the current week. The
-- current week is never closed — a circle judged mid-week would fail on partial
-- results, the same reason `close_league_week` refuses an unfinished week.
--
-- The goal recorded is the goal in force at close time, not at the time the week
-- was actually running. In practice these are the same, because the first read
-- after a week ends closes it; a creator who raises the goal after a long gap
-- will have the new goal applied to the unclosed backlog. Worth knowing, not
-- worth a second history table.

create or replace function public.close_circle_weeks(p_circle_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_this_week date := date_trunc('week', current_date)::date;
  v_goal      int;
  v_created   date;
  v_last      date;
  v_week      date;
  v_xp        int;
  v_count     int := 0;
begin
  select sc.weekly_xp_goal, date_trunc('week', sc.created_at)::date
    into v_goal, v_created
  from public.study_circles sc
  where sc.id = p_circle_id;

  if v_goal is null then
    return 0;
  end if;

  select max(w.week_start) into v_last
  from public.study_circle_weeks w
  where w.circle_id = p_circle_id;

  -- greatest() ignores nulls, so a circle with no history starts at creation.
  v_week := greatest(v_created, v_last + 7);

  -- A year of backlog is more than enough; anything older stays unrecorded
  -- rather than making one unlucky page load walk hundreds of weeks.
  v_week := greatest(v_week, v_this_week - 364);

  while v_week < v_this_week loop
    v_xp := public.circle_week_xp(p_circle_id, v_week);

    insert into public.study_circle_weeks (circle_id, week_start, goal, xp, met, closed_at)
    values (p_circle_id, v_week, v_goal, v_xp, v_xp >= v_goal, now())
    on conflict (circle_id, week_start) do nothing;

    v_count := v_count + 1;
    v_week  := v_week + 7;
  end loop;

  return v_count;
end;
$$;

comment on function public.close_circle_weeks(uuid) is
  'Records every completed week this circle has not recorded yet. Idempotent; never touches the week in progress.';

revoke all on function public.close_circle_weeks(uuid) from public;
grant execute on function public.close_circle_weeks(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Circle summaries
-- ---------------------------------------------------------------------------
-- One row per circle, for the community list. Closes each circle's outstanding
-- weeks first — the lazy materialisation this project uses instead of cron.
--
-- OUT parameters are prefixed `o_`. Naming them after the columns they carry
-- makes them shadow those columns inside the body, and the failure only appears
-- when the function is called, not when it is created (see the note in 0011).

drop function if exists public.get_circle_summaries();
create function public.get_circle_summaries()
returns table (
  o_circle_id    uuid,
  o_week_start   date,
  o_goal         int,
  o_xp           int,
  o_member_count int,
  o_met          boolean,
  o_streak_weeks int,
  o_best_streak  int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_week date := date_trunc('week', current_date)::date;
  v_id   uuid;
begin
  for v_id in select sc.id from public.study_circles sc loop
    perform public.close_circle_weeks(v_id);
  end loop;

  return query
  select
    sc.id,
    v_week,
    sc.weekly_xp_goal,
    public.circle_week_xp(sc.id, v_week),
    (select count(*)::int from public.study_circle_members m where m.circle_id = sc.id),
    public.circle_week_xp(sc.id, v_week) >= sc.weekly_xp_goal,
    -- Current streak: completed weeks after the most recent missed one. The
    -- closer writes every week contiguously, so counting them is enough.
    (
      select count(*)::int
      from public.study_circle_weeks w
      where w.circle_id = sc.id
        and w.week_start < v_week
        and w.week_start > coalesce((
          select max(w2.week_start)
          from public.study_circle_weeks w2
          where w2.circle_id = sc.id
            and w2.week_start < v_week
            and not w2.met
        ), '1900-01-01'::date)
    ),
    -- Best streak: longest run of met weeks, by the usual gaps-and-islands
    -- trick — consecutive weeks share (week_start - n * 7).
    coalesce((
      select max(g.run)::int
      from (
        select count(*) as run
        from (
          select w.week_start
                 - (row_number() over (order by w.week_start))::int * 7 as grp
          from public.study_circle_weeks w
          where w.circle_id = sc.id and w.met
        ) islands
        group by islands.grp
      ) g
    ), 0)
  from public.study_circles sc;
end;
$$;

revoke all on function public.get_circle_summaries() from public;
grant execute on function public.get_circle_summaries() to authenticated, anon;

-- ---------------------------------------------------------------------------
-- 6. Who contributed what
-- ---------------------------------------------------------------------------
-- Members only. A circle's total and its streak are public, because those help
-- someone decide whether to join; the breakdown of who carried the week is for
-- the people in it.

drop function if exists public.get_circle_board(uuid);
create function public.get_circle_board(p_circle_id uuid)
returns table (
  o_user_id      uuid,
  o_display_name text,
  o_avatar_id    text,
  o_xp           int,
  o_rank         int,
  o_is_me        boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_week    date := date_trunc('week', current_date)::date;
begin
  if v_user_id is null then
    return;
  end if;

  if not exists (
    select 1 from public.study_circle_members m
    where m.circle_id = p_circle_id and m.user_id = v_user_id
  ) then
    return;
  end if;

  return query
  select
    m.user_id,
    coalesce(p.display_name, 'Learner')::text,
    p.avatar_id,
    coalesce(wx.xp, 0)::int,
    row_number() over (order by coalesce(wx.xp, 0) desc, m.joined_at)::int,
    (m.user_id = v_user_id)
  from public.study_circle_members m
  join public.profiles p on p.id = m.user_id
  left join public.weekly_xp wx
    on wx.user_id = m.user_id and wx.week_start = v_week
  where m.circle_id = p_circle_id
  order by 5;
end;
$$;

revoke all on function public.get_circle_board(uuid) from public;
grant execute on function public.get_circle_board(uuid) to authenticated;
