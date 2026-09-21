import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options?: CookieOptions };
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseEnabled } from "./config";

/**
 * Request-scoped Supabase client. Returns null when the project has no keys
 * yet, so every caller degrades to seed content instead of crashing.
 *
 * At build time - generateStaticParams, prerendering - there is no request and
 * `cookies()` throws. Public content still needs fetching then, so fall back to
 * a cookie-less anonymous client. It can read published rows, which is all a
 * prerender needs; anything requiring a session simply sees no session.
 */
export async function getServerSupabase() {
  if (!supabaseEnabled) return null;

  let cookieStore: Awaited<ReturnType<typeof cookies>> | null = null;
  try {
    cookieStore = await cookies();
  } catch {
    cookieStore = null;
  }

  if (!cookieStore) {
    return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: { getAll: () => [], setAll: () => {} },
    });
  }

  const store = cookieStore;
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            store.set({ name, value, ...options });
          }
        } catch {
          // Called from a Server Component - refreshing cookies is handled by middleware.
        }
      },
    },
  });
}
