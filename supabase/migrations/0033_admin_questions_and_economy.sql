-- Migration 0033: The question console, and tuning the economy without a deploy.
--
-- WHAT WAS WRONG WITH THE QUESTION PAGE
-- `/admin/questions` selected every question with no limit and no pagination.
-- PostgREST caps an unbounded response at 1,000 rows, so an administrator saw
-- 1,000 of 5,220 and nothing said so — measured against the live endpoint:
--
--     content-range: 0-999/5220
--
-- This is the same cap that hid twenty-three categories until migration 0029,
-- back again on a different page. Counting and slicing in the database is the
-- fix in both cases.
--
-- WHY THE SCHOLAR COUNTER NEVER MOVED, AND THE TRAP IN FIXING IT
-- `approveQuestion` sets `review_status = 'published'` and records nothing
-- about who verified the content. All 5,220 questions are `published` /
-- `ai_drafted` and always have been.
--
-- The obvious fix is wrong and would have been expensive. `scholar_approved`
-- is a value of the `review_status` enum, so marking a reviewed question with
-- it looks natural — but `submit_quiz_answer` refuses any question whose
-- `review_status <> 'published'`, and so do the ladder and the category
-- counts. Moving questions to `scholar_approved` would have deleted them from
-- the playable bank one at a time, invisibly, in proportion to how much
-- review actually got done. The better the scholars worked, the emptier the
-- game would get.
--
-- `source_type` cannot carry it either: its check constraint permits only
-- 'human' and 'ai_drafted'.
--
-- So scholar approval gets its own two columns. A question stays `published`
-- and playable throughout, and the fact that a person vouched for it is
-- recorded separately, which is what it always was.
--
-- ON TAKING A PRICE AS AN ARGUMENT
-- The standing rule in this schema is that a multiplier, a price or a reward
-- must never arrive as an argument — migration 0006 fixed a store that took
-- its price from the caller, and 0030 moved mode multipliers onto a
-- server-created row for the same reason.
--
-- The economy setters below take exactly those numbers as arguments, and that
-- is not a contradiction: the rule is about the *player* naming a number that
-- pays them. These are the configuration surface itself — the place the
-- trusted value is authored — and they are reachable only by an administrator,
-- bounded so a typo cannot mint a fortune, and every change is written to the
-- audit log with its before and after. A player-facing RPC still may not take
-- a price, and none here does.

-- ---------------------------------------------------------------------------
-- Scholar approval, as its own fact
-- ---------------------------------------------------------------------------
alter table public.questions
  add column if not exists scholar_approved_at timestamptz,
  add column if not exists scholar_approved_by text;

create index if not exists questions_scholar_approved_idx
  on public.questions (scholar_approved_at)
  where scholar_approved_at is not null;

