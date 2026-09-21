"use client";

import { useCallback } from "react";

export function ThemeToggle() {
  const toggle = useCallback(() => {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme");
    const isDark =
      current === "dark" ||
      (!current && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = isDark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private browsing - the preference simply won't persist.
    }
    window.dispatchEvent(new Event("themechange"));
  }, []);

  return (
    <button className="theme-btn" onClick={toggle} aria-label="Switch colour theme">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** Applies the saved theme before first paint, avoiding a flash of the wrong theme. */
export const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();`;
