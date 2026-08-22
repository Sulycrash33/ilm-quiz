-- Award achievements the moment they are earned.
--
-- Until now the only place that turned a met criterion into a row in
-- `user_achievements` was `getProfileStats()`, which runs when someone opens
-- the profile, achievements, or challenges page. So a player could clear a
-- whole tier, earn three achievements, and be told about them days later —
-- or never, if they never opened that page. Thirteen rewards were seeded and
-- effectively dormant.
--
-- The evaluation moves here rather than being duplicated in the answer path,
-- because two copies of the criteria rules in two languages is exactly how
-- they drift apart. `getProfileStats()` now calls this and then reads back
-- what is stored, so the database is the single place that decides what has
-- been earned; TypeScript keeps only the progress-bar arithmetic, which is
-- display-only and cannot award anything.

create or replace function public.award_achievements()
returns table (
  o_slug        text,
  o_name        text,
  o_description text,
  o_icon        text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    return;
  end if;

  return query
  with stats as (
    select
      count(*)                                             as total_attempts,
      count(*) filter (where a.is_correct)                 as correct_count,
      case when count(*) = 0 then 0
           else round(100.0 * count(*) filter (where a.is_correct) / count(*))
      end                                                  as accuracy_pct,
      bool_or(a.used_ask_the_imam_hint)                    as used_lifeline_ever
    from attempts a
    where a.user_id = v_user
  ),
  -- Breadth and per-category counts both come off the same join, so a
  -- category with no rows simply does not appear — matching the TypeScript,
  -- where an absent key reads as zero.
  by_category as (
    select c.slug, count(*) as attempted
    from attempts a
    join questions q on q.id = a.question_id
    join categories c on c.id = q.category_id
    where a.user_id = v_user
    group by c.slug
  ),
  prof as (
    select p.total_xp, p.streak_count
    from profiles p
    where p.id = v_user
  ),
  -- Rank is derived from XP here exactly as the app derives it for display:
  -- the highest tier whose threshold has been passed. Reading
  -- `profiles.current_rank_id` instead would make the achievement depend on
  -- whether the sync trigger had fired yet.
  rank_now as (
    select coalesce(max(rt.sort_order), 0) as sort_order
    from rank_tiers rt, prof
    where rt.min_xp <= prof.total_xp
  ),
  earned as (
    select ach.id, ach.slug, ach.name, ach.description, ach.icon
    from achievements ach, stats s, prof p, rank_now r
    where not exists (
            select 1 from user_achievements ua
            where ua.user_id = v_user and ua.achievement_id = ach.id
          )
      and case ach.criteria->>'type'
            when 'attempts_count' then
              s.total_attempts >= (ach.criteria->>'min')::bigint
            when 'correct_count' then
              s.correct_count >= (ach.criteria->>'min')::bigint
            when 'accuracy' then
              s.total_attempts >= (ach.criteria->>'min_attempts')::bigint
              and s.accuracy_pct >= (ach.criteria->>'min_pct')::numeric
            when 'category_breadth' then
              (select count(*) from by_category) >= (ach.criteria->>'min_categories')::bigint
            when 'category_count' then
              coalesce(
                (select bc.attempted from by_category bc
                 where bc.slug = ach.criteria->>'category_slug'), 0
              ) >= (ach.criteria->>'min')::bigint
            when 'used_lifeline' then
              coalesce(s.used_lifeline_ever, false)
            when 'streak' then
              p.streak_count >= (ach.criteria->>'min_days')::int
            when 'rank' then
              r.sort_order >= coalesce(
                (select rt.sort_order from rank_tiers rt
                 where rt.slug = ach.criteria->>'slug'), 32767
              )
            -- An unrecognised criteria type awards nothing. Failing closed
            -- matters: a typo in a seed must not hand every player a badge.
            else false
          end
  ),
  inserted as (
    insert into user_achievements (user_id, achievement_id)
    select v_user, e.id from earned e
    -- Concurrent calls are expected — the answer path and a profile page load
    -- can overlap — and the primary key makes the loser a no-op rather than
    -- an error.
    on conflict (user_id, achievement_id) do nothing
    returning achievement_id
  )
  select e.slug, e.name, e.description, e.icon
  from inserted i
  join earned e on e.id = i.achievement_id
  order by e.name;
end;
$$;

comment on function public.award_achievements() is
  'Evaluates every achievement criterion for the calling user, stores the newly met ones, and returns only those newly stored. Safe to call on every answer: it returns an empty set when nothing new was earned.';

-- Postgres grants EXECUTE to PUBLIC by default, and Supabase's default
-- privileges grant to `anon` directly, so both have to be revoked before the
-- grant to `authenticated` means anything. Same pattern as migration 0013.
revoke all on function public.award_achievements() from public, anon;
grant execute on function public.award_achievements() to authenticated;
