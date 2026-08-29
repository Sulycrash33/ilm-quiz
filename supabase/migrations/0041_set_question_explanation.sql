-- Migration 0041: rewriting an explanation is not editing the question.
--
-- WHY THIS IS SEPARATE FROM admin_update_question
-- `admin_update_question` (0040) clears scholar approval, and it is right to:
-- it can change the question text, the choices, and which choice is correct,
-- so what a scholar vouched for is genuinely no longer what the question says.
--
-- The explanations project is a different act on a different scale. It rewrites
-- the teaching text of ~5,220 questions and touches neither the question, the
-- choices, nor the answer. Putting it through `admin_update_question` would
-- withdraw approval from every question it passed over, which would make the
-- order of two unrelated projects matter: review a category first and the
-- rewrite would silently undo it.
--
-- So this function changes the explanation and the citation and nothing else,
-- and leaves `scholar_approved_at` alone. That is a deliberate and arguable
-- line: a scholar approves the question and its answer, and an explanation
-- that is merely fuller does not contradict what they approved. It is not a
-- loophole around 0040 — this function cannot reach the text, the choices or
-- the correct index, which are the things approval is actually about.
--
-- The citation moves with the explanation because a longer explanation is
-- usually what makes a better citation available, and separating them would
-- mean two writes for one edit.
--
-- `reviewed_at` is deliberately NOT bumped. That column records when a person
-- last looked at the question, and a bulk rewrite is not a person looking.

create or replace function public.admin_set_question_explanation(
  p_question_id uuid,
  p_explanation text,
  p_citation    text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_len int;
  v_new     text := nullif(btrim(coalesce(p_explanation, '')), '');
  v_text    text;
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  select length(coalesce(q.explanation, '')), q.question_text
    into v_old_len, v_text
    from public.questions q
   where q.id = p_question_id;

  if not found then
    raise exception 'That question no longer exists.';
  end if;

  if v_new is null then
    raise exception 'An explanation cannot be blank. Use the question editor to clear one.';
  end if;

  update public.questions
     set explanation        = v_new,
         citation_reference = coalesce(
           nullif(btrim(coalesce(p_citation, '')), ''),
           citation_reference
         ),
         updated_at         = now()
   where id = p_question_id;

  perform public.log_admin_action(
    'question.explanation', 'question', p_question_id::text, left(v_text, 120),
    jsonb_build_object(
      'chars_from', v_old_len,
      'chars_to', length(v_new),
      'citation_changed', nullif(btrim(coalesce(p_citation, '')), '') is not null
    )
  );
end;
$$;

revoke all on function public.admin_set_question_explanation(uuid, text, text) from public, anon;
grant execute on function public.admin_set_question_explanation(uuid, text, text) to authenticated;
