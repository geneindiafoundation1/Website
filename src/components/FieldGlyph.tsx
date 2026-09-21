"use client";

import { useEffect, useRef } from "react";
import { onSphere, project, themeColours, type Vec } from "@/lib/canvas3d";
import { type GlyphKind } from "@/lib/field-glyph";

/**
 * A turning 3D figure for each director, drawn from the field they work in: a
 * beating heart for cardiology, a firing neuron for neurobiology, a silicon die
 * with live traces for technology.
 *
 * On wide screens it takes a column of its own beside the bio; below that
 * breakpoint it falls back behind the copy as a faint watermark. Either way it
 * is purely decorative and hidden from assistive technology - the role line and
 * tags already say the field in words.
 *
 * Same approach as the home page pieces - orthographic projection by hand on a
 * 2D canvas, no 3D library, no image files, colours read from the stylesheet so
 * both themes are covered.
 */

/* ---------- geometry, built once at module load ---------- */

function norm(v: Vec): Vec {
  const m = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / m, y: v.y / m, z: v.z / m };
}

/** Deterministic pseudo-random, so the neuron is the same shape on every load. */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

/** Evenly resamples a polyline into points, for drawing it as a dotted run. */
function sample(poly: Vec[], per: number): Vec[] {
  const out: Vec[] = [];
  for (let i = 0; i < poly.length - 1; i++) {
    const a = poly[i];
    const b = poly[i + 1];
    for (let s = 0; s < per; s++) {
      const t = s / per;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t });
    }
  }
  out.push(poly[poly.length - 1]);
  return out;
}

/** Position along a polyline at t in [0,1], by segment index - close enough here. */
function along(poly: Vec[], t: number): Vec {
  const n = poly.length - 1;
  const f = Math.min(0.9999, Math.max(0, t)) * n;
  const i = Math.floor(f);
  const k = f - i;
  const a = poly[i];
  const b = poly[i + 1];
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k };
}

/* ---------- the human heart ----------
   Driven by an anterior-view outline rather than a formula. Silhouette is what
   makes a shape recognisable, so the anatomy is carried by the outline and the
   3D comes from lofting it over an ellipsoidal depth profile. */

function bezier3(p0: Vec, p1: Vec, p2: Vec, p3: Vec, s: number): Vec {
  const m = 1 - s;
  const a = m * m * m;
  const b = 3 * m * m * s;
  const c = 3 * m * s * s;
  const d = s * s * s;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
    z: a * p0.z + b * p1.z + c * p2.z + d * p3.z,
  };
}

/** Evenly redistributes a closed outline by arc length, so dots space uniformly. */
function resampleClosed(pts: [number, number][], n: number): [number, number][] {
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segs.push(d);
    total += d;
  }
  const out: [number, number][] = [];
  let acc = 0;
  let i = 0;
  for (let k = 0; k < n; k++) {
    const target = (k / n) * total;
    while (i < segs.length - 1 && acc + segs[i] < target) {
      acc += segs[i];
      i++;
    }
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const f = segs[i] ? (target - acc) / segs[i] : 0;
    out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
  }
  return out;
}

/**
 * Anterior view, traced anticlockwise from the apex: up the left border of the
 * left ventricle, out along the pulmonary trunk, over the aortic arch, down the
 * superior vena cava, around the bulge of the right atrium, then along the
 * inferior border back to the apex. The three vessel stubs across the top and
 * the apex slung to the lower left are what read as "heart" at a glance.
 */
