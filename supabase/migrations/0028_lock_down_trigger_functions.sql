-- Take the trigger functions off the public API.
--
-- Every one of these seven is a trigger function: it returns `trigger`, reads
-- `new`/`old`, and exists only to be fired by the table it is attached to.
-- None of them is meant to be callable by a client. But Postgres grants
-- EXECUTE to PUBLIC on every new function, and Supabase's default privileges
-- grant to `anon` and `authenticated` on top of that, so all seven were
-- exposed at `/rest/v1/rpc/<name>` — and `sync_rank_from_xp` was reachable
-- without signing in at all.
--
-- The practical risk was low: PostgREST cannot supply a trigger context, so a
-- direct call raises "trigger functions can only be called as triggers"
-- (0A000) before any body runs. This is about surface, not a live hole — an
-- endpoint that exists, names an internal function, and can never do anything
-- useful is a thing to remove, not to keep explaining.
--
-- Revoking EXECUTE does not affect the triggers themselves. A trigger fires
-- with the privileges of the statement that fired it and does not consult
-- EXECUTE grants on its function, which is why these are safe to close and
-- should have been closed when they were written.

revoke all on function public.sync_rank_from_xp()               from public, anon, authenticated;
revoke all on function public.accrue_weekly_xp()                from public, anon, authenticated;
revoke all on function public.handle_new_user()                 from public, anon, authenticated;
revoke all on function public.refresh_forum_topic_counters()    from public, anon, authenticated;
revoke all on function public.refresh_mentor_question_counters() from public, anon, authenticated;
revoke all on function public.schedule_question_review()        from public, anon, authenticated;
revoke all on function public.touch_streak_on_attempt()         from public, anon, authenticated;
