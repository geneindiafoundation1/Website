"use client";

import { useEffect, useRef } from "react";
import { project, themeColours, type Vec } from "@/lib/canvas3d";

/**
 * The mission, drawn: five inclined orbits - one per discipline the foundation
 * mentors in - turning around a common centre. An ecosystem rather than a
 * hierarchy, which is the point the section text makes.
 *
 * Same approach as the hero globe: orthographic projection by hand, no library,
 * no image files.
 */

/**
 * One orbit per discipline the foundation mentors in. `incline` and `node` are
 * spread widely on purpose: with similar values every ring foreshortens the same
 * way and the whole thing flattens into a spirograph instead of a nest.
 */
const ORBITS = [
  { radius: 0.46, incline: 0.12, node: 0.0, phase: 0.0, speed: 1.0 },
  { radius: 0.62, incline: 0.72, node: 1.0, phase: 1.1, speed: -0.72 },
  { radius: 0.76, incline: 1.24, node: 2.1, phase: 2.2, speed: 0.54 },
  { radius: 0.9, incline: 1.52, node: 0.6, phase: 3.4, speed: -0.4 },
  { radius: 1.02, incline: 0.42, node: 2.6, phase: 4.6, speed: 0.3 },
];

const RING_STEPS = 96;

/**
 * A point at angle `t` on an orbit: a flat circle, inclined about the X axis,
 * then swung about the vertical axis so each ring faces its own direction.
 */
function onOrbit(t: number, radius: number, incline: number, node: number): Vec {
  const fx = Math.cos(t) * radius;
  const fz = Math.sin(t) * radius;
  const y = -fz * Math.sin(incline);
  const z = fz * Math.cos(incline);
  return {
    x: fx * Math.cos(node) + z * Math.sin(node),
    y,
    z: -fx * Math.sin(node) + z * Math.cos(node),
  };
}

export function MissionOrbit() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const TILT = 0.34;

    let size = 0;
    let raf: number | null = null;
    let spin = 0.4;
    let clock = reduce ? 2.2 : 0;
    let last = 0;
    let visible = true;
    let colours = { brand: [19, 74, 128], sky: [63, 143, 196], accent: [21, 103, 143] } as ReturnType<
      typeof themeColours
    >;

    function resize() {
      size = canvas!.offsetWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.max(1, Math.round(size * dpr));
      canvas!.height = Math.max(1, Math.round(size * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      const scale = size * 0.42;
      const centre = size / 2;
      const { brand, sky, accent } = colours;
      ctx!.clearRect(0, 0, size, size);

      // Glow at the centre - the foundation the orbits share.
      const core = ctx!.createRadialGradient(centre, centre, 0, centre, centre, scale * 0.55);
      core.addColorStop(0, `rgba(${accent[0]},${accent[1]},${accent[2]},0.30)`);
      core.addColorStop(0.45, `rgba(${brand[0]},${brand[1]},${brand[2]},0.10)`);
      core.addColorStop(1, `rgba(${brand[0]},${brand[1]},${brand[2]},0)`);
      ctx!.fillStyle = core;
      ctx!.beginPath();
      ctx!.arc(centre, centre, scale * 0.55, 0, Math.PI * 2);
      ctx!.fill();

      ORBITS.forEach((orbit, i) => {
        // The ring itself, dotted, fading as it passes behind the centre.
        for (let s = 0; s < RING_STEPS; s++) {
          const t = (s / RING_STEPS) * Math.PI * 2;
          const p = project(onOrbit(t, orbit.radius, orbit.incline, orbit.node), spin, TILT, scale, centre);
          const front = p.depth > 0;
          ctx!.globalAlpha = front ? 0.26 + p.depth * 0.5 : 0.08;
          ctx!.fillStyle = `rgb(${brand[0]},${brand[1]},${brand[2]})`;
          ctx!.beginPath();
          ctx!.arc(p.sx, p.sy, front ? 1.0 + p.depth * 0.5 : 0.7, 0, Math.PI * 2);
          ctx!.fill();
        }

        // The body travelling that orbit, with a short trail behind it.
        const angle = orbit.phase + clock * orbit.speed;
        for (let k = 6; k >= 0; k--) {
          const p = project(
            onOrbit(angle - k * 0.055 * Math.sign(orbit.speed), orbit.radius, orbit.incline, orbit.node),
            spin,
            TILT,
            scale,
            centre,
          );
          const lead = k === 0;
          const depthFade = p.depth > 0 ? 0.55 + p.depth * 0.45 : 0.22;
          ctx!.globalAlpha = (lead ? 1 : (1 - k / 7) * 0.4) * depthFade;
          ctx!.fillStyle = lead
            ? `rgb(${accent[0]},${accent[1]},${accent[2]})`
            : `rgb(${sky[0]},${sky[1]},${sky[2]})`;
          ctx!.beginPath();
          ctx!.arc(p.sx, p.sy, lead ? 3.1 + (i === 0 ? 0.6 : 0) : 1.7, 0, Math.PI * 2);
          ctx!.fill();
        }

        // A thread from the body back to the centre - mentor to foundation.
        const body = project(onOrbit(angle, orbit.radius, orbit.incline, orbit.node), spin, TILT, scale, centre);
        ctx!.globalAlpha = body.depth > 0 ? 0.16 : 0.07;
        ctx!.strokeStyle = `rgb(${sky[0]},${sky[1]},${sky[2]})`;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(centre, centre);
        ctx!.lineTo(body.sx, body.sy);
        ctx!.stroke();
      });

      // Centre mark, drawn last so it sits above the threads.
      ctx!.globalAlpha = 1;
      ctx!.fillStyle = `rgb(${brand[0]},${brand[1]},${brand[2]})`;
      ctx!.beginPath();
      ctx!.arc(centre, centre, 5, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.globalAlpha = 0.5;
      ctx!.strokeStyle = `rgb(${accent[0]},${accent[1]},${accent[2]})`;
      ctx!.lineWidth = 1.2;
      ctx!.beginPath();
      ctx!.arc(centre, centre, 9.5, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.globalAlpha = 1;
    }

    function frame(now: number) {
      const dt = last ? Math.min(48, now - last) : 16;
      last = now;
      clock += dt * 0.00042;
      spin += dt * 0.00004;
      draw();
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      colours = themeColours();
      resize();
      draw();
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

    function onTheme() {
      colours = themeColours();
      draw();
    }

    function onVisibility() {
      if (document.hidden) stop();
      else if (!reduce && visible && !raf) raf = requestAnimationFrame(frame);
    }

    // Idle while scrolled away - this sits below the fold.
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
    window.addEventListener("themechange", onTheme);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      if (resizeTimer) clearTimeout(resizeTimer);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("themechange", onTheme);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="mission-orbit">
      <canvas
        ref={ref}
        role="img"
        aria-label="Five orbits turning around a shared centre, one for each discipline the foundation mentors in"
      />
    </div>
  );
}
