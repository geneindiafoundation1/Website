/**
 * A dotted world map for the home-page globe.
 *
 * The continents are carried by hand-traced coastline polygons in plain
 * longitude/latitude, tested with a ray cast and sampled onto an equal-arc
 * grid - so the land reads as land at globe size without shipping a GeoJSON
 * file or a texture. Roughly a couple of kilobytes of coordinates, and the
 * result is resolution-independent because the dots are placed on the sphere
 * rather than drawn from an image.
 *
 * Outlines are deliberately coarse: at ~3° of sampling nothing finer than a
 * large bay survives anyway, so the traces carry silhouette - the shapes the
 * eye actually recognises - and drop the detail.
 *
 * Coordinates are flat [lon, lat, lon, lat, …] runs. Nothing crosses the
 * ±180° seam (Chukotka is clipped at 180) so the point-in-polygon test can
 * stay a plain planar one.
 */

import { onSphere, type Vec } from "./canvas3d";

/* ---------- land ---------- */

const EURASIA = [
  // Iberia and the French Atlantic up to the Baltic approaches.
  -9.5, 38.7, -9.2, 43.4, -1.8, 46.2, -4.7, 48.4, 0.5, 49.5, 4.3, 51.5, 8.5, 53.8,
  8.2, 55.5, 10.6, 57.7,
  // Norway, round the North Cape, into the White Sea.
  8, 58, 5.3, 60.4, 5, 62, 11, 64, 14, 67, 18, 69.5, 25, 71, 31, 70, 33, 69,
  40, 66, 44, 68,
  // The Siberian Arctic: Yamal, Taymyr, the Lena delta, out to Chukotka.
  55, 68.5, 60, 70, 69, 73, 73, 68, 80, 73, 86, 76, 100, 76.5, 110, 73.5, 129, 73,
  140, 71.5, 150, 70, 160, 69.5, 170, 69.5, 179, 65, 179, 64, 170, 60,
  // Kamchatka, the Okhotsk coast, down to Vladivostok.
  163, 58, 162, 56, 156, 51, 155, 58, 150, 59, 142, 54, 140, 52, 131, 43,
  // Korea, the Yellow Sea, the China coast.
  126, 40, 126, 38, 129, 35, 129, 38, 122, 39, 121, 32, 117, 24, 110, 21,
  // Indochina and the Malay peninsula.
  108, 18, 109, 13, 106, 10, 100, 12, 101, 4, 103, 1.4, 98, 8, 98, 12,
  // Myanmar round the Bay of Bengal to the tip of India.
  94, 16, 90, 22, 87, 21, 80, 15, 77.5, 8.1,
  // The Indian west coast, Pakistan, and the mouth of the Gulf.
  73, 15, 70, 21, 66, 25, 56, 26,
  // Arabia: Oman, Yemen, the Red Sea shore up to Sinai.
  59, 22, 55, 17, 52, 15, 45, 12.7, 43, 17, 39, 21, 35, 28, 34.5, 31.5,
  // The Levant, Turkey, Greece.
  36, 36, 35.5, 36.5, 30, 36.8, 27, 36.7, 26, 38.5, 23, 37.9, 21, 37, 20, 39.5,
  // The Adriatic, Italy, and the Gulf of Lion back to Gibraltar.
  19, 42, 13.5, 45.5, 14.5, 42, 18.4, 40.2, 15.6, 38, 14, 41, 11, 42.4, 10, 44,
  8, 44.4, 3, 43, 0.9, 41.2, -0.3, 39.5, -2.2, 36.7, -5.6, 36, -7, 37.2, -9, 37,
];

const AFRICA = [
  -5.9, 35.8, 10, 37, 20, 32.5, 25, 31.5, 34, 31.5,
  // Down the Red Sea to the Horn.
  37, 22, 39, 15, 43, 12.5, 51, 11.5,
  // The East African coast to the Cape.
  44, 2, 41, -2, 40, -10, 40, -16, 35, -24, 32, -29, 25, -34, 20, -34.8, 18, -34,
  // Namibia, Angola, the Gulf of Guinea.
  14, -22, 11.7, -16, 13, -8, 9, -1, 8.5, 4, 5, 5.5, -2, 4.5, -7.5, 4.5,
  // The West African bulge back to Morocco.
  -13, 8, -17.5, 14.7, -16, 21, -13, 27.5, -9.8, 30,
];

