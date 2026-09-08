-- A chest you earned.
--
-- ── The question that produced this ───────────────────────────────────────
-- Asked, on being told the chests were a problem: **"shouldn't the chest be
-- mysterious?"** Yes. A chest with no mystery is a receipt. The mystery was
-- never what was wrong with them.
--
-- **What is wrong is mystery with a price on it.** You pay 100 coins and
-- receive an unknown return: that is a loot box, and it is why migration 0008
-- stripped the randomness out in the first place — leaving, as it turned out,
-- a husk that still *looked* like a gamble. The Rewards Center advertised
-- "Bronze — 20-60 coins" while `open_chest_rpc` paid exactly 40 every time,
-- from `reward_coins`. A fake gamble is not an improvement on a real one.
--
-- And it is not only a design objection on a children's app. Paying a set
-- price for an uncertain return is **gharar**; staking on an unknown outcome
-- is **maysir**. This app's own Fiqh and Contemporary Issues categories will
-- one day ask a child about exactly that, two taps from the shop.
--
-- ── The line ──────────────────────────────────────────────────────────────
-- **Barakah may come from a chest you earned. Never from a chest you bought.**
--
-- An earned chest has no stake, so it can be as mysterious as it likes — the
-- spin wheel has been exactly this since 0008, and nobody calls that a gamble.
-- And barakah belongs in it, because you got it by studying, which is the
-- whole of the rule 0058 set: **gifts do not pay rank; study does.** A chest
-- for a thirty-day streak is study, in the same way the daily challenge bonus
-- is study.
--
-- The owner's reason for keeping a shop chest too is worth recording, because
-- it is a real player and not a hypothetical: *someone may be here to enjoy
-- the app rather than to learn, and would rather stock up.* They can — with
-- coins, for lifelines and cosmetics, contents stated. That path lands next;
-- what could not wait is the loot box, which leaves now.
--
-- ── Shape ─────────────────────────────────────────────────────────────────
-- `award_chests()` is modelled on `award_achievements()` deliberately, down to
-- the `on conflict do nothing`: it recomputes from scratch what the player has
-- earned, grants only what is missing, and returns only what it newly granted.
-- Calling it twice grants nothing twice. That is the same idempotency the
-- answer path was missing this morning, and it is the reason to copy a shape
-- that already survives being called from two places at once.
--
-- Opening is atomic for the same reason: the row is claimed with
-- `update ... where opened_at is null returning`, so two taps race for one
-- row and exactly one wins. **Press the button twice** is the rule this
-- repository earned today, and it is built in rather than tested for.
--
-- ── What becomes live, and what dies ──────────────────────────────────────
-- `chest_types.min_coins/max_coins/min_xp/max_xp` come back to life: they are
-- the roll an earned chest makes, and they have been dead data since 0008
-- while being displayed to the player as though they were not.
-- `chest_types.reward_coins/reward_xp` — the fixed payout of the paid chest —
-- become dead in their place, and are kept only so the old rows stay legible.

create table if not exists public.chest_awards (
  slug        text primary key,
  tier        text not null references public.chest_types(tier),
  criteria    jsonb not null,
  sort_order  int not null default 0
);

comment on table public.chest_awards is
  'The milestones that grant a chest. Read by award_chests(); shaped like achievements.criteria so the two read the same way.';

create table if not exists public.user_chests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  tier          text not null references public.chest_types(tier),
  -- Null would mean a chest from some other source; every chest today comes
  -- from a milestone, and the unique index below is what stops a milestone
  -- granting twice.
  award_slug    text references public.chest_awards(slug),
  granted_at    timestamptz not null default now(),
  opened_at     timestamptz,
  coins_awarded int,
  xp_awarded    int
);

create unique index if not exists user_chests_one_per_award
  on public.user_chests (user_id, award_slug)
  where award_slug is not null;

create index if not exists user_chests_unopened
  on public.user_chests (user_id)
  where opened_at is null;

alter table public.chest_awards enable row level security;
alter table public.user_chests  enable row level security;

-- The catalogue is public reading; the chests are yours alone. Neither table
-- takes a write policy: everything is written by SECURITY DEFINER functions,
-- so a client cannot grant itself a chest or mark one opened without paying
-- out. Migration 0034's rule, applied to a new table rather than rediscovered.
drop policy if exists chest_awards_read on public.chest_awards;
create policy chest_awards_read on public.chest_awards
  for select to anon, authenticated using (true);

drop policy if exists user_chests_read_own on public.user_chests;
create policy user_chests_read_own on public.user_chests
  for select to authenticated using (user_id = auth.uid());

