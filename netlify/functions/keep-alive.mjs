/**
 * Keeps the Supabase project awake.
 *
 * Free Supabase projects pause after 7 consecutive days with no API requests.
 * Real visitor traffic normally prevents that, but during quiet spells — before
 * launch, or a slow week — this scheduled function makes one tiny read so the
 * idle timer never runs down.
 *
 * Runs every three days, which leaves a wide margin under the 7-day limit even
 * if a run is missed. Netlify picks up the schedule from the `config` export
 * below; nothing needs to be registered by hand.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export default async function handler() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("keep-alive: Supabase environment variables are not set on this site.");
    return new Response("Supabase is not configured.", { status: 500 });
  }

  // The cheapest possible read: one column, one row, and the row is discarded.
  const url = `${SUPABASE_URL}/rest/v1/posts?select=id&limit=1`;

  try {
    const response = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error(`keep-alive: Supabase returned ${response.status} — ${detail.slice(0, 200)}`);
      return new Response(`Supabase returned ${response.status}`, { status: 502 });
    }

    console.log(`keep-alive: ok at ${new Date().toISOString()}`);
    return new Response("ok");
  } catch (error) {
    console.error("keep-alive: request failed —", error instanceof Error ? error.message : error);
    return new Response("Request failed.", { status: 502 });
  }
}

/** 06:00 UTC every third day — standard cron syntax. */
export const config = {
  schedule: "0 6 */3 * *",
};
