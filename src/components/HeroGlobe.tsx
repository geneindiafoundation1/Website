"use client";

import { useEffect, useRef } from "react";
import { onSphere, project as project3d, themeColours, type Vec } from "@/lib/canvas3d";
import { indiaDots, landDots, oceanDots } from "@/lib/world-map";

/**
 * A slowly turning 3D globe: the continents picked out in dots, with
 * great-circle arcs curving out from India to the places mentors write in
 * from, each carrying a travelling pulse.
 *
 * Everything is projected by hand - no 3D library, no image files - so it stays
 * a few kilobytes and crisp at any size. The coastlines come from `world-map`,
 * sampled onto the sphere; a much fainter lattice sits underneath so the globe
 * still reads as a solid body when the Pacific is facing the viewer.
 */

const HOME = onSphere(22, 79); // India

/** Where the foundation's mentors are: roughly London, New York, Toronto, Dubai, Singapore, Sydney. */
const DESTINATIONS = [
  onSphere(51, 0),
  onSphere(41, -74),
  onSphere(44, -79),
  onSphere(25, 55),
  onSphere(1, 104),
  onSphere(-34, 151),
];

/** Spherical interpolation, so an arc follows the shortest path over the surface. */
function slerp(a: Vec, b: Vec, t: number): Vec {
  const dot = Math.min(1, Math.max(-1, a.x * b.x + a.y * b.y + a.z * b.z));
  const omega = Math.acos(dot);
  if (omega < 1e-6) return a;
  const s = Math.sin(omega);
  const k1 = Math.sin((1 - t) * omega) / s;
  const k2 = Math.sin(t * omega) / s;
  return { x: a.x * k1 + b.x * k2, y: a.y * k1 + b.y * k2, z: a.z * k1 + b.z * k2 };
}