const NORTH_AMERICA = [
  // The Alaskan and Canadian Arctic.
  -168, 65.5, -162, 70, -156, 71.4, -140, 70, -128, 70, -115, 69, -105, 68.5,
  -95, 68, -85, 66, -80, 63, -78, 62, -70, 61, -64, 60,
  // The Atlantic seaboard.
  -57, 54, -55, 50, -65, 45, -70, 42, -74, 40, -76, 37, -81, 32, -80, 25.5,
  // Florida, the Gulf, and the Yucatán.
  -83, 29, -88, 30, -94, 29.5, -97, 26, -92, 19, -88, 21.5, -87, 18,
  // Central America down to the isthmus.
  -83, 15, -79, 9.5, -83, 8, -92, 15, -96, 16, -105, 20,
  // Baja and the Pacific coast north to the Bering Strait.
  -110, 24, -114, 28, -117, 32.5, -122, 37, -124, 42, -124, 48, -131, 53,
  -136, 58, -145, 60, -152, 59, -158, 56, -165, 60,
];

const SOUTH_AMERICA = [
  -72, 12, -62, 10.5, -52, 5, -50, 0, -44, -2.5, -38, -5, -35, -8, -39, -13,
  -40, -20, -48, -25, -53, -34, -57, -38, -62, -40, -65, -45, -68, -50, -68, -55,
  -75, -52, -74, -45, -73, -37, -71, -30, -70, -20, -75, -14, -81, -6, -80, 0,
  -77, 8,
];

const AUSTRALIA = [
  113, -22, 114, -26, 115, -34, 123, -34, 130, -32, 137, -35, 141, -38, 146, -39,
  150, -37, 153, -28, 146, -19, 145, -15, 142, -11, 137, -12, 130, -12, 127, -14,
  122, -17, 114, -21,
];

const GREENLAND = [
  -45, 60, -20, 70, -22, 75, -30, 82, -45, 83, -58, 82, -68, 78, -55, 68, -50, 62,
];

/** Islands large enough to survive the sampling grid. */
const ISLANDS = [
  // Madagascar
  [43.2, -25.5, 47, -25, 50.5, -15.5, 49.5, -12.5, 47, -13, 43.3, -21],
  // Great Britain
  [-5, 50, 1.7, 51, 0, 53, -1, 55, -2, 57, -3, 58.5, -5, 58, -6, 56, -3, 54, -5, 53, -4, 51.5],
  // Ireland
  [-10, 51.5, -6, 52, -6, 54, -8, 55, -10, 54],
  // Iceland
  [-24, 65, -14, 65.5, -15, 64, -22, 63.5],
  // Japan
  [
    129.5, 33, 135, 34, 139, 35, 141, 38, 141, 41, 145, 43.5, 143, 45.5, 139.5, 42,
    137, 37, 133, 35, 130, 34, 129, 32.5,
  ],
  // Sumatra
  [95, 5.5, 98, 3, 102, -2, 106, -6, 104, -6, 100, -2, 96, 4],
  // Java
  [105, -6, 114, -8, 114, -8.7, 105, -7],
  // Borneo
  [109, 2, 113, 3.5, 117, 4, 119, -1, 116, -4, 110, -3, 109, -1],
  // Sulawesi
  [119, -5, 120, -3, 125, 1, 127, 1, 123, -1, 122, -5],
  // New Guinea
  [131, -1, 141, -2.5, 147, -6, 150, -10, 143, -9, 137, -8, 131, -4],
  // The Philippines
  [120, 18, 122, 14, 126, 10, 126, 6, 122, 6, 120, 13, 119, 16],
  // Sri Lanka
  [80, 9.8, 81.9, 7.5, 80.2, 5.9, 79.7, 8.5],
  // Tasmania
  [145, -41, 148, -41, 148, -43.5, 145, -43],
  // New Zealand - North, then South
  [173, -35, 178, -37, 177, -40, 175, -41.5, 174, -39, 172, -36],
  [172, -40.5, 174, -41.5, 171, -44, 168, -46.5, 166, -45.5, 171, -42],
  // Cuba
  [-85, 22, -77, 20, -74, 20.3, -79, 23, -84, 23],
  // Hispaniola
  [-74, 20, -68, 19.5, -69, 18, -74, 18.3],
];

const LAND = [EURASIA, AFRICA, NORTH_AMERICA, SOUTH_AMERICA, AUSTRALIA, GREENLAND, ...ISLANDS];

/**
 * India, traced as a single ring so it can be picked out of the landmass and
 * drawn in its own colour. Clockwise from the north-west: along the Himalaya,
 * round the north-east, back west above Bangladesh (the loop dips inward
 * rather than using a hole, which keeps the ray cast planar), down the east
 * coast to Kanyakumari, and up the west coast through Gujarat.
 *
 * Coarse by design - at the globe's sampling step nothing finer survives.
 */
