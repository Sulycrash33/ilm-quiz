-- Migration 0009: Make the daily streak real and protectable, and schedule
-- questions for spaced review.
--
-- WHY THE STREAK COMES FIRST
-- `profiles.streak_count` and `profiles.longest_streak` have never been written
-- by anything. No function in the schema touches them — not
-- `claim_daily_login_rpc`, not `submit_quiz_answer`. Every profile has shown a
-- day-streak of 0 since launch, and the "Streak Shield" this migration adds
-- would have had nothing to protect.
--
-- The columns to do it properly already existed: `last_activity_date` and
-- `streak_freezes_available` were in the original schema and were likewise never
-- written. This uses them rather than inventing parallel ones.
--
-- WHAT COUNTS AS A DAY
-- Answering at least one question. Not opening the app, and not claiming the
-- daily login reward — in a learning app the streak should track learning, which
-- is also what makes it worth protecting. `attempts` already records exactly
-- this, so the streak is derived from behaviour that is already trustworthy
-- (only `submit_quiz_answer` writes that table).
--
-- WHY FORGIVENESS IS PART OF THE DESIGN, NOT A CONCESSION
-- A streak that can never be repaired turns one missed day into permanent
-- churn: the habit ends and the player does not come back. Duolingo's own
-- numbers point the other way — a repairable streak retains better, and they cap
-- it at two equipped freezes. Same shape here: up to two missed days can be
-- covered, and a player can hold at most two freezes, so the streak still means
-- something.

-- ---------------------------------------------------------------------------
-- 1. The streak itself
-- ---------------------------------------------------------------------------

create or replace function public.touch_streak_on_attempt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last date;
  v_streak int;
  v_freezes int;
  v_missed int;
begin
  select p.last_activity_date, p.streak_count, coalesce(p.streak_freezes_available, 0)
    into v_last, v_streak, v_freezes
  from public.profiles p
  where p.id = new.user_id
  for update;

  if not found then
    return new;
  end if;

  -- Already counted today; nothing to do. This is the common case, since most
  -- attempts are the second and later ones of a session.
  if v_last = current_date then
    return new;
  end if;

  if v_last is null then
    v_streak := 1;
  else
    v_missed := (current_date - v_last) - 1;

    if v_missed <= 0 then
      -- Yesterday. The ordinary case: the streak continues.
      v_streak := coalesce(v_streak, 0) + 1;
    elsif v_missed <= 2 and v_freezes >= v_missed then
      -- A gap a freeze can cover. Spend one per missed day and carry on. The
      -- streak does not advance for the days that were missed — a freeze
      -- preserves progress, it does not manufacture it.
      v_freezes := v_freezes - v_missed;
      v_streak := coalesce(v_streak, 0) + 1;
    else
      -- Too long a gap, or nothing left to spend.
      v_streak := 1;
    end if;
  end if;

  update public.profiles p
     set streak_count = v_streak,
         longest_streak = greatest(coalesce(p.longest_streak, 0), v_streak),
         streak_freezes_available = v_freezes,
         last_activity_date = current_date
   where p.id = new.user_id;

  return new;
end;
$$;

comment on function public.touch_streak_on_attempt() is
  'Maintains the daily streak from answering activity. Fires on every attempt but does real work only on the first one of a day. Consumes streak freezes to cover gaps of up to two days.';

drop trigger if exists attempts_touch_streak on public.attempts;
create trigger attempts_touch_streak
  after insert on public.attempts
  for each row execute function public.touch_streak_on_attempt();

-- ---------------------------------------------------------------------------
-- 2. Selling freezes
-- ---------------------------------------------------------------------------
-- The catalogue had no Streak Shield — the one in the old dead
-- `src/data/store-items.ts` array was never in the live store. Added here as a
-- real item whose purchase grants a freeze.

alter table public.store_items
  add column if not exists grants_streak_freezes int not null default 0;

comment on column public.store_items.grants_streak_freezes is
  'How many streak freezes buying this item grants. purchase_store_item_rpc caps the total held at MAX_STREAK_FREEZES so freezes cannot be hoarded into a streak that never breaks.';