const HEART_OUTLINE_RAW: [number, number][] = [
  [-0.42, -0.98], // apex
  [-0.55, -0.8],
  [-0.63, -0.55],
  [-0.66, -0.28],
  [-0.64, -0.02],
  [-0.58, 0.18],
  [-0.5, 0.32], // left auricle
  [-0.44, 0.44],
  [-0.4, 0.58], // pulmonary trunk, left wall
  [-0.38, 0.72],
  [-0.34, 0.86],
  [-0.3, 0.95],
  [-0.16, 0.92], // pulmonary trunk, right wall
  [-0.14, 0.8],
  [-0.16, 0.66], // notch between trunk and aorta
  [-0.1, 0.72],
  [-0.04, 0.86],
  [0.06, 0.95], // aortic arch
  [0.18, 0.93],
  [0.24, 0.84],
  [0.26, 0.72],
  [0.24, 0.62],
  [0.3, 0.66], // superior vena cava
  [0.36, 0.74],
  [0.44, 0.72],
  [0.46, 0.58],
  [0.44, 0.44],
  [0.54, 0.32], // right atrium
  [0.62, 0.16],
  [0.66, -0.02],
  [0.62, -0.2],
  [0.54, -0.36],
  [0.4, -0.56], // inferior border
  [0.22, -0.72],
  [0.0, -0.86],
  [-0.22, -0.95],
];

const HEART_SCALE = 0.84;
/* Sits the figure high in its box: the apex drops further than the vessels
   rise, so centring on the bounding box wastes the top and crowds the trace. */
const HEART_LIFT = 0.15;
const HEART_DEPTH = 0.34;
const HEART_OUTLINE = resampleClosed(HEART_OUTLINE_RAW, 88).map(
  ([x, y]) => [x * HEART_SCALE, y * HEART_SCALE] as [number, number],
);

const HEART_CONTOURS: Vec[][] = (() => {
  const levels = 17;
  const out: Vec[][] = [];
  for (let l = 0; l < levels; l++) {
    const u = -1 + (2 * l) / (levels - 1);
    const s = Math.sqrt(Math.max(0, 1 - u * u));
    if (s < 0.12) continue;
    out.push(HEART_OUTLINE.map(([x, y]) => ({ x: x * s, y: y * s, z: u * HEART_DEPTH })));
  }
  return out;
})();

/**
 * Coronary arteries across the front face: the left anterior descending running
 * down the interventricular groove to the apex, the circumflex along the
 * atrioventricular groove separating atria from ventricles, and the right
 * coronary sweeping round the inferior border.
 */
const HEART_CORONARY: Vec[] = (() => {
  const runs: [Vec, Vec, Vec, Vec][] = [
    [
      { x: -0.22, y: 0.34, z: 0.16 },
      { x: -0.3, y: 0.1, z: 0.26 },
      { x: -0.34, y: -0.3, z: 0.22 },
      { x: -0.4, y: -0.8, z: 0.1 },
    ],
    [
      { x: -0.3, y: 0.3, z: 0.18 },
      { x: -0.05, y: 0.2, z: 0.28 },
      { x: 0.25, y: 0.12, z: 0.24 },
      { x: 0.5, y: 0.0, z: 0.1 },
    ],
    [
      { x: 0.5, y: 0.0, z: 0.12 },
      { x: 0.44, y: -0.28, z: 0.2 },
      { x: 0.26, y: -0.58, z: 0.18 },
      { x: -0.05, y: -0.82, z: 0.1 },
    ],
    // Diagonal branches off the LAD, over the left ventricle.
    [
      { x: -0.29, y: 0.06, z: 0.26 },
      { x: -0.36, y: -0.02, z: 0.24 },
      { x: -0.46, y: -0.14, z: 0.18 },
      { x: -0.52, y: -0.32, z: 0.1 },
    ],
    [
      { x: -0.33, y: -0.24, z: 0.23 },
      { x: -0.4, y: -0.34, z: 0.2 },
      { x: -0.47, y: -0.46, z: 0.14 },
      { x: -0.5, y: -0.6, z: 0.08 },
    ],
    // Marginal branch off the right coronary.
    [
      { x: 0.42, y: -0.32, z: 0.2 },
      { x: 0.34, y: -0.44, z: 0.19 },
      { x: 0.22, y: -0.52, z: 0.16 },
      { x: 0.08, y: -0.56, z: 0.12 },
    ],
  ];
  const pts: Vec[] = [];
  for (const [p0, p1, p2, p3] of runs) {
    const n = 34;
    for (let i = 0; i <= n; i++) {
      const v = bezier3(p0, p1, p2, p3, i / n);
      pts.push({ x: v.x * HEART_SCALE, y: v.y * HEART_SCALE, z: v.z });
    }
  }
  return pts;
})();

