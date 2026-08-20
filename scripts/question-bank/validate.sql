-- VALIDATE ONE CATEGORY. Replace REPLACE_SLUG below, then run.
-- A category is NOT done until this returns only 'tier_count ... ok' rows.
-- Verified against the live database 2026-08-20. Requires pg_trgm (installed).
--
-- Run after EVERY category, not at the end. The owner asked to be protected
-- from three failure modes and these are the mechanisms for them.

with cat as (select id from public.categories where slug = 'REPLACE_SLUG')

-- 1. Every tier must read exactly 20.
select 'tier_count' as check,
       t.id::text   as detail,
       count(q.id)::text as v,
       case when count(q.id) = 20 then 'ok' else 'SHORT' end as verdict
from public.rank_tiers t
left join public.questions q
  on q.tier = t.id and q.category_id = (select id from cat)
group by t.id

union all
-- 2. The same thing asked in different words. Threshold 0.5 per the handoff.
select 'near_duplicate',
       left(a.question_text, 60),
       round(similarity(a.question_text, b.question_text)::numeric, 3)::text,
       'FLAG'
from public.questions a
join public.questions b
  on a.category_id = b.category_id and a.id < b.id
where a.category_id = (select id from cat)
  and similarity(a.question_text, b.question_text) > 0.5

union all
-- 3. No correct answer may appear more than twice in a category.
select 'answer_repeated', ans, cnt::text, 'FLAG'
from (
  select (q.choices ->> q.correct_choice_index::int) as ans, count(*) as cnt
  from public.questions q
  where q.category_id = (select id from cat)
  group by 1 having count(*) > 2
) x

union all
-- 4. No opening stem more than four times ("Which name of", "How many", ...).
select 'stem_repeated', stem, cnt::text, 'FLAG'
from (
  select lower(substring(q.question_text from '^(\S+\s+\S+\s+\S+)')) as stem,
         count(*) as cnt
  from public.questions q
  where q.category_id = (select id from cat)
  group by 1 having count(*) > 4
) y

order by 1, 3 desc;
