-- Only studying earns barakah.
--
-- ── What was measured, on the first day anyone played this app ─────────────
-- The owner answered the five daily questions, claimed both rewards and spun
-- the wheel, then asked why the home screen said they were 43% of the way to
-- Talib when they had not opened a single category. The arithmetic was right
-- and that was the problem:
--
--   five answers            104 XP   (8, 12, 18, 36, 30 -- tiers 1,3,7,7,5,
--                                     the jump at the fourth being the combo)
--   daily challenge bonus    50 XP
--   day 1 login reward       50 XP
--   the wheel                10 XP
--                           ------
--                           214 XP   and Talib begins at 500. 214/500 = 43%.
--
-- So **more than half of the rank ring came from pressing claim**, not from
-- answering anything: 110 XP from three buttons against 104 from five
-- questions. Day 7 of the login ladder paid **500 XP** on its own -- the whole
-- Mubtadi-to-Talib band, for opening the app seven days running.
--
-- That contradicts this project's own written position. Migration 0053 put a
-- condition on the daily login reward precisely because "paying for opening
-- the app competed with the thing the app exists to make attractive". The gate
-- was added and the payout was never revisited, so the leak simply moved: you
-- still ranked up by claiming, you just had to answer five questions first.
--
-- ── The rule this establishes ─────────────────────────────────────────────
-- **Barakah is the record of what you have studied. Coins are what gifts give
-- you to spend.** A gift may hand you coins; it may not hand you rank. The one
-- exception is the daily challenge bonus, which is not a gift: it is paid for
-- answering all five of the day's questions, which is study.
--
-- Answering keeps paying both -- `submit_quiz_answer` adds the same amount to
-- `total_xp` and `coins`, deliberately, so that studying funds the shop.
--
-- ── Why this is data and not code ─────────────────────────────────────────
-- `claim_daily_login_rpc` reads `daily_login_rewards.coins/.xp` and
-- `spin_wheel_rpc` reads `spin_rewards.type/.value`; both add whatever they
-- find. So the rule is enforced by what those tables hold, and neither
-- function needs touching. `award_achievements()` was checked too and pays no
-- XP at all -- `achievements` has no reward column.

-- ── The hole this does NOT close, stated plainly ──────────────────────────
-- **Mystery chests still convert coins into barakah.** A bronze chest costs
-- 100 coins and returns 20-60 coins plus 10-40 XP; diamond costs 1000 and
-- returns 250-600 XP. So after this migration the wheel can pay 250 coins in a
-- day, and four days of that buys a diamond chest and most of a rank band --
-- the same leak by a longer road.
--
-- It is left open on purpose rather than patched blind, because closing it is
-- a product decision and not an arithmetic one. Paying coins only would make
-- every chest a guaranteed loss (you pay 100 to get back 20-60), which is not
-- a shop item, it is a fine; and making the coin return exceed the price turns
-- the chest into a coin gamble, which migration 0008 removed on loot-box
-- grounds and which this app must not have. The choice is the owner's: reprice
-- the chests, make them pay something that is not rank, or take them out.
-- Until then this rule holds for the two things that are actually gifts.

-- The seven-day ladder pays coins only. The coin amounts are untouched; it is
-- the same ascending ladder, and day 7 is still its top.
update public.daily_login_rewards
   set xp = 0
 where xp <> 0;

-- The wheel pays coins only. Six of its eight segments were XP.
--
-- The ids are left exactly as they are, and there are still eight segments,
-- because `spin_wheel_rpc` picks the day's prize by `row_number() over (order
-- by sr.id)` against the date -- renumbering or removing a row would silently
-- change which prize each day lands on.
update public.spin_rewards set type = 'coins', value =  20, label =  '20 Coins' where id = 1;
update public.spin_rewards set type = 'coins', value =  30, label =  '30 Coins' where id = 2;
update public.spin_rewards set type = 'coins', value =  40, label =  '40 Coins' where id = 3;
update public.spin_rewards set type = 'coins', value =  75, label =  '75 Coins' where id = 4;
update public.spin_rewards set type = 'coins', value = 100, label = '100 Coins' where id = 5;
update public.spin_rewards set type = 'coins', value = 250, label = '250 Coins' where id = 6;
-- ids 7 and 8 were already coins (50 and 150) and are left alone.

-- Guard rails, so a future edit cannot quietly re-open the leak.
do $$
declare
  v_login_xp int;
  v_spin_xp  int;
  v_segments int;
begin
  select coalesce(sum(xp), 0) into v_login_xp from public.daily_login_rewards;
  if v_login_xp <> 0 then
    raise exception 'daily_login_rewards still pays % XP; gifts pay coins only', v_login_xp;
  end if;

  select count(*) into v_spin_xp from public.spin_rewards where type <> 'coins';
  if v_spin_xp <> 0 then
    raise exception '% spin segments still pay something other than coins', v_spin_xp;
  end if;

  select count(*) into v_segments from public.spin_rewards;
  if v_segments <> 8 then
    raise exception 'spin_rewards has % segments, expected 8 -- the wheel picks by row_number and the drawing assumes eight', v_segments;
  end if;
end $$;