const SOMA_RADIUS = 0.27;

/** The neuron's dendrite tree - four generations branching off the cell body. */
const NEURON_SEGS: { a: Vec; b: Vec }[] = (() => {
  const rnd = lcg(20260801);
  const segs: { a: Vec; b: Vec }[] = [];
  function grow(from: Vec, dir: Vec, len: number, depth: number) {
    const to = { x: from.x + dir.x * len, y: from.y + dir.y * len, z: from.z + dir.z * len };
    segs.push({ a: from, b: to });
    if (depth === 0) return;
    for (let k = 0; k < 2; k++) {
      const d = norm({
        x: dir.x + (rnd() - 0.5) * 1.15,
        y: dir.y + (rnd() - 0.5) * 1.15,
        z: dir.z + (rnd() - 0.5) * 1.15,
      });
      grow(to, d, len * 0.6, depth - 1);
    }
  }
  const roots = 7;
  for (let i = 0; i < roots; i++) {
    // Biased upward and outward, leaving the lower left clear for the axon.
    const d = onSphere(-15 + rnd() * 95, 40 + (300 / roots) * i + rnd() * 22);
    grow({ x: d.x * SOMA_RADIUS, y: d.y * SOMA_RADIUS, z: d.z * SOMA_RADIUS }, d, 0.28, 3);
  }
  return segs;
})();

/** The axon: one long run leaving the cell body, carrying the signal. */
const AXON: Vec[] = (() => {
  const pts: Vec[] = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push({
      x: -SOMA_RADIUS * 0.7 - t * 0.56,
      y: -0.12 - t * 0.2 + Math.sin(t * 3.4) * 0.09,
      z: Math.cos(t * 2.6) * 0.16,
    });
  }
  return pts;
})();

/**
 * Terminal branches at the end of the axon, each ending in a synaptic bouton -
 * an axon that simply stops looks cut off rather than connected to anything.
 */
const AXON_TERMINALS: Vec[][] = (() => {
  const tip = AXON[AXON.length - 1];
  const dirs = [
    { x: -0.5, y: -0.42, z: 0.26 },
    { x: -0.58, y: 0.12, z: -0.3 },
    { x: -0.44, y: -0.58, z: -0.16 },
  ];
  return dirs.map((d0) => {
    const d = norm(d0);
    const pts: Vec[] = [];
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push({
        x: tip.x + d.x * 0.2 * t,
        y: tip.y + d.y * 0.2 * t + Math.sin(t * 2.1) * 0.02,
        z: tip.z + d.z * 0.2 * t,
      });
    }
    return pts;
  });
})();

/** A point cloud over the cell body, spread by the golden angle. */
const SOMA: Vec[] = (() => {
  const pts: Vec[] = [];
  const n = 110;
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const a = i * 2.399963;
    pts.push({ x: Math.cos(a) * r * SOMA_RADIUS, y: y * SOMA_RADIUS, z: Math.sin(a) * r * SOMA_RADIUS });
  }
  return pts;
})();

const DIE_X = 0.38;
const DIE_Y = 0.09;

/** The twelve edges of the silicon die. */
const DIE_EDGES: [Vec, Vec][] = (() => {
  const c: Vec[] = [];
  for (const sy of [-1, 1]) {
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        c.push({ x: sx * DIE_X, y: sy * DIE_Y, z: sz * DIE_X });
      }
    }
  }
  const edges: [Vec, Vec][] = [];
  for (let i = 0; i < c.length; i++) {
    for (let j = i + 1; j < c.length; j++) {
      const d =
        Number(c[i].x !== c[j].x) + Number(c[i].y !== c[j].y) + Number(c[i].z !== c[j].z);
      if (d === 1) edges.push([c[i], c[j]]);
    }
  }
  return edges;
})();

