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
--
-- Rows carrying choice_meta are exempt from THIS check and answer to check 2b
-- instead. Those are the da'if-format questions, where the stem must name the
-- collections the four narrations came from. Two such stems that both say
-- "from Sunan Abu Dawud and Sunan Ibn Majah ... which is weak" score ~0.6 on
-- trigram similarity while sharing not one narration between them. The stem is
-- not the content in that format; the four narrations are. Silencing this by
-- rewording the stems would have cost the player the source information and
-- taught the checker nothing, so the format gets its own check below.
select 'near_duplicate',
       left(a.question_text, 60),
       round(similarity(a.question_text, b.question_text)::numeric, 3)::text,
       'FLAG'
from public.questions a
join public.questions b
  on a.category_id = b.category_id and a.id < b.id
where a.category_id = (select id from cat)
  and a.choice_meta is null and b.choice_meta is null
  and similarity(a.question_text, b.question_text) > 0.5

union all
-- 2b. The real duplicate test for the da'if format: no narration may appear in
-- more than one question, and no two questions may carry the same set of four.
select 'daif_narration_reused', r, cnt::text, 'FLAG'
from (
  select jsonb_array_elements(q.choice_meta) ->> 'ref' as r, count(*) as cnt
  from public.questions q
  where q.category_id = (select id from cat) and q.choice_meta is not null
  group by 1 having count(*) > 1
) z

union all
-- 2c. Structural integrity of the da'if format: the answer must be the weak
-- one, and the citation must name it. A wrong index here is a factual error
-- about a scholar's grading, not a typo.
select 'daif_answer_not_weak', left(q.question_text, 60), q.citation_reference, 'FLAG'
from public.questions q
where q.category_id = (select id from cat) and q.choice_meta is not null
  and ((q.choice_meta -> q.correct_choice_index::int ->> 'g') is distinct from 'daif'
       or q.citation_reference is distinct from (q.choice_meta -> q.correct_choice_index::int ->> 'ref'))

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
-- 5. Answer-position skew. Choices are served to the player in stored order --
-- nothing in the app shuffles them (src/lib/quiz-service.ts reads `choices`
-- straight through; the only Math.random() near a question is the 50/50
-- lifeline picking which wrong answers to hide). So a category that parks the
-- answer at one index is beatable without knowing anything: the first five
-- categories authored in this pass sat at index 1 for about 90% of their
-- questions, which a player would have found within an evening. Fixed in bulk
-- by a deterministic rotation keyed on question id; this check is what stops it
-- recurring. Expect roughly 45 per index in a finished category of 180.
select 'answer_index_skew', idx::text, cnt::text, 'FLAG'
from (
  select q.correct_choice_index as idx, count(*) as cnt
  from public.questions q
  where q.category_id = (select id from cat)
  group by 1 having count(*) > 70
) w

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
