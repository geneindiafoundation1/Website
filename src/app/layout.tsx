import type { Metadata } from "next";
import { Merriweather, Source_Sans_3 } from "next/font/google";
import { themeScript } from "@/components/ThemeToggle";
import { site } from "@/lib/site";
import "./globals.css";

/* Fonts from the client's approved list. next/font downloads them at build time
   and serves them from this site, so browsers never call Google. To try another
   pair, swap these imports (e.g. Playfair_Display, Inter, Montserrat, Open_Sans). */
const bodyFont = Source_Sans_3({ subsets: ["latin"], display: "swap", variable: "--font-body" });
const displayFont = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} - ${site.tagline}`,
    template: `%s - ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} - ${site.tagline}`,
    description: site.description,
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* themeScript stamps data-theme on <html> before React hydrates - that is the
       point of it (no flash of the wrong theme), and it makes the server and
       client markup differ by design, so the mismatch warning is suppressed. */
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
