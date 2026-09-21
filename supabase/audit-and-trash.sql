-- ---------------------------------------------------------------------------
-- GENE-INDIA Foundation - activity log and trash
-- Run in the Supabase SQL editor AFTER roles.sql. Safe to re-run.
--
-- Two things:
--
--   1. Nothing is destroyed on delete. Rows are marked `deleted_at` and move to
--      the Trash screen, where they can be restored. Only an owner can empty
--      the trash, which is the one genuinely irreversible step.
--
--   2. Every create, edit, delete and restore is recorded in `activity_log`,
--      with who did it and exactly which fields changed. The log is written by
--      database triggers, so it captures changes made outside the website too,
--      and nobody - including admins - can edit or erase it from the app.
-- ---------------------------------------------------------------------------

-- ------------------------------ soft delete --------------------------------

alter table public.posts        add column if not exists deleted_at timestamptz;
alter table public.posts        add column if not exists deleted_by uuid;
alter table public.team_members add column if not exists deleted_at timestamptz;
alter table public.team_members add column if not exists deleted_by uuid;
alter table public.messages     add column if not exists deleted_at timestamptz;
alter table public.messages     add column if not exists deleted_by uuid;
alter table public.donations    add column if not exists deleted_at timestamptz;
alter table public.donations    add column if not exists deleted_by uuid;

create index if not exists posts_live_idx on public.posts (deleted_at);
create index if not exists team_live_idx on public.team_members (deleted_at);

-- The public must never see a trashed post or member. Admins still can, so the
-- Trash screen has something to show.
drop policy if exists "posts are publicly readable when published" on public.posts;
create policy "posts are publicly readable when published"
  on public.posts for select to anon, authenticated
  using ((published and deleted_at is null) or public.is_admin());

drop policy if exists "team is publicly readable when published" on public.team_members;
create policy "team is publicly readable when published"
  on public.team_members for select to anon, authenticated
  using ((published and deleted_at is null) or public.is_admin());

-- Soft-deleting and restoring are UPDATEs, so messages needs an update policy -
-- without one the database silently refuses the change and the button does
-- nothing. (Posts and team members are covered by their "for all" policies, and
-- donations by the verify policy.)
drop policy if exists "staff update messages" on public.messages;
create policy "staff update messages"
  on public.messages for update to authenticated
  using (public.can_edit()) with check (public.can_edit());

-- Emptying the trash is permanent, so it stays with owners only.
drop policy if exists "staff delete messages" on public.messages;
drop policy if exists "owners delete messages" on public.messages;
drop policy if exists "owners purge messages" on public.messages;
create policy "owners purge messages"
  on public.messages for delete to authenticated
  using (public.is_owner());

drop policy if exists "staff delete donations" on public.donations;
drop policy if exists "owners delete donations" on public.donations;
drop policy if exists "owners purge donations" on public.donations;
create policy "owners purge donations"
  on public.donations for delete to authenticated
  using (public.is_owner());

-- ----------------------------- activity log --------------------------------

create table if not exists public.activity_log (
  id          bigserial primary key,
  actor_id    uuid,               -- the login id; null when a visitor did it
  actor_kind  text not null default 'admin',   -- always 'admin'; visitors are not logged
  actor_email text,               -- the signed-in account's email
  action      text not null,      -- created | updated | trashed | restored | purged
  entity      text not null,      -- posts | team_members | messages | donations
  entity_id   uuid,
  label       text,               -- human-readable name of the row, e.g. a post title
  changes     jsonb,              -- { field: { from: …, to: … } } for edits
  created_at  timestamptz not null default now()
);

-- Added after the first release; harmless on a fresh install.
alter table public.activity_log add column if not exists actor_kind text not null default 'admin';

create index if not exists activity_log_recent_idx on public.activity_log (created_at desc);

alter table public.activity_log enable row level security;

-- Readable by any admin; writable by nobody. Only the trigger below inserts,
-- and it runs as the definer, so the record cannot be doctored from the app.
drop policy if exists "admins read the activity log" on public.activity_log;
create policy "admins read the activity log"
  on public.activity_log for select to authenticated
  using (public.is_admin());

