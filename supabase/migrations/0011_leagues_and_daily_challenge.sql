-- Migration 0011: Turn on weekly leagues and the daily challenge.
--
-- Both features already had tables, correct keys, and UI reading them. Neither
-- had anything writing them:
--
--   weekly_xp            0 rows. `submit_quiz_answer` does not touch it, so the
--                        "This week" tab of the leaderboard has always been empty.
--   leaderboard_cohorts  0 rows. Nothing has ever assigned a cohort.
--   daily_challenges     0 rows. No generator, so /challenges has never had a
--                        challenge to show.
--
-- This supplies the missing halves. Nothing here changes a table's shape beyond
-- one added column, because the original design of these four tables was sound —
-- `leaderboard_cohorts` even carries `rank_in_cohort` and `promoted`, which is
-- exactly the promotion/relegation model below.
--
-- WHY THERE IS NO SCHEDULED JOB
-- This project has no cron. Rather than depend on one, both features are lazily
-- materialised: the first player to touch a week or a day creates what that
-- period needs, and the work is idempotent so concurrent callers converge. That
-- keeps the features working on a deployment with nothing scheduled, at the cost
-- of the very first request of a period doing a little extra.

-- ---------------------------------------------------------------------------
-- 1. Weekly XP — the number leagues are ranked on
-- ---------------------------------------------------------------------------
-- Accrued by a trigger on `attempts` rather than by editing `submit_quiz_answer`.
-- Same reasoning as the streak and the review schedule: `attempts` is written
-- only by that function, so a trigger on it sees exactly what was graded without
-- putting another edit through the critical grading path.
--
-- Weeks start Monday, matching both `date_trunc('week')` and the Monday-based
-- week the leaderboard page already computes in TypeScript.

create or replace function public.accrue_weekly_xp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.xp_earned, 0) = 0 then
    return new;
  end if;

  insert into public.weekly_xp (user_id, week_start, xp, updated_at)
  values (new.user_id, date_trunc('week', new.created_at)::date, new.xp_earned, now())
  on conflict (user_id, week_start) do update
    set xp = public.weekly_xp.xp + excluded.xp,
        updated_at = now();

  return new;
end;
$$;

comment on function public.accrue_weekly_xp() is
  'Adds each graded answer''s XP to the player''s weekly total. Weeks start Monday, matching date_trunc(''week'') and the leaderboard page.';

drop trigger if exists attempts_accrue_weekly_xp on public.attempts;
create trigger attempts_accrue_weekly_xp
  after insert on public.attempts
  for each row execute function public.accrue_weekly_xp();

-- ---------------------------------------------------------------------------
-- 2. Leagues
-- ---------------------------------------------------------------------------
-- `cohort_number` is the division: 1 is the entry league, higher is better.
-- Players compete only against others in their division, and the table resets
-- every Monday — which is the point. A single all-time leaderboard becomes
-- unreachable within a month and everyone below the top stops looking.

alter table public.leaderboard_cohorts
  add column if not exists relegated boolean;

comment on column public.leaderboard_cohorts.relegated is
  'Set when a week is closed out. Mirrors `promoted`; both are null until then.';

-- Tuning. Small numbers on purpose: with a young player base a division of 30
-- would be a division of 3, and promoting the top 7 of 3 people is meaningless.
-- These are read by both functions below.
create or replace function public.league_rules()
returns table (promote_top int, relegate_bottom int, max_division int)
language sql
immutable
as $$ select 3, 2, 10 $$;

comment on function public.league_rules() is
  'League tuning in one place. Promote the top 3 of a division, relegate the bottom 2, cap at division 10.';

/**
 * Finalise a past week: rank everyone within their division and mark who goes
 * up and who goes down.
 *
 * Idempotent and safe to call repeatedly — it only writes rows whose rank is
 * still null, so a week already closed is left alone. Refuses to close a week
 * that has not finished, because ranking a league mid-week would promote people
 * on partial results.
 */
