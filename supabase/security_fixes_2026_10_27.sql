-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- Security fixes from the 2026-10-27 audit

begin;

-- ─── SHARE LINKS ─────────────────────────────────────────────────────────────
-- "using (true)" let anyone list every share token and read every dog profile.
-- Public profiles are served by /api/profile/[token] with the service role,
-- so no public read rule is needed. Owners keep access via "owners manage".
drop policy if exists "dog_share_links: public read" on public.dog_share_links;

-- ─── USERS ───────────────────────────────────────────────────────────────────
-- Allowed users to set is_founder / paid_at on themselves. The app never updates
-- this table from the browser; the server uses the service role.
drop policy if exists "users: update own row" on public.users;

-- ─── WAITLIST ────────────────────────────────────────────────────────────────
-- The waitlist form posts to /api/waitlist, which uses the service role.
drop policy if exists "Anyone can join waitlist" on public.waitlist;

-- ─── DOG PHOTOS (storage) ────────────────────────────────────────────────────
-- Photos are stored as "<dog_id>/photo.<ext>". Only the dog's owner may
-- upload or replace files in that folder. The bucket is public, so photo
-- URLs keep working without a public SELECT rule (which allowed listing).
drop policy if exists "anyone can view dog photos"                 on storage.objects;
drop policy if exists "authenticated users can upload dog photos"  on storage.objects;
drop policy if exists "authenticated users can update dog photos"  on storage.objects;

create policy "dog photos: owners read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'dog-photos'
    and exists (
      select 1 from public.dogs
      where dogs.id::text = (storage.foldername(objects.name))[1]
        and dogs.user_id = auth.uid()
    )
  );

create policy "dog photos: owners upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'dog-photos'
    and exists (
      select 1 from public.dogs
      where dogs.id::text = (storage.foldername(objects.name))[1]
        and dogs.user_id = auth.uid()
    )
  );

create policy "dog photos: owners update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'dog-photos'
    and exists (
      select 1 from public.dogs
      where dogs.id::text = (storage.foldername(objects.name))[1]
        and dogs.user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'dog-photos'
    and exists (
      select 1 from public.dogs
      where dogs.id::text = (storage.foldername(objects.name))[1]
        and dogs.user_id = auth.uid()
    )
  );

-- ─── handle_new_user ─────────────────────────────────────────────────────────
-- Runs with admin rights, so pin its search_path and stop the browser from
-- calling it directly. The signup trigger still runs it as before.
alter function public.handle_new_user() set search_path = '';
revoke execute on function public.handle_new_user() from public, anon, authenticated;

commit;
