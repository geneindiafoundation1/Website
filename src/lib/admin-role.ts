import { getServerSupabase } from "./supabase/server";

/**
 * Is the signed-in account on the admin allow-list?
 *
 * There is a single kind of member: everyone on the list has full access.
 * Accounts created in Supabase → Authentication → Users are added to the list
 * automatically (see supabase/roles.sql). The database enforces this too - this
 * check lets the interface explain the rule rather than fail at it.
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  // The allow-list lets each member read their own row, and no one else's.
  const { data, error } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("isAdmin:", error.message);
    return false;
  }
  return Boolean(data);
}
