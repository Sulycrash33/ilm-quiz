-- Migration 0008: Take the gambling out of the rewards, and make owned items work.
--
-- Three changes, all closing gaps that were shipping.
--
-- 1. CHESTS AND THE WHEEL WERE LOOT BOXES.
--    `open_chest_rpc` charged a fixed number of coins and returned a reward
--    rolled at random between min and max. `spin_wheel_rpc` rolled a weighted
--    wheel. Structurally that is gacha: a set payment for an unknown return.
--
--    That is a problem twice over for this app. Rulings on loot boxes vary, but
--    the distinction scholars keep drawing is between paying for a *random*
--    outcome and paying for a *chosen* one — the Mufti of the Federal
--    Territories ruled that using in-game currency to open a random crate is
--    impermissible while a direct non-random purchase is not. Separately, the
--    regulatory direction of travel in 2026 is hostile to randomised rewards in
--    products minors use, and this is a children's Islamic education app.
--
--    The fix keeps the chest. Tiers, prices, the opening moment all stay; only
--    the randomness goes. Each tier now pays a fixed, published amount, so a
--    player knows exactly what 500 coins buys before spending it. Payouts are
--    the midpoints of the old ranges, so the economy is unchanged in expectation
--    — every tier remains a net coin sink that converts coins into XP.
--
-- 2. OWNED STORE ITEMS DID NOTHING.
--    Migration 0006 made purchases durable and correctly priced but left them
--    inert: buying a "50/50" recorded a 50/50 and changed no gameplay. Five of
--    the catalogue items describe exactly the lifelines the Hunt already has, so
--    they are wired to them here — owning one lets a player use that lifeline
--    without paying coins, and `spend_lifeline_rpc` spends from the shelf before
--    it reaches for the wallet.
--
-- 3. SOME ITEMS COULD NOT HONESTLY BE SOLD.
--    See the block near the end. Four bundles would have minted coins and three
--    power-ups describe mechanics that do not exist.

-- ---------------------------------------------------------------------------
-- 1. Deterministic chests
-- ---------------------------------------------------------------------------

alter table public.chest_types
  add column if not exists reward_coins int,
  add column if not exists reward_xp int;

-- Midpoints of the old random ranges, so expected value is unchanged.
update public.chest_types set reward_coins = 40,  reward_xp = 25  where tier = 'bronze'  and reward_coins is null;
update public.chest_types set reward_coins = 105, reward_xp = 70  where tier = 'silver'  and reward_coins is null;
update public.chest_types set reward_coins = 250, reward_xp = 175 where tier = 'gold'    and reward_coins is null;
update public.chest_types set reward_coins = 575, reward_xp = 425 where tier = 'diamond' and reward_coins is null;

-- Any tier added later must state its payout; a null would silently reintroduce
-- an unknown return.
alter table public.chest_types
  alter column reward_coins set not null,
  alter column reward_xp set not null;

comment on column public.chest_types.reward_coins is
  'Exactly what this chest pays. Fixed on purpose: a chest that rolls a random reward is a loot box, which this app should not ship. The old min_coins/max_coins columns are retained only so the change is auditable.';

