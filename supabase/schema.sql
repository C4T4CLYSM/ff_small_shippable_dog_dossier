-- Dog Dossier — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run

-- ─── EXTENSIONS ──────────────────────────────────────────────────────────────
create extension if not exists pgcrypto;

-- ─── USERS ───────────────────────────────────────────────────────────────────
create table public.users (
  id              uuid references auth.users(id) on delete cascade primary key,
  email           text not null,
  stripe_customer_id text,
  is_founder      boolean default false,
  paid_at         timestamptz,
  created_at      timestamptz default now()
);

-- Auto-create a user row when someone signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── DOGS ────────────────────────────────────────────────────────────────────
create table public.dogs (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references public.users(id) on delete cascade not null,
  name            text not null,
  breed           text,
  date_of_birth   date,
  weight_lbs      numeric(5,1),
  sex             text check (sex in ('male', 'female')),
  spayed_neutered boolean,
  coat_color      text,
  photo_url       text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── DOG SAFETY ──────────────────────────────────────────────────────────────
create table public.dog_safety (
  id                        uuid default gen_random_uuid() primary key,
  dog_id                    uuid references public.dogs(id) on delete cascade not null unique,
  emergency_contact_name    text,
  emergency_contact_phone   text,
  vet_name                  text,
  vet_phone                 text,
  vet_address               text,
  microchip_number          text,
  medical_conditions        text,
  allergies                 text,
  medications               jsonb default '[]'::jsonb,
  updated_at                timestamptz default now()
);

-- ─── DOG ROUTINE ─────────────────────────────────────────────────────────────
create table public.dog_routine (
  id                uuid default gen_random_uuid() primary key,
  dog_id            uuid references public.dogs(id) on delete cascade not null unique,
  feeding_schedule  jsonb default '[]'::jsonb,
  walk_schedule     text,
  potty_schedule    text,
  crate_trained     boolean,
  sleep_location    text,
  exercise_level    text check (exercise_level in ('low', 'medium', 'high')),
  updated_at        timestamptz default now()
);

-- ─── DOG BEHAVIOR ────────────────────────────────────────────────────────────
create table public.dog_behavior (
  id                uuid default gen_random_uuid() primary key,
  dog_id            uuid references public.dogs(id) on delete cascade not null unique,
  good_with_kids    text check (good_with_kids in ('yes', 'no', 'caution')),
  good_with_dogs    text check (good_with_dogs in ('yes', 'no', 'caution')),
  good_with_cats    text check (good_with_cats in ('yes', 'no', 'caution')),
  known_fears       text,
  known_commands    text,
  leash_behavior    text,
  additional_notes  text,
  updated_at        timestamptz default now()
);

-- ─── DOG SHARE LINKS ─────────────────────────────────────────────────────────
-- Each dog can have multiple share links (e.g. one for the walker, one for the vet)
-- Each link has its own visibility toggles per section
create table public.dog_share_links (
  id            uuid default gen_random_uuid() primary key,
  dog_id        uuid references public.dogs(id) on delete cascade not null,
  token         text unique not null default encode(gen_random_bytes(16), 'hex'),
  label         text not null,
  show_basics   boolean default true,
  show_safety   boolean default true,
  show_routine  boolean default true,
  show_behavior boolean default true,
  created_at    timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
alter table public.users           enable row level security;
alter table public.dogs            enable row level security;
alter table public.dog_safety      enable row level security;
alter table public.dog_routine     enable row level security;
alter table public.dog_behavior    enable row level security;
alter table public.dog_share_links enable row level security;

-- users
create policy "users: read own row"   on public.users for select using (auth.uid() = id);
create policy "users: update own row" on public.users for update using (auth.uid() = id);

-- dogs
create policy "dogs: owners manage" on public.dogs for all
  using (auth.uid() = user_id);

-- dog_safety
create policy "dog_safety: owners manage" on public.dog_safety for all
  using (exists (
    select 1 from public.dogs where dogs.id = dog_safety.dog_id and dogs.user_id = auth.uid()
  ));

-- dog_routine
create policy "dog_routine: owners manage" on public.dog_routine for all
  using (exists (
    select 1 from public.dogs where dogs.id = dog_routine.dog_id and dogs.user_id = auth.uid()
  ));

-- dog_behavior
create policy "dog_behavior: owners manage" on public.dog_behavior for all
  using (exists (
    select 1 from public.dogs where dogs.id = dog_behavior.dog_id and dogs.user_id = auth.uid()
  ));

-- dog_share_links: owners manage their links
create policy "dog_share_links: owners manage" on public.dog_share_links for all
  using (exists (
    select 1 from public.dogs where dogs.id = dog_share_links.dog_id and dogs.user_id = auth.uid()
  ));

-- ─── PUBLIC READ (via share link) ────────────────────────────────────────────
-- Anyone with a valid token can read the dog profile.
-- Each section is only readable if its visibility toggle is on for that link.

create policy "dog_share_links: public read" on public.dog_share_links for select
  using (true);

create policy "dogs: public read via share link" on public.dogs for select
  using (
    exists (select 1 from public.dog_share_links where dog_share_links.dog_id = dogs.id)
  );

create policy "dog_safety: public read via share link" on public.dog_safety for select
  using (
    exists (
      select 1 from public.dog_share_links
      where dog_share_links.dog_id = dog_safety.dog_id
      and dog_share_links.show_safety = true
    )
  );

create policy "dog_routine: public read via share link" on public.dog_routine for select
  using (
    exists (
      select 1 from public.dog_share_links
      where dog_share_links.dog_id = dog_routine.dog_id
      and dog_share_links.show_routine = true
    )
  );

create policy "dog_behavior: public read via share link" on public.dog_behavior for select
  using (
    exists (
      select 1 from public.dog_share_links
      where dog_share_links.dog_id = dog_behavior.dog_id
      and dog_share_links.show_behavior = true
    )
  );
