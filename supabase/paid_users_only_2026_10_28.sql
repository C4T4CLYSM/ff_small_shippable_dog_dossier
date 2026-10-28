-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- Only paid users can create dogs. The payment check on the signup page runs
-- in the browser and can be skipped, so enforce it in the database too.
-- Paid status is copied from paid_emails by handle_new_user at signup.
-- Safety, routine, behavior and share links all require owning a dog,
-- so they are covered by this rule as well.

-- "as restrictive" means this must pass IN ADDITION to "dogs: owners manage"
create policy "dogs: paid users only"
  on public.dogs
  as restrictive
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
        and (users.is_founder or users.paid_at is not null)
    )
  );
