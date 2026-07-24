-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- Removes circular RLS policies that caused infinite recursion

drop policy if exists "dogs: public read via share link" on public.dogs;
drop policy if exists "dog_safety: public read via share link" on public.dog_safety;
drop policy if exists "dog_routine: public read via share link" on public.dog_routine;
drop policy if exists "dog_behavior: public read via share link" on public.dog_behavior;
