-- Give questions a rank tier.
--
-- The nine ranks — Mubtadi, Talib, Hafiz, Faqih, Muhaddith, Mufassir, Shaykh,
-- Imam, Mujaddid — already existed as `rank_tiers` and as a seeker's own
-- progression, but questions only carried `difficulty` (easy/medium/hard).
-- Three buckets cannot express nine levels, so a Mujaddid and a Talib were
-- being asked from the same pool of "hard" questions.
--
-- `tier` is that missing dimension: which rank a question is pitched at.
--
-- ON THE BACKFILL, AND WHY IT IS MARKED AS A GUESS
-- Existing questions are placed at the centre of their old band — easy at
-- tier 2, medium at 5, hard at 8. That is an estimate, not an authored
-- judgement: nothing in the data says whether a given "hard" question is
-- Shaykh-level or Mujaddid-level. Silently spreading 273 questions across nine
-- tiers would manufacture a precision the content does not have, and would
-- leave nobody able to tell which tiers were real.
--
-- So `tier_is_estimated` records the difference. Everything backfilled here is
-- `true`; setting a tier deliberately (via the admin screens) sets it `false`.
-- `get_tier_coverage()` reports both counts per bucket, so the gap between
-- "we have a question here" and "someone decided this is Faqih-level" stays
-- visible rather than being rounded away.
--
-- ON COVERAGE
-- Nine tiers across twenty-five categories is 225 buckets. At the time of
-- writing there are 273 published questions in total, so most buckets are
-- empty and the ones that are filled hold estimates. Question selection is
-- written to widen outward from the seeker's tier to the nearest populated one
-- rather than fail, so the game plays correctly today and simply gets sharper
-- as authored content arrives. `get_tier_coverage()` is what says where to
-- write next.

alter table public.questions
  add column if not exists tier smallint not null default 1
    references public.rank_tiers(id),
  add column if not exists tier_is_estimated boolean not null default true;

comment on column public.questions.tier is
  'Which of the nine ranks this question is pitched at. See rank_tiers.';
comment on column public.questions.tier_is_estimated is
  'True while the tier is a backfilled guess from the old easy/medium/hard band. Set false when a reviewer sets the tier deliberately.';

-- Band centres, not a spread: see the note above.
update public.questions
   set tier = case difficulty
                when 'easy'   then 2
                when 'medium' then 5
                when 'hard'   then 8
                else 5
              end,
       tier_is_estimated = true;

-- The hot path: "published questions in this category at or near this tier".
create index if not exists questions_category_tier_published_idx
  on public.questions (category_id, tier)
  where review_status = 'published';

/**
 * Where the content is, and where it is not.
 *
 * One row per (category, tier) — all 225, including the empty ones, because
 * the empty ones are the point. `o_authored` counts only questions whose tier
 * someone actually decided.
 */
drop function if exists public.get_tier_coverage();
create function public.get_tier_coverage()
returns table (
  o_category_id uuid,
  o_category_slug text,
  o_category_name text,
  o_tier smallint,
  o_tier_name text,
  o_published integer,
  o_authored integer
)
language sql
stable
security definer
set search_path to 'public'
as $$
  select c.id,
         c.slug,
         c.name,
         rt.id::smallint,
         rt.name,
         count(q.id) filter (where q.review_status = 'published')::int,
         count(q.id) filter (where q.review_status = 'published'
                               and q.tier_is_estimated = false)::int
    from public.categories c
   cross join public.rank_tiers rt
    left join public.questions q
           on q.category_id = c.id
          and q.tier = rt.id
   group by c.id, c.slug, c.name, rt.id, rt.name, rt.sort_order
   order by c.name, rt.sort_order;
$$;

revoke execute on function public.get_tier_coverage() from public, anon;
grant  execute on function public.get_tier_coverage() to authenticated;
