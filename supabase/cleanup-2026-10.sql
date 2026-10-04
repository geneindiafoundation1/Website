-- ---------------------------------------------------------------------------
-- GENE-INDIA Foundation - one-time cleanup (October 2026)
-- Run ONCE in the Supabase SQL editor, AFTER running the updated roles.sql.
--
--   1. Removes the donations table - the site no longer takes donations.
--   2. Clears donation entries from the activity log.
--
-- Permanent: the donations table and every row in it are deleted. Run
-- `npm run backup` first if you want a copy.
-- ---------------------------------------------------------------------------

-- Its policies, triggers and indexes are dropped with it.
drop table if exists public.donations cascade;

delete from public.activity_log where entity = 'donations';

-- Every table left should be one the site uses:
--   activity_log, admins, messages, posts, programs, rate_limits, team_members
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
