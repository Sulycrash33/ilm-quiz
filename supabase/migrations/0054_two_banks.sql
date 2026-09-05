-- ---------------------------------------------------------------------------
-- 0054 — Two banks: the one you browse, and the one that comes to you.
-- ---------------------------------------------------------------------------
--
-- Until now there was one bank. Categories served it, and so did the daily
-- challenge, multiplayer and the play modes — so a question met in a level run
-- could reappear as today's challenge or in a battle. The owner wants the
-- arena to be its own bank: unpredictable, never browsable, and never the same
-- questions the categories teach.
--
-- This migration only *separates* the two. It changes nothing a player sees:
-- every existing question stays in the `category` pool, and every reader is
-- pinned to that pool so today's behaviour is exactly today's behaviour. The
-- arena pool is created empty and wired up in a later change. Landing the
-- split on its own means that if something looks wrong after the modes are
-- flipped over, the question is which half — and this half is already proven.
--
-- ── The pool is derived, never typed ──────────────────────────────────────
-- `questions.pool` is not something a caller sets. A trigger copies it from
-- the question's category on every insert and on every change of category, so
-- the two cannot disagree — there is no code path that can file an arena
-- question in the category bank by forgetting a field.
--
-- That shape is deliberate and the reason is migration 0049. There, a comment
-- said `correct_choice_index` was never selected, four call sites honoured it,
-- and the policy did not enforce it — so the answer key was readable by anyone
-- holding the anon key for months. Intent repeated at call sites is intent
-- that drifts. A derived column cannot.
--
-- ── Readers are pinned, so nothing moves yet ──────────────────────────────
-- Three readers would otherwise start seeing arena questions the moment any
-- are imported, because they select across categories rather than within one:
--
--   * `ensure_daily_challenge` picks any category with enough published
--     questions — it would happily pick an arena one
--   * `getModeQuestionPool` (timed/survival/practice) selects by tier alone
--     and ignores category entirely
--   * the category grid lists every category there is
--
-- All three are pinned to `category` here. Those same three lines are the
-- switch: flipping them to `arena` is what turns the new bank on, which is
-- the whole of the next change.
--
-- `start_multiplayer_quiz_rpc` needs nothing: it filters by the room's own
-- category, and rooms are created from the category list, which is pinned.
--
-- ── Arena questions are not queued for translation ────────────────────────
-- The trigger that fans every new question out to five locales now skips the
-- arena pool. The queue stands at ~26,000 rows and drains at twenty a day
-- against an exhausted free-tier key; adding another 26,000 would bury the
-- backlog without translating anything sooner. English serves, and 0047's
-- per-row fallback means a locale with no translation simply reads English.
-- One condition to remove on the day the Gemini plan is fixed.

create type question_pool as enum ('category', 'arena');

alter table public.categories
  add column pool public.question_pool not null default 'category';

alter table public.questions
  add column pool public.question_pool not null default 'category';

comment on column public.questions.pool is
  'Derived from the question''s category by questions_sync_pool(). Never set this directly.';

-- ---------------------------------------------------------------------------
-- The guard: a question's pool is always its category's pool.
-- ---------------------------------------------------------------------------
create or replace function public.questions_sync_pool()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  select c.pool into new.pool
    from public.categories c
   where c.id = new.category_id;
  -- A question with no category cannot exist (category_id is not null), so a
  -- miss here means the category vanished mid-statement. Fail loudly rather
  -- than defaulting, because defaulting would file it in the browsable bank.
  if new.pool is null then
    raise exception 'questions_sync_pool: no category % ', new.category_id;
  end if;
  return new;
end;
$function$;

drop trigger if exists questions_sync_pool_trg on public.questions;
create trigger questions_sync_pool_trg
  before insert or update of category_id on public.questions
  for each row execute function public.questions_sync_pool();

-- Existing rows: every category is 'category' by default, so this is a no-op
-- today. Written anyway so the column is correct by construction rather than
-- by the default happening to be right.
update public.questions q
   set pool = c.pool
  from public.categories c
 where c.id = q.category_id and q.pool is distinct from c.pool;

-- The arena is selected by tier across all categories, which is a different
-- access pattern from the category path (category_id + tier) and wants its
-- own index. Partial: the browsable bank never uses it.
create index if not exists questions_arena_tier_idx
  on public.questions (tier)
  where pool = 'arena' and review_status = 'published';

-- ---------------------------------------------------------------------------
-- Translation: skip the arena pool.
-- ---------------------------------------------------------------------------
create or replace function public.questions_enqueue_translations_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  -- The arena bank is deliberately English-only for now: see 0054's note.
  if new.pool = 'arena' then
    return new;
  end if;
  if tg_op = 'INSERT'
     or new.question_text is distinct from old.question_text
     or new.choices      is distinct from old.choices
     or new.explanation  is distinct from old.explanation
  then
    perform public.enqueue_question_translations(new.id);
  end if;
  return new;
end;
$function$;

-- ---------------------------------------------------------------------------
-- Pin the daily challenge to the browsable bank, for now.
-- ---------------------------------------------------------------------------
create or replace function public.ensure_daily_challenge(p_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(o_id uuid, o_challenge_date date, o_question_count integer, o_reward_coins integer, o_reward_xp integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_existing record;
  v_category uuid;
  v_questions uuid[];
  c_questions constant int := 5;
  c_coins constant int := 60;
  c_xp constant int := 50;
begin
  select dc.id as cid, dc.challenge_date as cdate,
         coalesce(array_length(dc.question_ids, 1), 0) as ccount,
         dc.reward_coins as ccoins, dc.reward_xp as cxp
    into v_existing
  from public.daily_challenges dc where dc.challenge_date = p_date;

  if found then
    return query select v_existing.cid, v_existing.cdate, v_existing.ccount,
                        v_existing.ccoins, v_existing.cxp;
    return;
  end if;

  select c.id into v_category
  from public.categories c
  -- THE PIN. This one predicate is the whole of this function's change:
  -- without it the daily challenge would start picking arena categories the
  -- moment any arena questions exist. Flipping it to 'arena' is what moves
  -- the daily onto the new bank.
  where c.pool = 'category'
    and (
    select count(*) from public.questions q
    where q.category_id = c.id and q.review_status = 'published'
  ) >= c_questions
  order by md5(c.id::text || p_date::text)
  limit 1;

  if v_category is null then
    -- Not enough published content anywhere. Better no challenge than one that
    -- cannot be completed.
    return;
  end if;

  select array_agg(q.id order by md5(q.id::text || p_date::text))
    into v_questions
  from (
    select q2.id
    from public.questions q2
    where q2.category_id = v_category and q2.review_status = 'published'
    order by md5(q2.id::text || p_date::text)
    limit c_questions
  ) q;

  insert into public.daily_challenges
    (challenge_date, category_id, question_ids, reward_coins, reward_xp)
  values (p_date, v_category, v_questions, c_coins, c_xp)
  on conflict (challenge_date) do nothing;

  return query
  select dc.id, dc.challenge_date, coalesce(array_length(dc.question_ids, 1), 0),
         dc.reward_coins, dc.reward_xp
  from public.daily_challenges dc
  where dc.challenge_date = p_date;
end;
$function$;
