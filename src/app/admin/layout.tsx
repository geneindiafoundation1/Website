import type { Metadata } from "next";
import Link from "next/link";
import { LogoLockup } from "@/components/Logo";
import { AdminNav } from "./AdminNav";
import { SignOutButton } from "./SignOutButton";
import { getServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerSupabase();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  // Nobody signed in sees the panel chrome - that covers the login screen and
  // the "not connected yet" notice alike, so the nav never leaks to visitors.
  if (!user) return <>{children}</>;

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link className="brand admin-brand" href="/">
          <LogoLockup />
          <span className="brand-sub">Admin</span>
        </Link>

        <AdminNav />

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: ".6rem" }}>
          <p className="hint">Signed in as {user.email}</p>
          <Link className="btn btn-ghost btn-sm" href="/">
            View website
          </Link>
          <SignOutButton />
        </div>
      </aside>

      <div className="admin-main">{children}</div>
    </div>
  );
}
