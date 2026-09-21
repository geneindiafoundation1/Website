-- ---------------------------------------------------------------------------
-- GENE-INDIA Foundation - admin roles
-- Run in the Supabase SQL editor AFTER hardening.sql. Safe to re-run.
--
-- Two kinds of member:
--
--   owner   - full access: write, edit and delete blog posts and team members;
--             read, verify and delete messages and donations; empty the trash.
--   viewer  - read-only: can sign in and read messages and donations, but
--             cannot change anything.
--
-- Adding someone: create their login in Supabase under Authentication → Users.
-- They become a viewer automatically - no SQL needed. Promote them only if they
-- genuinely need to publish:
--     update public.admins set role = 'owner' where email = 'them@example.com';
-- ---------------------------------------------------------------------------

alter table public.admins
  add column if not exists role text not null default 'viewer';

-- The editor tier was removed; anyone who held it had full content rights, so
-- they become owners rather than being silently demoted.
update public.admins set role = 'owner' where role = 'editor';

alter table public.admins alter column role set default 'viewer';

alter table public.admins drop constraint if exists admins_role_check;
alter table public.admins
  add constraint admins_role_check check (role in ('owner', 'viewer'));

-- The foundation needs at least one owner, or nobody can clear messages. If no
-- owner exists yet, promote the first account added to the allow-list - that is
-- the one created when the site was set up.
update public.admins
set role = 'owner'
where user_id = (select user_id from public.admins order by created_at limit 1)
  and not exists (select 1 from public.admins where role = 'owner');

/* Can this account change content? Owners only - viewers are read-only. */
create or replace function public.can_edit()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where user_id = auth.uid() and role = 'owner'
  );
$$;

/* Super-admin: may permanently delete messages and donation records. */
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where user_id = auth.uid() and role = 'owner'
  );
$$;

grant execute on function public.can_edit() to anon, authenticated;
grant execute on function public.is_owner() to anon, authenticated;

-- ---------------------------- writes: owners -------------------------------
-- Reads stay with is_admin(), so viewers still see drafts, messages and
-- donations. Only the write policies tighten to can_edit().

drop policy if exists "staff manage posts" on public.posts;
create policy "staff manage posts"
  on public.posts for all to authenticated
  using (public.can_edit()) with check (public.can_edit());

drop policy if exists "staff manage team" on public.team_members;
create policy "staff manage team"
  on public.team_members for all to authenticated
  using (public.can_edit()) with check (public.can_edit());

drop policy if exists "staff verify donations" on public.donations;
create policy "staff verify donations"
  on public.donations for update to authenticated
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

-- ------------------------ deleting records: owners -------------------------
-- Contact messages and donation reports are records of what people sent you,
-- and deleting one is permanent - there is no undo. Viewers can never delete.

drop policy if exists "owners delete messages" on public.messages;
drop policy if exists "staff delete messages" on public.messages;
create policy "staff delete messages"
  on public.messages for delete to authenticated
  using (public.can_edit());

drop policy if exists "owners delete donations" on public.donations;
drop policy if exists "staff delete donations" on public.donations;
create policy "staff delete donations"
  on public.donations for delete to authenticated
  using (public.can_edit());

-- ------------------- roles are assigned by SQL -----------------------------
-- There is no member-management screen in the admin panel: roles are set here,
-- deliberately, so that granting access always takes a decision in Supabase.
--
-- Give someone access (create their login under Authentication → Users first):
--     insert into public.admins (user_id, email, role)
--     select id, email, 'viewer' from auth.users where email = 'them@example.com'
--     on conflict (user_id) do update set role = 'viewer';
--
-- Promote or demote:
--     update public.admins set role = 'owner'  where email = 'them@example.com';
--     update public.admins set role = 'viewer' where email = 'them@example.com';
--
-- Revoke access entirely:
--     delete from public.admins where email = 'them@example.com';
--
-- See who has what:
--     select email, role from public.admins order by role, email;
--
-- If an earlier version of this file created the member-management functions,
-- they are no longer used and can be removed:
--     drop function if exists public.list_members();
--     drop function if exists public.set_member_role(uuid, text);
--     drop function if exists public.add_member_by_email(text, text);

-- ------------------ new logins start as viewers -----------------------------
-- Creating an account in Supabase Authentication is enough: this trigger adds
-- the person to the allow-list as a viewer, so they can sign in and read
-- messages and donations but change nothing. Promote to owner by hand when
-- someone actually needs to publish.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admins (user_id, email, role)
  values (NEW.id, NEW.email, 'viewer')
  on conflict (user_id) do nothing;   -- never demote an existing member
  return NEW;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Catch up any account created before this trigger existed.
insert into public.admins (user_id, email, role)
select id, email, 'viewer' from auth.users
on conflict (user_id) do nothing;
