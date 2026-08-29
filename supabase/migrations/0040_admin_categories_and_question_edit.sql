-- Migration 0040: categories become editable, and a question can be corrected.
--
-- WHAT WAS MISSING
-- `/admin/categories` listed the categories and did nothing else: no add, no
-- remove, no reordering. `categories` has row level security on with a single
-- `select` policy for everyone and no insert, update or delete policy at all,
-- so the page could not have written to the table even if it had tried. Every
-- write here goes through a definer function, which is the same shape as the
-- rest of the admin surface and the reason the audit log cannot be bypassed.
--
-- `/admin/questions` could publish, reject and record scholar approval, but
-- could not fix a typo. A reviewer who spotted a wrong answer could only
-- reject the whole question.
--
-- ON DELETING A CATEGORY
-- `questions.category_id` is `on delete no action`, so the database already
-- refuses to drop a category that has questions. That is the right rule and it
-- is kept: every one of the 29 categories currently holds 180 questions, so
-- none of them can be deleted today, and a delete that silently took 180
-- questions with it would be much worse than one that fails.
--
-- What changes is the failure. A raw foreign key violation tells an
-- administrator nothing they can act on, so the function counts what is in the
-- way first and says so: how many questions, and whether a daily challenge or
-- a study circle also points at it. Deleting an empty category still works,
-- which is what the feature is actually for.
--
-- ON REORDERING
-- `admin_reorder_categories` takes the whole desired order rather than a
-- "move this one up" instruction. Renumbering the full list from 1 is
-- idempotent, cannot leave two categories fighting over one position, and
-- repairs any gaps a previous edit left behind. It also means the same
-- function serves buttons today and drag and drop later without changing.

