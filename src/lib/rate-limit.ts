import { createHash } from "node:crypto";
import { getServerSupabase } from "./supabase/server";

/**
 * Form throttling, shared across instances.
 *
 * The counter lives in Postgres (see supabase/hardening.sql), because serverless
 * hosts spin up isolated instances - an in-memory counter would reset constantly
 * and effectively let spam through. The in-memory map below is only a fallback
 * for when the database is unreachable or not configured yet.
 */
const WINDOW_SECONDS = 10 * 60;
const MAX_HITS = 5;

const memoryHits = new Map<string, number[]>();

/** Hashes IP + form name, so raw visitor IP addresses are never stored. */
function clientKey(request: Request, bucket: string) {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`${bucket}:${ip}`).digest("hex").slice(0, 40);
}

function memoryLimit(key: string): boolean {
  const now = Date.now();
  const windowMs = WINDOW_SECONDS * 1000;
  const recent = (memoryHits.get(key) || []).filter((t) => now - t < windowMs);

  if (recent.length >= MAX_HITS) {
    memoryHits.set(key, recent);
    return false;
  }

  recent.push(now);
  memoryHits.set(key, recent);

  // Opportunistic cleanup so the map can't grow without bound.
  if (memoryHits.size > 5000) {
    for (const [k, times] of memoryHits) {
      if (times.every((t) => now - t >= windowMs)) memoryHits.delete(k);
    }
  }
  return true;
}

/** True if the request is within its budget, false if it should be refused. */
export async function rateLimit(request: Request, bucket: string): Promise<boolean> {
  const key = clientKey(request, bucket);

  try {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { data, error } = await supabase.rpc("rate_limit_hit", {
        p_key: key,
        p_max: MAX_HITS,
        p_window_seconds: WINDOW_SECONDS,
      });

      if (!error && typeof data === "boolean") return data;
      if (error) console.error("rate limit:", error.message);
    }
  } catch (error) {
    console.error("rate limit:", error instanceof Error ? error.message : error);
  }

  // Database unavailable - fall back to the per-instance counter rather than
  // failing shut, so a database blip can't take the contact form down.
  return memoryLimit(key);
}
