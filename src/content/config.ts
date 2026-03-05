import { defineCollection, z } from "astro:content";

// ─── PropFirm ────────────────────────────────────────────────────────────────
// Stores facts only — no editorial opinions.
// New attributes: add to the relevant group, or to `custom` for one-offs.

const PropFirmSchema = z.object({
  // Identity
  id: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  status: z.enum(["active", "paused", "unknown"]).default("active"),
  foundedYear: z.number().int().min(1900).max(2100).optional(),
  hqCountry: z.string().optional(), // ISO 3166-1 alpha-2

  // Evaluation (challenge models, targets, drawdowns)
  evaluation: z.object({
    types: z.array(z.enum(["1-step", "2-step", "3-step", "instant", "rapid", "synthetic", "other"])),
    profitTargets: z.record(z.number()).optional(), // { "phase1": 10, "phase2": 5 }
    dailyDrawdown: z.number().min(0).max(100).nullable(),
    maxDrawdown: z.number().min(0).max(100).nullable(),
    minTradingDays: z.number().int().nullable(),
    scalingPlan: z.boolean().nullable(),
  }),

  // Pricing (challenge fees, resets)
  pricing: z.object({
    challengeFees: z
      .array(
        z.object({
          accountSize: z.number(), // USD
          fee: z.number(), // USD
          model: z.string().optional(), // e.g. "2-step", "instant"
          label: z.string().optional(),
        })
      )
      .default([]),
    resetFee: z.number().nullable(),
    refundPolicy: z.string().nullable(),
  }),

  // Payouts
  payouts: z.object({
    splitMax: z.number().min(0).max(100).nullable(), // %
    schedule: z.string().nullable(), // e.g. "bi-weekly"
    processingTime: z.string().nullable(),
    firstPayoutDays: z.number().int().nullable(),
    methods: z.array(z.string()).optional(),
  }),

  // Rules (what traders can and cannot do)
  rules: z.object({
    newsTrading: z.boolean().nullable(),
    weekendHolding: z.boolean().nullable(),
    copyTrading: z.boolean().nullable(),
    expertAdvisors: z.boolean().nullable(),
    consistencyRule: z.string().nullable(), // descriptive
    notes: z.string().nullable().optional(),
  }),

  // Markets (tradeable instruments, platforms)
  markets: z.object({
    platforms: z.array(z.string()),
    instruments: z.string(), // free-text summary
  }),

  // Trust signals
  trust: z.object({
    trustpilotRating: z.number().min(0).max(5).nullable(),
    trustpilotCount: z.number().int().nullable(),
    communitySize: z.string().nullable(), // e.g. "300,000+ funded traders"
    notableFlags: z.array(z.string()).optional(), // warnings, accolades
  }),

  // Links (official URLs — never tracking URLs)
  links: z
    .object({
      website: z.string().url().optional(),
      dashboard: z.string().url().optional(),
      terms: z.string().url().optional(),
      helpCenter: z.string().url().optional(),
    })
    .optional(),

  // Media
  media: z
    .object({
      logo: z.string().optional(),
      screenshot: z.string().optional(),
    })
    .optional(),

  // Availability
  availability: z.object({
    restrictedCountries: z.array(z.string()).default([]),
    allowedCountries: z.array(z.string()).optional(),
  }),

  // Support
  support: z
    .object({
      hours: z.string().optional(),
      liveChat: z.boolean().optional(),
      email: z.boolean().optional(),
      discord: z.boolean().optional(),
    })
    .optional(),

  // Free-text factual notes
  notes: z.string().nullable().optional(),

  // Reserved for future attributes without schema breakage
  custom: z.record(z.unknown()).optional(),

  // Timestamps
  lastVerifiedAt: z.string().date(),
  lastUpdatedAt: z.string().date(),
  dataSources: z.array(z.string()).default([]),
});

// ─── Review ──────────────────────────────────────────────────────────────────
// Editorial opinions and scoring — kept separate from facts.

const ReviewSchema = z.object({
  id: z.string(),
  propFirmId: z.string(), // references PropFirm.id

  summary: z.string(), // editorial markdown summary
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  bestFor: z.string(),
  notIdealFor: z.string(),

  // Scoring (optional — only include when methodology is applied)
  overallScore: z.number().min(0).max(100).optional(),
  categoryScores: z.record(z.string(), z.number().min(0).max(100)).optional(),
  categorySections: z.record(z.string(), z.string()).optional(),

  // Optional structured verdict sections
  verdictBlocks: z
    .array(
      z.object({
        heading: z.string(),
        body: z.string(), // markdown
      })
    )
    .optional(),

  // Optional FAQ
  faq: z
    .array(
      z.object({
        q: z.string(),
        a: z.string(),
      })
    )
    .optional(),

  // Verification flag — false means review is unverified/preliminary
  verified: z.boolean().default(true),

  // Flagged — true means firm has serious concerns (payout issues, transparency, etc.)
  flagged: z.boolean().default(false),

  // Per-firm warning text for flagged firms (supports markdown links like [Name](/url))
  flaggedWarning: z.string().optional(),

  methodologyVersion: z.string(),
  lastReviewedAt: z.string().date(),
  author: z.string().optional(),
  editor: z.string().optional(),
  youtubeUrl: z.string().url().optional(),
});

// ─── Offer ───────────────────────────────────────────────────────────────────
// Affiliate / promo offers. Tracking URLs live here — never in templates.

const OfferSchema = z.object({
  id: z.string(),
  name: z.string(),
  propFirmIds: z.array(z.string()), // references PropFirm.id (supports multi-firm offers)
  trackingUrl: z.string().url(),
  terms: z.string(),
  startAt: z.string().date().optional(),
  endAt: z.string().date().optional(),
});

// ─── Blog ─────────────────────────────────────────────────────────────────────
// Editorial articles — stored as Markdown content files.

const BlogSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  category: z.string(), // e.g. "Best Firms", "Education", "Futures", "Regional"
  tags: z.array(z.string()).default([]),
  coverImage: z.string().optional(),
  author: z.string().default("BestPropFirms.com"),
  authorImage: z.string().optional(),
  publishedAt: z.string().date(),
  featured: z.boolean().default(false),
  readingTimeMinutes: z.number().int().optional(),
  youtubeVideoId: z.string().optional(),
  featuredFirms: z
    .array(
      z.object({
        slug: z.string(),
        descriptor: z.string(), // e.g. "Best Prop Firm for UK Traders"
      })
    )
    .optional(),
});

// ─── Collection definitions ───────────────────────────────────────────────────

export const collections = {
  "prop-firms": defineCollection({ type: "data", schema: PropFirmSchema }),
  reviews: defineCollection({ type: "data", schema: ReviewSchema }),
  offers: defineCollection({ type: "data", schema: OfferSchema }),
  blog: defineCollection({ type: "content", schema: BlogSchema }),
  guides: defineCollection({ type: "content", schema: BlogSchema }),
};

// ─── Exported types ───────────────────────────────────────────────────────────

export type PropFirm = z.infer<typeof PropFirmSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type Offer = z.infer<typeof OfferSchema>;
export type BlogPost = z.infer<typeof BlogSchema>;
