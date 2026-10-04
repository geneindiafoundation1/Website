-- ---------------------------------------------------------------------------
-- GENE-INDIA Foundation - flagship programs
-- Run in the Supabase SQL editor AFTER schema.sql, hardening.sql, roles.sql and
-- audit-and-trash.sql. Safe to re-run.
--
-- Creates the `programs` table behind the Programs page and the admin panel's
-- Programs section, with the same rules as blog posts and team members:
-- the public reads published programs, admins write and empty the trash, and
-- every change by the team lands in the activity log.
-- ---------------------------------------------------------------------------

create table if not exists public.programs (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  eyebrow       text not null default '',
  tagline       text not null default '',
  summary       text not null default '',
  poster_url    text,
  details       text[] not null default '{}',
  highlights    text[] not null default '{}',
  tags          text[] not null default '{}',
  audience      text not null default '',
  sort_order    integer not null default 99,
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  deleted_by    uuid
);

-- Earlier versions had a registration link; the site no longer shows one.
alter table public.programs drop column if exists register_url;

create index if not exists programs_sort_idx on public.programs (published, sort_order);
create index if not exists programs_live_idx on public.programs (deleted_at);

drop trigger if exists programs_touch on public.programs;
create trigger programs_touch before update on public.programs
  for each row execute function public.touch_updated_at();

-- ------------------------- row-level security -------------------------------

alter table public.programs enable row level security;

drop policy if exists "programs are publicly readable when published" on public.programs;
create policy "programs are publicly readable when published"
  on public.programs for select to anon, authenticated
  using ((published and deleted_at is null) or public.is_admin());

-- Adding, editing, and moving to trash (an update) - admins.
drop policy if exists "staff manage programs" on public.programs;
create policy "staff manage programs"
  on public.programs for all to authenticated
  using (public.can_edit()) with check (public.can_edit());

-- Emptying the trash (a real delete). is_owner() now means any admin; kept as a
-- separate policy so the rule can be tightened again later in one place.
drop policy if exists "owners purge programs" on public.programs;
create policy "owners purge programs"
  on public.programs as restrictive for delete to authenticated
  using (public.is_owner());

-- ------------------------------ activity log --------------------------------

drop trigger if exists programs_activity on public.programs;
create trigger programs_activity
  after insert or update or delete on public.programs
  for each row execute function public.log_activity();

-- ---------------------------- starting content ------------------------------
-- The two flagship programs, with posters served from the website itself
-- (public/programs/). Re-running this file never overwrites edits made in the
-- admin panel.

insert into public.programs
  (slug, title, eyebrow, tagline, summary, poster_url, details, highlights, tags, audience, sort_order, published)
values
(
  'grand-round-lecture-series',
  'The Grand-Round Lecture Series',
  'Flagship program · Monthly lectures',
  'Extraordinary journeys, in their own words.',
  E'Every month, we bring you face to face with highly accomplished and remarkable people: the scientists, doctors, engineers, and artists who are shaping our world. They share not just what they achieved, but how they got there: the learnings and turning points, the setbacks and the choices that made them.\n\nCome for the ideas, stay for the stories, and leave inspired to write your own. Through these interactions, carve your own path to a very successful career.',
  '/programs/grand-round-lecture-series.webp',
  array['When: Once a month', 'Where: Live on Zoom', 'Also streaming: Facebook Live'],
  array[]::text[],
  array['Scientists', 'Doctors', 'Engineers', 'Artists', 'Innovators'],
  '',
  1,
  true
),
(
  'parents-as-pathfinders',
  'Parents as Pathfinders',
  'Flagship program · A family mentorship program',
  'Guide with confidence. Grow together.',
  'Every child''s future begins early in life, and at home. This program gives parents the knowledge, tools and confidence to guide their children through today''s fast-changing world of careers and opportunities, through curated expert-led sessions, personal mentoring and a supportive community of families.',
  '/programs/parents-as-pathfinders.webp',
  array['For: Parent + child pairs', 'Grades: 1–5'],
  array[
    'See the full map of possibilities: Emerging careers in science, medicine, technology, arts, humanities, design and beyond.',
    'Navigate the big decisions: Subject choices, entrance exams, scholarships and admissions.',
    'Nurture your child''s strengths: Spot their talents and support their interests, without pressure.',
    'Talk openly, together: Build conversations about goals, setbacks and wellbeing.',
    'Join a community: Connect with mentors and families on the same journey.'
  ],
  array[]::text[],
  'Parents whose children are in the very early stages of their academic journey, mentored together as parent–student pairs in Grades 1–5.',
  2,
  true
)
on conflict (slug) do nothing;
