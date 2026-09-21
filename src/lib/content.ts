import { memberVideos } from "./member-videos";
import { seedPosts, seedTeam } from "./seed";
import { missingDeletedAt, selectLive } from "./supabase/live";
import { getServerSupabase } from "./supabase/server";
import type { Member, Post } from "./types";

/** Former members who must not appear on the site, even if a leftover row remains in the database. */
const RETIRED_MEMBER_SLUGS = new Set(["faisal-kawoosa"]);

function liveTeam(members: Member[]): Member[] {
  return members
    .filter((member) => !RETIRED_MEMBER_SLUGS.has(member.slug))
    .map((member) => ({ ...member, video: memberVideos[member.slug] ?? null }));
}

/** Drop a retired director's identifying line if an old blog row is still in the database. */
function scrubRetiredCopy(post: Post): Post {
  return {
    ...post,
    body: post.body.replace(
      "An analyst who has advised Tier 1 technology brands for fourteen years can tell a student which skills will still matter in five years, and which won't.",
      "A practitioner who has spent years in industry can tell a student which skills will still matter in five years, and which won't.",
    ),
  };
}

/**
 * Content access layer. Reads from Supabase when it is configured and falls
 * back to the seed content otherwise, so the site always renders.
 */

export async function getPosts({ includeDrafts = false } = {}): Promise<Post[]> {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return seedPosts.filter((p) => includeDrafts || p.published);
  }

  const { data, error } = await selectLive<Post>(async (filterTrashed) => {
    let query = supabase.from("posts").select("*");
    if (filterTrashed) query = query.is("deleted_at", null);
    query = query.order("published_at", { ascending: false });
    if (!includeDrafts) query = query.eq("published", true);
    return query;
  });
  if (error || !data) {
    console.error("getPosts:", error?.message);
    return seedPosts.filter((p) => includeDrafts || p.published).map(scrubRetiredCopy);
  }
  return data.map(scrubRetiredCopy);
}

export async function getPost(slug: string): Promise<Post | null> {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return seedPosts.find((p) => p.slug === slug && p.published) ?? null;
  }

  const first = await supabase.from("posts").select("*").eq("slug", slug).is("deleted_at", null).maybeSingle();
  const result = first.error && missingDeletedAt(first.error)
    ? await supabase.from("posts").select("*").eq("slug", slug).maybeSingle()
    : first;
  const { data, error } = result;
  if (error) console.error("getPost:", error.message);
  const post = (data as Post | null) ?? seedPosts.find((p) => p.slug === slug) ?? null;
  return post ? scrubRetiredCopy(post) : null;
}

export async function getTeam({ includeDrafts = false } = {}): Promise<Member[]> {
  const supabase = await getServerSupabase();
  if (!supabase) {
    // Match the ordering the database query applies, so the fallback looks identical.
    return liveTeam(
      seedTeam.filter((m) => includeDrafts || m.published).sort((a, b) => a.sort_order - b.sort_order),
    );
  }

  const { data, error } = await selectLive<Member>(async (filterTrashed) => {
    let query = supabase.from("team_members").select("*");
    if (filterTrashed) query = query.is("deleted_at", null);
    query = query.order("sort_order", { ascending: true });
    if (!includeDrafts) query = query.eq("published", true);
    return query;
  });
  if (error || !data) {
    console.error("getTeam:", error?.message);
    return liveTeam(seedTeam.filter((m) => includeDrafts || m.published));
  }
  return liveTeam(data as Member[]);
}

/** "2026-07-12" → "12 July 2026" */
export function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/** "2026-07-25T09:37:29Z" → "25 July 2026, 3:07 pm" - used where order matters. */
export function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Splits our markdown-lite body into rendered blocks. */
export function parseBody(body: string): Array<{ type: "h2" | "p"; text: string }> {
  return body
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) =>
      chunk.startsWith("## ")
        ? { type: "h2" as const, text: chunk.slice(3).trim() }
        : { type: "p" as const, text: chunk.replace(/\n/g, " ") },
    );
}