-- Scarce on purpose. "One shouldn't just get them easy while playing" was the
-- brief, and these are milestones rather than a per-run drop: the first is
-- three days of study, the last is a thousand right answers.
insert into public.chest_awards (slug, tier, criteria, sort_order) values
  ('streak-3',    'bronze',  '{"type":"streak","min_days":3}',        10),
  ('streak-7',    'silver',  '{"type":"streak","min_days":7}',        20),
  ('streak-30',   'gold',    '{"type":"streak","min_days":30}',       30),
  ('streak-100',  'diamond', '{"type":"streak","min_days":100}',      40),
  ('correct-50',  'bronze',  '{"type":"correct_count","min":50}',     50),
  ('correct-250', 'silver',  '{"type":"correct_count","min":250}',    60),
  ('correct-1000','gold',    '{"type":"correct_count","min":1000}',   70),
  ('breadth-10',  'silver',  '{"type":"category_breadth","min_categories":10}', 80)
on conflict (slug) do nothing;

-- Grant what has been earned and not yet granted.
--
-- Modelled on award_achievements(): recomputed from scratch every call, so it
-- cannot drift from the data, and `on conflict do nothing` makes a second
-- caller a no-op rather than a second chest.
create or replace function public.award_chests()
returns table(o_id uuid, o_tier text, o_slug text)
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    return;
  end if;

  return query
  with stats as (
    select
      count(*) filter (where a.is_correct) as correct_count
    from public.attempts a
    where a.user_id = v_user
  ),
  by_category as (
    select c.slug
    from public.attempts a
    join public.questions q on q.id = a.question_id
    join public.categories c on c.id = q.category_id
    where a.user_id = v_user
    group by c.slug
  ),
  prof as (
    select p.streak_count from public.profiles p where p.id = v_user
  ),
  earned as (
    select ca.slug, ca.tier
    from public.chest_awards ca, stats s, prof p
    where not exists (
            select 1 from public.user_chests uc
             where uc.user_id = v_user and uc.award_slug = ca.slug
          )
      and case ca.criteria->>'type'
            when 'streak' then
              coalesce(p.streak_count, 0) >= (ca.criteria->>'min_days')::int
            when 'correct_count' then
              s.correct_count >= (ca.criteria->>'min')::bigint
            when 'category_breadth' then
              (select count(*) from by_category) >= (ca.criteria->>'min_categories')::bigint
            -- Fails closed, for the reason award_achievements() gives: a typo
            -- in a seed must not hand every player a chest.
            else false
          end
  ),
  inserted as (
    insert into public.user_chests (user_id, tier, award_slug)
    select v_user, e.tier, e.slug from earned e
    on conflict (user_id, award_slug) where award_slug is not null do nothing
    returning id, tier, award_slug
  )
  select i.id, i.tier, i.award_slug from inserted i;
end;
$function$;

revoke all on function public.award_chests() from public, anon;
grant execute on function public.award_chests() to authenticated;

-- Open one. The roll happens here, on the server, at the moment of opening —
-- so the contents genuinely are not known until then, by anybody.
--
-- The old `open_chest_rpc(text)` took a chest *tier* and charged coins for it.
-- It is dropped rather than left beside this one: two functions with one name,
-- one of which sells a loot box, is precisely the kind of thing this codebase
-- keeps finding in its own tree.
drop function if exists public.open_chest_rpc(text);

create or replace function public.open_chest_rpc(p_chest_id uuid)
returns table(success boolean, error text, tier text, coins_awarded int, xp_awarded int)
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_user uuid := auth.uid();
  v_tier text;
  v_chest record;
  v_coins int;
  v_xp int;
begin
  if v_user is null then
    return query select false, 'You must be signed in.'::text, null::text, null::int, null::int;
    return;
  end if;

  -- Claim the row and mark it opened in one statement. Two taps race for this
  -- update; exactly one finds `opened_at is null` and the other gets nothing.
  -- The award is computed after the claim, so a lost race cannot pay.
  update public.user_chests uc
     set opened_at = now()
   where uc.id = p_chest_id
     and uc.user_id = v_user
     and uc.opened_at is null
  returning uc.tier into v_tier;

  if v_tier is null then
    return query select false, 'That chest is not yours, or is already open.'::text,
                        null::text, null::int, null::int;
    return;
  end if;

  select * into v_chest from public.chest_types c where c.tier = v_tier;

  -- The ranges, live again. There is no stake on this chest, so a roll here is
  -- a surprise rather than a gamble — the distinction 0008 drew for the wheel.
  v_coins := v_chest.min_coins + floor(random() * (v_chest.max_coins - v_chest.min_coins + 1))::int;
  v_xp    := v_chest.min_xp    + floor(random() * (v_chest.max_xp    - v_chest.min_xp    + 1))::int;

  update public.user_chests uc
     set coins_awarded = v_coins, xp_awarded = v_xp
   where uc.id = p_chest_id;

  update public.profiles p
     set coins    = p.coins + v_coins,
         total_xp = p.total_xp + v_xp
   where p.id = v_user;

  return query select true, null::text, v_tier, v_coins, v_xp;
end;
$function$;

revoke all on function public.open_chest_rpc(uuid) from public, anon;
grant execute on function public.open_chest_rpc(uuid) to authenticated;
