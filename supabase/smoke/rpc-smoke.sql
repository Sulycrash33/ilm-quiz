-- RPC and RLS smoke test.
--
-- WHY THIS EXISTS
-- Three separate faults reached production because they only appear when code
-- actually runs, and nothing ever ran it:
--
--   1. `submit_quiz_answer` raised 42702 (ambiguous "explanation") on every
--      call, so no answer in the game was ever recorded.
--   2. `claim_daily_login_rpc` raised 42702 (ambiguous "day_number"), so the
--      seven-day login reward could never be claimed.
--   3. All four `quiz_room*` tables raised 42P17 (infinite recursion in the
--      policy on `quiz_room_players`), so multiplayer was unreachable.
--
-- None of these are visible to `tsc`, to `next build`, or to reading the
-- migration that created them. Each function was created without complaint,
-- was granted correctly, and had a caller that looked right. They fail at
-- invocation, and only at invocation.
--
-- So: invoke everything, as a real signed-in user, and assert nothing raises.
--
-- HOW TO RUN
-- Substitute a real user id for :uid and run the whole file. It wraps itself
-- in a transaction and ends with ROLLBACK, so it writes nothing that survives
-- — safe against production. Any row in the final output is a failure.
--
--   psql "$DATABASE_URL" -v uid="'<a-real-auth-uid>'" -f supabase/smoke/rpc-smoke.sql
--
-- Add a probe here whenever a new SECURITY DEFINER RPC is added.

\set ON_ERROR_STOP on

begin;

create temp table smoke(kind text, name text, ok boolean, err text);

-- Give the account enough coins that a failure means "it raised", never
-- "insufficient funds". Rolled back with everything else.
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

-- 2. every player-facing RPC must be callable without raising -----------------
do $$
declare v_q uuid; v_item text; v_tier text;
begin
  select q.id  into v_q    from public.questions q where q.review_status = 'published' limit 1;
  select si.id into v_item from public.store_items si limit 1;
  select ct.tier into v_tier from public.chest_types ct limit 1;

  begin perform public.submit_quiz_answer(v_q, 0, false, 4200, false, null);
    insert into smoke values ('rpc','submit_quiz_answer',true,null);
  exception when others then insert into smoke values ('rpc','submit_quiz_answer',false,SQLERRM); end;

  begin perform public.claim_daily_login_rpc();
    insert into smoke values ('rpc','claim_daily_login_rpc',true,null);
  exception when others then insert into smoke values ('rpc','claim_daily_login_rpc',false,SQLERRM); end;

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
end $$;

-- 3. answering must actually fan out to the three triggers on `attempts` ------
do $$
declare v_before int; v_after int;
begin
  select count(*) into v_before from public.attempts;
  perform public.submit_quiz_answer(
    (select q.id from public.questions q where q.review_status='published' limit 1),
    (select q.correct_choice_index from public.questions q where q.review_status='published' limit 1),
    false, 4200, false, null);
  select count(*) into v_after from public.attempts;

  if v_after <= v_before then
    insert into smoke values ('chain','attempts row written',false,'no attempt recorded');
  else
    insert into smoke values ('chain','attempts row written',true,null);
  end if;

  if not exists (select 1 from public.weekly_xp w where w.user_id = auth.uid()) then
    insert into smoke values ('chain','weekly_xp accrued',false,'trigger attempts_accrue_weekly_xp did not fire');
  else
    insert into smoke values ('chain','weekly_xp accrued',true,null);
  end if;

  if not exists (select 1 from public.user_question_schedule s where s.user_id = auth.uid()) then
    insert into smoke values ('chain','review scheduled',false,'trigger attempts_schedule_review did not fire');
  else
    insert into smoke values ('chain','review scheduled',true,null);
  end if;

  if (select p.last_activity_date from public.profiles p where p.id = auth.uid()) is null then
    insert into smoke values ('chain','streak touched',false,'trigger attempts_touch_streak did not fire');
  else
    insert into smoke values ('chain','streak touched',true,null);
  end if;
end $$;

reset role;

-- Anything printed here is a failure. Empty output means the smoke test passed.
select kind, name, err from smoke where not ok order by kind, name;

rollback;
