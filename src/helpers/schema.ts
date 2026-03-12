/**
 * Shared JSON-LD schema helpers for structured data across all page types.
 * Single source of truth for author data, publisher blocks, breadcrumbs, and FAQ schema.
 */

export const SITE_URL = "https://www.bestpropfirms.com";
export const SITE_LOGO = `${SITE_URL}/images/brand/best-prop-firms-site-logo.png`;

// Author data store
const AUTHORS: Record<string, AuthorData> = {
  "noam-korbl": {
    name: "Noam Korbl",
    jobTitle: "COO & Co-Founder",
    image: `${SITE_URL}/images/team/noam-korbl-300x280-1.png`,
    sameAs: [
      "https://www.linkedin.com/in/noam-korbl-201a3266",
      "https://www.facebook.com/noam.korbl",
      "https://www.crunchbase.com/person/noam-korbl",
      "https://www.crunchbase.com/person/noam-korbl-f10b",
    ],
    hasCredential: [
      { "@type": "EducationalOccupationalCredential", name: "Bachelor of Business Administration", sameAs: "https://en.wikipedia.org/wiki/Bachelor_of_Business_Administration" },
      { "@type": "EducationalOccupationalCredential", name: "RG146", sameAs: "https://en.wikipedia.org/wiki/RG146" },
    ],
    alumniOf: [
      { "@type": "Organization", name: "Monash University", sameAs: "https://en.wikipedia.org/wiki/Monash_University" },
    ],
    knowsAbout: [
      { "@type": "Thing", name: "Proprietary trading", sameAs: "https://en.wikipedia.org/wiki/Proprietary_trading" },
      { "@type": "Thing", name: "financial services", sameAs: "https://en.wikipedia.org/wiki/Financial_services" },
      { "@type": "Thing", name: "derivative", sameAs: "https://en.wikipedia.org/wiki/Derivative" },
      { "@type": "Thing", name: "Foreign Exchange", sameAs: "https://en.wikipedia.org/wiki/Foreign_exchange_company" },
    ],
    memberOf: [
      { "@type": "Organization", name: "Mizrachi Charity Fund Ltd", sameAs: "https://www.acnc.gov.au/charity/charities/b03c3b10-2caf-e811-a960-000d3ad24282/people" },
    ],
  },
  "justin-grossbard": {
    name: "Justin Grossbard",
    jobTitle: "CEO & Co-Founder",
    image: `${SITE_URL}/images/team/justin-grossbard.png`,
    sameAs: [
      "https://www.linkedin.com/in/justingrossbard/",
      "https://x.com/grossbard01",
      "https://www.facebook.com/justin.grossbard",
    ],
    hasCredential: [
      { "@type": "EducationalOccupationalCredential", name: "Masters Degree", sameAs: "https://en.wikipedia.org/wiki/Master%27s_degree" },
      { "@type": "EducationalOccupationalCredential", name: "RG146", sameAs: "https://en.wikipedia.org/wiki/RG146" },
    ],
    alumniOf: [
      { "@type": "Organization", name: "Monash University", sameAs: "https://en.wikipedia.org/wiki/Monash_University" },
    ],
    knowsAbout: [
      { "@type": "Thing", name: "Proprietary trading", sameAs: "https://en.wikipedia.org/wiki/Proprietary_trading" },
      { "@type": "Thing", name: "financial services", sameAs: "https://en.wikipedia.org/wiki/Financial_services" },
      { "@type": "Thing", name: "derivative", sameAs: "https://en.wikipedia.org/wiki/Derivative" },
      { "@type": "Thing", name: "Foreign Exchange", sameAs: "https://en.wikipedia.org/wiki/Foreign_exchange_company" },
    ],
    memberOf: [
      { "@type": "Organization", name: "AFMA", sameAs: "https://afma.com.au/" },
      { "@type": "Organization", name: "Australian Institute of Company Directors", sameAs: "https://en.wikipedia.org/wiki/Australian_Institute_of_Company_Directors" },
    ],
  },
  "tegan-miller": {
    name: "Tegan Miller",
    jobTitle: "Financial Writer & Analyst",
    image: `${SITE_URL}/images/team/tegan-miller-300x280-1.png`,
    sameAs: [],
    hasCredential: [],
    alumniOf: [],
    knowsAbout: [
      { "@type": "Thing", name: "Proprietary trading", sameAs: "https://en.wikipedia.org/wiki/Proprietary_trading" },
      { "@type": "Thing", name: "financial services", sameAs: "https://en.wikipedia.org/wiki/Financial_services" },
    ],
    memberOf: [],
  },
};

