import Link from "next/link";
import { formatDate } from "@/lib/content";
import type { Post } from "@/lib/types";

/** Deterministic gradient variant so a post looks the same on every render. */
export function thumbClass(slug: string) {
  let sum = 0;
  for (let i = 0; i < slug.length; i++) sum += slug.charCodeAt(i);
  const variant = sum % 3;
  return variant === 0 ? "thumb" : `thumb v${variant}`;
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link className="post" href={`/blog/${post.slug}`}>
      <div className={thumbClass(post.slug)}>
        {post.cover_url ? (
          // Covers come from Supabase storage; plain <img> keeps this free of loader config.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover_url} alt={post.title} loading="lazy" />
        ) : null}
      </div>
      <div className="meta">
        <span>{post.category}</span>
        <span>·</span>
        <span>{formatDate(post.published_at)}</span>
        {!post.published ? <span className="pill">Draft</span> : null}
      </div>
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
    </Link>
  );
}
