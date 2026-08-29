-- Migration 0042: a place for a rewritten explanation to wait.
--
-- WHY A STAGING COLUMN AND NOT A DIRECT WRITE
-- The 5,220 explanations already in the bank average 125 characters and were
-- produced by drafting with a model and publishing the result. docs/HANDOFF.md
-- is explicit that whatever replaces them must go through review instead of
-- repeating that. A rewrite that writes straight into `explanation` is the
-- same pattern with better prose, and players would read every word of it
-- before any person had.
--
-- So a draft lands in `explanation_draft`, which nothing player-facing reads.
-- `submit_quiz_answer` returns `explanation`, the round review reads
-- `explanation`, and neither knows this column exists. A draft becomes visible
-- only when a person publishes it, one question at a time.
--
-- WHAT IS WRONG WITH THE CURRENT EXPLANATIONS
-- Not only their length. Sampled across Contemporary Issues, most of them
-- restate the correct answer in different words:
--
--   Q: Why is lab-grown meat a genuinely new fiqh question?
--   A: Because classical rulings assume an animal was slaughtered.
--   E: "Classical halal-meat rulings assume a slaughter step that lab-
--      cultivated meat does not involve."
--
-- A player who chose correctly learns nothing, and one who chose wrongly is
-- told the right answer again rather than why theirs was wrong. Length is the
-- symptom; a paraphrase of the answer is the disease.
--
-- PUBLISHING KEEPS SCHOLAR APPROVAL
-- Publishing a draft goes through the same reasoning as migration 0041: it
-- moves prose into `explanation` and touches neither the question, the choices
-- nor the correct index, so approval survives it. That is what lets the
-- explanations project and the review project run in either order.

alter table public.questions
  add column if not exists explanation_draft    text,
  add column if not exists explanation_draft_at timestamptz,
  add column if not exists explanation_draft_by text;

comment on column public.questions.explanation_draft is
  'A rewritten explanation waiting for a person to accept it. Nothing '
  'player-facing reads this column; publishing copies it into `explanation`. '
  'See migration 0042.';

-- Finding the questions that have a draft waiting has to be cheap: the review
-- screen pages through them by category.
create index if not exists questions_explanation_draft_pending
  on public.questions (category_id)
  where explanation_draft is not null;


-- ---------------------------------------------------------------------------
-- Stage a draft. Never visible to a player.
-- ---------------------------------------------------------------------------
create or replace function public.admin_stage_explanation(
  p_question_id uuid,
  p_draft       text,
  p_model       text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_draft text := nullif(btrim(coalesce(p_draft, '')), '');
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;
  if v_draft is null then
    raise exception 'A draft cannot be blank.';
  end if;
  if not exists (select 1 from public.questions q where q.id = p_question_id) then
    raise exception 'That question no longer exists.';
  end if;

  update public.questions
     set explanation_draft    = v_draft,
         explanation_draft_at = now(),
         explanation_draft_by = coalesce(nullif(btrim(coalesce(p_model, '')), ''), 'unknown')
   where id = p_question_id;
end;
$$;

revoke all on function public.admin_stage_explanation(uuid, text, text) from public, anon;
grant execute on function public.admin_stage_explanation(uuid, text, text) to authenticated;


-- ---------------------------------------------------------------------------
-- Accept a draft: this is the only way a rewrite reaches a player.
-- ---------------------------------------------------------------------------
create or replace function public.admin_publish_explanation(p_question_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_draft   text;
  v_old_len int;
  v_text    text;
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  select q.explanation_draft, length(coalesce(q.explanation, '')), q.question_text
    into v_draft, v_old_len, v_text
    from public.questions q where q.id = p_question_id;

  if not found then
    raise exception 'That question no longer exists.';
  end if;
  if v_draft is null then
    raise exception 'There is no draft to publish for that question.';
  end if;

  -- Only the prose moves. Scholar approval survives for the same reason it
  -- survives `admin_set_question_explanation`: the question, its choices and
  -- its correct answer are untouched, and those are what approval is about.
  update public.questions
     set explanation          = v_draft,
         explanation_draft    = null,
         explanation_draft_at = null,
         explanation_draft_by = null,
         updated_at           = now()
   where id = p_question_id;

  perform public.log_admin_action(
    'explanation.publish', 'question', p_question_id::text, left(v_text, 120),
    jsonb_build_object('chars_from', v_old_len, 'chars_to', length(v_draft))
  );
end;
$$;

revoke all on function public.admin_publish_explanation(uuid) from public, anon;
grant execute on function public.admin_publish_explanation(uuid) to authenticated;


-- ---------------------------------------------------------------------------
-- Throw a draft away.
-- ---------------------------------------------------------------------------
create or replace function public.admin_discard_explanation(p_question_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_text text;
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  select q.question_text into v_text
    from public.questions q where q.id = p_question_id and q.explanation_draft is not null;
  if not found then
    raise exception 'There is no draft to discard for that question.';
  end if;

  update public.questions
     set explanation_draft = null, explanation_draft_at = null, explanation_draft_by = null
   where id = p_question_id;

  perform public.log_admin_action(
    'explanation.discard', 'question', p_question_id::text, left(v_text, 120), '{}'::jsonb
  );
end;
$$;

revoke all on function public.admin_discard_explanation(uuid) from public, anon;
grant execute on function public.admin_discard_explanation(uuid) to authenticated;


-- ---------------------------------------------------------------------------
-- What a reviewer needs on screen, counted and sliced in the database.
-- ---------------------------------------------------------------------------
-- PostgREST caps an unbounded select at 1,000 rows, which has bitten this
-- project twice: the category grid in 0029 and the question console in 0033.
-- A category holds 180 questions, so this one would fit — but the "all
-- categories" view would not, and the habit is cheaper than the bug.
create or replace function public.admin_list_explanation_drafts(
  p_category_id uuid default null,
  p_limit       integer default 25,
  p_offset      integer default 0
)
returns table(
  o_id            uuid,
  o_question      text,
  o_correct       text,
  o_category      text,
  o_tier          smallint,
  o_current       text,
  o_current_chars integer,
  o_draft         text,
  o_draft_chars   integer,
  o_drafted_by    text,
  o_total         bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with matching as (
    select q.id, q.question_text, q.choices, q.correct_choice_index, q.tier,
           q.explanation, q.explanation_draft, q.explanation_draft_by, c.name as category
      from public.questions q
      join public.categories c on c.id = q.category_id
     where q.explanation_draft is not null
       and (p_category_id is null or q.category_id = p_category_id)
       and public.is_admin()
  )
  select m.id,
         m.question_text,
         m.choices ->> m.correct_choice_index,
         m.category,
         m.tier,
         m.explanation,
         length(coalesce(m.explanation, '')),
         m.explanation_draft,
         length(m.explanation_draft),
         m.explanation_draft_by,
         (select count(*) from matching)
    from matching m
   order by m.category, m.tier, m.id
   limit greatest(1, least(coalesce(p_limit, 25), 100))
  offset greatest(0, coalesce(p_offset, 0));
$$;

revoke all on function public.admin_list_explanation_drafts(uuid, integer, integer) from public, anon;
grant execute on function public.admin_list_explanation_drafts(uuid, integer, integer) to authenticated;
