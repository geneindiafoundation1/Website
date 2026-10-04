import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Crawlers that collect pages for AI training and datasets. They can fetch the
 * whole site over and over, and every byte Netlify serves costs credits, so
 * they are turned away. Search engines (Google, Bing, DuckDuckGo) and social
 * link previews (WhatsApp, Facebook, LinkedIn, X) are unaffected.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "Amazonbot",
  "meta-externalagent",
  "FacebookBot",
  "PerplexityBot",
  "cohere-ai",
  "cohere-training-data-crawler",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "Omgili",
  "YouBot",
  "Timpibot",
  "AI2Bot",
  "Ai2Bot-Dolma",
  "PanguBot",
  "Kangaroo Bot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
      { userAgent: AI_CRAWLERS, disallow: "/" },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
