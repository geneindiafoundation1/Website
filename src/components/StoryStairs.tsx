"use client";

import { useEffect, useRef } from "react";
import { project, themeColours, type Vec } from "@/lib/canvas3d";

/**
 * The story, drawn: a flight of solid steps climbing away from the viewer, with
 * a marker making its way up them one at a time.
 *
 * The section's copy is about the path someone has already walked, so the steps
 * are the path and the marker is the student on it.
 *
 * Each step is a cloud of points rather than a filled block - dots along its
 * twelve edges plus a lattice over the tread. Nothing is opaque, so the far side
 * of the flight shows through the near side, and depth alone does the work of
 * separating them. Same family as the globe and the orbits elsewhere on the
 * page, but denser and at higher opacity so it holds its weight beside a long
 * column of text.
 *
 * Projected by hand - no 3D library, no image files.
 */

const STEPS = 6;
const STEP_W = 0.3; // along the climb
const STEP_D = 0.62; // across it
const RISE = 0.21;
const BASE_Y = -0.78;

/** Slightly past the last step, so the marker rests at the top before restarting. */
const DWELL = 1.5;

/**
 * How far the drawn figure reaches from its own centre, per unit of `scale`,
 * measured off the projection: the floor's far corner sets the bottom, the
 * marker's halo at the top step sets the top, and the widest point of the sway
 * sets the sides. `scale` is derived from these so the flight is framed by what
 * is actually drawn - sizing it by a guessed fraction of the box is what used
 * to push the floor off the bottom edge on short canvases.
 */
const HALF_W = 1.27;
const HALF_H = 1.14;
/** The figure's mid-point sits a little below the origin it is projected about. */
const Y_CENTRE = 0.096;
/** Breathing room, so nothing lands hard against an edge. */
const FIT = 0.98;

type Box = { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number };

/** How far apart the points sit, in world units. */
const DOT_GAP = 0.052;

/**
 * A block as a cloud of points: dots along all twelve edges, plus a lattice
 * across the tread on top so it reads as a surface you could stand on rather
 * than an empty cage. The four vertical faces are left as outlines - filling
 * them too turns the flight into a solid mass of dots.
 */
function boxPoints(b: Box): Vec[] {
  const out: Vec[] = [];
  const xs = [b.x0, b.x1];
  const ys = [b.y0, b.y1];
  const zs = [b.z0, b.z1];

  /** Points from `a` to `c`, spaced evenly and always landing on both corners. */
  const run = (a: Vec, c: Vec) => {
    const len = Math.hypot(c.x - a.x, c.y - a.y, c.z - a.z);
    const n = Math.max(1, Math.round(len / DOT_GAP));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      out.push({ x: a.x + (c.x - a.x) * t, y: a.y + (c.y - a.y) * t, z: a.z + (c.z - a.z) * t });
    }
  };

  for (const y of ys) {
    for (const z of zs) run({ x: b.x0, y, z }, { x: b.x1, y, z });
    for (const x of xs) run({ x, y, z: b.z0 }, { x, y, z: b.z1 });
  }
  for (const x of xs) for (const z of zs) run({ x, y: b.y0, z }, { x, y: b.y1, z });

  // Tread lattice, inset so it doesn't double up on the edge runs above.
  const nx = Math.max(1, Math.round((b.x1 - b.x0) / DOT_GAP));
  const nz = Math.max(1, Math.round((b.z1 - b.z0) / DOT_GAP));
  for (let i = 1; i < nx; i++) {
    for (let j = 1; j < nz; j++) {
      out.push({ x: b.x0 + ((b.x1 - b.x0) * i) / nx, y: b.y1, z: b.z0 + ((b.z1 - b.z0) * j) / nz });
    }
  }
  return out;
}

/** Step `i` as a block, sitting on the floor and rising one tread higher. */
function step(i: number): Box {
  const x0 = -(STEPS * STEP_W) / 2 + i * STEP_W;
  return {
    x0,
    x1: x0 + STEP_W,
    y0: BASE_Y,
    y1: BASE_Y + (i + 1) * RISE,
    z0: -STEP_D / 2,
    z1: STEP_D / 2,
  };
}

