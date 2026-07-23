-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- This adds the paid_emails staging table and updates the user trigger

-- ─── PAID EMAILS (staging table) ─────────────────────────────────────────────
-- Stores payment info before the user has created a Supabase Auth account.
-- When they sign up, the trigger below copies this data into public.users.
create table public.paid_emails (
  email               text primary key,
  stripe_customer_id  text,
  is_founder          boolean default false,
  paid_at             timestamptz default now()
);

-- ─── UPDATE USER TRIGGER ─────────────────────────────────────────────────────
-- When a new auth user signs up, auto-create their public.users row
-- and copy over any payment data from paid_emails.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  paid public.paid_emails%rowtype;
begin
  select * into paid from public.paid_emails where email = new.email;

  insert into public.users (id, email, stripe_customer_id, is_founder, paid_at)
  values (
    new.id,
    new.email,
    paid.stripe_customer_id,
    coalesce(paid.is_founder, false),
    paid.paid_at
  );

  return new;
end;
$$ language plpgsql security definer;
