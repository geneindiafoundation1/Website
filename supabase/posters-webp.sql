-- ---------------------------------------------------------------------------
-- GENE-INDIA Foundation - switch the two built-in program posters to WebP
-- Run ONCE in the Supabase SQL editor, AFTER the deploy that adds
-- public/programs/*.webp has gone live. Check first - both must load:
--     https://geneindiafoundation.netlify.app/programs/grand-round-lecture-series.webp
--     https://geneindiafoundation.netlify.app/programs/parents-as-pathfinders.webp
-- (Before that deploy the .webp files don't exist on the live site, and the
-- posters would break as soon as an admin save rebuilds the pages.)
--
-- Only touches posters still pointing at the original .jpg files shipped with
-- the site; posters uploaded through the admin panel are left alone.
-- ---------------------------------------------------------------------------

update public.programs
set poster_url = regexp_replace(poster_url, '\.jpg$', '.webp')
where poster_url in (
  '/programs/grand-round-lecture-series.jpg',
  '/programs/parents-as-pathfinders.jpg'
);

select slug, poster_url from public.programs order by sort_order;
