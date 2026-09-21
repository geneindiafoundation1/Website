import { AmbientField } from "@/components/AmbientField";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: site.legalName,
    alternateName: [site.name, site.tagline],
    url: site.url,
    email: site.email,
    description: site.description,
    areaServed: "IN",
    slogan: site.strapline,
    sameAs: site.social.map((s) => s.href),
  };

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <AmbientField />
      <SiteHeader />
      <ScrollReveal />
      <main id="main">{children}</main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
