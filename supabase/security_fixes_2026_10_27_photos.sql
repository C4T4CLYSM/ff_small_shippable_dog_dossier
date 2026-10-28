-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- Follow-up to security_fixes_2026_10_27.sql: inside the dogs subquery,
-- "name" meant dogs.name (the dog's name), not the file path, so every
-- upload was rejected. Use objects.name explicitly.

begin;

drop policy if exists "dog photos: owners read"   on storage.objects;
drop policy if exists "dog photos: owners upload" on storage.objects;
drop policy if exists "dog photos: owners update" on storage.objects;

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

commit;
