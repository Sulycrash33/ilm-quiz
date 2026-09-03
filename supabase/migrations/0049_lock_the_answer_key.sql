-- ---------------------------------------------------------------------------
-- 0049 — The answer key stops being downloadable.
-- ---------------------------------------------------------------------------
--
-- The SELECT policy on `questions` is `using (review_status = 'published')`.
-- Row Level Security is row-level only — Postgres has no column-level policy
-- — so that rule says which rows are visible and nothing about which columns
-- are. `correct_choice_index` and `explanation` sit in the same row as the
-- question text, and the policy hands over the whole row.
--
-- `quiz-service.ts` has always declined to select those two columns, and says
-- so in a comment: "they must never reach the browser before an answer is
-- submitted." That comment states an intention. It does not enforce one.
-- Anyone holding the anon key — which ships inside the app itself — can ask
-- PostgREST for `correct_choice_index` directly and receive it, regardless of
-- what the app's own client code chooses to request. Every answer in the
-- 5,220-question bank has been downloadable since the schema existed.
--
-- `quiz_room_questions` (multiplayer) has the identical shape of the same
-- bug: "Room participants can view questions" is `room_id in (my_room_ids())`
-- with no column restriction, and the row carries `correct_index`. The app
-- already built `quiz_room_questions_safe`, a view with that column removed,
-- and reads through it everywhere — but the base table's own SELECT grant was
-- never narrowed, so the view was a convention, not a wall. A participant
-- could read `correct_index` straight off the base table exactly as they
-- could read `correct_choice_index` off `questions`.
--
-- ── Why this needed more than a grant ──────────────────────────────────────
-- Four places read one of these two columns as the `authenticated` role —
-- three admin pages and one lifeline — because a server action built with
-- `@/lib/supabase/server` runs under the signed-in user's own JWT and is
-- therefore bound by the same column privileges as a request from the
-- browser. Revoking the column without moving these first would have broken
-- the admin console and the fifty-fifty lifeline in the same migration that
-- fixed the leak.
--
-- Multiplayer's own seeding step had the same shape: `startMultiplayerQuiz`
-- selected `correct_choice_index` from `questions` as `authenticated` in
-- order to copy it into `quiz_room_questions.correct_index`. That whole
-- operation moves into one function below rather than staying a select
-- followed by a client-side insert, which is both the fix and, incidentally,
-- the same atomicity the rest of this codebase's privileged writes already
-- have.

-- ---------------------------------------------------------------------------
-- 1. The fifty-fifty lifeline never learns the correct answer any more
-- ---------------------------------------------------------------------------
--
-- Before, this ran client-side against `questions.correct_choice_index` and
-- computed two wrong indices in TypeScript. The database now does the whole
-- computation and returns only the two indices to eliminate — the correct
-- index itself never crosses out of this function.

