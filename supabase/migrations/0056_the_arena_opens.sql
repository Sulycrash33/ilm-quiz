-- ---------------------------------------------------------------------------
-- 0056 — The arena opens.
-- ---------------------------------------------------------------------------
--
-- 0054 built two banks and pinned every reader to the browsable one so nothing
-- moved. This is the flip: the daily challenge and multiplayer now draw from
-- the arena bank, and they stop asking anybody to choose a subject.
--
-- ── The idea, in the owner's words ────────────────────────────────────────
-- "Just randomly popping questions for players instead of asking the player to
-- select a tier or category... if any player wants a tier or category they
-- know where to go." The categories remain exactly as they were: 29 subjects,
-- nine levels each, chosen deliberately. Everything else now arrives
-- unannounced out of 5,246 questions the categories never teach.
--
-- ── Random subject, but not random difficulty ─────────────────────────────
-- The bank is spread evenly across nine tiers, so uniform random would give
-- every question an ~11% chance of being Expert. In a five-question daily a
-- new player would have roughly a 44% chance of meeting at least one question
-- written for someone nine levels above them — and nobody has played this app
-- yet, so that experience is entirely untested. Difficulty therefore stays
-- contextual, and each surface keeps the notion of "appropriate" it already
-- had:
--
--   daily challenge   a spread across the whole bank — it is a shared
--                     challenge, and a little stretch is the point
--   battle            the room's own difficulty, which the host still picks
--   play modes        the band `startGameRun` already computes per player
--                     (client side, in quiz-service)
--
-- The player still selects nothing about subject. That was the whole idea and
-- it survives intact.
--
-- ── "Random" must not mean "different for each player" ────────────────────
-- Two of these are shared experiences and randomising per player would break
-- them quietly:
--
--   * the daily challenge is the same five questions for everyone on a given
--     day — that is what makes it comparable and worth talking about. It stays
--     deterministic in the date, exactly as before; only the pool changed.
--   * a battle's questions are seeded once into `quiz_room_questions` when the
--     host starts, so both players face the same set. Unchanged.
--
-- ── The daily challenge loses its category ────────────────────────────────
-- It used to pick one category by date-hash and take five questions from it,
-- so a whole day could be Tajwid. Now it hashes over the arena bank itself, so
-- a day's five can come from any of the thirteen arena subjects. That is the
-- "unannounced" feel the owner asked for, and it makes a single day a broader
-- test than a single-subject set was.
--
-- `daily_challenges.category_id` is nullable and is now written null. It is
-- kept rather than dropped: every challenge before today has a real category
-- and that history should stay legible.

-- ---------------------------------------------------------------------------
-- A battle no longer has a subject.
-- ---------------------------------------------------------------------------
alter table public.quiz_rooms alter column category drop not null;

comment on column public.quiz_rooms.category is
  'Historical. Rooms created before 0056 name the category they drew from; rooms created after it are null, because a battle now draws from the whole arena bank. Not used for question selection.';

create or replace function public.start_multiplayer_quiz_rpc(p_room_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
   -- The arena bank, across every subject. The room's own category is no
   -- longer consulted: a battle is meant to be unpredictable, and the host
   -- picking a subject was the opposite of that. Difficulty is still the
   -- room's, so the host keeps the one dial that decides whether the match is
   -- winnable.
   where qs.pool = 'arena'
     and qs.difficulty::text = v_room.difficulty
     and qs.review_status = 'published'
   order by random()
   limit v_room.question_count;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    raise exception 'No questions available at this difficulty';
  end if;

  update public.quiz_rooms
     set status = 'starting',
         current_question = 1,
         starts_at = now() + interval '5 seconds'
   where id = p_room_id;
end;
$function$;

-- ---------------------------------------------------------------------------
-- The daily challenge draws from the whole arena bank.
-- ---------------------------------------------------------------------------
create or replace function public.ensure_daily_challenge(p_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(o_id uuid, o_challenge_date date, o_question_count integer, o_reward_coins integer, o_reward_xp integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_existing record;
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

  -- Five questions from the arena bank, chosen by the date rather than by
  -- chance, so every player gets the same five and tomorrow's are different.
  -- No category step: a day can now span any of the arena subjects.
  select array_agg(q.id order by md5(q.id::text || p_date::text))
    into v_questions
  from (
    select q2.id
    from public.questions q2
    where q2.pool = 'arena' and q2.review_status = 'published'
    order by md5(q2.id::text || p_date::text)
    limit c_questions
  ) q;

  if v_questions is null or array_length(v_questions, 1) < c_questions then
    -- Better no challenge than one that cannot be completed.
    return;
  end if;

  insert into public.daily_challenges
    (challenge_date, category_id, question_ids, reward_coins, reward_xp)
  values (p_date, null, v_questions, c_coins, c_xp)
  on conflict (challenge_date) do nothing;

  return query
  select dc.id, dc.challenge_date, coalesce(array_length(dc.question_ids, 1), 0),
         dc.reward_coins, dc.reward_xp
  from public.daily_challenges dc
  where dc.challenge_date = p_date;
end;
$function$;

revoke all on function public.ensure_daily_challenge(date) from public, anon;
grant execute on function public.ensure_daily_challenge(date) to authenticated;
