-- Count category progress in the database instead of in the browser.
--
-- `getCategoriesWithProgress` used to fetch every published question's
-- `category_id` and tally them in JavaScript. PostgREST caps a response at
-- 1,000 rows, so with 5,220 published questions it silently returned the
-- first 1,000 — six categories got a count and the other twenty-three got
-- zero, which the grid renders as "Coming soon". The bank was complete the
-- whole time; only the tally was truncated.
--
-- The same bug was waiting in the answered tally: it read every one of the
-- caller's `attempts` rows. Invisible with one account and 5,220 questions
-- in front of it, wrong for any player who answers more than a thousand.
--
-- Counting here removes the cap from both: aggregates are computed over the
-- whole table and only one row per category crosses the wire.
--
-- `security invoker` is deliberate. This reads `questions` and `attempts`,
-- both of which carry row level policies, and those policies should apply to
-- whoever is calling. There is nothing here that needs to bypass them, so it
-- does not — which is why this function needs no internal permission check of
-- its own. It is still taken off the public API below: `/quiz` is behind auth,
-- so `authenticated` is the only role that has any business calling it.

create or replace function public.category_progress()
returns table (
  category_id uuid,
  published_count integer,
  answered_count integer
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    c.id,
    count(distinct q.id) filter (where q.review_status = 'published')::integer,
    count(distinct a.question_id) filter (where q.review_status = 'published')::integer
  from public.categories c
  left join public.questions q
    on q.category_id = c.id
  left join public.attempts a
    on a.question_id = q.id
   and a.user_id = auth.uid()
  group by c.id
$$;

revoke all on function public.category_progress() from public, anon;
grant execute on function public.category_progress() to authenticated;
