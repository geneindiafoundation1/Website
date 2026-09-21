export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown-lite: paragraphs separated by blank lines; lines starting with "## " become headings. */
  body: string;
  category: string;
  cover_url: string | null;
  published: boolean;
  published_at: string;
  read_minutes: number;
};

export type Member = {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string | null;
  tags: string[];
  sort_order: number;
  published: boolean;
  /** YouTube video for this director, attached in getTeam - not a database column. */
  video?: { id: string; title: string } | null;
};

export type ContactMessage = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

export type Donation = {
  name: string;
  email: string;
  amount: number;
  mode: string;
  reference: string;
  note: string;
};
