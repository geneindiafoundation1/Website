"use client";

import { useEffect, useRef } from "react";

type Dot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** Baseline drift, preserved so the pointer can nudge without permanently changing speed. */
  bx: number;
  by: number;
  tone: number;
};

type Layer = {
  /** Fraction of scroll distance this layer travels - the parallax. */
  depth: number;
  /** Multiplier on dot radius and drift speed. */
  scale: number;
  alpha: number;
  link: number;
  dots: Dot[];
};

const LAYERS: Omit<Layer, "dots">[] = [
  { depth: 0.05, scale: 0.7, alpha: 0.34, link: 96 },
  { depth: 0.13, scale: 1.05, alpha: 0.5, link: 128 },
  { depth: 0.24, scale: 1.5, alpha: 0.7, link: 152 },
];

/** Every seventh dot picks up an accent; the rest carry the brand green. */
const TONE_VARS = ["--brand", "--brand", "--brand", "--accent", "--sky"];

function toRgb(value: string): [number, number, number] {
  const v = value.trim();
  if (v.startsWith("#")) {
    const hex = v.length === 4 ? v.replace(/#(.)(.)(.)/, "#$1$1$2$2$3$3") : v;
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
  }
  const nums = v.match(/[\d.]+/g);
  if (nums && nums.length >= 3) return [+nums[0], +nums[1], +nums[2]];
  return [120, 120, 120];
}

/**
 * Ambient parallax dot-field that sits behind the whole site: three depth layers of
 * slowly drifting nodes, distance-faded links, gentle pointer attraction, and scroll
 * parallax. Static (drawn once) when the visitor prefers reduced motion.
 */
export function AmbientField() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SPRITE = 32;

    let layers: Layer[] = [];
    let sprites: HTMLCanvasElement[] = [];
    let w = 0;
    let h = 0;
    let raf: number | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let last = 0;
    let scrollY = window.scrollY;
    // Pointer lives off-canvas until the visitor actually moves it.
    let px = -9999;
    let py = -9999;
    let pointerOn = false;

    /** Pre-render each tone as a soft radial sprite - cheaper than per-dot gradients. */
    function buildSprites() {
      const styles = getComputedStyle(document.documentElement);
      sprites = TONE_VARS.map((name) => {
        const [r, g, b] = toRgb(styles.getPropertyValue(name));
        const s = document.createElement("canvas");
        s.width = s.height = SPRITE;
        const sc = s.getContext("2d")!;
        const c = SPRITE / 2;
        const grad = sc.createRadialGradient(c, c, 0, c, c, c);
        grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
        grad.addColorStop(0.24, `rgba(${r},${g},${b},0.85)`);
        grad.addColorStop(0.55, `rgba(${r},${g},${b},0.16)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        sc.fillStyle = grad;
        sc.fillRect(0, 0, SPRITE, SPRITE);
        return s;
      });
    }

    function build() {
      w = canvas!.offsetWidth;
      h = canvas!.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.max(1, Math.round(w * dpr));
      canvas!.height = Math.max(1, Math.round(h * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildSprites();

      const total = Math.max(24, Math.min(84, Math.round((w * h) / 17000)));
      const split = [0.42, 0.34, 0.24];
      layers = LAYERS.map((cfg, li) => {
        const count = Math.round(total * split[li]);
        return {
          ...cfg,
          dots: Array.from({ length: count }, (_, i) => {
            const bx = (Math.random() - 0.5) * 0.13 * cfg.scale;
            const by = (Math.random() - 0.5) * 0.13 * cfg.scale;
            return {
              x: Math.random() * w,
              // Spread over 1.5 viewports so parallax scrolling always has dots to reveal.
              y: Math.random() * h * 1.5,
              vx: bx,
              vy: by,
              bx,
              by,
              r: (Math.random() * 0.9 + 1.05) * cfg.scale,
              tone: (i * 3 + li) % TONE_VARS.length,
            };
          }),
        };
      });
    }

    function draw() {
      if (!w || !h) return;
      const styles = getComputedStyle(document.documentElement);
      const [lr, lg, lb] = toRgb(styles.getPropertyValue("--brand"));
      const span = h * 1.5;

      ctx!.clearRect(0, 0, w, h);
      ctx!.lineCap = "round";

      for (const layer of layers) {
        // Wrap the parallax offset so the field is endless in either scroll direction.
        const shift = ((-scrollY * layer.depth) % span + span) % span;
        const pts = layer.dots.map((d) => {
          let y = d.y + shift;
          if (y > span) y -= span;
          return { x: d.x, y: y - (span - h) / 2, r: d.r, tone: d.tone };
        });

        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          for (let j = i + 1; j < pts.length; j++) {
            const b = pts[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > layer.link * layer.link) continue;
            const d = Math.sqrt(d2);
            ctx!.globalAlpha = (1 - d / layer.link) * 0.17 * layer.alpha;
            ctx!.strokeStyle = `rgb(${lr},${lg},${lb})`;
            ctx!.lineWidth = 0.7 * layer.scale;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }

        // Threads from the cursor to whatever is nearby - a light touch of responsiveness.
        if (pointerOn) {
          for (const p of pts) {
            const d = Math.hypot(p.x - px, p.y - py);
            if (d > 170) continue;
            ctx!.globalAlpha = (1 - d / 170) * 0.26 * layer.alpha;
            ctx!.strokeStyle = `rgb(${lr},${lg},${lb})`;
            ctx!.lineWidth = 0.7 * layer.scale;
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(px, py);
            ctx!.stroke();
          }
        }

        for (const p of pts) {
          const size = p.r * 7;
          ctx!.globalAlpha = layer.alpha;
          ctx!.drawImage(sprites[p.tone], p.x - size / 2, p.y - size / 2, size, size);
        }
      }
      ctx!.globalAlpha = 1;
    }

    function step(now: number) {
      // ~45fps is plenty for motion this slow, and halves the work on high-refresh screens.
      if (now - last > 22) {
        last = now;
        const span = h * 1.5;
        for (const layer of layers) {
          for (const d of layer.dots) {
            if (pointerOn) {
              // Pointer pull is applied to the drift, then eased back to baseline.
              const dx = px - d.x;
              const dy = py - (d.y - (span - h) / 2);
              const dist = Math.hypot(dx, dy);
              if (dist < 200 && dist > 1) {
                const pull = (1 - dist / 200) * 0.0055 * layer.scale;
                d.vx += dx * pull;
                d.vy += dy * pull;
              }
            }
            d.vx += (d.bx - d.vx) * 0.02;
            d.vy += (d.by - d.vy) * 0.02;
            d.x += d.vx;
            d.y += d.vy;
            if (d.x < -20) d.x += w + 40;
            if (d.x > w + 20) d.x -= w + 40;
            if (d.y < 0) d.y += span;
            if (d.y > span) d.y -= span;
          }
        }
        draw();
      }
      raf = requestAnimationFrame(step);
    }

    function start() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      build();
      draw();
      if (!reduce) raf = requestAnimationFrame(step);
    }

    function onResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(start, 180);
    }

    function onScroll() {
      scrollY = window.scrollY;
      if (reduce) draw();
    }

    function onPointer(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      px = e.clientX;
      py = e.clientY;
      pointerOn = true;
    }

    function onLeave() {
      pointerOn = false;
      px = py = -9999;
    }

    function onTheme() {
      buildSprites();
      draw();
    }

    function onVisibility() {
      if (document.hidden && raf) {
        cancelAnimationFrame(raf);
        raf = null;
      } else if (!document.hidden && !reduce && !raf) {
        raf = requestAnimationFrame(step);
      }
    }

    start();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("themechange", onTheme);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("themechange", onTheme);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="ambient" aria-hidden="true">
      <canvas ref={ref} />
    </div>
  );
}
