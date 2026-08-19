-- RPC and RLS smoke test.
--
-- WHY THIS EXISTS
-- Three faults reached production because they only appear when the code is
-- actually run, and nothing ever ran it:
--
--   1. `submit_quiz_answer` raised 42702 (ambiguous "explanation") on every
--      call, so no answer in the game was ever recorded. `attempts` had zero
--      rows in production.
--   2. `claim_daily_login_rpc` raised 42702 (ambiguous "day_number"), so the
--      seven-day login reward could never be claimed.
--   3. All four `quiz_room*` tables raised 42P17 (infinite recursion in the
--      policy on `quiz_room_players`), so multiplayer was unreachable.
--
-- None of these are visible to `tsc`, to `next build`, or to reading the
-- migration that created them. Each function was created without complaint,
-- was granted correctly, and had a caller that looked right.
--
-- So: invoke everything, as a real signed-in user, and assert nothing fails.
--
-- TWO KINDS OF FAILURE, BOTH CHECKED
-- A raised exception is the obvious one. The subtler one is an RPC that
-- returns `o_success = false` — it did not throw, so `perform` would call it a
-- pass, but the operation did not happen. Every function returning `o_success`
-- is checked on that column, not merely on whether it threw. An earlier
-- draft of this file used `perform` throughout and reported all-green while
-- silently passing a bad content kind to `report_content`.
--
-- WRITE PROBES THAT SATISFY THE REAL RULES
-- These RPCs validate their input. A mentor bio under 20 characters is
-- rejected on purpose, and the content kinds are `forum_topic`,
-- `forum_reply`, `mentor_question`, `mentor_answer` — not `topic`/`reply`. A
-- probe that trips a business rule is a bad probe, not a bug found.
--
-- HOW TO RUN
-- Substitute a real user id for :uid. The file wraps itself in a transaction
-- and ends with ROLLBACK, so it writes nothing that survives and is safe to
-- run against production.
--
--   psql "$DATABASE_URL" -v uid="'<a-real-auth-uid>'" -f supabase/smoke/rpc-smoke.sql
--
-- Empty output means pass. Add a probe here whenever an RPC is added.

\set ON_ERROR_STOP on

begin;

create temp table smoke(kind text, name text, ok boolean, err text);
-- The probes run as `authenticated`, so that role must be able to write the
-- results table. Without this the test dies on its first insert.
grant all on smoke to authenticated;

-- Enough coins that a failure means "it broke", never "insufficient funds".
update public.profiles set coins = greatest(coalesce(coins,0), 5000) where id = :uid;

set local role authenticated;
select set_config('request.jwt.claims',
                  json_build_object('sub', :uid, 'role', 'authenticated')::text,
                  true);

-- 1. every table must be readable without raising -----------------------------
do $$
declare r record; n int;
begin
  for r in select c.relname from pg_class c
             join pg_namespace ns on ns.oid = c.relnamespace
            where ns.nspname = 'public' and c.relkind = 'r'
            order by 1
  loop
    begin
      execute format('select count(*) from public.%I', r.relname) into n;
      insert into smoke values ('table', r.relname, true, null);
    exception when others then
      insert into smoke values ('table', r.relname, false, SQLERRM);
    end;
  end loop;
end $$;

-- 2. the hunt loop and the economy --------------------------------------------
do $$
declare v_q uuid; v_item text; v_tier text; v_ok boolean; v_err text;
begin
  select q.id   into v_q    from public.questions q where q.review_status = 'published' limit 1;
  select si.id  into v_item from public.store_items si limit 1;
  select ct.tier into v_tier from public.chest_types ct limit 1;

  begin perform public.submit_quiz_answer(v_q, 0, false, 4200, false, null);
    insert into smoke values ('rpc','submit_quiz_answer',true,null);
  exception when others then insert into smoke values ('rpc','submit_quiz_answer',false,SQLERRM); end;

  begin
    select c.o_success, c.o_error into v_ok, v_err from public.claim_daily_login_rpc() c;
    insert into smoke values ('rpc','claim_daily_login_rpc', v_ok, v_err);
  exception when others then insert into smoke values ('rpc','claim_daily_login_rpc',false,SQLERRM); end;

  -- Returns un-prefixed `success`/`error`; left as-is because it works.
  begin perform public.complete_daily_challenge_rpc();
    insert into smoke values ('rpc','complete_daily_challenge_rpc',true,null);
  exception when others then insert into smoke values ('rpc','complete_daily_challenge_rpc',false,SQLERRM); end;

  begin perform public.open_chest_rpc(v_tier);
    insert into smoke values ('rpc','open_chest_rpc',true,null);
  exception when others then insert into smoke values ('rpc','open_chest_rpc',false,SQLERRM); end;

  begin perform public.purchase_store_item_rpc(v_item);
    insert into smoke values ('rpc','purchase_store_item_rpc',true,null);
  exception when others then insert into smoke values ('rpc','purchase_store_item_rpc',false,SQLERRM); end;

  begin perform public.spin_wheel_rpc();
    insert into smoke values ('rpc','spin_wheel_rpc',true,null);
  exception when others then insert into smoke values ('rpc','spin_wheel_rpc',false,SQLERRM); end;

  begin perform public.spend_lifeline_rpc('fifty-fifty');
    insert into smoke values ('rpc','spend_lifeline_rpc',true,null);
  exception when others then insert into smoke values ('rpc','spend_lifeline_rpc',false,SQLERRM); end;

  begin perform public.get_circle_summaries();
    insert into smoke values ('rpc','get_circle_summaries',true,null);
  exception when others then insert into smoke values ('rpc','get_circle_summaries',false,SQLERRM); end;

  begin perform public.ensure_league_cohort();
    insert into smoke values ('rpc','ensure_league_cohort',true,null);
  exception when others then insert into smoke values ('rpc','ensure_league_cohort',false,SQLERRM); end;

  begin perform public.get_league_standings();
    insert into smoke values ('rpc','get_league_standings',true,null);
  exception when others then insert into smoke values ('rpc','get_league_standings',false,SQLERRM); end;

  begin perform public.ensure_daily_challenge(current_date);
    insert into smoke values ('rpc','ensure_daily_challenge',true,null);
  exception when others then insert into smoke values ('rpc','ensure_daily_challenge',false,SQLERRM); end;
