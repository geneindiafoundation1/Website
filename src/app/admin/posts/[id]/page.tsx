import Link from "next/link";
import { notFound } from "next/navigation";
import { SetupNotice } from "../../SetupNotice";
import { NoPermission } from "../../NoPermission";
import { savePost } from "../../actions";
import { ImageUpload } from "../../ImageUpload";
import { canEdit } from "@/lib/admin-role";
import { supabaseEnabled } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PostEditor({ params }: { params: Promise<{ id: string }> }) {
  if (!supabaseEnabled) return <SetupNotice />;
  if (!(await canEdit()))
    return <NoPermission what="add or edit blog posts" back="/admin/posts" backLabel="Back to posts" />;

  const { id } = await params;
  const isNew = id === "new";

  let post: Post | null = null;
  if (!isNew) {
    const supabase = await getServerSupabase();
    const { data } = await supabase!.from("posts").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    post = data as Post;
  }

  return (
    <>
      <div className="admin-head">
        <h1>{isNew ? "New blog post" : "Edit post"}</h1>
        <Link className="btn btn-ghost btn-sm" href="/admin/posts">
          Back to posts
        </Link>
      </div>

      <form action={savePost} className="panel">
        {post ? <input type="hidden" name="id" value={post.id} /> : null}

        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required defaultValue={post?.title} />
        </div>

        <div className="two">
          <div className="field">
            <label htmlFor="slug">Web address</label>
            <input id="slug" name="slug" className="mono" required defaultValue={post?.slug} />
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <input id="category" name="category" required defaultValue={post?.category ?? "Updates"} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="excerpt">Short summary</label>
          <textarea
            id="excerpt"
            name="excerpt"
            required
            style={{ minHeight: 70 }}
            defaultValue={post?.excerpt}
          />
        </div>

        <ImageUpload name="cover_url" label="Cover image" required defaultValue={post?.cover_url ?? ""} />

        <div className="field">
          <label htmlFor="body">Post content</label>
          <textarea
            id="body"
            name="body"
            required
            style={{ minHeight: 380 }}
            defaultValue={post?.body}
          />
          <p className="hint">
            Leave a blank line between paragraphs. Start a line with <code className="mono">## </code>
            to make it a heading.
          </p>
        </div>

        <div className="two">
          <div className="field">
            <label htmlFor="published_at">Publish date</label>
            <input
              id="published_at"
              name="published_at"
              type="date"
              required
              defaultValue={post?.published_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div className="field" style={{ justifyContent: "flex-end" }}>
            <label style={{ display: "flex", gap: ".55rem", alignItems: "center" }}>
              <input
                type="checkbox"
                name="published"
                defaultChecked={post?.published ?? false}
                style={{ width: "auto" }}
              />
              Publish this post on the website
            </label>
          </div>
        </div>

        <button className="btn btn-primary btn-lg self-start" type="submit">
          {isNew ? "Create post" : "Save changes"}
        </button>
      </form>
    </>
  );
}
