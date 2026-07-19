-- Migration 0003: Multiplayer Quiz Rooms
-- Adds tables for real-time multiplayer quiz functionality

-- 1. Quiz Rooms
create table if not exists public.quiz_rooms (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  host_id uuid references auth.users(id) on delete cascade not null,
  host_name text not null,
  status text not null default 'waiting' check (status in ('waiting', 'starting', 'in_progress', 'finished')),
  category text not null,
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  max_players int not null default 4 check (max_players between 2 and 10),
  current_players int not null default 1,
  question_count int not null default 10 check (question_count between 5 and 30),
  current_question int not null default 0,
  created_at timestamptz default now(),
  starts_at timestamptz,
  finished_at timestamptz
);

-- 2. Quiz Room Players
create table if not exists public.quiz_room_players (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.quiz_rooms(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  user_name text not null,
  avatar_url text,
  score int not null default 0,
  correct_answers int not null default 0,
  total_answers int not null default 0,
  streak int not null default 0,
  is_ready boolean not null default false,
  is_host boolean not null default false,
  joined_at timestamptz default now(),
  unique(room_id, user_id)
);

-- 3. Quiz Room Questions
create table if not exists public.quiz_room_questions (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.quiz_rooms(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade not null,
  question_text text not null,
  choices jsonb not null,
  correct_index int not null,
  time_limit int not null default 30,
  order_num int not null,
  started_at timestamptz,
  unique(room_id, order_num)
);

-- 4. Quiz Room Answers
create table if not exists public.quiz_room_answers (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.quiz_rooms(id) on delete cascade not null,
  question_id uuid references public.quiz_room_questions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  selected_index int not null,
  is_correct boolean not null,
  time_taken int not null,
  answered_at timestamptz default now(),
  unique(room_id, question_id, user_id)
);

-- 5. Indexes for performance
create index if not exists idx_quiz_rooms_code on public.quiz_rooms(code);
create index if not exists idx_quiz_rooms_status on public.quiz_rooms(status);
create index if not exists idx_quiz_room_players_room on public.quiz_room_players(room_id);
create index if not exists idx_quiz_room_players_user on public.quiz_room_players(user_id);
create index if not exists idx_quiz_room_questions_room on public.quiz_room_questions(room_id);
create index if not exists idx_quiz_room_answers_room on public.quiz_room_answers(room_id);
create index if not exists idx_quiz_room_answers_question on public.quiz_room_answers(question_id);

-- 6. RLS Policies

-- Quiz Rooms: anyone can read waiting rooms, only host can update
alter table public.quiz_rooms enable row level security;

create policy "Anyone can view waiting rooms"
  on public.quiz_rooms for select
  using (true);

create policy "Authenticated users can create rooms"
  on public.quiz_rooms for insert
  with check (auth.uid() = host_id);

create policy "Host can update room"
  on public.quiz_rooms for update
  using (auth.uid() = host_id);

create policy "Host can delete room"
  on public.quiz_rooms for delete
  using (auth.uid() = host_id);

-- Quiz Room Players: anyone in the room can read, authenticated users can join
alter table public.quiz_room_players enable row level security;

create policy "Anyone can view room players"
  on public.quiz_room_players for select
  using (true);

create policy "Authenticated users can join rooms"
  on public.quiz_room_players for insert
  with check (auth.uid() = user_id);

create policy "Users can update own player data"
  on public.quiz_room_players for update
  using (auth.uid() = user_id);

create policy "Users can leave rooms"
  on public.quiz_room_players for delete
  using (auth.uid() = user_id);

-- Quiz Room Questions: anyone in the room can read
alter table public.quiz_room_questions enable row level security;

create policy "Anyone can view room questions"
  on public.quiz_room_questions for select
  using (true);

create policy "Host can insert questions"
  on public.quiz_room_questions for insert
  with check (
    exists (
      select 1 from public.quiz_rooms
      where quiz_rooms.id = room_id
        and quiz_rooms.host_id = auth.uid()
    )
  );

-- Quiz Room Answers: anyone in the room can read, users can submit own answers
alter table public.quiz_room_answers enable row level security;

create policy "Anyone can view room answers"
  on public.quiz_room_answers for select
  using (true);

create policy "Users can submit own answers"
  on public.quiz_room_answers for insert
  with check (auth.uid() = user_id);

-- 7. Enable Realtime for multiplayer tables
alter publication supabase_realtime add table public.quiz_rooms;
alter publication supabase_realtime add table public.quiz_room_players;
alter publication supabase_realtime add table public.quiz_room_answers;

-- 8. Function to clean up old rooms (run periodically)
create or replace function public.cleanup_old_rooms()
returns void
language plpgsql
security definer
as $$
begin
  -- Delete rooms that are finished and older than 1 hour
  delete from public.quiz_rooms
  where status = 'finished'
    and finished_at < now() - interval '1 hour';

  -- Delete waiting rooms older than 30 minutes
  delete from public.quiz_rooms
  where status = 'waiting'
    and created_at < now() - interval '30 minutes';
end;
$$;
