"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canEdit, isOwner } from "@/lib/admin-role";
import { getServerSupabase } from "@/lib/supabase/server";

const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

/**
 * Browser `required` attributes are a convenience, not a guarantee - a form can
 * be submitted without them. Every field is checked again here.
 */
function requireFields(form: FormData, fields: Record<string, string>) {
  const missing = Object.entries(fields)
    .filter(([key]) => !str(form, key))
    .map(([, label]) => label);

  if (missing.length) {
    throw new Error(
      missing.length === 1
        ? `${missing[0]} is required.`
        : `These fields are required: ${missing.join(", ")}.`,
    );
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

/**
 * Every write goes through here. Hiding buttons from read-only members is a
 * courtesy; this is the check that actually stops them, and the database
 * policies stop anyone who gets past this.
 */
async function requireSupabase() {
  const supabase = await getServerSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // Owners and editors may write; viewers and unlisted accounts may not.
  if (!(await canEdit())) {
    throw new Error(
      "You don't have permission to change content. Your account has read-only access - " +
        "ask a foundation administrator if you need editing rights.",
    );
  }
  return supabase;
}

/**
 * Postgres rejects writes from an account that isn't on the admin allow-list
 * with code 42501. Surfacing that raw is baffling, so name the real cause.
 */
function fail(error: { code?: string; message: string }): never {
  if (error.code === "42501") {
    throw new Error(
      "Your account is signed in but is not on the admin allow-list, so it cannot " +
        "change content. Add it in Supabase (see supabase/hardening.sql) and try again.",
    );
  }
  throw new Error(error.message);
}

/* ------------------------------- posts ------------------------------- */

export async function savePost(formData: FormData) {
  const supabase = await requireSupabase();

  requireFields(formData, {
    title: "Title",
    slug: "Web address",
    category: "Category",
    excerpt: "Short summary",
    cover_url: "Cover image",
    body: "Post content",
    published_at: "Publish date",
  });

  const id = str(formData, "id");
  const title = str(formData, "title");
  const body = str(formData, "body");

  const record = {
    title,
    slug: slugify(str(formData, "slug") || title),
    excerpt: str(formData, "excerpt"),
    body,
    category: str(formData, "category") || "Updates",
    cover_url: str(formData, "cover_url") || null,
    published: formData.get("published") === "on",
    published_at: str(formData, "published_at") || new Date().toISOString().slice(0, 10),
    read_minutes: Math.max(1, Math.round(body.split(/\s+/).length / 200)),
  };

  const { error } = id
    ? await supabase.from("posts").update(record).eq("id", id)
    : await supabase.from("posts").insert(record);

  if (error) fail(error);

  revalidatePath("/blog");
  revalidatePath(`/blog/${record.slug}`);
  revalidatePath("/");
  redirect("/admin/posts");
}

export async function deletePost(formData: FormData) {
  const supabase = await requireSupabase();
  const { error } = await trash(supabase, "posts", str(formData, "id"));
  if (error) fail(error);
  revalidatePath("/blog");
  revalidatePath("/admin/posts");
}

/* ------------------------------- team ------------------------------- */

export async function saveMember(formData: FormData) {
  const supabase = await requireSupabase();

  requireFields(formData, {
    name: "Full name",
    // No slug field on this form - it is generated from the name below.
    role: "Role",
    bio: "Biography",
    photo_url: "Photo",
    tags: "Tags",
    sort_order: "Display order",
  });

  const id = str(formData, "id");
  const name = str(formData, "name");

  const record = {
    name,
    slug: slugify(str(formData, "slug") || name),
    role: str(formData, "role"),
    bio: str(formData, "bio"),
    photo_url: str(formData, "photo_url") || null,
    tags: str(formData, "tags")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    sort_order: Number(str(formData, "sort_order")) || 99,
    published: formData.get("published") === "on",
  };

  const { error } = id
    ? await supabase.from("team_members").update(record).eq("id", id)
    : await supabase.from("team_members").insert(record);

  if (error) fail(error);

  revalidatePath("/team");
  redirect("/admin/team");
}

export async function deleteMember(formData: FormData) {
  const supabase = await requireSupabase();
  const { error } = await trash(supabase, "team_members", str(formData, "id"));
  if (error) fail(error);
  revalidatePath("/team");
  revalidatePath("/admin/team");
}

/* ---------------------------- donations ----------------------------- */

export async function markDonationVerified(formData: FormData) {
  const supabase = await requireSupabase();
  const { error } = await supabase
    .from("donations")
    .update({ verified: true })
    .eq("id", str(formData, "id"));
  if (error) fail(error);
  revalidatePath("/admin/donations");
}

/* ------------------------ deleting records ------------------------ */
/* Editors and owners may clear messages and donation entries; viewers may not.
 * Deletion is permanent - there is no undo. */

export async function deleteMessage(formData: FormData) {
  const supabase = await requireSupabase();
  const { error } = await trash(supabase, "messages", str(formData, "id"));
  if (error) fail(error);
  revalidatePath("/admin/messages");
}

export async function deleteDonation(formData: FormData) {
  const supabase = await requireSupabase();
  const { error } = await trash(supabase, "donations", str(formData, "id"));
  if (error) fail(error);
  revalidatePath("/admin/donations");
}

/* --------------------------- trash & restore --------------------------- */
/* Deleting marks the row instead of destroying it, so it can be recovered from
 * the Trash screen. Emptying the trash is the only irreversible step, and that
 * is reserved for owners. */

type Table = "posts" | "team_members" | "messages" | "donations";

/**
 * A row-level-security refusal is not an error - the update simply matches no
 * rows and reports success, which looks like a dead button. Asking for the
 * changed rows back turns that silence into a message we can show.
 */
const REFUSED = {
  code: "no-rows",
  message:
    "The database refused that change, so nothing was altered. Your account may not have " +
    "permission, or the item may already be gone. If this keeps happening, the migrations in " +
    "supabase/ may need re-running.",
};

async function trash(
  supabase: Awaited<ReturnType<typeof getServerSupabase>>,
  table: Table,
  id: string,
) {
  const { data: auth } = await supabase!.auth.getUser();
  const { data, error } = await supabase!
    .from(table)
    .update({ deleted_at: new Date().toISOString(), deleted_by: auth.user?.id ?? null })
    .eq("id", id)
    .select("id");

  if (error) return { error };
  if (!data || data.length === 0) return { error: REFUSED };
  return { error: null };
}

function asTable(value: string): Table {
  if (!["posts", "team_members", "messages", "donations"].includes(value)) {
    throw new Error("Unknown item.");
  }
  return value as Table;
}

export async function restoreItem(formData: FormData) {
  const supabase = await requireSupabase();
  const table = asTable(str(formData, "table"));

  const { data, error } = await supabase
    .from(table)
    .update({ deleted_at: null, deleted_by: null })
    .eq("id", str(formData, "id"))
    .select("id");
  if (error) fail(error);
  if (!data || data.length === 0) fail(REFUSED);

  revalidatePath("/admin/trash");
  revalidatePath("/blog");
  revalidatePath("/team");
  revalidatePath("/");
}

/**
 * Destroys one trashed row for good. The only step in the panel with no undo,
 * so it is owners-only and refuses anything still live - a row has to be put in
 * the trash first, which makes deleting forever a deliberate second decision.
 */
export async function purgeItem(formData: FormData) {
  const supabase = await requireSupabase();
  if (!(await isOwner())) {
    throw new Error(
      "Only an owner can delete something permanently. Ask a foundation owner to do this.",
    );
  }

  const table = asTable(str(formData, "table"));
  const id = str(formData, "id");

  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq("id", id)
    .not("deleted_at", "is", null)
    .select("id");
  if (error) fail(error);
  if (!data || data.length === 0) fail(REFUSED);

  revalidatePath("/admin/trash");
  revalidatePath("/admin/activity");
}



