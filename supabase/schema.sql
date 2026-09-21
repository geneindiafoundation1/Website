-- ---------------------------------------------------------------------------
-- GENE-INDIA Foundation - database schema
-- Run this once in the Supabase SQL editor (SQL Editor → New query → Run),
-- then run seed.sql to load the launch content.
-- ---------------------------------------------------------------------------

-- ------------------------------- tables ------------------------------------

create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  excerpt       text not null default '',
  body          text not null default '',
  category      text not null default 'Updates',
  cover_url     text,
  published     boolean not null default false,
  published_at  date not null default current_date,
  read_minutes  integer not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.team_members (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  role        text not null default '',
  bio         text not null default '',
  photo_url   text,
  tags        text[] not null default '{}',
  sort_order  integer not null default 99,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  topic       text not null default 'General enquiry',
  message     text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.donations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  amount      numeric(12, 2) not null check (amount > 0),
  mode        text not null default 'UPI',
  reference   text,
  note        text,
  verified    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists posts_published_idx on public.posts (published, published_at desc);
create index if not exists team_sort_idx on public.team_members (published, sort_order);
create index if not exists messages_created_idx on public.messages (created_at desc);
create index if not exists donations_created_idx on public.donations (created_at desc);

-- `updated_at` maintained by trigger so the app never has to set it.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

drop trigger if exists team_touch on public.team_members;
create trigger team_touch before update on public.team_members
  for each row execute function public.touch_updated_at();

-- ------------------------- row-level security -------------------------------
-- The public may read published content and submit forms. Only signed-in staff
-- may read messages or donations, or change anything.

alter table public.posts         enable row level security;
alter table public.team_members  enable row level security;
alter table public.messages      enable row level security;
alter table public.donations     enable row level security;

drop policy if exists "posts are publicly readable when published" on public.posts;
create policy "posts are publicly readable when published"
  on public.posts for select to anon, authenticated
  using (published or auth.role() = 'authenticated');

drop policy if exists "staff manage posts" on public.posts;
create policy "staff manage posts"
  on public.posts for all to authenticated
  using (true) with check (true);

drop policy if exists "team is publicly readable when published" on public.team_members;
create policy "team is publicly readable when published"
  on public.team_members for select to anon, authenticated
  using (published or auth.role() = 'authenticated');

drop policy if exists "staff manage team" on public.team_members;
create policy "staff manage team"
  on public.team_members for all to authenticated
  using (true) with check (true);

drop policy if exists "anyone may send a message" on public.messages;
create policy "anyone may send a message"
  on public.messages for insert to anon, authenticated
  with check (true);

drop policy if exists "staff read messages" on public.messages;
create policy "staff read messages"
  on public.messages for select to authenticated
  using (true);

drop policy if exists "anyone may report a donation" on public.donations;
create policy "anyone may report a donation"
  on public.donations for insert to anon, authenticated
  with check (true);

drop policy if exists "staff read donations" on public.donations;
create policy "staff read donations"
  on public.donations for select to authenticated
  using (true);

drop policy if exists "staff verify donations" on public.donations;
create policy "staff verify donations"
  on public.donations for update to authenticated
  using (true) with check (true);

-- ---------------------------- storage bucket --------------------------------
-- Cover images and team photographs uploaded from the admin panel.

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media is publicly readable" on storage.objects;
create policy "media is publicly readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "staff upload media" on storage.objects;
create policy "staff upload media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media');

drop policy if exists "staff manage media" on storage.objects;
create policy "staff manage media"
  on storage.objects for update to authenticated
  using (bucket_id = 'media') with check (bucket_id = 'media');

drop policy if exists "staff delete media" on storage.objects;
create policy "staff delete media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media');
