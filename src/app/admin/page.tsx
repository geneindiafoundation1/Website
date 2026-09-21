import Link from "next/link";
import { SetupNotice } from "./SetupNotice";
import { getPosts, getTeam } from "@/lib/content";
import { supabaseEnabled } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";

export default async function AdminHome() {
  if (!supabaseEnabled) return <SetupNotice />;

  const [posts, team] = await Promise.all([
    getPosts({ includeDrafts: true }),
    getTeam({ includeDrafts: true }),
  ]);

  const supabase = await getServerSupabase();
  const messages = supabase
    ? (await supabase.from("messages").select("id", { count: "exact", head: true })).count ?? 0
    : 0;
  const unverified = supabase
    ? (
        await supabase
          .from("donations")
          .select("id", { count: "exact", head: true })
          .eq("verified", false)
      ).count ?? 0
    : 0;

  const tiles = [
    { label: "Blog posts", value: posts.length, sub: `${posts.filter((p) => p.published).length} live`, href: "/admin/posts" },
    { label: "Team members", value: team.length, sub: `${team.filter((m) => m.published).length} live`, href: "/admin/team" },
    { label: "Messages", value: messages, sub: "from the contact form", href: "/admin/messages" },
    { label: "Donations to verify", value: unverified, sub: "awaiting bank check", href: "/admin/donations" },
  ];

  return (
    <>
      <div className="admin-head">
        <h1>Overview</h1>
        <Link className="btn btn-primary btn-sm" href="/admin/posts/new">
          New blog post
        </Link>
      </div>

      <div className="grid-3">
        {tiles.map((tile) => (
          <Link className="card" key={tile.label} href={tile.href}>
            <span className="eyebrow">{tile.label}</span>
            <b style={{ fontSize: "var(--step-3)", lineHeight: 1 }}>
              {tile.value}
            </b>
            <p>{tile.sub}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
