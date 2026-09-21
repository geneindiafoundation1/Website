-- ---------------------------------------------------------------------------
-- GENE-INDIA Foundation - security hardening
-- Run this in the Supabase SQL editor AFTER schema.sql and seed.sql.
-- Safe to re-run.
--
-- It does two things:
--   1. Restricts write access to an explicit `admins` allow-list, instead of
--      "anyone who happens to hold an account".
--   2. Adds a shared rate-limit counter, so the contact and donation forms are
--      throttled across every serverless instance rather than per-instance.
-- ---------------------------------------------------------------------------

-- =========================== 1. admin allow-list ===========================

create table if not exists public.admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  email       text,
  created_at  timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Deliberately no write policy: membership is managed from the Supabase
-- dashboard (or SQL editor) only, never by the application.
drop policy if exists "admins can see the allow-list" on public.admins;
create policy "admins can see the allow-list"
  on public.admins for select to authenticated
  using (user_id = auth.uid());

/*
 * SECURITY DEFINER so it can read `admins` regardless of the caller's own
 * permissions. The fixed search_path stops a caller shadowing `admins` with
 * something of their own.
 */
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- Seed the allow-list with every account that exists today. If you are reading
-- this before creating your login, add yourself afterwards with:
--     insert into public.admins (user_id, email)
--     select id, email from auth.users where email = 'you@example.com'
--     on conflict (user_id) do nothing;
insert into public.admins (user_id, email)
select id, email from auth.users
on conflict (user_id) do nothing;

-- --------------------------- rewritten policies ----------------------------
-- Public: read published content, submit forms. Admins: everything.

drop policy if exists "posts are publicly readable when published" on public.posts;
create policy "posts are publicly readable when published"
  on public.posts for select to anon, authenticated
  using (published or public.is_admin());

drop policy if exists "staff manage posts" on public.posts;
create policy "staff manage posts"
  on public.posts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "team is publicly readable when published" on public.team_members;
create policy "team is publicly readable when published"
  on public.team_members for select to anon, authenticated
  using (published or public.is_admin());

drop policy if exists "staff manage team" on public.team_members;
create policy "staff manage team"
  on public.team_members for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "staff read messages" on public.messages;
create policy "staff read messages"
  on public.messages for select to authenticated
  using (public.is_admin());

drop policy if exists "staff read donations" on public.donations;
create policy "staff read donations"
  on public.donations for select to authenticated
  using (public.is_admin());

drop policy if exists "staff verify donations" on public.donations;
create policy "staff verify donations"
  on public.donations for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Uploaded images: world-readable (it is a website), admin-writable only.
drop policy if exists "staff upload media" on storage.objects;
create policy "staff upload media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "staff manage media" on storage.objects;
create policy "staff manage media"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "staff delete media" on storage.objects;
create policy "staff delete media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ============================ 2. rate limiting =============================
-- Counters live in the database so every serverless instance shares them.
-- The table is locked down entirely; only the SECURITY DEFINER function below
-- can touch it, which is why no policies are defined for it.

create table if not exists public.rate_limits (
  key           text primary key,
  hits          integer not null default 0,
  window_start  timestamptz not null default now()
);

alter table public.rate_limits enable row level security;

/*
 * Records one hit and reports whether the caller is still within its budget.
 * Returns true to allow, false to block. The whole check-and-increment happens
 * in a single statement, so simultaneous requests cannot slip past the limit.
 *
 * `p_key` is a hash of the client IP and form name - never a raw IP address.
 */
create or replace function public.rate_limit_hit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_hits integer;
begin
  insert into public.rate_limits as r (key, hits, window_start)
  values (p_key, 1, now())
  on conflict (key) do update
    set hits = case
          when r.window_start < now() - make_interval(secs => p_window_seconds) then 1
          else r.hits + 1
        end,
        window_start = case
          when r.window_start < now() - make_interval(secs => p_window_seconds) then now()
          else r.window_start
        end
  returning r.hits into current_hits;

  -- Occasionally sweep away counters nobody is using any more.
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return current_hits <= p_max;
end;
$$;

grant execute on function public.rate_limit_hit(text, integer, integer) to anon, authenticated;
