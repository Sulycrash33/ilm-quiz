-- Migration 0034: A lifeline spend is recorded against the question it bought.
--
-- WHAT WAS WRONG
-- `submit_quiz_answer` took `p_double_points boolean` from the caller and
-- multiplied the award by two whenever it was true. Nothing checked that the
-- player owned the power-up, had paid for it, or had spent it on this
-- question. A single crafted call to the RPC took 2x XP for free, forever.
--
-- The parameter for the honest version was already there and dead:
-- `p_lifeline_used text` was declared and never read once in the body. The
-- reason it could not be read is that there was nothing to read it against —
-- `spend_lifeline_rpc` charged coins or decremented the shelf and wrote no
-- record at all. A spend left no trace, so no grader could ever confirm one.
--
-- This is the standing rule of the schema, stated in 0006, 0030 and 0033: a
-- multiplier, a price or a reward must never arrive as an argument from a
-- player. Double points was the last place it still did.
--
-- WHAT THIS DOES
-- `lifeline_spends` is that missing trace: one row per lifeline, per player,
-- per question, written only inside `spend_lifeline_rpc` after the charge has
-- actually succeeded. `submit_quiz_answer` then stops believing the client and
-- asks the ledger instead — and consumes the row, so one purchase pays once.
--
-- Both client-supplied parameters are removed rather than ignored. A dead
-- parameter is how this hole survived long enough to be shipped; leaving
-- `p_double_points` in place, unread, would leave the same trap for the next
-- reader. `p_used_hint` goes with them: with ask-the-imam in the ledger, the
-- attempt's hint flag is derived from the spend rather than from what the
-- client says about itself.
--
-- Changing a function's parameter list needs `drop function` first. A bare
-- `create or replace` would have created an *overload* and left the vulnerable
-- version reachable beside the fixed one — the trap migration 0030 fell into.

create table if not exists public.lifeline_spends (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  lifeline_id text not null references public.lifeline_prices(id),
  question_id uuid not null references public.questions(id) on delete cascade,
  run_id      uuid references public.game_runs(id) on delete set null,
  created_at  timestamptz not null default now(),
  -- Set when a grader has honoured this spend. A double-points row pays once
  -- and once only; re-answering the same question does not pay again.
  consumed_at timestamptz
);

-- A lifeline is bought at most once for a given question. Without this, two
-- taps racing each other would buy two rows and the second would sit unspent,
-- ready to double a later answer to the same question.
create unique index if not exists lifeline_spends_once
  on public.lifeline_spends (user_id, question_id, lifeline_id);

create index if not exists lifeline_spends_unconsumed
  on public.lifeline_spends (user_id, question_id)
  where consumed_at is null;

alter table public.lifeline_spends enable row level security;

-- Readable by its owner, writable by nobody. As with `admin_audit_log` in
-- 0032, the absence of an insert policy is the point: rows arrive only through
-- the SECURITY DEFINER function below, so a spend cannot be forged by a direct
-- PostgREST call the way a `p_double_points => true` argument could be.
drop policy if exists "lifeline_spends_select_own" on public.lifeline_spends;
create policy "lifeline_spends_select_own"
  on public.lifeline_spends for select
  using (auth.uid() = user_id);

comment on table public.lifeline_spends is
  'One row per lifeline bought for one question. The only evidence a grader '
  'accepts that a power-up was paid for; see migration 0034.';


-- ---------------------------------------------------------------------------
-- spend_lifeline_rpc: charge, then record what the charge bought.
-- ---------------------------------------------------------------------------
drop function if exists public.spend_lifeline_rpc(text);

