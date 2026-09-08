-- A chest is not a handout.
--
-- The owner, seeing 0060 land: **"mystery box is not free and it's not cheaply
-- gotten, so one has to work hard to get it, or if there is a special
-- occasion. But you can't just check daily reward and see it there."**
--
-- Two objections, and they are different problems. 0060 fixed the *price* of a
-- chest and left both of these standing.
--
-- ── 1. It was cheap ───────────────────────────────────────────────────────
-- The first chest landed at a **three day streak** or **fifty correct
-- answers**: about a week of casual use. That is not work, and a reward that
-- arrives that easily teaches the player it is not worth having.
--
--   | was                     | now                                        |
--   |-------------------------|--------------------------------------------|
--   | streak 3 -> bronze      | streak **30** -> bronze                    |
--   | streak 7 -> silver      | streak **100** -> silver                   |
--   | streak 30 -> gold       | streak **365** -> gold                      |
--   | streak 100 -> diamond   | *(diamond is no longer earned by grinding)* |
--   | 50 correct -> bronze    | **250** correct -> bronze                  |
--   | 250 correct -> silver   | **1,000** correct -> silver                |
--   | 1,000 correct -> gold   | **5,000** correct -> gold                  |
--   | 10 categories -> silver | **25** categories -> silver                |
--
-- **Diamond is now occasion-only.** Nothing you can grind produces one, which
-- is what makes it worth being the top of the ladder — the same reasoning that
-- keeps the question bank's size off the player's screen: a number you can
-- march toward stops being an event.
--
-- ── 2. Special occasions ──────────────────────────────────────────────────
-- The second half of the brief, and the mechanism lands here with **no
-- occasions seeded**. A criteria of `{"type":"occasion","from":...,"to":...}`
-- grants its chest once to anyone who opens the app inside the window, and the
-- unique index on (user_id, award_slug) is what makes it once ever rather than
-- once a day.
--
-- **The dates are deliberately not guessed.** Ramadan, the two Eids and
-- Laylat al Qadr move against the Gregorian calendar and are settled by
-- sighting in a way this file has no business asserting. The owner names the
-- occasion and the dates; the row is one insert.
--
-- ── 3. Not on the handout screen ──────────────────────────────────────────
-- Handled in the app rather than here, and it is the sharper of the two
-- points: the shelf sat on `/rewards`, between the Day 1 to 7 coin ladder and
-- the free spin. **Everything on that screen is something you get for showing
-- up.** Putting an earned chest there tells the player it is another handout,
-- which is exactly the confusion 0058 spent a migration undoing. It moves to
-- `/achievements`, where the things you earned already live.

-- Nobody holds a chest yet -- checked, `user_chests` is empty -- so the old
-- milestones can go rather than being left as rows nobody can reach.
delete from public.user_chests where award_slug in (
  'streak-3','streak-7','streak-30','streak-100',
  'correct-50','correct-250','correct-1000','breadth-10'
);
delete from public.chest_awards where slug in (
  'streak-3','streak-7','streak-30','streak-100',
  'correct-50','correct-250','correct-1000','breadth-10'
);

insert into public.chest_awards (slug, tier, criteria, sort_order) values
  ('streak-30',    'bronze', '{"type":"streak","min_days":30}',                 10),
  ('streak-100',   'silver', '{"type":"streak","min_days":100}',                20),
  ('streak-365',   'gold',   '{"type":"streak","min_days":365}',                30),
  ('correct-250',  'bronze', '{"type":"correct_count","min":250}',              40),
  ('correct-1000', 'silver', '{"type":"correct_count","min":1000}',             50),
  ('correct-5000', 'gold',   '{"type":"correct_count","min":5000}',             60),
  ('breadth-25',   'silver', '{"type":"category_breadth","min_categories":25}', 70)
on conflict (slug) do update
  set tier = excluded.tier,
      criteria = excluded.criteria,
      sort_order = excluded.sort_order;

-- The occasion window. Granted once, to anyone who opens the app between the
-- dates, and never again -- the unique index on (user_id, award_slug) is the
-- whole of the enforcement.
--
-- To add one, and this is the entire procedure:
--
--   insert into public.chest_awards (slug, tier, criteria, sort_order) values
--     ('eid-al-fitr-1448', 'diamond',
--      '{"type":"occasion","from":"2027-03-20","to":"2027-03-22"}', 100);
--
-- No dates are seeded here on purpose. Ramadan and the two Eids move against
-- the Gregorian calendar and are settled by sighting; a migration that guessed
-- them would be wrong in a way an Islamic education app cannot afford.
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
    select count(*) filter (where a.is_correct) as correct_count
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
            when 'occasion' then
              current_date between (ca.criteria->>'from')::date
                               and (ca.criteria->>'to')::date
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

do $$
declare v_cheap int;
begin
  select count(*) into v_cheap
    from public.chest_awards
   where (criteria->>'type' = 'streak'        and (criteria->>'min_days')::int < 30)
      or (criteria->>'type' = 'correct_count' and (criteria->>'min')::bigint < 250);
  if v_cheap > 0 then
    raise exception '% chest award(s) are cheaper than a 30 day streak or 250 correct answers', v_cheap;
  end if;

  if exists (select 1 from public.chest_awards
              where tier = 'diamond' and criteria->>'type' <> 'occasion') then
    raise exception 'a diamond chest is grindable; diamond is occasion only';
  end if;
end $$;
