/**
 * Small helpers shared by the hand-drawn 3D pieces on the home page.
 * Orthographic projection only - enough for a globe or a set of orbits, and it
 * keeps both components to a few kilobytes with no 3D library involved.
 */

export type Vec = { x: number; y: number; z: number };

/** Latitude/longitude in degrees → a point on the unit sphere. */
export function onSphere(latDeg: number, lonDeg: number): Vec {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const c = Math.cos(lat);
  return { x: c * Math.sin(lon), y: Math.sin(lat), z: c * Math.cos(lon) };
}

/** Rotate about the vertical axis by `spin`, tilt by `tilt`, then flatten. */
export function project(
  v: Vec,
  spin: number,
  tilt: number,
  radius: number,
  centre: number,
) {
  const cs = Math.cos(spin);
  const sn = Math.sin(spin);
  const x = v.x * cs + v.z * sn;
  const z = -v.x * sn + v.z * cs;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const y = v.y * ct - z * st;
  const depth = v.y * st + z * ct;
  return { sx: centre + x * radius, sy: centre - y * radius, depth };
}

/** Reads a CSS custom property value - hex or rgb() - into an [r,g,b] triple. */
export function toRgb(value: string): [number, number, number] {
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

/** Pulls the theme's brand colours straight from the stylesheet. */
export function themeColours() {
  const styles = getComputedStyle(document.documentElement);
  return {
    brand: toRgb(styles.getPropertyValue("--brand")),
    sky: toRgb(styles.getPropertyValue("--sky")),
    accent: toRgb(styles.getPropertyValue("--accent")),
    /** The highlight India is drawn in - white on dark, near-black on light. */
    india: toRgb(styles.getPropertyValue("--globe-india")),
  };
}