insert into public.store_items
  (id, name_key, desc_key, icon, price_coins, tab, category, consumable, sort_order, grants_streak_freezes)
values
  ('17', 'storeItem17Name', 'storeItem17Desc', '🛡️', 150, 'powerups', 'power-up', true, 17, 1)
on conflict (id) do update
  set grants_streak_freezes = excluded.grants_streak_freezes,
      in_stock = true;

-- Purchase, now able to grant a freeze as well as stock an item.
--
-- Everything about the price path is unchanged from 0006. What is added is the
-- freeze cap check before charging, and the grant after.
create or replace function public.purchase_store_item_rpc(p_item_id text)
returns table (success boolean, error text, new_balance int, price int, quantity int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_item record;
  v_owned int;
  v_new_balance int;
  v_quantity int;
  v_freezes int;
  c_max_freezes constant int := 2;
begin
  if v_user_id is null then
    return query select false, 'You must be signed in.'::text, null::int, null::int, null::int;
    return;
  end if;

  select * into v_item from public.store_items si where si.id = p_item_id;

  if v_item is null then
    return query select false, 'Unknown item.'::text, null::int, null::int, null::int;
    return;
  end if;

  if not v_item.in_stock then
    return query select false, 'That item is out of stock.'::text, null::int, v_item.price_coins, null::int;
    return;
  end if;

  if not v_item.consumable then
    select ui.quantity into v_owned
    from public.user_inventory ui
    where ui.user_id = v_user_id and ui.item_id = p_item_id;

    if coalesce(v_owned, 0) > 0 then
      return query select false, 'You already own that.'::text, null::int, v_item.price_coins, v_owned;
      return;
    end if;
  end if;

  -- Refuse before charging if the freeze it grants would exceed the cap. A
  -- player who could stockpile freezes would have a streak that never breaks,
  -- which makes the streak meaningless.
  if v_item.grants_streak_freezes > 0 then
    select coalesce(p.streak_freezes_available, 0) into v_freezes
    from public.profiles p where p.id = v_user_id;

    if v_freezes + v_item.grants_streak_freezes > c_max_freezes then
      return query select false, 'You already hold the maximum number of streak shields.'::text,
                          null::int, v_item.price_coins, v_freezes;
      return;
    end if;
  end if;

  update public.profiles p
     set coins = p.coins - v_item.price_coins
   where p.id = v_user_id
     and p.coins >= v_item.price_coins
  returning p.coins into v_new_balance;

  if v_new_balance is null then
    select p.coins into v_new_balance from public.profiles p where p.id = v_user_id;
    return query select false, 'Not enough coins.'::text, v_new_balance, v_item.price_coins, null::int;
    return;
  end if;

  if v_item.grants_streak_freezes > 0 then
    update public.profiles p
       set streak_freezes_available = least(
             c_max_freezes,
             coalesce(p.streak_freezes_available, 0) + v_item.grants_streak_freezes)
     where p.id = v_user_id
    returning p.streak_freezes_available into v_freezes;
  end if;

  insert into public.user_inventory (user_id, item_id, quantity)
  values (v_user_id, p_item_id, 1)
  on conflict (user_id, item_id)
    do update set quantity = public.user_inventory.quantity + 1,
                  updated_at = now()
  returning public.user_inventory.quantity into v_quantity;

  return query select true, null::text, v_new_balance, v_item.price_coins, v_quantity;
end;
$$;

revoke all on function public.purchase_store_item_rpc(text) from public;
grant execute on function public.purchase_store_item_rpc(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Spaced review
-- ---------------------------------------------------------------------------
-- Spaced practice is the strongest lever available here: the effect on
-- long-term retention is large and well replicated, and unlike most engagement
-- mechanics it is good for the learner rather than merely sticky. It also gives
-- the app an honest daily reason to open — "14 questions are due" — instead of a
-- manufactured one.
--
-- The scheduler is SM-2, deliberately, rather than something more modern. The
-- gap between no spacing and any spacing is far larger than the gap between SM-2
-- and a better algorithm, and SM-2 fits in a trigger with four columns.
--
-- Everything it needs is already recorded: `attempts` has correctness and a
-- timestamp per question per user, written only by `submit_quiz_answer`.

create table if not exists public.user_question_schedule (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  -- SM-2 ease. Starts at 2.5, floored at 1.3 so a repeatedly-missed question
  -- never collapses to reviewing forever.
  ease numeric(4,2) not null default 2.50 check (ease >= 1.30),
  interval_days int not null default 0 check (interval_days >= 0),
  due_on date not null default current_date,
  reps int not null default 0 check (reps >= 0),
  lapses int not null default 0 check (lapses >= 0),
  last_reviewed_at timestamptz,
  primary key (user_id, question_id)
);

comment on table public.user_question_schedule is
  'When each question is next due for this player, maintained by an SM-2 trigger on attempts. Derived state: it can be rebuilt from attempts if it is ever lost.';

create index if not exists user_question_schedule_due_idx
  on public.user_question_schedule (user_id, due_on);

create or replace function public.schedule_question_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ease numeric(4,2);
  v_interval int;
  v_reps int;
  v_lapses int;
begin
  select s.ease, s.interval_days, s.reps, s.lapses
    into v_ease, v_interval, v_reps, v_lapses
  from public.user_question_schedule s
  where s.user_id = new.user_id and s.question_id = new.question_id;

  if not found then
    v_ease := 2.50; v_interval := 0; v_reps := 0; v_lapses := 0;
  end if;

  if new.is_correct then
    v_reps := v_reps + 1;
    v_interval := case
                    when v_reps = 1 then 1
                    when v_reps = 2 then 3
                    else greatest(1, round(v_interval * v_ease))::int
                  end;
    -- Answering correctly without a hint earns a slightly longer leash.
    if not coalesce(new.used_ask_the_imam_hint, false) then
      v_ease := least(2.80, v_ease + 0.06);
    end if;
  else
    -- A miss resets the ladder and shortens the leash, but never below the
    -- floor: a hard question should come back often, not every single session
    -- forever.
    v_reps := 0;
    v_lapses := v_lapses + 1;
    v_interval := 1;
    v_ease := greatest(1.30, v_ease - 0.20);
  end if;

  insert into public.user_question_schedule
    (user_id, question_id, ease, interval_days, due_on, reps, lapses, last_reviewed_at)
  values
    (new.user_id, new.question_id, v_ease, v_interval,
     current_date + v_interval, v_reps, v_lapses, now())
  on conflict (user_id, question_id) do update
    set ease = excluded.ease,
        interval_days = excluded.interval_days,
        due_on = excluded.due_on,
        reps = excluded.reps,
        lapses = excluded.lapses,
        last_reviewed_at = excluded.last_reviewed_at;

  return new;
end;
$$;

comment on function public.schedule_question_review() is
  'SM-2 scheduler. Correct answers push the next review out by interval * ease; a miss resets to one day and lowers ease. Runs on every attempt, so the schedule cannot drift from what was actually answered.';

drop trigger if exists attempts_schedule_review on public.attempts;
create trigger attempts_schedule_review
  after insert on public.attempts
  for each row execute function public.schedule_question_review();

alter table public.user_question_schedule enable row level security;

drop policy if exists "Users can read their own review schedule" on public.user_question_schedule;
create policy "Users can read their own review schedule"
  on public.user_question_schedule for select to authenticated
  using (auth.uid() = user_id);

-- Read-only for clients; the trigger is the only writer.
grant select on public.user_question_schedule to authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.user_question_schedule from authenticated, anon;

-- ---------------------------------------------------------------------------
-- Residual / follow-ups
-- ---------------------------------------------------------------------------
-- a) The streak counts a day when a question is answered. If the daily login
--    reward should also count, call it from claim_daily_login_rpc — deliberately
--    not done, so the streak means learning rather than opening the app.
-- b) Freezes are consumed silently on the first attempt after a gap. The UI can
--    tell a player this happened by watching streak_freezes_available fall.
-- c) user_question_schedule is derived state. A rebuild-from-attempts routine
--    would be worth having before anyone depends on it for anything but review
--    ordering.
