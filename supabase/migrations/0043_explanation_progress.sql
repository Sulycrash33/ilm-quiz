-- Migration 0043: how far the explanations project has actually got.
--
-- A rewrite across 5,220 questions needs a number that says how much is done,
-- or it is impossible to tell a good session from a wasted one.
--
-- This exists as a function because the count cannot be expressed as a
-- PostgREST filter. The obvious attempt is `explanation.lt.300`, which is a
-- *lexicographic* comparison on text: it asks whether the explanation sorts
-- before the string "300", so an explanation beginning with a digit or a
-- capital letter matches and everything else does not. It would have produced
-- a confident, meaningless number. Length lives in SQL, so the count does too.
--
-- 300 characters is the line between the old register and the new one. The
-- explanations being replaced average 125; the rewrite targets 350 to 600.

create or replace function public.admin_explanation_progress()
returns table(
  o_total    bigint,
  o_short    bigint,
  o_rewritten bigint,
  o_pending  bigint,
  o_avg_chars integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*) filter (where q.review_status = 'published'),
    count(*) filter (where q.review_status = 'published'
                       and length(coalesce(q.explanation, '')) < 300),
    count(*) filter (where q.review_status = 'published'
                       and length(coalesce(q.explanation, '')) >= 300),
    count(*) filter (where q.explanation_draft is not null),
    coalesce(avg(length(coalesce(q.explanation, '')))
             filter (where q.review_status = 'published'), 0)::int
  from public.questions q
  where public.is_admin();
$$;

revoke all on function public.admin_explanation_progress() from public, anon;
grant execute on function public.admin_explanation_progress() to authenticated;
