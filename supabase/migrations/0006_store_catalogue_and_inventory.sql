-- Migration 0006: Give the store a server-side catalogue and an inventory.
--
-- Three problems, all in the same place.
--
-- 1. THE CLIENT SET THE PRICE.
--    `purchase_store_item_rpc(p_price int)` took the amount to deduct straight
--    from the caller. Anything that can reach the API could buy a 3000-coin
--    item for 0 — or pass a negative price and mint coins. This is the same
--    shape of hole migration 0005 closed for lifelines, and it is closed the
--    same way: the price lives in the database, and the client sends only which
--    item it wants.
--
-- 2. THERE WERE TWO CATALOGUES THAT DISAGREED.
--    `src/data/store-items.ts` and the inline `storeItems` map in
--    `StorePageClient.tsx` both defined items 1–16 with DIFFERENT prices — item
--    1 was 50 coins in one and 100 in the other. Only the second was ever
--    rendered. This table becomes the single source of truth so there is
--    nothing left to drift.
--
-- 3. BUYING SOMETHING GAVE YOU NOTHING.
--    The old flow deducted coins, showed a toast, and stopped. No record was
--    written anywhere, so a purchase could not be reflected in the UI, could not
--    be spent, and vanished on refresh. Players were paying real coins for a
--    message. `user_inventory` below gives purchases somewhere to live.
--
--    NOTE: this migration makes purchases *durable and correctly priced*. It
--    does NOT make them *do* anything yet — consuming a Streak Shield or
--    applying an XP Boost is game logic that has to be designed and wired into
--    the run loop. Until then the store honestly sells an owned item that shows
--    as owned, instead of silently selling nothing. See the follow-up note at
--    the end of this file.

-- ---------------------------------------------------------------------------
-- 1. The catalogue
-- ---------------------------------------------------------------------------
-- `name_key` / `desc_key` hold i18n keys rather than literal text, matching how
-- StorePageClient already renders items, so the store stays translated across
-- all six locales without duplicating copy into the database.

create table if not exists public.store_items (
  id text primary key,
  name_key text not null,
  desc_key text not null,
  icon text not null default '🎁',
  price_coins int not null check (price_coins > 0),
  -- Which tab the item appears under in the store UI.
  tab text not null check (tab in ('lifelines', 'powerups', 'cosmetics', 'bundles')),
  -- Display grouping used by ShopItem's badge.
  category text not null check (category in ('avatar', 'theme', 'power-up', 'badge')),
  -- Consumables can be bought repeatedly and stack. Cosmetics are owned once.
  consumable boolean not null default true,
  in_stock boolean not null default true,
  sort_order int not null default 0
);

comment on table public.store_items is
  'Authoritative store catalogue. The client never sends a price; purchase_store_item_rpc reads it from here. Replaces the two disagreeing TypeScript catalogues that previously defined items 1-16 with different prices.';

-- Prices and ids mirror the map that StorePageClient actually rendered, so
-- nothing visibly changes for players on the first deploy.
insert into public.store_items (id, name_key, desc_key, icon, price_coins, tab, category, consumable, sort_order) values
  ('1',  'storeItem1Name',  'storeItem1Desc',  '🎯', 100,  'lifelines', 'power-up', true,  1),
  ('2',  'storeItem2Name',  'storeItem2Desc',  '💡', 50,   'lifelines', 'power-up', true,  2),
  ('3',  'storeItem3Name',  'storeItem3Desc',  '⏭️', 75,   'lifelines', 'power-up', true,  3),
  ('4',  'storeItem4Name',  'storeItem4Desc',  '⚡', 200,  'lifelines', 'power-up', true,  4),
  ('5',  'storeItem5Name',  'storeItem5Desc',  '❄️', 150,  'powerups',  'power-up', true,  5),
  ('6',  'storeItem6Name',  'storeItem6Desc',  '🔥', 250,  'powerups',  'power-up', true,  6),
  ('7',  'storeItem7Name',  'storeItem7Desc',  '🔄', 125,  'powerups',  'power-up', true,  7),
  ('8',  'storeItem8Name',  'storeItem8Desc',  '🧠', 100,  'powerups',  'power-up', true,  8),
  ('9',  'storeItem9Name',  'storeItem9Desc',  '🖼️', 500,  'cosmetics', 'avatar',   false, 9),
  ('10', 'storeItem10Name', 'storeItem10Desc', '✨', 750,  'cosmetics', 'theme',    false, 10),
  ('11', 'storeItem11Name', 'storeItem11Desc', '🎓', 300,  'cosmetics', 'badge',    false, 11),
  ('12', 'storeItem12Name', 'storeItem12Desc', '⭐', 400,  'cosmetics', 'avatar',   false, 12),
  ('13', 'storeItem13Name', 'storeItem13Desc', '📦', 400,  'bundles',   'power-up', true,  13),
  ('14', 'storeItem14Name', 'storeItem14Desc', '📚', 800,  'bundles',   'power-up', true,  14),
  ('15', 'storeItem15Name', 'storeItem15Desc', '👑', 1500, 'bundles',   'avatar',   false, 15),
  ('16', 'storeItem16Name', 'storeItem16Desc', '💎', 3000, 'bundles',   'theme',    false, 16)