const treadTop = (i: number) => BASE_Y + (i + 1) * RISE;
const treadCentre = (i: number) => -(STEPS * STEP_W) / 2 + (i + 0.5) * STEP_W;

/** Lambert, then darken below 1 / lift toward white above it. */
function shade(rgb: number[], f: number) {
  const t = Math.min(1, Math.max(0, f - 1));
  const at = (i: number) =>
    Math.round(f <= 1 ? rgb[i] * f : rgb[i] + (255 - rgb[i]) * t);
  return `rgb(${at(0)},${at(1)},${at(2)})`;
}

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);

export function StoryStairs() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const TILT = 0.46;

    // Not square: the canvas stretches to whatever height the copy beside it
    // takes, so the two columns balance.
    let width = 0;
    let height = 0;
    let raf: number | null = null;
    // Held part-way up the climb when motion is off.
    let clock = reduce ? 5.6 : 0;
    let last = 0;
    let visible = true;
    let colours = { brand: [19, 74, 128], sky: [63, 143, 196], accent: [21, 103, 143] } as ReturnType<
      typeof themeColours
    >;

    function resize() {
      width = canvas!.offsetWidth;
      height = canvas!.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.max(1, Math.round(width * dpr));
      canvas!.height = Math.max(1, Math.round(height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      // Fit to whichever edge binds first, then centre on the figure's own
      // mid-point rather than on the origin.
      const scale = Math.min((width * 0.5) / HALF_W, (height * 0.5) / HALF_H) * FIT;
      const cx = width / 2;
      const cy = height / 2 - scale * Y_CENTRE;
      const { brand, sky, accent } = colours;
      // A slow sway rather than a full turn - a staircase seen end-on is a line.
      const spin = 0.66 + 0.13 * Math.sin(clock * 0.34);
      // project() centres on a single value; offset by hand for a non-square box.
      const put = (v: Vec) => {
        const p = project(v, spin, TILT, scale, 0);
        return { sx: cx + p.sx, sy: cy + p.sy, depth: p.depth };
      };
      ctx!.clearRect(0, 0, width, height);

      function trace(pts: Vec[]) {
        ctx!.beginPath();
        pts.forEach((v, i) => {
          const p = put(v);
          if (i === 0) ctx!.moveTo(p.sx, p.sy);
          else ctx!.lineTo(p.sx, p.sy);
        });
        ctx!.closePath();
      }

      function polygon(pts: Vec[], fill: string, alpha: number) {
        ctx!.globalAlpha = alpha;
        trace(pts);
        ctx!.fillStyle = fill;
        ctx!.fill();
      }

      // A dot's size in pixels, so the cloud keeps its density at any canvas size.
      const dotR = Math.max(1.1, scale * 0.0072);

      /**
       * A block as a cloud of points. Nothing is filled: depth alone separates
       * near from far, which is what makes the flight read as three-dimensional
       * while staying open.
       */
      function cloud(box: Box, base: number[], alpha = 1) {
        for (const v of boxPoints(box)) {
          const p = put(v);
          // depth runs about -1..1 here; map it to how near the dot reads.
          const near = Math.max(0, Math.min(1, p.depth * 0.5 + 0.5));
          ctx!.globalAlpha = (0.3 + near * 0.65) * alpha;
          ctx!.fillStyle = shade(base, 0.85 + near * 0.5);
          ctx!.beginPath();
          ctx!.arc(p.sx, p.sy, dotR * (0.68 + near * 0.62), 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      // Floor, so the steps stand on something rather than float.
      const half = (STEPS * STEP_W) / 2;
      polygon(
        [
          { x: -half - 0.24, y: BASE_Y, z: -STEP_D / 2 - 0.24 },
          { x: half + 0.24, y: BASE_Y, z: -STEP_D / 2 - 0.24 },
          { x: half + 0.24, y: BASE_Y, z: STEP_D / 2 + 0.24 },
          { x: -half - 0.24, y: BASE_Y, z: STEP_D / 2 + 0.24 },
        ],
        `rgb(${brand[0]},${brand[1]},${brand[2]})`,
        0.1,
      );

      // Back to front. Every step shares a z span, so the climb direction alone
      // decides the order and a single sort is enough.
      const order = Array.from({ length: STEPS }, (_, i) => i).sort(
        (a, b) => put({ x: treadCentre(a), y: 0, z: 0 }).depth - put({ x: treadCentre(b), y: 0, z: 0 }).depth,
      );

      for (const i of order) {
        // The climb warms from brand toward sky as it rises.
        cloud(step(i), mix(brand, sky, (i / (STEPS - 1)) * 0.7));
      }

      // The marker, working its way up. It clamps at the top step, rests there,
      // then fades out and begins again from the bottom.
      const cycle = (clock * 0.62) % (STEPS - 1 + DWELL);
      const t = Math.min(cycle, STEPS - 1);
      const i = Math.min(STEPS - 2, Math.floor(t));
      const frac = Math.min(1, t - i);
      // Ease so it settles onto each tread instead of sliding at a constant rate.
      const e = frac * frac * (3 - 2 * frac);
      const mx = treadCentre(i) + (treadCentre(i + 1) - treadCentre(i)) * e;
      const my =
        treadTop(i) + (treadTop(i + 1) - treadTop(i)) * e + Math.sin(frac * Math.PI) * 0.07;
      const fade =
        Math.min(1, cycle / 0.3) * (cycle > STEPS - 1 ? 1 - (cycle - (STEPS - 1)) / DWELL : 1);
      const alpha = Math.max(0, fade);
      // A halo first, so the marker reads as lit from within rather than as one
      // more dot in the cloud. It rides a little above the tread it stands on.
      const centre = put({ x: mx, y: my + 0.08, z: 0 });
      const halo = ctx!.createRadialGradient(centre.sx, centre.sy, 0, centre.sx, centre.sy, scale * 0.3);
      halo.addColorStop(0, `rgba(${accent[0]},${accent[1]},${accent[2]},0.4)`);
      halo.addColorStop(1, `rgba(${accent[0]},${accent[1]},${accent[2]},0)`);
      ctx!.globalAlpha = alpha;
      ctx!.fillStyle = halo;
      ctx!.beginPath();
      ctx!.arc(centre.sx, centre.sy, scale * 0.3, 0, Math.PI * 2);
      ctx!.fill();
      // The marker itself stays a single bright point - one dot among the cloud,
      // but the only one that moves.
      ctx!.globalAlpha = alpha;
      ctx!.fillStyle = shade(accent, 1.15);
      ctx!.beginPath();
      ctx!.arc(centre.sx, centre.sy, dotR * 2.6, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.globalAlpha = 1;
    }

    function frame(now: number) {
      const dt = last ? Math.min(48, now - last) : 16;
      last = now;
      clock += dt * 0.00075;
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

    // Watching the element, not the window: its height is set by the copy in the
    // next column, which reflows without the window changing size.
    const sizeObserver = new ResizeObserver(onResize);
    sizeObserver.observe(canvas);

    function onTheme() {
      colours = themeColours();
      draw();
    }

    function onVisibility() {
      if (document.hidden) stop();
      else if (!reduce && visible && !raf) raf = requestAnimationFrame(frame);
    }

    // Idle while scrolled away - this sits well below the fold.
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
    window.addEventListener("themechange", onTheme);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      if (resizeTimer) clearTimeout(resizeTimer);
      observer.disconnect();
      sizeObserver.disconnect();
      window.removeEventListener("themechange", onTheme);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="story-stairs">
      <canvas
        ref={ref}
        role="img"
        aria-label="A flight of solid steps with a marker climbing them, one step at a time"
      />
    </div>
  );
}
