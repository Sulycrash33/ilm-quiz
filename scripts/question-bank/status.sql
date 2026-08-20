-- WHERE AM I? Run this at the start of every session.
-- The first category with have < 180 is the one to work on.
-- Verified against the live database 2026-08-20.
--
--   mcp__Supabase__execute_sql(project_id="ziblpvwiqzpjnkqjwodl", query=<this file>)

select
  c.sort_order as "#",
  c.slug,
  coalesce(sum(tc.n), 0)       as have,
  180 - coalesce(sum(tc.n), 0) as short,
  string_agg(t.id::text, ',' order by t.id) filter (where tc.n < 20) as tiers_short
from public.categories c
cross join public.rank_tiers t
left join lateral (
  select count(*) as n
  from public.questions q
  where q.category_id = c.id and q.tier = t.id
) tc on true
group by c.sort_order, c.slug
order by c.sort_order;
