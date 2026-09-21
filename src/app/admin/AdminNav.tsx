"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/posts", label: "Blog posts" },
  { href: "/admin/team", label: "Team members" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/trash", label: "Trash" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav>
      {LINKS.map((link) => {
        const current =
          link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} aria-current={current ? "page" : undefined}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