/** Sixteen traces running from the die out to pads at the rim, with a jog. */
const CHIP_TRACES: Vec[][] = (() => {
  const out: Vec[][] = [];
  const dirs = [
    { x: 1, z: 0 },
    { x: -1, z: 0 },
    { x: 0, z: 1 },
    { x: 0, z: -1 },
  ];
  for (const d of dirs) {
    for (const k of [-1.5, -0.5, 0.5, 1.5]) {
      const perp = { x: -d.z, z: d.x };
      const o = k * 0.115;
      const o2 = o + k * 0.085;
      const p = (r: number, off: number): Vec => ({
        x: d.x * r + perp.x * off,
        y: 0,
        z: d.z * r + perp.z * off,
      });
      out.push([p(DIE_X, o), p(0.52, o), p(0.64, o2), p(0.84, o2)]);
    }
  }
  return out;
})();

/** A lattice across the top face of the die - the thing that reads as silicon. */
const DIE_LATTICE: Vec[] = (() => {
  const pts: Vec[] = [];
  const n = 7;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      pts.push({
        x: -DIE_X * 0.78 + DIE_X * 1.56 * (i / (n - 1)),
        y: DIE_Y,
        z: -DIE_X * 0.78 + DIE_X * 1.56 * (j / (n - 1)),
      });
    }
  }
  return pts;
})();

/** Bond wires arcing from the die's top face out to where each trace begins. */
const BOND_WIRES: Vec[] = (() => {
  const pts: Vec[] = [];
  for (const t of CHIP_TRACES) {
    const a = { x: t[0].x * 0.82, y: DIE_Y, z: t[0].z * 0.82 };
    const b = t[1];
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const s = i / n;
      pts.push({
        x: a.x + (b.x - a.x) * s,
        y: a.y + (b.y - a.y) * s + Math.sin(s * Math.PI) * 0.1,
        z: a.z + (b.z - a.z) * s,
      });
    }
  }
  return pts;
})();

const TRACE_DOTS = CHIP_TRACES.map((t) => sample(t, 7));
const AXON_DOTS = sample(AXON, 3);
const TERMINAL_DOTS = AXON_TERMINALS.map((t) => sample(t, 3));

/* ---------- the component ---------- */

type Colours = ReturnType<typeof themeColours>;