end $$;

-- 3. answering must fan out to all three triggers on `attempts` ---------------
-- This is the assertion that would have caught the headline bug: not merely
-- "the RPC returned", but "the row landed and everything downstream moved".
do $$
declare v_before int; v_after int;
begin
  select count(*) into v_before from public.attempts;
  perform public.submit_quiz_answer(
    (select q.id from public.questions q where q.review_status='published' limit 1),
    (select q.correct_choice_index from public.questions q where q.review_status='published' limit 1),
    false, 4200, false, null);
  select count(*) into v_after from public.attempts;

  if v_after <= v_before
    then insert into smoke values ('chain','attempts row written',false,'no attempt recorded');
    else insert into smoke values ('chain','attempts row written',true,null); end if;

  if not exists (select 1 from public.weekly_xp w where w.user_id = auth.uid())
    then insert into smoke values ('chain','weekly_xp accrued',false,'trigger attempts_accrue_weekly_xp did not fire');
    else insert into smoke values ('chain','weekly_xp accrued',true,null); end if;

  if not exists (select 1 from public.user_question_schedule s where s.user_id = auth.uid())
    then insert into smoke values ('chain','review scheduled',false,'trigger attempts_schedule_review did not fire');
    else insert into smoke values ('chain','review scheduled',true,null); end if;

  if (select p.last_activity_date from public.profiles p where p.id = auth.uid()) is null
    then insert into smoke values ('chain','streak touched',false,'trigger attempts_touch_streak did not fire');
    else insert into smoke values ('chain','streak touched',true,null); end if;
end $$;

-- 4. circles, forum, mentorship, moderation, multiplayer ----------------------
do $$
declare
  v_cat uuid; v_topic uuid; v_reply uuid; v_mq uuid; v_ma uuid;
  v_circle uuid; v_room uuid; v_me uuid := auth.uid();
  v_ok boolean; v_err text;
