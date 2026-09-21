export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

/**
 * Supabase renamed the browser-side key: newer projects issue a "publishable"
 * key (sb_publishable_…) where older ones issued an "anon" key (eyJ…). Both are
 * safe to expose and both work here, so accept whichever the project provides.
 */
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

/** True once the client has pasted their Supabase keys into .env.local. */
export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
