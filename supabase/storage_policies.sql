-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- Allows authenticated users to upload photos to dog-photos bucket

create policy "authenticated users can upload dog photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'dog-photos');

create policy "authenticated users can update dog photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'dog-photos');

create policy "anyone can view dog photos"
  on storage.objects for select
  using (bucket_id = 'dog-photos');