/*
 * Records one change. Fields that carry no meaning for a reader - timestamps
 * the system maintains itself - are left out of the diff, and long text is
 * truncated so the log stays readable.
 */
create or replace function public.log_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action   text;
  v_kind     text;
  v_changes  jsonb := '{}'::jsonb;
  v_label    text;
  v_id       uuid;
  v_email    text;
  k          text;
  old_j      jsonb;
  new_j      jsonb;
  old_v      text;
  new_v      text;
begin
  /*
   * The log exists to hold the foundation's own team accountable, so it records
   * signed-in accounts only. Public form submissions are skipped: a contact
   * message or donation report is already stored in full in its own table, and
   * copying it here would duplicate the data to no purpose.
   */
  if auth.uid() is null then
    if TG_OP = 'DELETE' then
      return OLD;
    end if;
    return NEW;
  end if;

  v_kind := 'admin';
  select email into v_email from auth.users where id = auth.uid();

  if TG_OP = 'INSERT' then
    v_action := 'created';
    new_j := to_jsonb(NEW);
    v_id := (new_j ->> 'id')::uuid;

  elsif TG_OP = 'DELETE' then
    v_action := 'purged';
    old_j := to_jsonb(OLD);
    v_id := (old_j ->> 'id')::uuid;

  else
    old_j := to_jsonb(OLD);
    new_j := to_jsonb(NEW);
    v_id := (new_j ->> 'id')::uuid;

    if (old_j ->> 'deleted_at') is null and (new_j ->> 'deleted_at') is not null then
      v_action := 'trashed';
    elsif (old_j ->> 'deleted_at') is not null and (new_j ->> 'deleted_at') is null then
      v_action := 'restored';
    else
      v_action := 'updated';
      -- Which fields actually changed, old value and new.
      for k in select jsonb_object_keys(new_j) loop
        if k not in ('updated_at', 'created_at', 'read_minutes') then
          old_v := old_j ->> k;
          new_v := new_j ->> k;
          if old_v is distinct from new_v then
            v_changes := v_changes || jsonb_build_object(
              k,
              jsonb_build_object(
                'from', left(coalesce(old_v, ''), 300),
                'to',   left(coalesce(new_v, ''), 300)
              )
            );
          end if;
        end if;
      end loop;

      -- Nothing meaningful changed; don't clutter the log.
      if v_changes = '{}'::jsonb then
        return NEW;
      end if;
    end if;
  end if;

  v_label := coalesce(
    new_j ->> 'title', old_j ->> 'title',
    new_j ->> 'name',  old_j ->> 'name',
    new_j ->> 'email', old_j ->> 'email'
  );

  insert into public.activity_log
    (actor_id, actor_kind, actor_email, action, entity, entity_id, label, changes)
  values (auth.uid(), v_kind, v_email, v_action, TG_TABLE_NAME, v_id,
          left(coalesce(v_label, ''), 200), nullif(v_changes, '{}'::jsonb));

  if TG_OP = 'DELETE' then
    return OLD;
  end if;
  return NEW;
end;
$$;

drop trigger if exists posts_activity on public.posts;
create trigger posts_activity
  after insert or update or delete on public.posts
  for each row execute function public.log_activity();

drop trigger if exists team_activity on public.team_members;
create trigger team_activity
  after insert or update or delete on public.team_members
  for each row execute function public.log_activity();

drop trigger if exists messages_activity on public.messages;
create trigger messages_activity
  after insert or update or delete on public.messages
  for each row execute function public.log_activity();

drop trigger if exists donations_activity on public.donations;
create trigger donations_activity
  after insert or update or delete on public.donations
  for each row execute function public.log_activity();

-- ---------------------- clear duplicated visitor rows ----------------------
-- Earlier versions logged public form submissions too. Those rows duplicate
-- what is already held in `messages` and `donations`, so they are removed.
-- Nothing about your team's own actions is touched: every admin entry has an
-- actor_id, and only rows without one are deleted.

delete from public.activity_log where actor_id is null;
