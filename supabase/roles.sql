-- ---------------------------------------------------------------------------
-- GENE-INDIA Foundation - admin access
-- Run in the Supabase SQL editor AFTER hardening.sql. Safe to re-run.
--
-- One kind of member: everyone on the allow-list (public.admins) has full
-- access - write, edit and delete blog posts, team members and programs; read
-- and delete messages; empty the trash.
--
-- Adding someone: create their login in Supabase under Authentication → Users
-- → Add user. They get full access automatically - no SQL, no code change.
--
-- IMPORTANT: because every account gets full access, public sign-up must be
-- OFF (Authentication → Sign In / Providers → "Allow new users to sign up").
-- Otherwise anyone could create an account and edit the site. Accounts added
-- from the dashboard still work with sign-up switched off.
-- ---------------------------------------------------------------------------

/*
 * The policies across the schema call can_edit() for writes and is_owner() for
 * permanent deletes. With a single kind of member both simply mean "on the
 * allow-list", so they defer to is_admin() and the policies stay unchanged.
 */
create or replace function public.can_edit()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin();
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin();
$$;

grant execute on function public.can_edit() to anon, authenticated;
grant execute on function public.is_owner() to anon, authenticated;

-- Earlier versions had owner and viewer roles. Everyone is now a full member.
alter table public.admins drop constraint if exists admins_role_check;
alter table public.admins drop column if exists role;

-- ------------------------------ write policies ------------------------------

drop policy if exists "staff manage posts" on public.posts;
create policy "staff manage posts"
  on public.posts for all to authenticated
  using (public.can_edit()) with check (public.can_edit());

drop policy if exists "staff manage team" on public.team_members;
create policy "staff manage team"
  on public.team_members for all to authenticated
  using (public.can_edit()) with check (public.can_edit());

drop policy if exists "staff upload media" on storage.objects;
create policy "staff upload media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.can_edit());

drop policy if exists "staff manage media" on storage.objects;
create policy "staff manage media"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.can_edit())
  with check (bucket_id = 'media' and public.can_edit());

drop policy if exists "staff delete media" on storage.objects;
create policy "staff delete media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.can_edit());

drop policy if exists "owners delete messages" on public.messages;
drop policy if exists "staff delete messages" on public.messages;
create policy "staff delete messages"
  on public.messages for delete to authenticated
  using (public.can_edit());

-- ------------------------- new logins get access ----------------------------
-- Creating an account in Supabase Authentication is enough: this trigger adds
-- the person to the allow-list.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admins (user_id, email)
  values (NEW.id, NEW.email)
  on conflict (user_id) do nothing;
  return NEW;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Catch up any account created before this trigger existed.
insert into public.admins (user_id, email)
select id, email from auth.users
on conflict (user_id) do nothing;

-- Member-management functions from an early version - no longer used.
drop function if exists public.list_members();
drop function if exists public.set_member_role(uuid, text);
drop function if exists public.add_member_by_email(text, text);

-- ------------------------------ managing access ------------------------------
-- See who has access:
--     select email, created_at from public.admins order by created_at;
--
-- Remove someone: delete their user under Authentication → Users (their
-- allow-list entry goes with it), or keep the login but revoke access:
--     delete from public.admins where email = 'them@example.com';
