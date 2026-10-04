/**
 * Single source of truth for the foundation's contact details.
 * Values here were confirmed by the client in the "Information & Assets
 * Required" checklist (July 2026); anything still marked TODO is outstanding.
 */
export const site = {
  /** Exactly as registered - used for legal lines and structured data. */
  legalName: "GENE-INDIA FOUNDATION",
  name: "GENE-INDIA Foundation",
  shortName: "GENE-INDIA",
  tagline: "Global Education and Networking for Excellence",
  strapline: "Building equity through education",
  description:
    "GENE-INDIA Foundation connects experienced professionals with students and young professionals across India through structured, volunteer-led mentorship in health sciences, humanities, engineering, IT, and social sciences.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://geneindiafoundation.org",

  /** Shown on the site, and where contact alerts are delivered.
   *  Actual delivery is driven by EMAIL_TO in .env.local - keep the two in step. */
  email: "info@geneindiafoundation.org",
  hours: "9:00 am - 6:00 pm IST",

  /**
   * The registered office is Gousia Colony, Zakura, Srinagar, J&K 190006, but
   * the client asked for it NOT to be published. No public phone or WhatsApp
   * number has been provided either, so the site shows email only.
   */
  showAddress: false,
  phone: null as string | null,
  whatsapp: null as string | null,
  mapUrl: null as string | null,

  social: [
    {
      label: "LinkedIn",
      icon: "linkedin",
      href: "https://www.linkedin.com/in/gene-india-foundation-ba7a15423/",
    },
    { label: "Instagram", icon: "instagram", href: "https://www.instagram.com/geneindiafoundation/" },
    { label: "Facebook", icon: "facebook", href: "https://www.facebook.com/geneindiafoundation/" },
    { label: "X", icon: "x", href: "https://x.com/geneifoundation" },
    { label: "YouTube", icon: "youtube", href: "https://www.youtube.com/@GeneIndiaFoundation" },
  ],

  nav: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/programs", label: "Programs" },
    { href: "/team", label: "Team" },
    { href: "/blog", label: "Blogs" },
    { href: "/contact", label: "Contact" },
  ],

  /**
   * Drives the privacy and terms pages.
   *
   * Anything left null is simply not rendered - the pages are written so they
   * read correctly without it. Fill a value in and the corresponding line
   * appears; do NOT invent registration numbers.
   */
  legal: {
    /** Shown as "Last updated" on both policy pages. Bump when you edit them. */
    updated: "4 October 2026",
    /** Where policy questions and data requests go. */
    contactEmail: "info@geneindiafoundation.org",

    /** e.g. "Section 8 Company", "Public Charitable Trust", "Registered Society". */
    entityType: null as string | null,
    /** Registration / CIN number as issued. */
    registrationNumber: null as string | null,
    /** The foundation's PAN. */
    pan: null as string | null,
    /** 12A registration number, if granted. */
    reg12A: null as string | null,

    /**
     * A postal address is not published elsewhere on the site at the client's
     * request (see `showAddress`), but policy pages normally expect one. Set
     * this to publish it on the policy pages only.
     */
    postalAddress: null as string | null,

    /** Courts named in the governing-law clause. */
    jurisdiction: "Srinagar, Jammu & Kashmir, India",
  },
} as const;
