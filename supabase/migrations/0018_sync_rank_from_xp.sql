-- Make the rank real.
--
-- `profiles.current_rank_id` is read in two places — `profile-stats.ts`, which
-- feeds the rank-based achievement criteria, and now the home page, which
-- shows the seeker their rank next to their name. Nothing in the codebase or
-- the schema ever wrote it. Every profile therefore sat at rank 1 (Mubtadi)
-- permanently, no matter how much XP was earned, and the rank achievements
-- could never unlock.
--
-- The same recurring shape as the other faults found this session: a column
-- the UI reads and nothing maintains.
--
-- Rank is a pure function of `total_xp` against `rank_tiers`, so it should
-- never have been a field anyone had to remember to update. A BEFORE trigger
-- derives it on every write instead, which covers all six XP paths at once —
-- answering a question, the daily login reward, the daily challenge, chests,
-- the wheel, and any future one — without each having to opt in.
--
-- Note on the thresholds: `rank_tiers` is the authority (0, 500, 1500, 3000,
-- 5000, 8000, 12000, 18000, 25000). `src/lib/constants.ts` carried a second,
-- different set of thresholds for the same nine names, so the client and the
-- server disagreed about which rank a seeker held. That file is aligned to
-- these values in the same change.

create or replace function public.sync_rank_from_xp()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  select rt.id
    into new.current_rank_id
    from public.rank_tiers rt
   where rt.min_xp <= greatest(coalesce(new.total_xp, 0), 0)
   order by rt.min_xp desc
   limit 1;

  -- No tiers seeded: leave whatever was there rather than nulling a column
  -- another query may be joining on.
  if new.current_rank_id is null then
    new.current_rank_id := coalesce(old.current_rank_id, 1);
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_sync_rank on public.profiles;
create trigger profiles_sync_rank
  before insert or update of total_xp on public.profiles
  for each row
  execute function public.sync_rank_from_xp();

-- Backfill every existing profile. `total_xp = total_xp` is a real UPDATE of
-- that column, so the trigger fires and recomputes the rank.
update public.profiles set total_xp = total_xp;