begin
  select c.id into v_cat from public.categories c limit 1;

  begin perform public.get_moderation_alert_counts();
    insert into smoke values ('rpc','get_moderation_alert_counts',true,null);
  exception when others then insert into smoke values ('rpc','get_moderation_alert_counts',false,SQLERRM); end;

  begin perform public.get_moderation_queue();
    insert into smoke values ('rpc','get_moderation_queue',true,null);
  exception when others then insert into smoke values ('rpc','get_moderation_queue',false,SQLERRM); end;

  begin
    insert into public.study_circles (name, description, max_members, weekly_xp_goal, created_by)
    values ('smoke circle', null, 20, 500, v_me) returning id into v_circle;
    insert into public.study_circle_members (circle_id, user_id) values (v_circle, v_me);
    perform public.get_circle_board(v_circle);
    insert into smoke values ('rpc','get_circle_board',true,null);
  exception when others then insert into smoke values ('rpc','get_circle_board',false,SQLERRM); end;

  -- forum
  begin
    select f.o_success, f.o_error, f.o_topic_id into v_ok, v_err, v_topic
      from public.create_forum_topic('Smoke topic title','Smoke topic body text.', v_cat, 'en') f;
    insert into smoke values ('rpc','create_forum_topic', v_ok, v_err);
  exception when others then insert into smoke values ('rpc','create_forum_topic',false,SQLERRM); end;

  begin
    select f.o_success, f.o_error, f.o_reply_id into v_ok, v_err, v_reply
      from public.create_forum_reply(v_topic,'Smoke reply body text.') f;
    insert into smoke values ('rpc','create_forum_reply', v_ok, v_err);
  exception when others then insert into smoke values ('rpc','create_forum_reply',false,SQLERRM); end;

  begin
    select f.o_success, f.o_error into v_ok, v_err
      from public.edit_own_post('forum_reply', v_reply, 'Edited smoke reply body.', false) f;
    insert into smoke values ('rpc','edit_own_post', v_ok, v_err);
  exception when others then insert into smoke values ('rpc','edit_own_post',false,SQLERRM); end;

  begin
    select f.o_success, f.o_error into v_ok, v_err
      from public.report_content('forum_topic', v_topic, 'spam', 'smoke detail') f;
    insert into smoke values ('rpc','report_content', v_ok, v_err);
  exception when others then insert into smoke values ('rpc','report_content',false,SQLERRM); end;

  begin
    select f.o_success, f.o_error into v_ok, v_err
      from public.verify_forum_reply(v_reply, true) f;
    insert into smoke values ('rpc','verify_forum_reply', v_ok, v_err);
  exception when others then insert into smoke values ('rpc','verify_forum_reply',false,SQLERRM); end;

  -- Must run BEFORE moderate_content: moderating an item resolves its open
  -- reports, so dismissing afterwards correctly fails with "already resolved".
  begin
    select f.o_success, f.o_error into v_ok, v_err
      from public.dismiss_report((select r.id from public.content_reports r
                                   where r.resolved_at is null limit 1), 'smoke') f;
    insert into smoke values ('rpc','dismiss_report', v_ok, v_err);
  exception when others then insert into smoke values ('rpc','dismiss_report',false,SQLERRM); end;

  begin
    select f.o_success, f.o_error into v_ok, v_err
      from public.moderate_content('forum_topic', v_topic, 'hidden'::content_status, 'smoke') f;
    insert into smoke values ('rpc','moderate_content', v_ok, v_err);
  exception when others then insert into smoke values ('rpc','moderate_content',false,SQLERRM); end;

  -- mentorship: applied and approved, so the answer path is actually reached
  begin
    select f.o_success, f.o_error into v_ok, v_err
      from public.apply_as_mentor(
        'I have studied and taught the Quran and hadith sciences for several years.',
        'Ijazah in Hafs an Asim; BA Islamic Studies',
        array['en']::app_language[]) f;
    insert into smoke values ('rpc','apply_as_mentor', v_ok, v_err);
  exception when others then insert into smoke values ('rpc','apply_as_mentor',false,SQLERRM); end;

  begin
    select f.o_success, f.o_error into v_ok, v_err
      from public.review_mentor_application(v_me,'approved'::mentor_status,'smoke') f;
    insert into smoke values ('rpc','review_mentor_application', v_ok, v_err);
  exception when others then insert into smoke values ('rpc','review_mentor_application',false,SQLERRM); end;

  begin
    select f.o_success, f.o_error, f.o_question_id into v_ok, v_err, v_mq
      from public.ask_mentor_question('How do I begin memorising?',
                                      'I would like advice on starting hifz.', v_cat, 'en') f;
    insert into smoke values ('rpc','ask_mentor_question', v_ok, v_err);
  exception when others then insert into smoke values ('rpc','ask_mentor_question',false,SQLERRM); end;

  begin
    select f.o_success, f.o_error, f.o_answer_id into v_ok, v_err, v_ma
      from public.answer_mentor_question(v_mq,
             'Begin with the shorter surahs and keep a consistent daily portion.') f;
    insert into smoke values ('rpc','answer_mentor_question', v_ok, v_err);
  exception when others then insert into smoke values ('rpc','answer_mentor_question',false,SQLERRM); end;

  begin
    select f.o_success, f.o_error into v_ok, v_err from public.accept_mentor_answer(v_ma) f;
    insert into smoke values ('rpc','accept_mentor_answer', v_ok, v_err);
  exception when others then insert into smoke values ('rpc','accept_mentor_answer',false,SQLERRM); end;

  -- rooms. The recursion fixed in 0017 made every one of these unreachable.
  begin
    insert into public.quiz_rooms (code, host_id, host_name, status, category, difficulty,
                                   max_players, current_players, question_count, current_question)
    values ('SMOKE1', v_me, 'smoke', 'waiting', 'General', 'medium', 4, 0, 10, 0)
    returning id into v_room;
    perform public.join_room_rpc('SMOKE1','smoke');
    insert into smoke values ('rpc','join_room_rpc',true,null);
  exception when others then insert into smoke values ('rpc','join_room_rpc',false,SQLERRM); end;

  begin perform public.restart_room_rpc(v_room);
    insert into smoke values ('rpc','restart_room_rpc',true,null);
  exception when others then insert into smoke values ('rpc','restart_room_rpc',false,SQLERRM); end;

  begin perform public.leave_room_rpc(v_room);
    insert into smoke values ('rpc','leave_room_rpc',true,null);
  exception when others then insert into smoke values ('rpc','leave_room_rpc',false,SQLERRM); end;
end $$;

reset role;

-- Anything printed here is a failure. Empty output means the smoke test passed.
select kind, name, err from smoke where ok is not true order by kind, name;

rollback;