-- ---------------------------------------------------------------------------
-- The register of questions, sliced in the database
-- ---------------------------------------------------------------------------
create or replace function public.admin_list_questions(
  p_search      text default null,
  p_category_id uuid default null,
  p_tier        integer default null,
  p_status      text default null,
  p_source      text default null,
  p_limit       integer default 50,
  p_offset      integer default 0
)
returns table (
  o_id            uuid,
  o_question_text text,
  o_category      text,
  o_category_id   uuid,
  o_tier          smallint,
  o_difficulty    text,
  o_status        text,
  o_source_type   text,
  o_choices       jsonb,
  o_correct_index smallint,
  o_explanation   text,
  o_citation      text,
  o_scholar_ok    boolean,
  o_reviewed_at   timestamptz,
  o_created_at    timestamptz,
  o_total         bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_limit  integer := greatest(1, least(coalesce(p_limit, 50), 200));
  v_offset integer := greatest(0, coalesce(p_offset, 0));
  v_search text := nullif(btrim(coalesce(p_search, '')), '');
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  return query
    select
      q.id,
      q.question_text,
      c.name,
      q.category_id,
      q.tier,
      q.difficulty::text,
      q.review_status::text,
      q.source_type,
      q.choices,
      q.correct_choice_index,
      q.explanation,
      q.citation_reference,
      (q.scholar_approved_at is not null),
      q.reviewed_at,
      q.created_at,
      count(*) over ()
    from public.questions q
    left join public.categories c on c.id = q.category_id
    where (p_category_id is null or q.category_id = p_category_id)
      and (p_tier        is null or q.tier = p_tier::smallint)
      and (p_status      is null or q.review_status::text = p_status)
      and (p_source is null
           or (p_source = 'scholar' and q.scholar_approved_at is not null)
           or (p_source = 'unreviewed' and q.scholar_approved_at is null))
      and (
        v_search is null
        or q.question_text ilike '%' || v_search || '%'
        or q.explanation   ilike '%' || v_search || '%'
        or q.citation_reference ilike '%' || v_search || '%'
      )
    order by q.created_at desc, q.id
    limit v_limit offset v_offset;
end;
$$;

revoke all on function public.admin_list_questions(text, uuid, integer, text, text, integer, integer)
  from public, anon;
grant execute on function public.admin_list_questions(text, uuid, integer, text, text, integer, integer)
  to authenticated;

-- ---------------------------------------------------------------------------
-- What the console needs to build its filters
-- ---------------------------------------------------------------------------
-- One call for the whole shape of the bank: per category, per tier, and how
-- much of it a scholar has actually signed off. Counted here for the same
-- reason as everything else — an unbounded select would be capped.
create or replace function public.admin_question_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  return jsonb_build_object(
    'total', (select count(*) from public.questions),
    'by_status', (
      select coalesce(jsonb_object_agg(s, n), '{}'::jsonb)
      from (
        select review_status::text as s, count(*) as n
        from public.questions group by review_status
      ) x
    ),
    'by_source', (
      select coalesce(jsonb_object_agg(s, n), '{}'::jsonb)
      from (
        select source_type as s, count(*) as n
        from public.questions group by source_type
      ) x
    ),
    'categories', coalesce((
      select jsonb_agg(x order by x->>'name')
      from (
        select jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'total', count(q.id),
          'scholar_approved', count(q.id) filter (where q.scholar_approved_at is not null)
        ) as x
        from public.categories c
        left join public.questions q on q.category_id = c.id
        group by c.id, c.name
      ) s
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.admin_question_summary() from public, anon;
grant execute on function public.admin_question_summary() to authenticated;

-- ---------------------------------------------------------------------------
-- Moving a question through review
-- ---------------------------------------------------------------------------
-- `p_status` is restricted to the two states the console actually offers.
-- Anything else here would be a way to unpublish the bank by accident, and
-- there is no reason an admin screen needs to put a question back into draft.
create or replace function public.admin_set_question_status(
  p_question_id uuid,
  p_status      text default null,
  p_scholar_approved boolean default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_status  text;
  v_old_scholar timestamptz;
  v_text        text;
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  if p_status is not null and p_status not in ('published', 'rejected') then
    raise exception 'A question may only be published or rejected here.';
  end if;

  select q.review_status::text, q.scholar_approved_at, q.question_text
    into v_old_status, v_old_scholar, v_text
    from public.questions q where q.id = p_question_id;

  if not found then
    raise exception 'That question no longer exists.';
  end if;

  update public.questions
     set review_status = coalesce(p_status::review_status, review_status),
         scholar_approved_at = case
           when p_scholar_approved is null then scholar_approved_at
           when p_scholar_approved then now()
           else null
         end,
         scholar_approved_by = case
           when p_scholar_approved is null then scholar_approved_by
           when p_scholar_approved then auth.uid()::text
           else null
         end,
         reviewed_by = auth.uid()::text,
         reviewed_at = now(),
         updated_at  = now()
   where id = p_question_id;

  perform public.log_admin_action(
    'question.review', 'question', p_question_id::text, left(v_text, 120),
    jsonb_build_object(
      'status_from', v_old_status,
      'status_to', coalesce(p_status, v_old_status),
      'scholar_from', (v_old_scholar is not null),
      'scholar_to', coalesce(p_scholar_approved, v_old_scholar is not null)
    )
  );

  return coalesce(p_status, v_old_status);
end;
$$;

revoke all on function public.admin_set_question_status(uuid, text, boolean) from public, anon;
grant execute on function public.admin_set_question_status(uuid, text, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- The dashboard counter, now counting something that exists
-- ---------------------------------------------------------------------------
-- Migration 0032 counted `source_type = 'scholar_approved'`, which the check
-- constraint makes impossible — it would have read zero forever regardless of
-- how much review was done. Replaced here now that the real column exists.
create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  return jsonb_build_object(
    'total_users', (select count(*) from public.profiles),
    'suspended_users', (
      select count(*) from auth.users
       where banned_until is not null and banned_until > now()
    ),
    'active_today', (
      select count(distinct a.user_id) from public.attempts a
       where a.created_at >= date_trunc('day', now())
    ),
    'active_week', (
      select count(distinct a.user_id) from public.attempts a
       where a.created_at >= now() - interval '7 days'
    ),
    'total_questions', (select count(*) from public.questions),
    'published_questions', (
      select count(*) from public.questions where review_status = 'published'
    ),
    'scholar_approved', (
      select count(*) from public.questions where scholar_approved_at is not null
    ),
    'total_attempts', (select count(*) from public.attempts),
    'accuracy_pct', (
      select case when count(*) = 0 then 0
             else round(100.0 * count(*) filter (where is_correct) / count(*))::int
             end
      from public.attempts
    ),
    'attempts_today', (
      select count(*) from public.attempts
       where created_at >= date_trunc('day', now())
    )
  );
end;
$$;

revoke all on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_dashboard_stats() to authenticated;

-- ---------------------------------------------------------------------------
-- The economy, as one document
-- ---------------------------------------------------------------------------
create or replace function public.admin_economy_snapshot()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  return jsonb_build_object(
    'lifelines', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', l.id, 'cost', l.cost, 'enabled', l.enabled, 'sort_order', l.sort_order
      ) order by l.sort_order, l.id) from public.lifeline_prices l
    ), '[]'::jsonb),
    'store', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'name_key', s.name_key, 'icon', s.icon,
        'price_coins', s.price_coins, 'in_stock', s.in_stock, 'tab', s.tab
      ) order by s.sort_order, s.id) from public.store_items s
    ), '[]'::jsonb),
    'spin', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id, 'label', r.label, 'type', r.type, 'value', r.value, 'weight', r.weight
      ) order by r.id) from public.spin_rewards r
    ), '[]'::jsonb),
    'chests', coalesce((
      select jsonb_agg(jsonb_build_object(
        'tier', t.tier, 'price_coins', t.price_coins,
        'reward_coins', t.reward_coins, 'reward_xp', t.reward_xp
      ) order by t.price_coins) from public.chest_types t
    ), '[]'::jsonb),
    'modes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'mode', m.mode, 'xp_numerator', m.xp_numerator, 'xp_denominator', m.xp_denominator,
        'lives', m.lives, 'run_seconds', m.run_seconds,
        'per_question_timer', m.per_question_timer, 'endless', m.endless
      ) order by m.mode) from public.game_mode_rules m
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.admin_economy_snapshot() from public, anon;
grant execute on function public.admin_economy_snapshot() to authenticated;