export function HeroGlobe() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const TILT = 0.3; // radians - leans the northern hemisphere, where India sits, toward the viewer
    // Built once per mount - the point-in-polygon pass is the only real work
    // this component does, and it must not run inside the animation loop.
    const land = landDots();
    const ocean = oceanDots();
    const india = indiaDots();
    const ARC_STEPS = 44;

    let size = 0;
    let raf: number | null = null;
    // Begin with India toward the viewer, then drift.
    let spin = -Math.atan2(HOME.x, HOME.z);
    let last = 0;
    let visible = true;
    let brand: [number, number, number] = [19, 74, 128];
    let sky: [number, number, number] = [63, 143, 196];
    let accent: [number, number, number] = [21, 103, 143];
    let indiaRgb: [number, number, number] = [13, 33, 54];

    function readColours() {
      ({ brand, sky, accent, india: indiaRgb } = themeColours());
    }

    function resize() {
      size = canvas!.offsetWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.max(1, Math.round(size * dpr));
      canvas!.height = Math.max(1, Math.round(size * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const project = (v: Vec, radius: number) => project3d(v, spin, TILT, radius, size / 2);

    function draw(now: number) {
      const radius = size * 0.4;
      ctx!.clearRect(0, 0, size, size);

      // Soft halo, so the globe reads as a body rather than a flat ring of dots.
      const halo = ctx!.createRadialGradient(size / 2, size / 2, radius * 0.2, size / 2, size / 2, radius * 1.25);
      halo.addColorStop(0, `rgba(${brand[0]},${brand[1]},${brand[2]},0.10)`);
      halo.addColorStop(0.72, `rgba(${brand[0]},${brand[1]},${brand[2]},0.045)`);
      halo.addColorStop(1, `rgba(${brand[0]},${brand[1]},${brand[2]},0)`);
      ctx!.fillStyle = halo;
      ctx!.beginPath();
      ctx!.arc(size / 2, size / 2, radius * 1.25, 0, Math.PI * 2);
      ctx!.fill();

      // Rim.
      ctx!.strokeStyle = `rgba(${brand[0]},${brand[1]},${brand[2]},0.20)`;
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
      ctx!.stroke();

      // Only the near hemisphere is drawn. Showing the far side too flattens the
      // illusion; hiding it is what makes the globe read as solid.

      // The ocean lattice first, kept faint - it carries the curvature without
      // competing with the coastlines drawn over it.
      ctx!.fillStyle = `rgb(${sky[0]},${sky[1]},${sky[2]})`;
      for (const d of ocean) {
        const p = project(d, radius);
        if (p.depth <= 0.015) continue;
        ctx!.globalAlpha = (0.06 + p.depth * 0.16) * 0.9;
        ctx!.beginPath();
        ctx!.arc(p.sx, p.sy, 0.5 + p.depth * 0.5, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Then the continents, full strength.
      ctx!.fillStyle = `rgb(${brand[0]},${brand[1]},${brand[2]})`;
      for (const d of land) {
        const p = project(d, radius);
        if (p.depth <= 0.015) continue;
        ctx!.globalAlpha = 0.2 + p.depth * 0.75;
        ctx!.beginPath();
        ctx!.arc(p.sx, p.sy, 0.7 + p.depth * 1.05, 0, Math.PI * 2);
        ctx!.fill();
      }

      // India last of the land, in its own colour and a shade heavier, so the
      // country the foundation serves reads as the subject rather than one more
      // coastline.
      ctx!.fillStyle = `rgb(${indiaRgb[0]},${indiaRgb[1]},${indiaRgb[2]})`;
      for (const d of india) {
        const p = project(d, radius);
        if (p.depth <= 0.015) continue;
        ctx!.globalAlpha = 0.3 + p.depth * 0.7;
        ctx!.beginPath();
        ctx!.arc(p.sx, p.sy, 0.85 + p.depth * 1.15, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Connection arcs, lifted off the surface so they read as travelling over it.
      DESTINATIONS.forEach((dest, i) => {
        // An arc with both feet on the far side would appear as a stray stroke.
        const homeDepth = project(HOME, radius).depth;
        const destDepth = project(dest, radius).depth;
        if (homeDepth < -0.05 && destDepth < -0.05) return;

        const points = Array.from({ length: ARC_STEPS + 1 }, (_, s) => {
          const t = s / ARC_STEPS;
          const base = slerp(HOME, dest, t);
          const lift = 1 + Math.sin(t * Math.PI) * 0.1;
          return project(
            { x: base.x * lift, y: base.y * lift, z: base.z * lift },
            radius,
          );
        });

        ctx!.lineWidth = 1.3;
        for (let s = 0; s < points.length - 1; s++) {
          const a = points[s];
          const b = points[s + 1];
          // Hide the stretch that passes behind the globe.
          const depth = (a.depth + b.depth) / 2;
          if (depth < -0.1) continue;
          ctx!.globalAlpha = Math.min(1, Math.max(0, 0.15 + (depth + 0.1) * 0.75)) * 0.75;
          ctx!.strokeStyle = `rgb(${sky[0]},${sky[1]},${sky[2]})`;
          ctx!.beginPath();
          ctx!.moveTo(a.sx, a.sy);
          ctx!.lineTo(b.sx, b.sy);
          ctx!.stroke();
        }

        // A pulse running from the mentor toward India, staggered per arc.
        const phase = ((now / 2600 + i / DESTINATIONS.length) % 1 + 1) % 1;
        const pulse = points[Math.round((1 - phase) * ARC_STEPS)];
        if (pulse && pulse.depth > -0.05) {
          ctx!.globalAlpha = Math.sin(phase * Math.PI) * 0.9;
          ctx!.fillStyle = `rgb(${accent[0]},${accent[1]},${accent[2]})`;
          ctx!.beginPath();
          ctx!.arc(pulse.sx, pulse.sy, 2.6, 0, Math.PI * 2);
          ctx!.fill();
        }
      });

      // India, and each mentor city, marked.
      [HOME, ...DESTINATIONS].forEach((v, i) => {
        const p = project(v, radius);
        if (p.depth <= 0) return;
        const home = i === 0;
        ctx!.globalAlpha = 0.45 + p.depth * 0.55;
        ctx!.fillStyle = home
          ? `rgb(${indiaRgb[0]},${indiaRgb[1]},${indiaRgb[2]})`
          : `rgb(${sky[0]},${sky[1]},${sky[2]})`;
        ctx!.beginPath();
        ctx!.arc(p.sx, p.sy, home ? 3.4 : 2.2, 0, Math.PI * 2);
        ctx!.fill();
        // A ring around the home marker, so it still reads as a pin against
        // the warm fill of the country beneath it.
        if (home) {
          ctx!.globalAlpha *= 0.5;
          ctx!.strokeStyle = `rgb(${indiaRgb[0]},${indiaRgb[1]},${indiaRgb[2]})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.arc(p.sx, p.sy, 6.4, 0, Math.PI * 2);
          ctx!.stroke();
        }
      });

      ctx!.globalAlpha = 1;
    }

    function frame(now: number) {
      const dt = last ? Math.min(48, now - last) : 16;
      last = now;
      spin += dt * 0.00009; // about one turn every seventy seconds
      draw(now);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      readColours();
      resize();
      draw(performance.now());
      if (!reduce && visible) raf = requestAnimationFrame(frame);
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      last = 0;
    }

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    function onResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(start, 160);
    }

    function onVisibility() {
      if (document.hidden) stop();
      else if (!reduce && visible && !raf) raf = requestAnimationFrame(frame);
    }

    // Don't spend frames on a globe that has scrolled out of view.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) stop();
        else if (!reduce && !raf) raf = requestAnimationFrame(frame);
      },
      { rootMargin: "120px" },
    );
    observer.observe(canvas);

    start();
    window.addEventListener("resize", onResize);
    window.addEventListener("themechange", () => {
      readColours();
      draw(performance.now());
    });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      if (resizeTimer) clearTimeout(resizeTimer);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="hero-globe">
      <canvas ref={ref} role="img" aria-label="A globe showing mentors around the world connecting to students in India" />
    </div>
  );
}