create or replace function public.close_league_week(p_week_start date)
returns table (rows_closed int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
  v_rules record;
begin
  if p_week_start >= date_trunc('week', current_date)::date then
    return query select 0;
    return;
  end if;

  select * into v_rules from public.league_rules();

  with ranked as (
    select
      lc.user_id,
      lc.cohort_number,
      row_number() over (
        partition by lc.cohort_number
        order by coalesce(wx.xp, 0) desc, lc.assigned_at
      )::int as rnk,
      count(*) over (partition by lc.cohort_number)::int as cohort_size
    from public.leaderboard_cohorts lc
    left join public.weekly_xp wx
      on wx.user_id = lc.user_id and wx.week_start = lc.week_start
    where lc.week_start = p_week_start
  )
  update public.leaderboard_cohorts lc
     set rank_in_cohort = ranked.rnk,
         promoted = (ranked.rnk <= v_rules.promote_top and ranked.cohort_size > v_rules.promote_top),
         -- Nobody is relegated out of the entry division, and a division too
         -- small to have a meaningful bottom does not relegate at all.
         relegated = (
           lc.cohort_number > 1
           and ranked.rnk > ranked.cohort_size - v_rules.relegate_bottom
           and ranked.cohort_size > v_rules.promote_top + v_rules.relegate_bottom
         )
  from ranked
  where lc.user_id = ranked.user_id
    and lc.week_start = p_week_start
    and lc.rank_in_cohort is null;

  get diagnostics v_count = row_count;
  return query select v_count;
end;
$$;

revoke all on function public.close_league_week(date) from public;
grant execute on function public.close_league_week(date) to authenticated;

/**
 * Make sure the caller has a division for the current week, closing out last
 * week first so promotion actually applies.
 *
 * A newcomer starts in division 1. Everyone else carries their previous
 * division, plus one if they were promoted, minus one if relegated.
 */
-- OUT parameters are prefixed `o_` throughout this migration. Naming them after
-- the columns they carry (week_start, cohort_number, id, ...) makes them shadow
-- those columns inside the function body, and `on conflict (user_id, week_start)`
-- then fails at runtime with "column reference is ambiguous" — a failure that
-- does not show up until the function is called, not when it is created.
drop function if exists public.ensure_league_cohort();
create function public.ensure_league_cohort()
returns table (o_week_start date, o_cohort_number int, o_moved text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_week date := date_trunc('week', current_date)::date;
  v_last record;
  v_division int;
  v_moved text := 'none';
  v_rules record;
begin
  if v_user_id is null then
    return;
  end if;

  select lc.cohort_number into v_last
  from public.leaderboard_cohorts lc
  where lc.user_id = v_user_id and lc.week_start = v_week;

  if found then
    return query select v_week, v_last.cohort_number, 'none'::text;
    return;
  end if;

  select * into v_rules from public.league_rules();

  -- Their most recent completed week decides where they land.
  select lc.cohort_number, lc.week_start, lc.promoted, lc.relegated into v_last
  from public.leaderboard_cohorts lc
  where lc.user_id = v_user_id and lc.week_start < v_week
  order by lc.week_start desc
  limit 1;

  if not found then
    v_division := 1;
  else
    -- Close that week if it has not been closed, so promoted/relegated are set.
    if v_last.promoted is null then
      perform public.close_league_week(v_last.week_start);
      select lc.cohort_number, lc.promoted, lc.relegated into v_last
      from public.leaderboard_cohorts lc
      where lc.user_id = v_user_id and lc.week_start = v_last.week_start;
    end if;

    v_division := v_last.cohort_number;
    if coalesce(v_last.promoted, false) then
      v_division := least(v_division + 1, v_rules.max_division);
      v_moved := 'promoted';
    elsif coalesce(v_last.relegated, false) then
      v_division := greatest(v_division - 1, 1);
      v_moved := 'relegated';
    end if;
  end if;

  insert into public.leaderboard_cohorts (user_id, week_start, cohort_number, assigned_at)
  values (v_user_id, v_week, v_division, now())
  on conflict (user_id, week_start) do nothing;

  return query select v_week, v_division, v_moved;
end;
$$;

revoke all on function public.ensure_league_cohort() from public;
grant execute on function public.ensure_league_cohort() to authenticated;

/** This week's standings for the caller's division. */
drop function if exists public.get_league_standings();
create function public.get_league_standings()
returns table (
  o_user_id uuid,
  o_display_name text,
  o_xp int,
  o_rank int,
  o_is_me boolean,
  o_cohort_number int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_week date := date_trunc('week', current_date)::date;
  v_division int;
begin
  if v_user_id is null then
    return;
  end if;

  select lc.cohort_number into v_division
  from public.leaderboard_cohorts lc
  where lc.user_id = v_user_id and lc.week_start = v_week;

  if v_division is null then
    return;
  end if;

  return query
  select
    lc.user_id,
    coalesce(p.display_name, 'Learner')::text,
    coalesce(wx.xp, 0)::int,
    row_number() over (order by coalesce(wx.xp, 0) desc, lc.assigned_at)::int,
    (lc.user_id = v_user_id),
    lc.cohort_number
  from public.leaderboard_cohorts lc
  join public.profiles p on p.id = lc.user_id
  left join public.weekly_xp wx
    on wx.user_id = lc.user_id and wx.week_start = v_week
  where lc.week_start = v_week
    and lc.cohort_number = v_division
  order by 4;
end;
$$;

revoke all on function public.get_league_standings() from public;
grant execute on function public.get_league_standings() to authenticated;

grant select on public.leaderboard_cohorts to authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.leaderboard_cohorts from authenticated, anon;

alter table public.leaderboard_cohorts enable row level security;
drop policy if exists "Players can read cohort membership" on public.leaderboard_cohorts;
create policy "Players can read cohort membership"
  on public.leaderboard_cohorts for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- 3. The daily challenge
-- ---------------------------------------------------------------------------
-- One set of questions per day, identical for everyone, so it is something
-- players can actually talk about. Generated on first request of the day rather
-- than by a scheduler, and chosen deterministically from the date so two
-- concurrent first-requests produce the same challenge.

drop function if exists public.ensure_daily_challenge(date);
create function public.ensure_daily_challenge(p_date date default current_date)
returns table (o_id uuid, o_challenge_date date, o_question_count int, o_reward_coins int, o_reward_xp int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing record;
  v_category uuid;
  v_questions uuid[];
  c_questions constant int := 5;
  c_coins constant int := 60;
  c_xp constant int := 50;
begin
  select dc.id as cid, dc.challenge_date as cdate,
         coalesce(array_length(dc.question_ids, 1), 0) as ccount,
         dc.reward_coins as ccoins, dc.reward_xp as cxp
    into v_existing
  from public.daily_challenges dc where dc.challenge_date = p_date;

  if found then
    return query select v_existing.cid, v_existing.cdate, v_existing.ccount,
                        v_existing.ccoins, v_existing.cxp;
    return;
  end if;

  -- Pick a category deterministically from the date, among those with enough
  -- published questions to fill a challenge.
  select c.id into v_category
  from public.categories c
  where (
    select count(*) from public.questions q
    where q.category_id = c.id and q.review_status = 'published'
  ) >= c_questions
  order by md5(c.id::text || p_date::text)
  limit 1;

  if v_category is null then
    -- Not enough published content anywhere yet. Better to have no challenge
    -- than one that cannot be completed.
    return;
  end if;

  select array_agg(q.id order by md5(q.id::text || p_date::text))
    into v_questions
  from (
    select q2.id
    from public.questions q2
    where q2.category_id = v_category and q2.review_status = 'published'
    order by md5(q2.id::text || p_date::text)
    limit c_questions
  ) q;

  insert into public.daily_challenges
    (challenge_date, category_id, question_ids, reward_coins, reward_xp)
  values (p_date, v_category, v_questions, c_coins, c_xp)
  on conflict (challenge_date) do nothing;

  return query
  select dc.id, dc.challenge_date, coalesce(array_length(dc.question_ids, 1), 0),
         dc.reward_coins, dc.reward_xp
  from public.daily_challenges dc
  where dc.challenge_date = p_date;
end;
$$;

revoke all on function public.ensure_daily_challenge(date) from public;
grant execute on function public.ensure_daily_challenge(date) to authenticated;

/**
 * Claim today's challenge reward.
 *
 * Guarded the same way the daily login is: the completion row is the lock, so a
 * double tap cannot pay twice. Deliberately does NOT verify that the player
 * answered the questions — see the note at the end of this file.
 */
create or replace function public.complete_daily_challenge_rpc()
returns table (success boolean, error text, coins_awarded int, xp_awarded int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge record;
  v_answered int;
begin
  if v_user_id is null then
    return query select false, 'You must be signed in.'::text, null::int, null::int;
    return;
  end if;

  select dc.* into v_challenge
  from public.daily_challenges dc
  where dc.challenge_date = current_date;

  if not found then
    return query select false, 'There is no challenge today.'::text, null::int, null::int;
    return;
  end if;

  if exists (
    select 1 from public.user_daily_challenge_completions c
    where c.user_id = v_user_id and c.daily_challenge_id = v_challenge.id
  ) then
    return query select false, 'Already completed today.'::text, null::int, null::int;
    return;
  end if;

  -- Every question in the set must have been answered today. Checked against
  -- `attempts`, which only submit_quiz_answer writes, so this cannot be claimed
  -- without actually playing.
  select count(distinct a.question_id) into v_answered
  from public.attempts a
  where a.user_id = v_user_id
    and a.question_id = any(v_challenge.question_ids)
    and a.created_at::date = current_date;

  if v_answered < coalesce(array_length(v_challenge.question_ids, 1), 0) then
    return query select false, 'Answer every question in today''s challenge first.'::text, null::int, null::int;
    return;
  end if;

  insert into public.user_daily_challenge_completions (user_id, daily_challenge_id)
  values (v_user_id, v_challenge.id)
  on conflict (user_id, daily_challenge_id) do nothing;

  update public.profiles p
     set coins = p.coins + v_challenge.reward_coins,
         total_xp = p.total_xp + v_challenge.reward_xp
   where p.id = v_user_id;

  return query select true, null::text, v_challenge.reward_coins, v_challenge.reward_xp;
end;
$$;

revoke all on function public.complete_daily_challenge_rpc() from public;
grant execute on function public.complete_daily_challenge_rpc() to authenticated;

grant select on public.daily_challenges to authenticated;
grant select on public.user_daily_challenge_completions to authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.daily_challenges from authenticated, anon;
revoke insert, update, delete, truncate, references, trigger
  on public.user_daily_challenge_completions from authenticated, anon;

-- ---------------------------------------------------------------------------
-- Residual / follow-ups
-- ---------------------------------------------------------------------------
-- a) Divisions are per-player counters, not populations. Two players in
--    division 3 are in the same standings table, which is right, but there is no
--    splitting when a division outgrows a comfortable size. Add cohort splitting
--    when any division exceeds roughly thirty players.
-- b) close_league_week only closes weeks that have ended, and is triggered by a
--    player's first activity of a new week. A player who never returns leaves
--    their last week unclosed, which affects nobody but means the table is not
--    self-completing. A weekly job would tidy this if one ever exists.
-- c) The daily challenge awards on completion of all five questions. XP for the
--    answers themselves is already paid by submit_quiz_answer, so the challenge
--    reward is a bonus on top rather than the only payment.
