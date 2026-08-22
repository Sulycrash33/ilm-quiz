-- Remember that a player has been shown how the game works.
--
-- The nine-tier ladder is the whole shape of ILM Hunt — twenty questions per
-- tier, every one of them right before the next tier opens, nine ranks from
-- Mubtadi to Mujaddid — and nothing in the app ever said so. Players landed on
-- a dashboard and were left to infer the structure from a row of padlocks.
--
-- This column is what stops the explainer showing twice. It lives on the
-- profile rather than in localStorage on purpose: someone who signs in on a
-- second device has already seen it, and being taught the rules again is a
-- small insult to their attention.

alter table public.profiles
  add column if not exists onboarding_seen_at timestamptz;

comment on column public.profiles.onboarding_seen_at is
  'When the player was shown the nine-tier explainer. Null means never — the only condition under which it is shown.';

/**
 * Marks the explainer as seen for the calling player.
 *
 * A plain update would do, except that `profiles` is writable by its owner and
 * this must be a one-way latch: `coalesce` keeps the *first* time it was shown
 * rather than letting a later call move the timestamp forward, so the column
 * stays an honest record of when someone was actually taught the rules.
 */
create or replace function public.mark_onboarding_seen()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;
  update profiles
     set onboarding_seen_at = coalesce(onboarding_seen_at, now())
   where id = auth.uid();
end;
$$;

revoke all on function public.mark_onboarding_seen() from public, anon;
grant execute on function public.mark_onboarding_seen() to authenticated;