create or replace function public.fifty_fifty_choices(p_question_id uuid)
returns int[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correct int;
  v_total int;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  select correct_choice_index, jsonb_array_length(choices)
    into v_correct, v_total
    from public.questions
   where id = p_question_id
     and review_status = 'published';

  if v_correct is null then
    raise exception 'Question not found.';
  end if;

  -- Two of the wrong indices, chosen at random and returned in no particular
  -- order. `order by random()` is a plain shuffle-and-take, not a hand-rolled
  -- one — safer than reimplementing Fisher-Yates for two elements. `random()`
  -- is fine here: this picks which two wrong options to remove, not anything
  -- that decides a reward, so migration 0008's objection to chance does not
  -- apply.
  return array(
    select x from generate_series(0, v_total - 1) as x
     where x <> v_correct
     order by random()
     limit 2
  );
end;
$$;

comment on function public.fifty_fifty_choices(uuid) is
  'Two wrong option indices to eliminate. correct_choice_index is read here and never returned — the fifty-fifty lifeline no longer needs the client to know it.';

revoke all on function public.fifty_fifty_choices(uuid) from public, anon;
grant execute on function public.fifty_fifty_choices(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Starting a multiplayer round, as one atomic server-side operation
-- ---------------------------------------------------------------------------
--
-- Replaces the select-then-insert `startMultiplayerQuiz` used to do as the
-- signed-in host. The host check, the question selection and the write all
-- happen inside one function now, which also closes a small race the old code
-- had: two rapid calls could each pass the host check and both insert a full
-- set of questions.

create or replace function public.start_multiplayer_quiz_rpc(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.quiz_rooms%rowtype;
  v_inserted int;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  select * into v_room from public.quiz_rooms where id = p_room_id for update;
  if v_room.id is null then
    raise exception 'Room not found';
  end if;
  if v_room.host_id <> auth.uid() then
    raise exception 'Only the host can start the quiz.';
  end if;

  insert into public.quiz_room_questions
    (room_id, question_id, question_text, choices, correct_index, time_limit, order_num)
  select p_room_id, qs.id, qs.question_text, qs.choices, qs.correct_choice_index,
         30, row_number() over (order by random())
    from public.questions qs
   where qs.category_id::text = v_room.category
     and qs.difficulty::text = v_room.difficulty
     and qs.review_status = 'published'
   order by random()
   limit v_room.question_count;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    raise exception 'No questions available for this category';
  end if;

  update public.quiz_rooms
     set status = 'starting',
         current_question = 1,
         starts_at = now() + interval '5 seconds'
   where id = p_room_id;
end;
$$;

comment on function public.start_multiplayer_quiz_rpc(uuid) is
  'Seeds a multiplayer room and starts it. Replaces a client-side select of correct_choice_index followed by an insert; both now happen inside this function, host-checked and atomic.';

revoke all on function public.start_multiplayer_quiz_rpc(uuid) from public, anon;
grant execute on function public.start_multiplayer_quiz_rpc(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. The two admin reads that selected the answer key directly
-- ---------------------------------------------------------------------------

/** Questions still needing an explanation draft, for `generateDrafts`. Was a
    direct select as `authenticated`; admin-gated the same way every other
    function in the explanations project already is. */
create or replace function public.admin_questions_for_drafting(
  p_category_id uuid,
  p_limit int default 10
)
returns table (
  o_id uuid,
  o_question_text text,
  o_choices jsonb,
  o_correct_choice_index smallint,
  o_explanation text,
  o_citation_reference text,
  o_tier smallint,
  o_category_name text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then
    raise exception 'Admins only.';
  end if;

  return query
    select qs.id, qs.question_text, qs.choices, qs.correct_choice_index,
           qs.explanation, qs.citation_reference, qs.tier, c.name
      from public.questions qs
      left join public.categories c on c.id = qs.category_id
     where qs.category_id = p_category_id
       and qs.review_status = 'published'
       and qs.explanation_draft is null
     order by qs.tier
     limit greatest(1, least(p_limit, 10));
end;
$$;

revoke all on function public.admin_questions_for_drafting(uuid, int) from public, anon;
grant execute on function public.admin_questions_for_drafting(uuid, int) to authenticated;

/** The ai_drafted review queue, for `/admin/review`. Was a direct select as
    `authenticated`; reviewer-gated the same way the page's own writes are. */
create or replace function public.reviewer_pending_questions()
returns table (
  o_id uuid,
  o_question_text text,
  o_choices jsonb,
  o_correct_choice_index smallint,
  o_explanation text,
  o_citation_reference text,
  o_madhab_tag text,
  o_difficulty text,
  o_language text,
  o_category_id uuid,
  o_category_name text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles p
     where p.id = auth.uid() and p.role in ('reviewer', 'admin')
  ) then
    raise exception 'Not authorized. This page is restricted to content reviewers.';
  end if;

  return query
    select qs.id, qs.question_text, qs.choices, qs.correct_choice_index,
           qs.explanation, qs.citation_reference, qs.madhab_tag::text,
           qs.difficulty::text, qs.language::text, qs.category_id, c.name
      from public.questions qs
      left join public.categories c on c.id = qs.category_id
     where qs.review_status = 'ai_drafted'
     order by qs.created_at asc;
end;
$$;

revoke all on function public.reviewer_pending_questions() from public, anon;
grant execute on function public.reviewer_pending_questions() to authenticated;

-- ---------------------------------------------------------------------------
-- 4. The columns themselves, locked
-- ---------------------------------------------------------------------------
--
-- Every remaining read of these columns now goes through a SECURITY DEFINER
-- function, which runs as this function's owner and is unaffected by a
-- privilege revoked from `anon` or `authenticated`. `submit_quiz_answer`,
-- `submit_multiplayer_answer_rpc` and every admin function above keep working
-- exactly as before. A plain `select` from the browser, or from a server
-- action running as the signed-in user, no longer can.
--
-- ── Why a per-column REVOKE alone does nothing here ────────────────────────
-- Tried first, and it failed a check in this migration's own dry run:
-- `authenticated` could still select `correct_choice_index` afterwards.
-- The reason is that Supabase's default schema setup already grants
-- table-level SELECT — `grant select on all tables in schema public to
-- anon, authenticated` — and Postgres tracks table-level and column-level
-- privileges as separate ACL entries. Column access is permitted if
-- *either* grants it, so a column-level REVOKE on top of a standing
-- table-level GRANT changes nothing: the table-level grant still covers
-- every column, that one included. Column-level security in Postgres
-- has to work the other way around: revoke the table-level privilege
-- entirely, then grant SELECT back on exactly the columns that should
-- stay visible.
--
-- That is what follows. Only SELECT is touched — INSERT, UPDATE, DELETE and
-- the row policies that gate them are exactly as they were. Every column
-- routinely read directly by the app (`quiz-service.ts`'s three published-
-- question queries, the three count-only queries, `getCategoryLevels`) is
-- named below; `correct_choice_index` and `explanation` are the only two
-- omitted, matching the two the handoff named. `admin_update_question` and
-- `admin_set_question_explanation` write these two columns and never need
-- to read them back, so their privilege is untouched.

revoke select on public.questions from anon, authenticated;
grant select (
  id, category_id, difficulty, language, madhab_tag, question_text, choices,
  citation_reference, source_type, review_status, reviewed_by, reviewed_at,
  created_at, updated_at, tier, tier_is_estimated, seed_batch, choice_meta,
  scholar_approved_at, scholar_approved_by,
  explanation_draft, explanation_draft_at, explanation_draft_by
) on public.questions to anon, authenticated;

revoke select on public.quiz_room_questions from anon, authenticated;
grant select (
  id, room_id, question_id, question_text, choices, time_limit, order_num, started_at
) on public.quiz_room_questions to anon, authenticated;
