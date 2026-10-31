-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- Optional personal details for each account (first name, last name, phone).

begin;

-- ─── USER PROFILES ───────────────────────────────────────────────────────────
-- Kept apart from public.users, which holds payment status (is_founder, paid_at)
-- that users must never be able to edit. Never read by the share-link API.
create table public.user_profiles (
  user_id     uuid references public.users(id) on delete cascade primary key,
  first_name  text check (char_length(first_name) <= 100),
  last_name   text check (char_length(last_name) <= 100),
  phone       text check (char_length(phone) <= 30),
  updated_at  timestamptz default now()
);

alter table public.user_profiles enable row level security;

-- Each person can read, add and change only their own details
create policy "user_profiles: read own row" on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "user_profiles: insert own row" on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "user_profiles: update own row" on public.user_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

commit;
