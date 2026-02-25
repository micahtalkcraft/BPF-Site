/**
 * Data lint script — run with: npm run lint:data
 *
 * Checks:
 * 1. All JSON files validate against their Zod schemas
 * 2. No duplicate slugs
 * 3. No orphan review references (propFirmId → prop-firms collection)
 * 4. No orphan offer references (propFirmIds → prop-firms collection)
 * 5. Scores are within valid range (0–100)
 * 6. Status field is valid
 */

import { readdir, readFile } from "fs/promises";
import { join, resolve } from "path";
import { z } from "zod";

// ─── Schema definitions (inline — avoids Astro-specific imports) ──────────────

const PropFirmSchema = z.object({
  id: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  status: z.enum(["active", "paused", "unknown"]).default("active"),
  foundedYear: z.number().int().min(1900).max(2100).optional(),
  hqCountry: z.string().optional(),
  evaluation: z.object({
    types: z.array(z.enum(["1-step", "2-step", "instant", "other"])),
    profitTargets: z.record(z.number()).optional(),
    dailyDrawdown: z.number().min(0).max(100).nullable(),
    maxDrawdown: z.number().min(0).max(100).nullable(),
    minTradingDays: z.number().int().nullable(),
    scalingPlan: z.boolean().nullable(),
  }),
  pricing: z.object({
    challengeFees: z
      .array(z.object({
        accountSize: z.number(),
        fee: z.number(),
        model: z.string().optional(),
        label: z.string().optional(),
      }))
      .default([]),
    resetFee: z.number().nullable(),
    refundPolicy: z.string().nullable(),
  }),
  payouts: z.object({
    splitMax: z.number().min(0).max(100).nullable(),
    schedule: z.string().nullable(),
    processingTime: z.string().nullable(),
    firstPayoutDays: z.number().int().nullable(),
    methods: z.array(z.string()).optional(),
  }),
  rules: z.object({
    newsTrading: z.boolean().nullable(),
    weekendHolding: z.boolean().nullable(),
    copyTrading: z.boolean().nullable(),
    expertAdvisors: z.boolean().nullable(),
    consistencyRule: z.string().nullable(),
    notes: z.string().nullable().optional(),
  }),
  markets: z.object({
    platforms: z.array(z.string()),
    instruments: z.string(),
  }),
  trust: z.object({
    trustpilotRating: z.number().min(0).max(5).nullable(),
    trustpilotCount: z.number().int().nullable(),
    communitySize: z.string().nullable(),
    notableFlags: z.array(z.string()).optional(),
  }),
  links: z.object({
    website: z.string().url().optional(),
    dashboard: z.string().url().optional(),
    terms: z.string().url().optional(),
    helpCenter: z.string().url().optional(),
  }).optional(),
  media: z.object({
    logo: z.string().optional(),
    screenshot: z.string().optional(),
  }).optional(),
  availability: z.object({
    restrictedCountries: z.array(z.string()).default([]),
    allowedCountries: z.array(z.string()).optional(),
  }),
  support: z.object({
    hours: z.string().optional(),
    liveChat: z.boolean().optional(),
    email: z.boolean().optional(),
    discord: z.boolean().optional(),
  }).optional(),
  notes: z.string().nullable().optional(),
  custom: z.record(z.unknown()).optional(),
  lastVerifiedAt: z.string().date(),
  lastUpdatedAt: z.string().date(),
  dataSources: z.array(z.string()).default([]),
});

const ReviewSchema = z.object({
  id: z.string(),
  propFirmId: z.string(),
  summary: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  bestFor: z.string(),
  notIdealFor: z.string(),
  overallScore: z.number().min(0).max(100).optional(),
  categoryScores: z.object({
    trust: z.number().min(0).max(100),
    conditions: z.number().min(0).max(100),
    pricing: z.number().min(0).max(100),
    platforms: z.number().min(0).max(100),
    payouts: z.number().min(0).max(100),
    support: z.number().min(0).max(100),
    ux: z.number().min(0).max(100),
  }).optional(),
  verdictBlocks: z.array(z.object({ heading: z.string(), body: z.string() })).optional(),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  methodologyVersion: z.string(),
  lastReviewedAt: z.string().date(),
  author: z.string().optional(),
  editor: z.string().optional(),
});

