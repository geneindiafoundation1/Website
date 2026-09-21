import type { Metadata } from "next";
import { PostCard } from "@/components/PostCard";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blogs",
  description:
    "Notes from our mentors, updates from our programs, and guidance for students finding their way.",
};

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <div className="phead">
        <div className="wrap">
          <p className="eyebrow">Stories &amp; updates</p>
          <h1>The GENE-INDIA blog</h1>
          <p className="lede">
            Notes from our mentors, updates from our programs, and guidance for students finding
            their way.
          </p>
        </div>
      </div>

      <section className="wrap">
        {posts.length ? (
          <div className="posts stagger" data-reveal>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="lede">No posts published yet - check back soon.</p>
        )}
      </section>
    </>
  );
}