interface SchemaEntity {
  "@type": string;
  name: string;
  sameAs: string;
}

interface AuthorData {
  name: string;
  jobTitle: string;
  image: string;
  sameAs: string[];
  hasCredential: SchemaEntity[];
  alumniOf: SchemaEntity[];
  knowsAbout: SchemaEntity[];
  memberOf: SchemaEntity[];
}

/**
 * Returns full Person schema for embedding in Article/CriticReview author blocks.
 */
export function getAuthorSchema(slug: string) {
  const a = AUTHORS[slug];
  if (!a) throw new Error(`Unknown author: ${slug}`);
  return {
    "@type": "Person" as const,
    "@id": `${SITE_URL}/about/${slug}/#person`,
    name: a.name,
    jobTitle: a.jobTitle,
    url: `${SITE_URL}/about/${slug}/`,
    image: a.image,
    sameAs: a.sameAs,
    ...(a.hasCredential.length > 0 && { hasCredential: a.hasCredential }),
    ...(a.alumniOf.length > 0 && { alumniOf: a.alumniOf }),
    knowsAbout: a.knowsAbout,
    ...(a.memberOf.length > 0 && { memberOf: a.memberOf }),
  };
}

/**
 * Returns full Person schema for author profile pages (includes worksFor).
 */
export function getAuthorProfileSchema(slug: string) {
  const base = getAuthorSchema(slug);
  return {
    ...base,
    worksFor: {
      "@type": "Organization" as const,
      "@id": `${SITE_URL}/#organization`,
      name: "BestPropFirms.com",
    },
  };
}

/**
 * Returns raw author data for use in Organization founder/employee arrays.
 */
export function getAuthorRef(slug: string) {
  const a = AUTHORS[slug];
  if (!a) throw new Error(`Unknown author: ${slug}`);
  return {
    "@type": "Person" as const,
    "@id": `${SITE_URL}/about/${slug}/#person`,
    name: a.name,
  };
}

/**
 * Returns publisher block (identical on every page).
 */
export function getPublisherSchema() {
  return {
    "@type": "Organization" as const,
    "@id": `${SITE_URL}/#organization`,
    name: "BestPropFirms.com",
    url: SITE_URL,
    publishingPrinciples: `${SITE_URL}/methodology/`,
    logo: { "@type": "ImageObject" as const, url: SITE_LOGO },
  };
}

/**
 * Returns BreadcrumbList from an array of crumbs.
 * Last crumb has no `item` (current page).
 */
export function getBreadcrumbSchema(crumbs: { name: string; url?: string }[]) {
  return {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: crumbs.map((c, i) => {
      const entry: Record<string, unknown> = {
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
      };
      if (c.url) entry.item = `${SITE_URL}${c.url}`;
      return entry;
    }),
  };
}

/**
 * Returns FAQPage from array of {q, a} objects.
 */
export function getFaqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org" as const,
    "@type": "FAQPage" as const,
    mainEntity: faqs.map((f) => ({
      "@type": "Question" as const,
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: f.a,
      },
    })),
  };
}

/**
 * Returns the full Organization schema for the About page.
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org" as const,
    "@type": "Organization" as const,
    "@id": `${SITE_URL}/#organization`,
    name: "BestPropFirms.com",
    alternateName: "Best Prop Firms",
    url: SITE_URL,
    logo: { "@type": "ImageObject" as const, url: SITE_LOGO },
    description: "Independent prop firm comparison and review site. Rankings based on verified testing across challenges, spreads, platforms, and payout reliability.",
    foundingDate: "2023",
    publishingPrinciples: `${SITE_URL}/methodology/`,
    sameAs: [
      "https://www.facebook.com/bestpropfirmscom",
      "https://x.com/Prop_Firms",
      "https://www.youtube.com/@propfirms",
      "https://www.instagram.com/prop_firms_/",
      "https://www.linkedin.com/company/prop-firms/",
      "https://www.crunchbase.com/organization/prop-firms",
      "https://www.trustpilot.com/review/prop-firms.com",
      "https://discord.gg/cKDj3pBUjb",
    ],
    founder: [
      getAuthorRef("justin-grossbard"),
      getAuthorRef("noam-korbl"),
    ],
    employee: [
      getAuthorRef("tegan-miller"),
    ],
  };
}