export function FieldGlyph({ kind }: { kind: GlyphKind }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const TILT = 0.3;

    let size = 0;
    let raf: number | null = null;
    let spin = 0.5;
    // Reduced motion still gets a composed frame, just a static one.
    let clock = reduce ? 0.42 : 0;
    let last = 0;
    let visible = true;
    let colours: Colours = {
      brand: [19, 74, 128],
      sky: [63, 143, 196],
      accent: [21, 103, 143],
      india: [13, 33, 54],
    };

    /**
     * Re-measures the backing store. Returns whether the size actually changed,
     * so callers only repaint when there is something to repaint. Measuring on
     * mount alone is not enough - this canvas is absolutely positioned, and if
     * layout has not settled when the effect runs it would be stuck at zero
     * with nothing ever drawn.
     */
    function measure() {
      const w = canvas!.getBoundingClientRect().width || canvas!.offsetWidth;
      if (!w || Math.abs(w - size) < 0.5) return false;
      size = w;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.max(1, Math.round(size * dpr));
      canvas!.height = Math.max(1, Math.round(size * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    }

    /**
     * A dot whose size and opacity fall away as it turns behind the figure.
     * With `lit`, a screen-space gradient is layered on top - a cheap stand-in
     * for a light from the upper left that gives the surface a sense of volume
     * instead of reading as an evenly lit cloud of points.
     */
    function dot(
      v: Vec,
      scale: number,
      centre: number,
      rgb: number[],
      base: number,
      r: number,
      lit = false,
    ) {
      const p = project(v, spin, TILT, scale, centre);
      const front = p.depth > 0;
      let a = base * (front ? 0.55 + p.depth * 0.45 : 0.2);
      if (lit) {
        const gx = (p.sx - centre) / (size * 0.5);
        const gy = (p.sy - centre) / (size * 0.5);
        a *= Math.max(0.42, Math.min(1.3, 0.92 - gx * 0.34 - gy * 0.3));
      }
      ctx!.globalAlpha = a;
      ctx!.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      ctx!.beginPath();
      ctx!.arc(p.sx, p.sy, front ? r + p.depth * r * 0.45 : r * 0.7, 0, Math.PI * 2);
      ctx!.fill();
    }

    function line(a: Vec, b: Vec, scale: number, centre: number, rgb: number[], base: number) {
      const pa = project(a, spin, TILT, scale, centre);
      const pb = project(b, spin, TILT, scale, centre);
      const depth = (pa.depth + pb.depth) / 2;
      ctx!.globalAlpha = base * (depth > 0 ? 0.5 + depth * 0.5 : 0.18);
      ctx!.strokeStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(pa.sx, pa.sy);
      ctx!.lineTo(pb.sx, pb.sy);
      ctx!.stroke();
    }

    function glow(centre: number, radius: number, rgb: number[], strength: number) {
      const g = ctx!.createRadialGradient(centre, centre, 0, centre, centre, radius);
      g.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${strength})`);
      g.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
      ctx!.globalAlpha = 1;
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(centre, centre, radius, 0, Math.PI * 2);
      ctx!.fill();
    }

    /** Lub-dub: a strong beat, a softer one just behind it, then rest. */
    function beat(t: number) {
      const p = t % 1;
      return (
        1 + 0.085 * Math.exp(-70 * p * p) + 0.05 * Math.exp(-80 * (p - 0.19) * (p - 0.19))
      );
    }

    function drawHeart(scale: number, centre: number) {
      const { brand, sky, accent } = colours;
      const b = beat(clock * 0.62);
      // The heart gets its own, larger scale; the ECG below still uses `scale`.
      const hs = scale * 1.34;
      const place = (v: Vec): Vec => ({
        x: v.x * b,
        y: v.y * b + HEART_LIFT,
        z: v.z * b,
      });
      glow(centre, scale * 0.95, accent, 0.1 + (b - 1) * 1.5);

      for (const ring of HEART_CONTOURS) {
        for (const v of ring) dot(place(v), hs, centre, brand, 0.8, 1.0, true);
      }
      // Drawn after the muscle so the vessels sit on top of the front face.
      for (const v of HEART_CORONARY) dot(place(v), hs, centre, accent, 0.95, 1.3, true);

      // An ECG trace along the bottom, sweeping in time with the beat.
      const baseY = centre + scale * 1.3;
      const w = size * 0.86;
      const x0 = (size - w) / 2;
      ctx!.globalAlpha = 0.32;
      ctx!.strokeStyle = `rgb(${sky[0]},${sky[1]},${sky[2]})`;
      ctx!.lineWidth = 1.4;
      ctx!.beginPath();
      const steps = 120;
      for (let i = 0; i <= steps; i++) {
        const f = i / steps;
        // Phase so the spike travels right to left against the same clock.
        const q = (f + clock * 0.62) % 1;
        let y = 0;
        y += 0.1 * Math.exp(-900 * (q - 0.3) * (q - 0.3)); // P
        y -= 0.28 * Math.exp(-2600 * (q - 0.4) * (q - 0.4)); // Q
        y += 1.0 * Math.exp(-3200 * (q - 0.43) * (q - 0.43)); // R
        y -= 0.34 * Math.exp(-2400 * (q - 0.47) * (q - 0.47)); // S
        y += 0.17 * Math.exp(-700 * (q - 0.6) * (q - 0.6)); // T
        const px = x0 + f * w;
        const py = baseY - y * scale * 0.18;
        if (i === 0) ctx!.moveTo(px, py);
        else ctx!.lineTo(px, py);
      }
      ctx!.stroke();
      ctx!.globalAlpha = 1;
    }

    function drawNeuron(scale: number, centre: number) {
      const { brand, sky, accent } = colours;
      const ns = scale * 1.46;
      glow(centre, scale * 0.78, accent, 0.13);

      for (const s of NEURON_SEGS) line(s.a, s.b, ns, centre, brand, 0.5);
      for (const v of SOMA) dot(v, ns, centre, brand, 0.8, 1.15, true);

      /* Myelin: the axon is drawn in fat sheathed runs broken by thin gaps at
         the nodes of Ranvier, rather than as one uniform dotted line. */
      AXON_DOTS.forEach((v, i) => {
        const sheathed = ((i / AXON_DOTS.length) * 5.5) % 1 < 0.72;
        dot(v, ns, centre, sky, sheathed ? 0.55 : 0.32, sheathed ? 1.5 : 0.7, true);
      });

      for (const run of TERMINAL_DOTS) {
        for (const v of run) dot(v, ns, centre, sky, 0.45, 0.8);
      }
      // Synaptic boutons at the very ends of the terminals.
      for (const run of AXON_TERMINALS) {
        dot(run[run.length - 1], ns, centre, accent, 0.85, 2.4, true);
      }

      // Three action potentials chasing each other down the axon.
      for (let k = 0; k < 3; k++) {
        const t = (clock * 0.5 + k / 3) % 1;
        for (let tail = 4; tail >= 0; tail--) {
          const tt = t - tail * 0.022;
          if (tt < 0) continue;
          const lead = tail === 0;
          dot(
            along(AXON, tt),
            ns,
            centre,
            lead ? accent : sky,
            lead ? 1 : (1 - tail / 5) * 0.5,
            lead ? 3.1 : 1.7,
          );
        }
      }
      ctx!.globalAlpha = 1;
    }

    function drawChip(scale: number, centre: number) {
      const { brand, sky, accent } = colours;
      const cs = scale * 1.5;
      glow(centre, scale * 0.72, accent, 0.14);

      for (const dots of TRACE_DOTS) for (const v of dots) dot(v, cs, centre, brand, 0.4, 0.8);

      // Pads at the rim.
      for (const t of CHIP_TRACES) dot(t[t.length - 1], cs, centre, sky, 0.7, 2.1, true);

      // Bond wires arcing off the die, then the die body over them.
      for (const v of BOND_WIRES) dot(v, cs, centre, sky, 0.4, 0.7);
      for (const v of DIE_LATTICE) dot(v, cs, centre, brand, 0.55, 0.9, true);
      for (const [a, b] of DIE_EDGES) line(a, b, cs, centre, brand, 0.75);

      // Data packets running inward, each trace on its own phase.
      CHIP_TRACES.forEach((t, i) => {
        const phase = (clock * 0.42 + i / CHIP_TRACES.length) % 1;
        const p = 1 - phase; // rim → die
        for (let tail = 3; tail >= 0; tail--) {
          const tt = p + tail * 0.03;
          if (tt > 1) continue;
          const lead = tail === 0;
          dot(
            along(t, tt),
            cs,
            centre,
            lead ? accent : sky,
            lead ? 1 : (1 - tail / 4) * 0.45,
            lead ? 2.4 : 1.4,
          );
        }
      });

      // The die's core, drawn last so it reads above the traces.
      const c = project({ x: 0, y: DIE_Y, z: 0 }, spin, TILT, cs, centre);
      ctx!.globalAlpha = 0.9;
      ctx!.fillStyle = `rgb(${accent[0]},${accent[1]},${accent[2]})`;
      ctx!.beginPath();
      ctx!.arc(c.sx, c.sy, 3.8, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.globalAlpha = 1;
    }

    function draw() {
      if (!size) return;
      const scale = size * 0.34;
      const centre = size / 2;
      ctx!.clearRect(0, 0, size, size);
      if (kind === "heart") drawHeart(scale, centre);
      else if (kind === "neuron") drawNeuron(scale, centre);
      else drawChip(scale, centre);
      ctx!.globalAlpha = 1;
    }

    function frame(now: number) {
      const dt = last ? Math.min(48, now - last) : 16;
      last = now;
      clock += dt * 0.0007;
      spin += dt * 0.00022;
      // Picks up a late layout without waiting for a resize event.
      if (!size) measure();
      draw();
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      colours = themeColours();
      measure();
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

    // Layout here depends on the bio's height and the page's breakpoints, so
    // watch the element itself rather than only the window.
    const sizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            if (measure()) draw();
          });
    sizeObserver?.observe(canvas);

    // These sit down the page; idle them until they're actually on screen.
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
      sizeObserver?.disconnect();
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("themechange", onTheme);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [kind]);

  return (
    <div className="field-watermark" aria-hidden="true">
      <canvas ref={ref} />
    </div>
  );
}
