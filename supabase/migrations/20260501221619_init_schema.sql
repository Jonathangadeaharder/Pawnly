-- Profiles: user profile data
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  rating integer not null default 1200,
  games_played integer not null default 0,
  puzzles_solved integer not null default 0,
  streak integer not null default 0,
  joined_at timestamptz not null default now()
);

-- Games: game history
create table games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  opponent_type text not null check (opponent_type in ('ai', 'human')),
  result text not null check (result in ('win', 'loss', 'draw')),
  moves jsonb not null default '[]',
  time_control text,
  difficulty text,
  played_at timestamptz not null default now()
);

-- Achievements: unlocked achievements
create table achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  unique(user_id, achievement_id)
);

-- Puzzle progress: puzzle completion tracking
create table puzzle_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  puzzle_id text not null,
  solved boolean not null default false,
  attempts integer not null default 0,
  solved_at timestamptz,
  unique(user_id, puzzle_id)
);

-- Lesson progress: lesson completion tracking
create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  unique(user_id, lesson_id)
);

-- Streaks: daily streak tracking
create table streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  active boolean not null default true,
  unique(user_id, date)
);

-- Indexes for common queries
create index idx_games_user_id on games(user_id);
create index idx_games_played_at on games(played_at desc);
create index idx_achievements_user_id on achievements(user_id);
create index idx_puzzle_progress_user_id on puzzle_progress(user_id);
create index idx_lesson_progress_user_id on lesson_progress(user_id);
create index idx_streaks_user_id on streaks(user_id);
create index idx_streaks_date on streaks(date desc);

-- Row Level Security
alter table profiles enable row level security;
alter table games enable row level security;
alter table achievements enable row level security;
alter table puzzle_progress enable row level security;
alter table lesson_progress enable row level security;
alter table streaks enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can view own games"
  on games for select
  using (auth.uid() = user_id);

create policy "Users can insert own games"
  on games for insert
  with check (auth.uid() = user_id);

create policy "Users can view own achievements"
  on achievements for select
  using (auth.uid() = user_id);

create policy "Users can insert own achievements"
  on achievements for insert
  with check (auth.uid() = user_id);

create policy "Users can view own puzzle progress"
  on puzzle_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own puzzle progress"
  on puzzle_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own puzzle progress"
  on puzzle_progress for update
  using (auth.uid() = user_id);

create policy "Users can view own lesson progress"
  on lesson_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own lesson progress"
  on lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lesson progress"
  on lesson_progress for update
  using (auth.uid() = user_id);

create policy "Users can view own streaks"
  on streaks for select
  using (auth.uid() = user_id);

create policy "Users can insert own streaks"
  on streaks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own streaks"
  on streaks for update
  using (auth.uid() = user_id);
