import Link from "next/link";
import { SetupNotice } from "../SetupNotice";
import { deletePost } from "../actions";
import { formatDate, getPosts } from "@/lib/content";
import { canEdit } from "@/lib/admin-role";
import { supabaseEnabled } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function AdminPosts() {
  if (!supabaseEnabled) return <SetupNotice />;
  const posts = await getPosts({ includeDrafts: true });
  const editable = await canEdit();

  return (
    <>
      <div className="admin-head">
        <h1>Blog posts</h1>
        {editable ? (
          <Link className="btn btn-primary btn-sm" href="/admin/posts/new">
            New post
          </Link>
        ) : (
          <span className="pill">Read only</span>
        )}
      </div>

      <div className="rows">
        {posts.length === 0 ? (
          <p className="empty">No posts yet. Write the first one.</p>
        ) : (
          posts.map((post) => (
            <div className="row" key={post.id}>
              <div>
                <div className="row-title">{post.title}</div>
                <div className="hint">
                  {post.category} · {formatDate(post.published_at)}
                </div>
              </div>
              <span className={post.published ? "pill live" : "pill"}>
                {post.published ? "Live" : "Draft"}
              </span>
              <div style={{ display: "flex", gap: ".4rem" }}>
                {editable ? (
                  <>
                    <Link className="btn btn-ghost btn-sm" href={`/admin/posts/${post.id}`}>
                      Edit
                    </Link>
                    <form action={deletePost}>
                      <input type="hidden" name="id" value={post.id} />
                      <button className="btn btn-ghost btn-sm" type="submit">
                        Delete
                      </button>
                    </form>
                  </>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
