-- ---------------------------------------------------------------------------
-- GENE-INDIA Foundation - empty the trash automatically
-- Run in the Supabase SQL editor AFTER audit-and-trash.sql and programs.sql.
-- Safe to re-run.
--
-- Anything moved to the Trash in the admin panel is deleted permanently once it
-- has been there for 10 days. A daily job inside the database does it, so it
-- runs whether or not anyone opens the admin panel, and costs no Netlify
-- credits. Image files left unused are cleared by the admin panel's own image
-- clean-up on the next save.
--
-- To change the period, edit TRASH_DAYS in src/lib/trash.ts and the interval
-- below, and re-run this file.
-- ---------------------------------------------------------------------------

-- Supabase's built-in scheduler (Integrations → Cron in the dashboard).
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;

/*
 * SECURITY DEFINER runs as the table owner, so row-level security - which
 * stops anonymous callers deleting anything - doesn't apply here. Nobody can
 * call it from the website: execute is revoked from the API roles below.
 */
create or replace function public.purge_old_trash()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cutoff timestamptz := now() - interval '10 days';
begin
  delete from public.posts        where deleted_at < cutoff;
  delete from public.team_members where deleted_at < cutoff;
  delete from public.programs     where deleted_at < cutoff;
  delete from public.messages     where deleted_at < cutoff;
end;
$$;

revoke execute on function public.purge_old_trash() from public, anon, authenticated;

-- Every day at 03:30 UTC (09:00 IST). Scheduling under the same name again
-- replaces the existing job, so re-running this file never duplicates it.
select cron.schedule('purge-old-trash', '30 3 * * *', $$select public.purge_old_trash()$$);

-- Clear anything already older than 10 days right away.
select public.purge_old_trash();

-- Check the job is scheduled:
--     select jobname, schedule, active from cron.job;
-- See its recent runs:
--     select status, start_time, return_message from cron.job_run_details
--     order by start_time desc limit 10;
