-- A rank that means the bank, and a ring that means the app.
--
-- ── The complaint, and it was right ───────────────────────────────────────
-- **"I answered just five questions and I am at 31%, in a game that has
-- categories I haven't even opened. Which kind of logic is that?"**
--
-- Measured rather than argued:
--
--   published questions                                        10,466
--   XP for answering every one, correctly, once, without combo 156,528
--   XP for Mujaddid, the ninth and highest rank                 25,000
--
-- **The highest rank in the game arrived at about 16% of the app.** A player
-- could be Mujaddid — the reviver — with eight thousand questions unopened,
-- and from there the ladder said nothing at all. Talib, the *second* rank, sat
-- at 500 XP: roughly thirty-three questions out of ten thousand.
--
-- So five questions really was a quarter of a rank. The arithmetic was doing
-- exactly what it was told; what it was told was wrong. **The ladder was never
-- scaled against the content it claims to measure**, and nobody noticed
-- because until 2026-09-08 nobody had ever earned a point.
--
-- ── 1. The ladder, times six ──────────────────────────────────────────────
-- Mujaddid now lands at 150,000, which is ~96% of what the whole published
-- bank pays without combo — reachable, because combo pays up to 3x and nobody
-- answers everything, but only after real work. Every rank below keeps its
-- original proportion, so the shape of the climb is unchanged; only the scale
-- moves.
--
--   | rank      | was    | now     | ≈ questions |
--   |-----------|--------|---------|-------------|
--   | Mubtadi   |      0 |       0 |           0 |
--   | Talib     |    500 |   3,000 |        ~200 |
--   | Hafiz     |  1,500 |   9,000 |        ~600 |
--   | Faqih     |  3,000 |  18,000 |      ~1,200 |
--   | Muhaddith |  5,000 |  30,000 |      ~2,000 |
--   | Mufassir  |  8,000 |  48,000 |      ~3,200 |
--   | Shaykh    | 12,000 |  72,000 |      ~4,800 |
--   | Imam      | 18,000 | 108,000 |      ~7,200 |
--   | Mujaddid  | 25,000 | 150,000 |     ~10,000 |
--
-- Five questions is now about 5% of the first rank instead of a quarter of it.
--
-- **`src/lib/constants.ts` carries the same numbers and must be changed in the
-- same commit** — its own comment says `minPoints` MUST match `rank_tiers`,
-- and this is the first time anyone has had cause to move them.
--
-- ── 2. A ring that measures the app, not the points ───────────────────────
-- Rescaling alone would have left the deeper objection standing, and the owner
-- put it exactly: rank is *"a separate entity entirely to my progress in a
-- game that has categories"*. It is a points total. It has nothing to say
-- about twenty-nine subjects sitting untouched.
--
-- `levels_progress()` answers the question actually being asked: **how much of
-- this app have I worked through?** A level is one tier of one category, and
-- it is cleared when every published question in it has been answered
-- correctly at least once — which is not a new rule invented here but the one
-- `getCategoryLevels` has always used to unlock the next level. One
-- definition, now readable in one query instead of only per category.
--
-- **It is pinned to `pool = 'category'`**, and that pin is load-bearing for the
-- same reason `getCategoriesWithProgress` carries it: the thirteen arena
-- categories are organisational, never navigational, and counting their tiers
-- would put levels in the denominator that no player can ever open.
--
-- **On the denominator, which this project has a rule about.** "Never state the
-- size of the question bank" stands — this returns *levels*, not questions, and
-- the same paragraph that forbids the bank size explicitly permits the subject
-- count, because it says how wide the app is rather than where it stops. A
-- level count is the shape of the journey. It is also the only honest way to
-- answer "categories I haven't even opened", which is what was asked for.

update public.rank_tiers set min_xp = v.min_xp
  from (values
    ('mubtadi',        0),
    ('talib',      3000),
    ('hafiz',      9000),
    ('faqih',     18000),
    ('muhaddith', 30000),
    ('mufassir',  48000),
    ('shaykh',    72000),
    ('imam',     108000),
    ('mujaddid', 150000)
  ) as v(slug, min_xp)
 where public.rank_tiers.slug = v.slug;

-- The trigger from 0018 derives `current_rank_id` from `total_xp` on write, so
-- existing rows keep a rank the new ladder no longer justifies until something
-- touches them. Re-derived here rather than left to drift.
update public.profiles p
   set current_rank_id = (
     select r.id from public.rank_tiers r
      where r.min_xp <= coalesce(p.total_xp, 0)
      order by r.min_xp desc
      limit 1
   );

create or replace function public.levels_progress()
returns table(o_cleared integer, o_total integer)
language sql
stable
security definer
set search_path = public
as $function$
  with correct as (
    select distinct a.question_id
      from public.attempts a
     where a.user_id = auth.uid()
       and a.is_correct
  ),
  tiers as (
    select q.category_id,
           least(greatest(coalesce(q.tier, 1), 1), 9) as tier,
           count(*) as published,
           count(c.question_id) as correct_count
      from public.questions q
      left join correct c on c.question_id = q.id
     where q.review_status = 'published'
       -- The pin. Arena categories are organisational, never navigational;
       -- their tiers are not levels any player can open.
       and q.pool = 'category'
     group by 1, 2
  )
  select coalesce(count(*) filter (where correct_count >= published), 0)::integer,
         coalesce(count(*), 0)::integer
    from tiers;
$function$;

revoke all on function public.levels_progress() from public, anon;
grant execute on function public.levels_progress() to authenticated;

do $$
declare
  v_top int;
  v_talib int;
  v_total int;
begin
  select min_xp into v_top   from public.rank_tiers where slug = 'mujaddid';
  select min_xp into v_talib from public.rank_tiers where slug = 'talib';

  -- The bank pays ~156,528 without combo. A top rank far below that is the bug
  -- this migration exists to fix, so it must not come back.
  if v_top < 100000 then
    raise exception 'the highest rank is % XP, far below what the bank pays; it would be reached on a fraction of the app', v_top;
  end if;
  if v_talib < 2000 then
    raise exception 'the second rank is % XP, which is a handful of questions', v_talib;
  end if;

  select o_total into v_total from public.levels_progress();
  if coalesce(v_total, 0) = 0 then
    raise exception 'levels_progress() sees no levels at all';
  end if;
end $$;
