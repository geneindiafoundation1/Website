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

/** Full lock-up including the arc and strapline - for the login screen. */
export function LogoFull({
  className = "logo-full",
  width = 260,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <Image
      className={className}
      src="/brand/logo-full.png"
      alt="GENE-INDIA Foundation - Building equity through education"
      width={width}
      height={Math.round((width * 1085) / 1200)}
      priority
    />
  );
}