const OfferSchema = z.object({
  id: z.string(),
  name: z.string(),
  propFirmIds: z.array(z.string()),
  trackingUrl: z.string().url(),
  terms: z.string(),
  startAt: z.string().date().optional(),
  endAt: z.string().date().optional(),
  regions: z.array(z.string()).optional(),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SRC = resolve(process.cwd(), "src/content");

async function loadJson(dir: string): Promise<{ file: string; data: unknown }[]> {
  const files = await readdir(dir).catch(() => [] as string[]);
  const results = [];
  for (const f of files.filter((f) => f.endsWith(".json"))) {
    const raw = await readFile(join(dir, f), "utf-8");
    results.push({ file: f, data: JSON.parse(raw) });
  }
  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

let errors = 0;

function error(msg: string) { console.error(`  ✗ ERROR: ${msg}`); errors++; }
function ok(msg: string) { console.log(`  ✓ ${msg}`); }

async function main() {
  console.log("\n🔍 BPF Site — Data Lint (prop-firms only)\n");

  const propFirmsRaw = await loadJson(join(SRC, "prop-firms"));
  const reviewsRaw = await loadJson(join(SRC, "reviews"));
  const offersRaw = await loadJson(join(SRC, "offers"));

  // ── 1. Schema validation ─────────────────────────────────────────────────

  console.log("── Prop Firms ───────────────────────────────");
  const propFirms: { file: string; data: z.infer<typeof PropFirmSchema> }[] = [];
  for (const { file, data } of propFirmsRaw) {
    const r = PropFirmSchema.safeParse(data);
    if (r.success) { ok(`${file} — valid`); propFirms.push({ file, data: r.data }); }
    else error(`${file} — ${r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  }

  console.log("\n── Reviews ──────────────────────────────────");
  const reviews: { file: string; data: z.infer<typeof ReviewSchema> }[] = [];
  for (const { file, data } of reviewsRaw) {
    const r = ReviewSchema.safeParse(data);
    if (r.success) { ok(`${file} — valid`); reviews.push({ file, data: r.data }); }
    else error(`${file} — ${r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  }

  console.log("\n── Offers ───────────────────────────────────");
  const offers: { file: string; data: z.infer<typeof OfferSchema> }[] = [];
  for (const { file, data } of offersRaw) {
    const r = OfferSchema.safeParse(data);
    if (r.success) { ok(`${file} — valid`); offers.push({ file, data: r.data }); }
    else error(`${file} — ${r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  }

  // ── 2. Duplicate slugs ───────────────────────────────────────────────────

  console.log("\n── Duplicate Slugs ──────────────────────────");
  const slugs = propFirms.map((f) => f.data.slug);
  const dups = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dups.length > 0) error(`Duplicate slugs: ${dups.join(", ")}`);
  else ok("No duplicate slugs");

  // ── 3. Review propFirmId references ─────────────────────────────────────

  console.log("\n── Review → PropFirm References ─────────────");
  const firmIds = new Set(propFirms.map((f) => f.data.id));
  for (const r of reviews) {
    if (!firmIds.has(r.data.propFirmId)) {
      error(`Review ${r.data.id} references non-existent propFirmId: ${r.data.propFirmId}`);
    } else {
      ok(`Review ${r.data.id} → propFirmId OK`);
    }
  }

  // ── 4. Offer propFirmIds references ─────────────────────────────────────

  console.log("\n── Offer → PropFirm References ──────────────");
  for (const o of offers) {
    for (const fid of o.data.propFirmIds) {
      if (!firmIds.has(fid)) {
        error(`Offer ${o.data.id} references non-existent propFirmId: ${fid}`);
      } else {
        ok(`Offer ${o.data.id} → ${fid} OK`);
      }
    }
  }

  // ── 5. Score ranges ──────────────────────────────────────────────────────

  console.log("\n── Score Range Check (0–100) ─────────────────");
  for (const r of reviews) {
    if (r.data.overallScore !== undefined && (r.data.overallScore < 0 || r.data.overallScore > 100)) {
      error(`Review ${r.data.id} overallScore out of range: ${r.data.overallScore}`);
    }
    if (r.data.categoryScores) {
      const bad = Object.values(r.data.categoryScores).filter((s) => s < 0 || s > 100);
      if (bad.length > 0) error(`Review ${r.data.id} category score(s) out of range: ${bad.join(", ")}`);
      else ok(`Review ${r.data.id} — scores OK`);
    } else {
      ok(`Review ${r.data.id} — no category scores (acceptable)`);
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────

  console.log("\n─────────────────────────────────────────────");
  if (errors > 0) {
    console.error(`\n❌ ${errors} error(s). Fix before deploying.\n`);
    process.exit(1);
  } else {
    console.log(`\n✅ All checks passed. Data is clean.\n`);
  }
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