create or replace function public.open_chest_rpc(p_tier text)
returns table (success boolean, error text, coins_awarded int, xp_awarded int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_chest record;
  v_balance int;
begin
  if v_user_id is null then
    return query select false, 'You must be signed in.'::text, null::int, null::int;
    return;
  end if;

  select * into v_chest from public.chest_types c where c.tier = p_tier;
  if v_chest is null then
    return query select false, 'Unknown chest.'::text, null::int, null::int;
    return;
  end if;

  -- Price comes from the table, never the caller.
  update public.profiles p set coins = p.coins - v_chest.price_coins
   where p.id = v_user_id and p.coins >= v_chest.price_coins
  returning p.coins into v_balance;

  if v_balance is null then
    return query select false, 'Not enough coins.'::text, null::int, null::int;
    return;
  end if;

  -- No roll. The player already knew this number before they paid it.
  update public.profiles p
     set coins = p.coins + v_chest.reward_coins,
         total_xp = p.total_xp + v_chest.reward_xp
   where p.id = v_user_id;

  return query select true, null::text, v_chest.reward_coins, v_chest.reward_xp;
end;
$$;

revoke all on function public.open_chest_rpc(text) from public;
grant execute on function public.open_chest_rpc(text) to authenticated;
grant select on public.chest_types to authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.chest_types from authenticated, anon;

-- ---------------------------------------------------------------------------
-- 2. The daily gift, formerly a wheel
-- ---------------------------------------------------------------------------
-- Same once-a-day cadence and the same reward table, but the outcome is a
-- function of the date rather than a weighted roll. It is a gift on a rota, not
-- a spin: the player can be shown today's reward before claiming it.

create or replace function public.spin_wheel_rpc()
returns table (success boolean, error text, next_available_at timestamptz, label text, reward_type text, value int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_last timestamptz;
  v_count int;
  v_reward record;
begin
  if v_user_id is null then
    return query select false, 'You must be signed in.'::text, null::timestamptz, null::text, null::text, null::int;
    return;
  end if;

  select p.last_spin_at into v_last from public.profiles p where p.id = v_user_id;

  if v_last is not null and v_last > now() - interval '24 hours' then
    return query select false, 'Come back later for today''s gift.'::text,
                        v_last + interval '24 hours', null::text, null::text, null::int;
    return;
  end if;

  select count(*) into v_count from public.spin_rewards;
  if v_count = 0 then
    return query select false, 'No rewards configured.'::text, null::timestamptz, null::text, null::text, null::int;
    return;
  end if;

  -- Deterministic rota: the day number selects the reward. Everyone gets the
  -- same gift on the same day, and it can be displayed in advance.
  select r.* into v_reward
  from (
    select sr.*, row_number() over (order by sr.id) - 1 as idx
    from public.spin_rewards sr
  ) r
  where r.idx = (extract(epoch from current_date)::bigint / 86400) % v_count;

  update public.profiles p
     set last_spin_at = now(),
         coins    = p.coins    + (case when v_reward.type = 'coins' then v_reward.value else 0 end),
         total_xp = p.total_xp + (case when v_reward.type = 'xp'    then v_reward.value else 0 end)
   where p.id = v_user_id;

  return query select true, null::text, (now() + interval '24 hours')::timestamptz,
                      v_reward.label, v_reward.type, v_reward.value;
end;
$$;

revoke all on function public.spin_wheel_rpc() from public;
grant execute on function public.spin_wheel_rpc() to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Store items that are actually lifelines
-- ---------------------------------------------------------------------------

alter table public.store_items
  add column if not exists lifeline_id text references public.lifeline_prices(id) on delete set null;

comment on column public.store_items.lifeline_id is
  'When set, owning this item lets the player use that lifeline without paying coins. spend_lifeline_rpc consumes from user_inventory before charging.';

update public.store_items set lifeline_id = 'fifty-fifty'   where id = '1';  -- "50/50 - Remove two wrong answers"
update public.store_items set lifeline_id = 'ask-imam'      where id = '2';  -- "Hint - Get a helpful hint"
update public.store_items set lifeline_id = 'skip'          where id = '3';  -- "Skip - Skip to next question"
update public.store_items set lifeline_id = 'double-points' where id = '4';  -- "Double XP - 2x XP for next quiz"
update public.store_items set lifeline_id = 'time-boost'    where id = '8';  -- "Wisdom Boost - Extra time for thinking"

-- Spend from the shelf before the wallet.
--
-- Replaces the 0005 version. The coin path is unchanged and still atomic; what
-- is new is the inventory check in front of it, and `paid_with` in the result so
-- the UI can tell the player which one happened.
--
-- Dropped rather than replaced: `create or replace` cannot widen a function's
-- OUT parameters, and this adds two. The existing app keeps working across the
-- change because it reads the returned columns by name and the ones it uses
-- (success, error, new_balance, cost) are all still there.
drop function if exists public.spend_lifeline_rpc(text);

create function public.spend_lifeline_rpc(p_lifeline_id text)
returns table (success boolean, error text, new_balance int, cost int, paid_with text, remaining int)
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

  -- Does the player own a stocked copy of this lifeline? Decrement it in one
  -- statement guarded by `quantity > 0`, so two taps cannot both consume the
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

    if v_remaining is not null then
      select p.coins into v_new_balance from public.profiles p where p.id = v_user_id;
      return query select true, null::text, v_new_balance, 0, 'inventory'::text, v_remaining;
      return;
    end if;
  end if;

  -- Nothing on the shelf: pay for it.
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

  return query select true, null::text, v_new_balance, v_cost, 'coins'::text, 0;
end;
$$;

revoke all on function public.spend_lifeline_rpc(text) from public;
grant execute on function public.spend_lifeline_rpc(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Items that could not honestly be sold
-- ---------------------------------------------------------------------------
--
-- THE BUNDLES WOULD HAVE MINTED COINS. Each is priced below the coins its own
-- description promises:
--
--   13 Starter Pack        400 coins  ->  "500 coins + 3 lifelines"   net +100
--   14 Scholar Bundle      800 coins  ->  "1000 coins + all power-ups" net +200
--   15 Premium Collection 1500 coins  ->  "All cosmetics + 2000 coins" net +500
--   16 Ultimate Pack      3000 coins  ->  "Everything in the store"
--
-- They are consumables, so implementing any of them as written gives an
-- unbounded coin loop: buy, receive more than you paid, repeat. Taking them off
-- sale is the only safe state until they are repriced above their contents and
-- their contents are actually modelled (which needs a bundle_contents table —
-- today the contents exist only as English marketing copy).
--
-- THREE POWER-UPS DESCRIBE MECHANICS THAT DO NOT EXIST. Time Freeze (stop the
-- timer for 30s), Score Multiplier (3x one question) and Second Chance (retry a
-- wrong answer) each need run-loop work and a design decision. Selling them
-- today takes coins for nothing.

update public.store_items set in_stock = false where id in ('5', '6', '7', '13', '14', '15', '16');

-- ---------------------------------------------------------------------------
-- Residual / follow-ups
-- ---------------------------------------------------------------------------
-- a) Cosmetics (9-12) remain on sale and are genuinely owned, but are display
--    only. The profile now lists what a player owns; applying a Celestial Theme
--    to the whole app is a larger piece of work.
-- b) chest_types.min_coins/max_coins/min_xp/max_xp are left in place, unused, so
--    the switch away from random payouts stays auditable. Drop them once nothing
--    references them.
-- c) A returning bundle should be priced strictly above the sum of its contents,
--    and its contents modelled as rows rather than prose.