-- ---------------------------------------------------------------------------
-- Tuning it
-- ---------------------------------------------------------------------------
-- Every setter below: admin only, bounded, and audited with before and after.
-- The bounds are not paranoia about the administrator; they are about the
-- typo. A missing decimal point on an XP multiplier is the difference between
-- a game and a spreadsheet, and nothing else in the stack would catch it.

create or replace function public.admin_update_lifeline_price(
  p_id text, p_cost integer, p_enabled boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_old record;
begin
  if not public.is_admin() then raise exception 'Not authorized.'; end if;
  if p_cost is null or p_cost < 0 or p_cost > 100000 then
    raise exception 'A lifeline cost must be between 0 and 100000.';
  end if;

  select * into v_old from public.lifeline_prices where id = p_id;
  if not found then raise exception 'Unknown lifeline.'; end if;

  update public.lifeline_prices
     set cost = p_cost, enabled = coalesce(p_enabled, enabled)
   where id = p_id;

  perform public.log_admin_action('economy.lifeline', 'lifeline', p_id, p_id,
    jsonb_build_object('cost_from', v_old.cost, 'cost_to', p_cost,
                       'enabled_from', v_old.enabled, 'enabled_to', coalesce(p_enabled, v_old.enabled)));
end;
$$;

revoke all on function public.admin_update_lifeline_price(text, integer, boolean) from public, anon;
grant execute on function public.admin_update_lifeline_price(text, integer, boolean) to authenticated;

create or replace function public.admin_update_store_item(
  p_id text, p_price_coins integer, p_in_stock boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_old record;
begin
  if not public.is_admin() then raise exception 'Not authorized.'; end if;
  if p_price_coins is null or p_price_coins < 0 or p_price_coins > 1000000 then
    raise exception 'A store price must be between 0 and 1000000.';
  end if;

  select * into v_old from public.store_items where id = p_id;
  if not found then raise exception 'Unknown store item.'; end if;

  update public.store_items
     set price_coins = p_price_coins, in_stock = coalesce(p_in_stock, in_stock)
   where id = p_id;

  perform public.log_admin_action('economy.store', 'store_item', p_id, v_old.name_key,
    jsonb_build_object('price_from', v_old.price_coins, 'price_to', p_price_coins,
                       'stock_from', v_old.in_stock, 'stock_to', coalesce(p_in_stock, v_old.in_stock)));
end;
$$;

revoke all on function public.admin_update_store_item(text, integer, boolean) from public, anon;
grant execute on function public.admin_update_store_item(text, integer, boolean) to authenticated;

create or replace function public.admin_update_spin_reward(
  p_id integer, p_value integer, p_weight integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_old record;
begin
  if not public.is_admin() then raise exception 'Not authorized.'; end if;
  if p_weight is null or p_weight < 0 or p_weight > 1000 then
    raise exception 'A spin weight must be between 0 and 1000.';
  end if;
  if p_value is null or p_value < 0 or p_value > 100000 then
    raise exception 'A spin reward must be between 0 and 100000.';
  end if;

  select * into v_old from public.spin_rewards where id = p_id;
  if not found then raise exception 'Unknown spin reward.'; end if;

  update public.spin_rewards set value = p_value, weight = p_weight where id = p_id;

  perform public.log_admin_action('economy.spin', 'spin_reward', p_id::text, v_old.label,
    jsonb_build_object('value_from', v_old.value, 'value_to', p_value,
                       'weight_from', v_old.weight, 'weight_to', p_weight));
end;
$$;

revoke all on function public.admin_update_spin_reward(integer, integer, integer) from public, anon;
grant execute on function public.admin_update_spin_reward(integer, integer, integer) to authenticated;

create or replace function public.admin_update_chest_type(
  p_tier text, p_price_coins integer, p_reward_coins integer, p_reward_xp integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_old record;
begin
  if not public.is_admin() then raise exception 'Not authorized.'; end if;
  if p_price_coins is null or p_price_coins < 0 or p_price_coins > 1000000
     or p_reward_coins is null or p_reward_coins < 0 or p_reward_coins > 1000000
     or p_reward_xp is null or p_reward_xp < 0 or p_reward_xp > 1000000 then
    raise exception 'Chest values must be between 0 and 1000000.';
  end if;

  select * into v_old from public.chest_types where tier = p_tier;
  if not found then raise exception 'Unknown chest tier.'; end if;

  update public.chest_types
     set price_coins = p_price_coins, reward_coins = p_reward_coins, reward_xp = p_reward_xp
   where tier = p_tier;

  perform public.log_admin_action('economy.chest', 'chest', p_tier, p_tier,
    jsonb_build_object('price_from', v_old.price_coins, 'price_to', p_price_coins,
                       'coins_from', v_old.reward_coins, 'coins_to', p_reward_coins,
                       'xp_from', v_old.reward_xp, 'xp_to', p_reward_xp));
end;
$$;

revoke all on function public.admin_update_chest_type(text, integer, integer, integer) from public, anon;
grant execute on function public.admin_update_chest_type(text, integer, integer, integer) to authenticated;

-- The XP multiplier a mode pays. Bounded hard: migration 0030 chose a table
-- topping out at 2x precisely so the compounded exposure stayed knowable, and
-- an admin screen must not be the thing that quietly raises that ceiling.
create or replace function public.admin_update_game_mode(
  p_mode text, p_xp_numerator integer, p_xp_denominator integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_old record;
begin
  if not public.is_admin() then raise exception 'Not authorized.'; end if;

  if p_xp_numerator is null or p_xp_denominator is null
     or p_xp_numerator < 1 or p_xp_denominator < 1 then
    raise exception 'An XP multiplier must be a ratio of positive whole numbers.';
  end if;

  if p_xp_numerator::numeric / p_xp_denominator::numeric > 2 then
    raise exception 'An XP multiplier may not exceed 2x.';
  end if;

  select * into v_old from public.game_mode_rules where mode = p_mode;
  if not found then raise exception 'Unknown game mode.'; end if;

  update public.game_mode_rules
     set xp_numerator = p_xp_numerator, xp_denominator = p_xp_denominator
   where mode = p_mode;

  perform public.log_admin_action('economy.mode', 'game_mode', p_mode, p_mode,
    jsonb_build_object(
      'from', v_old.xp_numerator || '/' || v_old.xp_denominator,
      'to',   p_xp_numerator || '/' || p_xp_denominator));
end;
$$;

revoke all on function public.admin_update_game_mode(text, integer, integer) from public, anon;
grant execute on function public.admin_update_game_mode(text, integer, integer) to authenticated;