const INDIA = [
  73.9, 34.6, 75.0, 35.3, 76.8, 35.6, 78.3, 35.4, 79.6, 34.3, 79.2, 32.6, 78.7, 31.0,
  81.0, 30.3, 83.0, 29.3, 85.0, 28.3, 88.1, 27.9, 89.1, 27.2, 92.1, 27.5, 94.5, 29.3,
  96.5, 29.0, 97.4, 28.2, 96.8, 27.2, 95.3, 26.6, 94.6, 25.2, 94.3, 23.9, 93.3, 22.2,
  92.6, 21.9, 92.2, 23.7, 91.2, 22.9, 89.9, 25.3, 88.1, 26.4, 88.2, 24.5, 88.1, 23.2,
  88.9, 21.6, 87.0, 21.5, 85.0, 19.8, 82.3, 16.9, 80.3, 15.8, 80.2, 13.1, 79.8, 10.3,
  77.5, 8.1, 76.0, 9.5, 74.8, 13.0, 73.3, 16.0, 72.8, 19.0, 72.6, 21.5, 69.0, 22.0,
  68.2, 23.8, 70.0, 24.3, 71.0, 27.5, 73.0, 29.9, 74.6, 32.5,
];

function isIndia(lon: number, lat: number): boolean {
  // Cheap reject first - the ring test runs for every grid point on the globe.
  if (lon < 68 || lon > 98 || lat < 6 || lat > 36) return false;
  return inside(lon, lat, INDIA);
}

/**
 * Enclosed water that the coastline traces above would otherwise swallow -
 * these are punched back out, so the Caspian doesn't read as steppe.
 */
const SEAS = [
  // Black Sea and the Sea of Azov
  [28, 41.5, 41, 41.5, 41, 46, 31, 46.5, 28, 44],
  // Caspian Sea
  [47, 37, 54, 37, 54, 47, 47, 47],
  // Persian Gulf
  [47.8, 30, 50, 28.5, 56.5, 26.8, 55.5, 24.5, 51, 24.3, 48.5, 28.8],
  // Baltic Sea and the Gulf of Bothnia
  [12.5, 54.5, 21, 54.5, 24, 59.5, 23, 64, 19, 65.5, 17, 62, 15, 58],
  // Hudson Bay
  [-94, 57, -80, 55, -77, 60, -82, 64, -92, 63],
];

/* ---------- sampling ---------- */

/** Ray cast against a flat [lon, lat, …] ring. */
function inside(lon: number, lat: number, ring: number[]): boolean {
  let hit = false;
  const n = ring.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i * 2];
    const yi = ring[i * 2 + 1];
    const xj = ring[j * 2];
    const yj = ring[j * 2 + 1];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      hit = !hit;
    }
  }
  return hit;
}

function isLand(lon: number, lat: number): boolean {
  for (const sea of SEAS) if (inside(lon, lat, sea)) return false;
  for (const ring of LAND) if (inside(lon, lat, ring)) return true;
  return false;
}

/**
 * Walks an equal-arc grid - the longitude step widens with latitude, so the
 * dots stay evenly spaced on the surface instead of bunching toward the poles
 * - and keeps the ones that fall on land.
 *
 * `stepDeg` is the spacing in degrees of great circle; ~3 is about as coarse
 * as the continents stay recognisable.
 */
export function landDots(stepDeg = 2.9): Vec[] {
  const pts: Vec[] = [];
  for (let lat = -56; lat <= 80; lat += stepDeg) {
    const c = Math.cos((lat * Math.PI) / 180);
    const lonStep = stepDeg / Math.max(c, 0.08);
    for (let lon = -180; lon < 180; lon += lonStep) {
      // India is sampled separately, at a finer step and in its own colour.
      if (isLand(lon, lat) && !isIndia(lon, lat)) pts.push(onSphere(lat, lon));
    }
  }
  return pts;
}

/**
 * India alone, on a tighter grid than the rest of the land so the country
 * reads as a filled, deliberate shape rather than a few scattered dots.
 */
export function indiaDots(stepDeg = 1.35): Vec[] {
  const pts: Vec[] = [];
  for (let lat = 6; lat <= 36; lat += stepDeg) {
    const c = Math.cos((lat * Math.PI) / 180);
    const lonStep = stepDeg / Math.max(c, 0.08);
    for (let lon = 68; lon <= 98; lon += lonStep) {
      if (isIndia(lon, lat)) pts.push(onSphere(lat, lon));
    }
  }
  return pts;
}

/**
 * A sparse lattice over the whole sphere, drawn far fainter than the land.
 * Without it the globe reads as almost empty whenever the Pacific is facing
 * the viewer, and the sense of a turning solid goes with it.
 */
export function oceanDots(): Vec[] {
  const pts: Vec[] = [];
  for (let lat = -80; lat <= 80; lat += 10) {
    const c = Math.cos((lat * Math.PI) / 180);
    const count = Math.max(6, Math.round((36 * c) / 0.6));
    for (let i = 0; i < count; i++) pts.push(onSphere(lat, (i / count) * 360 - 180));
  }
  return pts;
}
