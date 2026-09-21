"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogoFull } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { site } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const inkRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /** Slides the amber indicator to whichever nav item is current. */
  const moveInk = useCallback(() => {
    const nav = navRef.current;
    const ink = inkRef.current;
    if (!nav || !ink) return;

    const active = nav.querySelector<HTMLElement>('a[aria-current="page"]');
    if (!active || window.innerWidth <= 760) {
      ink.dataset.ready = "false";
      return;
    }

    ink.style.width = `${active.offsetWidth}px`;
    ink.style.transform = `translateX(${active.offsetLeft}px)`;
    ink.dataset.ready = "true";
  }, []);

  useEffect(() => {
    moveInk();
    // Fonts settling can shift link widths after first paint.
    const settle = setTimeout(moveInk, 120);
    window.addEventListener("resize", moveInk);
    return () => {
      clearTimeout(settle);
      window.removeEventListener("resize", moveInk);
    };
  }, [pathname, moveInk]);

  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="top">
      <div className="wrap top-in">
        <Link className="brand" href="/" aria-label={`${site.name} - home`}>
          {/* The complete master lockup - arc, emblem, wordmark, and strapline. */}
          <LogoFull className="logo-full brand-full" width={160} />
        </Link>

        <nav className={open ? "nav open" : "nav"} id="site-nav" ref={navRef}>
          <span className="nav-ink" data-ready="false" ref={inkRef} aria-hidden="true" />
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Link className="nav-login" href="/admin">
            Team login
          </Link>
          <Link className="btn btn-primary nav-donate" href="/donate">
            Donate
          </Link>
        </nav>

        <Link className="top-login" href="/admin">
          Team login
        </Link>
        <Link className="btn btn-primary" href="/donate">
          Donate
        </Link>
        <ThemeToggle />

        <button
          className="menu-btn"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}