create function public.spend_lifeline_rpc(
  p_lifeline_id text,
  p_question_id uuid default null,
  p_run_id      uuid default null
)
returns table(success boolean, error text, new_balance integer, cost integer,
              paid_with text, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_cost int;
  v_item_id text;
  v_remaining int;
  v_new_balance int;
  v_paid_with text;
  v_charged int;
begin
  if v_user_id is null then
    return query select false, 'You must be signed in.'::text, null::int, null::int, null::text, null::int;
    return;
  end if;

  select lp.cost into v_cost
  from public.lifeline_prices lp
  where lp.id = p_lifeline_id and lp.enabled;

  if v_cost is null then
    return query select false, 'Unknown lifeline.'::text, null::int, null::int, null::text, null::int;
    return;
  end if;

  -- A lifeline is bought for a *question*. Refusing an unknown or unpublished
  -- one keeps the ledger meaningful: a row here is a claim that this question
  -- was played, and the grader trusts it.
  if p_question_id is not null
     and not exists (
       select 1 from public.questions q
        where q.id = p_question_id and q.review_status = 'published'
     ) then
    return query select false, 'Question not found.'::text, null::int, null::int, null::text, null::int;
    return;
  end if;

  -- Already bought for this question: return the spend as it stands rather
  -- than charging twice. The unique index would reject the second row anyway;
  -- this turns a raised exception into the honest answer.
  if p_question_id is not null
     and exists (
       select 1 from public.lifeline_spends s
        where s.user_id = v_user_id
          and s.question_id = p_question_id
          and s.lifeline_id = p_lifeline_id
     ) then
    select p.coins into v_new_balance from public.profiles p where p.id = v_user_id;
    return query select true, null::text, v_new_balance, 0, 'already'::text, 0;
    return;
  end if;

  -- Spend from the shelf before the wallet. The decrement is guarded by
  -- `quantity > 0` in its own statement, so two taps cannot both consume the
  -- last one.
  select si.id into v_item_id
  from public.store_items si
  where si.lifeline_id = p_lifeline_id
  limit 1;

  if v_item_id is not null then
    update public.user_inventory ui
       set quantity = ui.quantity - 1,
           updated_at = now()
     where ui.user_id = v_user_id
       and ui.item_id = v_item_id
       and ui.quantity > 0
    returning ui.quantity into v_remaining;
  end if;

  if v_remaining is not null then
    select p.coins into v_new_balance from public.profiles p where p.id = v_user_id;
    v_paid_with := 'inventory';
    v_charged := 0;
  else
    update public.profiles p
       set coins = p.coins - v_cost
     where p.id = v_user_id
       and p.coins >= v_cost
    returning p.coins into v_new_balance;

    if v_new_balance is null then
      select p.coins into v_new_balance from public.profiles p where p.id = v_user_id;
      return query select false, 'Not enough coins.'::text, v_new_balance, v_cost, null::text, 0;
      return;
    end if;

    v_paid_with := 'coins';
    v_charged := v_cost;
    v_remaining := 0;
  end if;

  -- The charge succeeded; record what it bought. This runs in the same
  -- transaction as the charge, so a failure here refunds the coins by
  -- rolling them back rather than leaving a player poorer with nothing.
  if p_question_id is not null then
    insert into public.lifeline_spends (user_id, lifeline_id, question_id, run_id)
    values (v_user_id, p_lifeline_id, p_question_id, p_run_id);
  end if;

  return query select true, null::text, v_new_balance, v_charged, v_paid_with, v_remaining;
end;
$$;

revoke all on function public.spend_lifeline_rpc(text, uuid, uuid) from public, anon;
grant execute on function public.spend_lifeline_rpc(text, uuid, uuid) to authenticated;


-- ---------------------------------------------------------------------------
-- submit_quiz_answer: the multiplier is read from the ledger, not the caller.
-- ---------------------------------------------------------------------------
drop function if exists public.submit_quiz_answer(uuid, integer, boolean, integer, boolean, text, uuid);

create function public.submit_quiz_answer(
  p_question_id     uuid,
  p_choice_index    integer,
  p_response_time_ms integer default null,
  p_run_id          uuid default null
)
returns table(o_correct boolean, o_correct_index integer, o_explanation text,
              o_citation text, o_xp_earned integer, o_streak_multiplier integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_question record;
  v_streak int := 0;
  v_correct boolean;
  v_multiplier int;
  v_base_xp int;
  v_xp int;
  v_mode_num int := 1;
  v_mode_den int := 1;
  v_double boolean := false;
  v_used_hint boolean := false;
  rec record;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to answer.';
  end if;
  if p_choice_index is null or p_choice_index < 0 then
    raise exception 'Invalid answer.';
  end if;

  select q.id, q.choices, q.correct_choice_index, q.explanation,
         q.citation_reference, q.difficulty, q.tier, q.review_status
    into v_question
    from public.questions q
   where q.id = p_question_id;

  if not found then raise exception 'Question not found.'; end if;
  if v_question.review_status <> 'published' then
    raise exception 'This question is not available.';
  end if;

  if p_choice_index >= jsonb_array_length(v_question.choices) then
    raise exception 'Invalid answer.';
  end if;

  if p_run_id is not null then
    select r.xp_numerator, r.xp_denominator
      into v_mode_num, v_mode_den
      from public.game_runs g
      join public.game_mode_rules r on r.mode = g.mode
     where g.id = p_run_id
       and g.user_id = v_user_id
       and g.ended_at is null;

    if not found then
      v_mode_num := 1;
      v_mode_den := 1;
    end if;
  end if;

  -- Whether the hint was used is a fact about a purchase, not a claim about
  -- one. Read before the double-points row is consumed so the two are
  -- independent.
  select exists (
    select 1 from public.lifeline_spends s
     where s.user_id = v_user_id
       and s.question_id = p_question_id
       and s.lifeline_id = 'ask-imam'
  ) into v_used_hint;

  -- The double-points row is consumed here, atomically. `for update` is
  -- implied by the update itself: two answers racing on one question cannot
  -- both find the row unconsumed, so a single purchase can only ever pay once.
  update public.lifeline_spends s
     set consumed_at = now()
   where s.user_id = v_user_id
     and s.question_id = p_question_id
     and s.lifeline_id = 'double-points'
     and s.consumed_at is null
  returning true into v_double;

  v_double := coalesce(v_double, false);

  for rec in
    select a.is_correct
      from public.attempts a
     where a.user_id = v_user_id
     order by a.created_at desc
     limit 20
  loop
    exit when not rec.is_correct;
    v_streak := v_streak + 1;
  end loop;

  v_correct := (p_choice_index = v_question.correct_choice_index);
  if v_correct then
    v_multiplier := least(floor(v_streak / 3)::int + 1, 3);
  else
    v_multiplier := 1;
  end if;

  if not v_correct then
    v_base_xp := 0;
  else
    v_base_xp := round((20 + 5 * least(greatest(coalesce(v_question.tier, 1), 1), 9)) / 3.0);
  end if;

  v_xp := v_base_xp * v_multiplier * (case when v_double then 2 else 1 end);
  v_xp := round((v_xp * v_mode_num)::numeric / v_mode_den);

  insert into public.attempts (
    user_id, question_id, is_correct, xp_earned, response_time_ms, used_ask_the_imam_hint
  )
  values (
    v_user_id, v_question.id, v_correct, v_xp, p_response_time_ms, v_used_hint
  );

  update public.profiles p
     set coins      = coalesce(p.coins, 0) + v_xp,
         total_xp   = coalesce(p.total_xp, 0) + v_xp,
         high_score = greatest(coalesce(p.high_score, 0), coalesce(p.total_xp, 0) + v_xp)
   where p.id = v_user_id;

  return query
    select v_correct,
           v_question.correct_choice_index::int,
           v_question.explanation,
           v_question.citation_reference,
           v_xp,
           v_multiplier;
end;
$$;

revoke all on function public.submit_quiz_answer(uuid, integer, integer, uuid) from public, anon;
grant execute on function public.submit_quiz_answer(uuid, integer, integer, uuid) to authenticated;


-- ---------------------------------------------------------------------------
-- A deploy-window shim, and why it is not a hole.
-- ---------------------------------------------------------------------------
-- The migration is applied to the live database before the client that calls
-- the new signature is deployed. Without this, every answer in production
-- fails with "function not found" for as long as that gap lasts.
--
-- So the old seven-argument call still resolves — but it *discards* the two
-- arguments that were the vulnerability and delegates to the function above,
-- which reads the ledger instead. Calling the old signature with
-- `p_double_points => true` now earns exactly single XP. The shim is a
-- compatibility surface, not a second grader: there is one place XP is
-- decided, and this is not it.
--
-- Remove it once production runs the deployed client. It is listed in
-- docs/HANDOFF.md as an open item so it does not quietly become permanent.
create function public.submit_quiz_answer(
  p_question_id      uuid,
  p_choice_index     integer,
  p_used_hint        boolean,
  p_response_time_ms integer,
  p_double_points    boolean,
  p_lifeline_used    text,
  p_run_id           uuid
)
returns table(o_correct boolean, o_correct_index integer, o_explanation text,
              o_citation text, o_xp_earned integer, o_streak_multiplier integer)
language sql
security invoker
set search_path = public
as $$
  select * from public.submit_quiz_answer(p_question_id, p_choice_index,
                                          p_response_time_ms, p_run_id);
$$;

comment on function public.submit_quiz_answer(uuid, integer, boolean, integer, boolean, text, uuid) is
  'Deploy-window compatibility only. Ignores p_used_hint, p_double_points and '
  'p_lifeline_used; the ledger decides. Drop once the client is deployed. '
  'See migration 0034.';

revoke all on function public.submit_quiz_answer(uuid, integer, boolean, integer, boolean, text, uuid) from public, anon;
grant execute on function public.submit_quiz_answer(uuid, integer, boolean, integer, boolean, text, uuid) to authenticated;

-- No shim is needed for `spend_lifeline_rpc`: the new signature's two extra
-- parameters default to null, so an old client's single-argument call still
-- resolves to it — and records no ledger row, which means the lifeline it buys
-- earns nothing. Failing closed is the whole point. Adding a one-argument
-- overload beside it would have made that call *ambiguous* and broken it
-- outright, which is the 0030 trap wearing the opposite face.
