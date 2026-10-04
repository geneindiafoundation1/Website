import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/content";
import { site } from "@/lib/site";

// Static until the admin panel changes its content (revalidatePath) - no timed rebuilds.
export const revalidate = false;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/about", "/programs", "/team", "/blog", "/contact"].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  // Policy pages: indexed, but rarely change and shouldn't outrank the real content.
  const legalRoutes = ["/privacy", "/terms"].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  const posts = await getPosts();
  const postRoutes = posts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: new Date(post.published_at),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...legalRoutes, ...postRoutes];
}
