import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { thumbClass } from "@/components/PostCard";
import { formatDate, getPost, getPosts, parseBody } from "@/lib/content";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.published_at,
      images: post.cover_url ? [post.cover_url] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !post.published) notFound();

  return (
    <section className="wrap">
      <article className="article">
        <Link className="back" href="/blog">
          ← All posts
        </Link>

        <div className="meta" style={{ marginBottom: ".8rem" }}>
          <span>{post.category}</span>
          <span>·</span>
          <span>{formatDate(post.published_at)}</span>
          <span>·</span>
          <span>{post.read_minutes} min read</span>
        </div>

        <h1>{post.title}</h1>

        <div className={thumbClass(post.slug)}>
          {post.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.cover_url} alt={post.title} />
          ) : null}
        </div>

        <div className="prose">
          {parseBody(post.body).map((block, i) =>
            block.type === "h2" ? <h2 key={i}>{block.text}</h2> : <p key={i}>{block.text}</p>,
          )}
        </div>

        <hr className="rule" style={{ marginBlock: "2.5rem 2rem" }} />
        <p className="eyebrow">Support this work</p>
        <p style={{ color: "var(--ink-soft)", marginBlock: ".7rem 1.2rem" }}>
          Every rupee goes directly to running volunteer-led mentorship programs.
        </p>
        <Link className="btn btn-primary" href="/donate">
          Donate
        </Link>
      </article>
    </section>
  );
}