on conflict (id) do nothing;

alter table public.store_items enable row level security;

drop policy if exists "Anyone signed in can read the catalogue" on public.store_items;
create policy "Anyone signed in can read the catalogue"
  on public.store_items for select to authenticated using (true);

-- Read-only for clients. There is deliberately no insert/update/delete policy,
-- so no session can re-price an item.
grant select on public.store_items to authenticated;

-- ---------------------------------------------------------------------------
-- 2. What a player owns
-- ---------------------------------------------------------------------------

create table if not exists public.user_inventory (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.store_items(id) on delete cascade,
  quantity int not null default 0 check (quantity >= 0),
  first_acquired_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

comment on table public.user_inventory is
  'What each player owns. Written only by purchase_store_item_rpc — there is no insert or update grant for client sessions, so quantities cannot be self-issued.';

alter table public.user_inventory enable row level security;

drop policy if exists "Users can view their own inventory" on public.user_inventory;
create policy "Users can view their own inventory"
  on public.user_inventory for select to authenticated using (auth.uid() = user_id);

-- SELECT only. Writes go exclusively through the SECURITY DEFINER purchase
-- function; granting insert here would let a player hand themselves items.
grant select on public.user_inventory to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Purchase
-- ---------------------------------------------------------------------------
-- The old signature took a price and is replaced entirely. Dropping it matters:
-- leaving it in place would leave the hole open for any caller that still knows
-- how to call it.

drop function if exists public.purchase_store_item_rpc(int);

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

  -- A cosmetic already owned cannot be bought again. Without this a player can
  -- buy the same avatar frame repeatedly and simply lose coins.
  if not v_item.consumable then
    select ui.quantity into v_owned
    from public.user_inventory ui
    where ui.user_id = v_user_id and ui.item_id = p_item_id;

    if coalesce(v_owned, 0) > 0 then
      return query select false, 'You already own that.'::text, null::int, v_item.price_coins, v_owned;
      return;
    end if;
  end if;

  -- Check and deduction are one statement, so two taps cannot both succeed
  -- against the same balance.
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

comment on function public.purchase_store_item_rpc(text) is
  'Buys one store item at the price held in store_items, deducts atomically, and records it in user_inventory. Never trusts a client-supplied price. Refuses to re-sell a non-consumable the player already owns.';

-- ---------------------------------------------------------------------------
-- Residual risk / follow-ups (not closed here)
-- ---------------------------------------------------------------------------
-- a) OWNED ITEMS STILL HAVE NO EFFECT. This migration makes a purchase durable
--    and correctly priced, and the store can now show "Owned" truthfully. It
--    does not make a Streak Shield protect a streak or an XP Boost multiply XP —
--    each of those is game logic in the run loop, and each needs a design
--    decision (does a shield auto-consume on the first miss? does an XP boost
--    last a run or a day?). The inventory table is the foundation that work
--    needs; consuming from it will want a `consume_inventory_item_rpc` sibling
--    to this function so quantities can only fall through the same guarded path.
--
-- b) The four "bundles" (ids 13-16) are sold as single items rather than
--    expanding into their contents, because the contents were only ever
--    described in English marketing copy in src/data/store-items.ts, never
--    modelled. Modelling them properly means a bundle_contents join table.
--
-- c) src/data/store-items.ts is now dead data. It is left in place in this
--    migration's accompanying change only if something still imports it; the
--    intent is that this table is the only catalogue.
