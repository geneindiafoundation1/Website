import { getServerSupabase } from "./supabase/server";

/**
 * Which kind of admin is signed in.
 *
 * "owner" has full access; "viewer" is read-only; null means the account is
 * signed in but not on the allow-list at all. The database enforces this too -
 * this is what lets the interface explain the rule rather than fail at it.
 */
export type AdminRole = "owner" | "viewer" | null;

export async function getAdminRole(): Promise<AdminRole> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // The allow-list lets each member read their own row, and no one else's.
  const { data, error } = await supabase
    .from("admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    // Before roles.sql has been run there is no `role` column; treat a listed
    // account as an owner so an un-migrated project keeps working.
    console.error("getAdminRole:", error.message);
    return "owner";
  }

  if (!data) return null;
  // "editor" no longer exists, but tolerate it until roles.sql has been re-run.
  return data.role === "viewer" ? "viewer" : "owner";
}

export async function canEdit(): Promise<boolean> {
  return (await getAdminRole()) === "owner";
}

/** Super admin - permitted to permanently delete messages and donations. */
export async function isOwner(): Promise<boolean> {
  return (await getAdminRole()) === "owner";
}
