-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- Photo gallery: up to 6 photos per dog, plus the owner's "Found [name]?" setting.

begin;

-- ─── DOG PHOTOS ──────────────────────────────────────────────────────────────
-- One row per photo. path is the file inside the dog-photos bucket,
-- always "<dog_id>/<file>". position 0 is the main photo.
create table public.dog_photos (
  id          uuid default gen_random_uuid() primary key,
  dog_id      uuid references public.dogs(id) on delete cascade not null,
  path        text not null,
  position    int not null default 0,
  created_at  timestamptz default now(),
  constraint dog_photos_path_in_dog_folder check (split_part(path, '/', 1) = dog_id::text)
);

create index dog_photos_dog_id_position_idx on public.dog_photos (dog_id, position);

alter table public.dog_photos enable row level security;

create policy "dog_photos: owners manage" on public.dog_photos for all
  using (exists (
    select 1 from public.dogs where dogs.id = dog_photos.dog_id and dogs.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.dogs where dogs.id = dog_photos.dog_id and dogs.user_id = auth.uid()
  ));

-- At most 6 photos per dog
create or replace function public.limit_dog_photos()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.dog_photos where dog_id = new.dog_id) >= 6 then
    raise exception 'A dog can have at most 6 photos';
  end if;
  return new;
end;
$$;

create trigger dog_photos_limit
  before insert on public.dog_photos
  for each row execute function public.limit_dog_photos();

-- ─── "FOUND [NAME]?" SETTING ─────────────────────────────────────────────────
-- Off by default. Even when on, the bar only shows on share links that
-- already show Safety info.
alter table public.dogs add column show_found_bar boolean not null default false;

-- ─── STORAGE: owners can remove their dog's photos ───────────────────────────
create policy "dog photos: owners delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'dog-photos'
    and exists (
      select 1 from public.dogs
      where dogs.id::text = (storage.foldername(objects.name))[1]
        and dogs.user_id = auth.uid()
    )
  );

-- ─── MOVE EXISTING PHOTOS INTO THE GALLERY ───────────────────────────────────
-- Each dog's current photo becomes its main photo (position 0).
insert into public.dog_photos (dog_id, path, position)
select id, regexp_replace(photo_url, '^.*/dog-photos/([^?]+).*$', '\1'), 0
from public.dogs
where photo_url like '%/dog-photos/%'
  and split_part(regexp_replace(photo_url, '^.*/dog-photos/([^?]+).*$', '\1'), '/', 1) = id::text;

commit;