-- ---------------------------------------------------------------------------
-- Create
-- ---------------------------------------------------------------------------
create or replace function public.admin_create_category(
  p_name        text,
  p_slug        text,
  p_description text default null,
  p_icon        text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id   uuid;
  v_slug text := lower(btrim(coalesce(p_slug, '')));
  v_name text := btrim(coalesce(p_name, ''));
  v_next smallint;
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  if v_name = '' then
    raise exception 'A category needs a name.';
  end if;
  if v_slug = '' then
    raise exception 'A category needs a slug.';
  end if;
  -- The slug is a URL segment: /quiz/<slug> and /quiz/<slug>/<tier>. Anything
  -- outside this set would either need escaping or quietly fail to route.
  if v_slug !~ '^[a-z0-9][a-z0-9_-]*$' then
    raise exception 'A slug may use lowercase letters, numbers, hyphens and underscores, and must start with a letter or number.';
  end if;
  if exists (select 1 from public.categories c where c.slug = v_slug) then
    raise exception 'A category with the slug % already exists.', v_slug;
  end if;

  select coalesce(max(c.sort_order), 0) + 1 into v_next from public.categories c;

  insert into public.categories (name, slug, description, icon, sort_order)
  values (v_name, v_slug, nullif(btrim(coalesce(p_description, '')), ''),
          nullif(btrim(coalesce(p_icon, '')), ''), v_next)
  returning id into v_id;

  perform public.log_admin_action(
    'category.create', 'category', v_id::text, v_name,
    jsonb_build_object('slug', v_slug, 'sort_order', v_next)
  );

  return v_id;
end;
$$;

revoke all on function public.admin_create_category(text, text, text, text) from public, anon;
grant execute on function public.admin_create_category(text, text, text, text) to authenticated;


-- ---------------------------------------------------------------------------
-- Update
-- ---------------------------------------------------------------------------
-- The slug is deliberately not editable. It is the category's URL, and every
-- level a player has unlocked is reached through it; renaming it silently
-- breaks any link or bookmark pointing at the old one. The display name is
-- what an administrator actually wants to correct, and that is free to change.
create or replace function public.admin_update_category(
  p_id          uuid,
  p_name        text,
  p_description text default null,
  p_icon        text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_old  record;
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;
  if v_name = '' then
    raise exception 'A category needs a name.';
  end if;

  select c.name, c.description, c.icon into v_old
    from public.categories c where c.id = p_id;
  if not found then
    raise exception 'That category no longer exists.';
  end if;

  update public.categories
     set name        = v_name,
         description = nullif(btrim(coalesce(p_description, '')), ''),
         icon        = nullif(btrim(coalesce(p_icon, '')), '')
   where id = p_id;

  perform public.log_admin_action(
    'category.update', 'category', p_id::text, v_name,
    jsonb_build_object('name_from', v_old.name, 'name_to', v_name)
  );
end;
$$;

revoke all on function public.admin_update_category(uuid, text, text, text) from public, anon;
grant execute on function public.admin_update_category(uuid, text, text, text) to authenticated;


-- ---------------------------------------------------------------------------
-- Delete, or explain why not
-- ---------------------------------------------------------------------------
create or replace function public.admin_delete_category(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name       text;
  v_questions  int;
  v_challenges int;
  v_circles    int;
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  select c.name into v_name from public.categories c where c.id = p_id;
  if not found then
    raise exception 'That category no longer exists.';
  end if;

  select count(*) into v_questions  from public.questions q        where q.category_id = p_id;
  select count(*) into v_challenges from public.daily_challenges d where d.category_id = p_id;
  select count(*) into v_circles    from public.study_circles s    where s.category_id = p_id;

  -- Say what is in the way rather than letting a foreign key violation say
  -- nothing useful. Each of these is `on delete no action` in the schema, so
  -- the delete would fail anyway; this is the same refusal with a reason.
  if v_questions > 0 then
    raise exception
      'This category still holds % question(s). Move or delete them first: a category cannot be removed while the bank depends on it.',
      v_questions;
  end if;
  if v_challenges > 0 then
    raise exception 'A daily challenge still points at this category (% of them).', v_challenges;
  end if;
  if v_circles > 0 then
    raise exception 'A study circle still points at this category (% of them).', v_circles;
  end if;

  delete from public.categories where id = p_id;

  perform public.log_admin_action(
    'category.delete', 'category', p_id::text, v_name, '{}'::jsonb
  );
end;
$$;

revoke all on function public.admin_delete_category(uuid) from public, anon;
grant execute on function public.admin_delete_category(uuid) to authenticated;


-- ---------------------------------------------------------------------------
-- Reorder
-- ---------------------------------------------------------------------------
create or replace function public.admin_reorder_categories(p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  if p_ids is null or array_length(p_ids, 1) is null then
    raise exception 'No order was given.';
  end if;

  -- The list must be every category exactly once. A partial list would leave
  -- the categories it omitted holding stale positions that collide with the
  -- new ones, and a list with a duplicate would silently drop a category out
  -- of the order.
  select count(*) into v_total from public.categories;
  if array_length(p_ids, 1) <> v_total then
    raise exception 'The order must list all % categories; it listed %.',
      v_total, array_length(p_ids, 1);
  end if;
  if (select count(distinct x) from unnest(p_ids) as x) <> v_total then
    raise exception 'The order lists the same category more than once.';
  end if;
  if exists (
    select 1 from unnest(p_ids) as x
     where not exists (select 1 from public.categories c where c.id = x)
  ) then
    raise exception 'The order names a category that does not exist.';
  end if;

  update public.categories c
     set sort_order = p.ord
    from (select id, row_number() over () as ord
            from unnest(p_ids) as id) p
   where c.id = p.id;

  perform public.log_admin_action(
    'category.reorder', 'category', null, null,
    jsonb_build_object('count', v_total)
  );
end;
$$;

revoke all on function public.admin_reorder_categories(uuid[]) from public, anon;
grant execute on function public.admin_reorder_categories(uuid[]) to authenticated;


-- ---------------------------------------------------------------------------
-- Editing a question
-- ---------------------------------------------------------------------------
-- Correcting a question is not the same act as approving one, so it does not
-- inherit the approval: an edit clears scholar approval, because what a
-- scholar vouched for is no longer what the question says. The reviewer can
-- approve the corrected version in the same screen straight afterwards.
create or replace function public.admin_update_question(
  p_question_id  uuid,
  p_text         text,
  p_choices      jsonb,
  p_correct_index integer,
  p_explanation  text default null,
  p_citation     text default null,
  p_tier         integer default null,
  p_category_id  uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_text  text := btrim(coalesce(p_text, ''));
  v_count int;
  v_old   record;
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  select q.question_text, q.tier, q.category_id, q.scholar_approved_at
    into v_old
    from public.questions q where q.id = p_question_id;
  if not found then
    raise exception 'That question no longer exists.';
  end if;

  if v_text = '' then
    raise exception 'A question needs its text.';
  end if;

  if jsonb_typeof(p_choices) <> 'array' then
    raise exception 'The choices must be a list.';
  end if;
  v_count := jsonb_array_length(p_choices);
  if v_count < 2 then
    raise exception 'A question needs at least two choices.';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_choices) as c
     where jsonb_typeof(c) <> 'string' or btrim(c #>> '{}') = ''
  ) then
    raise exception 'Every choice needs text.';
  end if;

  -- The index has to point at a choice that exists. Getting this wrong is how
  -- a question becomes unanswerable: `submit_quiz_answer` compares against it
  -- and nothing else, so an out-of-range index marks every answer wrong.
  if p_correct_index is null or p_correct_index < 0 or p_correct_index >= v_count then
    raise exception 'The correct answer must be one of the % choices.', v_count;
  end if;

  if p_tier is not null and (p_tier < 1 or p_tier > 9) then
    raise exception 'A tier runs from 1 to 9.';
  end if;

  if p_category_id is not null
     and not exists (select 1 from public.categories c where c.id = p_category_id) then
    raise exception 'That category does not exist.';
  end if;

  update public.questions
     set question_text        = v_text,
         choices              = p_choices,
         correct_choice_index = p_correct_index::smallint,
         explanation          = nullif(btrim(coalesce(p_explanation, '')), ''),
         citation_reference   = nullif(btrim(coalesce(p_citation, '')), ''),
         tier                 = coalesce(p_tier::smallint, tier),
         category_id          = coalesce(p_category_id, category_id),
         scholar_approved_at  = null,
         scholar_approved_by  = null,
         reviewed_by          = auth.uid()::text,
         reviewed_at          = now(),
         updated_at           = now()
   where id = p_question_id;

  perform public.log_admin_action(
    'question.edit', 'question', p_question_id::text, left(v_text, 120),
    jsonb_build_object(
      'text_changed', v_old.question_text is distinct from v_text,
      'tier_from', v_old.tier,
      'tier_to', coalesce(p_tier, v_old.tier),
      'category_changed', p_category_id is not null and p_category_id is distinct from v_old.category_id,
      'scholar_approval_cleared', v_old.scholar_approved_at is not null
    )
  );
end;
$$;

revoke all on function public.admin_update_question(uuid, text, jsonb, integer, text, text, integer, uuid) from public, anon;
grant execute on function public.admin_update_question(uuid, text, jsonb, integer, text, text, integer, uuid) to authenticated;
