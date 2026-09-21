"use client";

import { useEffect } from "react";

/**
 * Reveals anything marked [data-reveal] as it scrolls into view.
 *
 * Content is visible by default; the hiding styles only apply once this
 * mounts and adds `.js-reveal` to <html>. So if JavaScript fails or is
 * disabled, the page still renders fully - the motion is purely additive.
 */
export function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    root.classList.add("js-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const observeAll = () => {
      for (const el of document.querySelectorAll("[data-reveal]:not(.is-in)")) {
        observer.observe(el);
      }
    };
    observeAll();

    // Client-side navigation swaps the tree without remounting this component.
    const mutation = new MutationObserver(observeAll);
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
      root.classList.remove("js-reveal");
    };
  }, []);

  return null;
}
