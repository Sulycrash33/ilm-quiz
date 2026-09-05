-- ---------------------------------------------------------------------------
-- 0051 — A reclaim that can actually be reached.
-- ---------------------------------------------------------------------------
--
-- `claim_translation_batch` has always been able to recover an abandoned
-- claim: a row left `in_progress` for more than ten minutes is picked up
-- alongside the queued ones. The recovery is real, it is tested, and on a
-- small queue it works exactly as intended.
--
-- On a large one it is unreachable, and 0048's own backfill is what exposed
-- it. The picked rows are ordered `by updated_at` alone, oldest first. A row
-- that has never been touched still carries the `updated_at` the backfill
-- stamped on it, while claiming a row *sets* `updated_at = now()`. So the
-- moment a claim is abandoned it sorts behind every row the backfill has not
-- yet reached — and with a batch of twelve it is not seen again until they
-- have all drained.
--
-- Measured against the live queue on 2026-09-05, not reasoned about: one row
-- abandoned at 2026-09-04 07:02 had **16,807 queued rows sorting ahead of
-- it**. At the rate the Gemini quota currently allows — about twenty a day —
-- that reclaim was roughly two years away. The row was not lost, which is
-- why nothing alerted; it was simply last in a very long line.
--
-- The fix is one clause. A stale claim is a row that has already been through
-- the gate once and fallen over, so it goes to the front rather than the
-- back:
--
--     order by (status = 'in_progress') desc, updated_at
--
-- The `where` above it already restricts `in_progress` to claims older than
-- ten minutes, so this can only ever promote a genuinely abandoned row, never
-- one a worker is holding right now. There are normally none, occasionally
-- one, and the ordering costs nothing when the set is empty.
--
-- ── Why the priority belongs this way round ──────────────────────────────
-- An abandoned claim has already spent an attempt. It is the one kind of row
-- that is quietly *degrading* rather than merely waiting: three abandonments
-- and it is `failed` for good. Serving it first means the three strikes are
-- spent over minutes, where a real fault shows up, instead of over years,
-- where nobody is watching. A queued row that waits another two minutes has
-- lost nothing at all.

create or replace function public.claim_translation_batch(p_limit integer default 20)
returns table(o_question_id uuid, o_locale app_language, o_text text, o_choices jsonb, o_explanation text)
language plpgsql
security definer
set search_path = public
as $function$
begin
  return query
  with picked as (
    select q.question_id, q.locale
      from public.translation_queue q
     where q.status = 'queued'
        or (q.status = 'in_progress' and q.claimed_at < now() - interval '10 minutes')
     -- Abandoned claims first. Claiming stamps `updated_at`, so without this
     -- an abandoned row sorts behind the entire untouched backlog.
     order by (q.status = 'in_progress') desc, q.updated_at
     limit greatest(1, least(coalesce(p_limit, 20), 100))
     for update skip locked
  ),
  claimed as (
    update public.translation_queue t
       set status = 'in_progress', claimed_at = now(), updated_at = now(),
           attempts = t.attempts + 1
      from picked p
     where t.question_id = p.question_id and t.locale = p.locale
     returning t.question_id, t.locale
  )
  select c.question_id, c.locale, qs.question_text, qs.choices, qs.explanation
    from claimed c
    join public.questions qs on qs.id = c.question_id;
end;
$function$;

revoke all on function public.claim_translation_batch(integer) from public, anon, authenticated;
grant execute on function public.claim_translation_batch(integer) to service_role;
