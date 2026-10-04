/**
 * Every image on the site has a small companion for cards: `photo.jpg` →
 * `photo.thumb.webp`, at most 720px on its longest side. The admin uploader
 * creates it alongside each upload, and the images shipped in public/ have
 * theirs committed next to them. Full-size images are still used wherever an
 * image is shown large.
 */
export function thumbUrl(url: string): string {
  return url.replace(/\.[a-z0-9]+(\?.*)?$/i, ".thumb.webp");
}

/**
 * `srcSet` for an image shown fairly large: standard-density screens take the
 * small companion, high-density screens the full image. The widths are
 * conservative estimates (a portrait thumbnail is narrower than 720px), which
 * errs toward the sharper file rather than a soft one.
 */
export function responsiveSrcSet(url: string, thumbWidth: number, fullWidth = 1200): string {
  return `${thumbUrl(url)} ${thumbWidth}w, ${url} ${fullWidth}w`;
}
