create table public.profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references auth.users(id) on delete cascade,
    age int4,
    height_cm numeric,
    weight_kg numeric,
    activity_level text,
    experience_level text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


create table public.fitness_goals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references auth.users(id) on delete cascade,
    goal text not null,
    daily_calorie_target int4,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.fitness_goals enable row level security;

create policy "Users can view own fitness goal"
on public.fitness_goals
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create own fitness goal"
on public.fitness_goals
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own fitness goal"
on public.fitness_goals
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


create table public.meal_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    meal_name text not null,
    calories int4 not null check (calories >= 0),
    logged_at timestamptz default now(),
    created_at timestamptz default now()
);

alter table public.meal_logs enable row level security;

create policy "Users can view own meal logs"
on public.meal_logs
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create own meal logs"
on public.meal_logs
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own meal logs"
on public.meal_logs
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own meal logs"
on public.meal_logs
for delete
to authenticated
using (auth.uid() = user_id);