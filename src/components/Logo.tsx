import Image from "next/image";

/**
 * The foundation's emblem, cropped from the master logo artwork. The art is
 * black; `.mark` inverts it to white under the dark theme (see globals.css).
 */
export function Logo({ className = "mark", size = 40 }: { className?: string; size?: number }) {
  return (
    <Image
      className={className}
      src="/brand/logo-mark.png"
      alt=""
      width={size}
      height={size}
      priority
    />
  );
}

/**
 * Horizontal lock-up - emblem plus the real GENE-INDIA FOUNDATION lettering
 * taken from the master artwork. Used in the header and footer so the brand
 * typography is the foundation's own rather than a substitute typeface.
 */
export function LogoLockup({ className = "lockup" }: { className?: string }) {
  return (
    <span className={className}>
      <Image
        className="mark"
        src="/brand/logo-mark.png"
        alt=""
        width={80}
        height={80}
        priority
      />
      <Image
        className="wordmark"
        src="/brand/logo-wordmark.png"
        alt="GENE-INDIA Foundation"
        width={1000}
        height={385}
        priority
      />
    </span>
  );
}

/**
 * Full lock-up including the arc and strapline - header and footer. One small
 * pre-sized WebP (400px wide, enough for the footer on a high-density screen)
 * shared by both, rather than an on-the-fly resized copy per size: one
 * download, cached by the browser, and no image-optimisation work on Netlify.
 */
export function LogoFull({
  className = "logo-full",
  width = 260,
  priority = false,
}: {
  className?: string;
  width?: number;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src="/brand/logo-full.webp"
      alt="GENE-INDIA Foundation - Building equity through education"
      width={width}
      height={Math.round((width * 361) / 400)}
      fetchPriority={priority ? "high" : undefined}
      loading={priority ? undefined : "lazy"}
      decoding="async"
    />
  );
}
