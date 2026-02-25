# AGENT.md — Prop Firm Review & Ranking Site (Astro)

## 0) Mission
Build a fast, SEO-first Astro site that ranks and reviews **prop firms** (only). The site must be **entity-driven**: each prop firm exists once as a canonical record, and every table/card/page reuses that same record. The site must support interactive features (filters, sorting, comparisons) without duplicating data.

## 1) Non-Negotiables
- **Single Source of Truth:** Prop firm facts live in one canonical data record per firm.
- **No duplicated data:** Never retype a firm’s rules/fees/platforms on multiple pages.
- **Extensible by design:** The data model must allow adding new attributes later without refactoring templates.
- **Type safety + validation:** All prop firm records must be schema-validated; invalid data fails the build.
- **SEO-first:** Static generation where possible; stable URLs; canonicals; sitemap; structured data where appropriate.
- **Performance:** Minimize client JS; avoid heavy runtime computations on every render.

## 2) Core Architecture (Astro)
### 2.1 Entity-driven site
- Pages render from a `PropFirm` record loaded by `slug`.
- Ranking pages query a collection of `PropFirm` records and render reusable components.
- Review content is separate from pure facts (editorial + scoring).

### 2.2 Data storage
Start with file-backed data (recommended early):
- `src/data/propfirms/*.json` (facts)
- `src/data/reviews/*.json` (editorial + scoring)
- `src/data/offers/*.json` (affiliate offers / promos)

Optionally later: swap to a DB without changing component interfaces.

### 2.3 IDs & slugs
- Every firm has a stable `id` and `slug`.
- URLs: `/prop-firms/{slug}`
- Internal references always use `id` (never name strings).

## 3) Canonical Data Models (Extensible)

### 3.1 PropFirm model (facts only)
**Goal:** Store factual, reusable attributes here. This model must tolerate new attributes later.

Minimum required fields:
- `id` (string)
- `slug` (string)
- `name` (string)
- `status` (active / paused / unknown)
- `platforms` (array of strings)
- `availability` (countries/regions)
- `support` (channels/hours)
- `lastVerifiedAt` (ISO string)
- `lastUpdatedAt` (ISO string)

Recommended structured groups (can expand freely later):
- `evaluation` (challenge models, targets, drawdowns, min days, etc.)
- `pricing` (fees by account size/model, refunds, resets)
- `payouts` (profit split, schedule, processing time, methods)
- `rules` (news, weekend, EAs, copy trading, consistency, etc.)
- `markets` (asset classes, instruments, leverage-like constraints if relevant)
- `trust` (ratings, community size, notable flags)
- `links` (website, dashboard, T&Cs, help center)
- `media` (logo, screenshots, badges)
- `notes` (short factual notes only)
- `custom` (object) — reserved for future attributes without schema breakage

**Important:** If a value appears in the UI more than once, it must be a field on `PropFirm`.

### 3.2 Review model (editorial + scoring)
Keep opinions and scoring separate from facts.

Minimum required fields:
- `id` (string)
- `propFirmId` (string)
- `summary` (string)
- `pros` (array of strings)
- `cons` (array of strings)
- `bestFor` (string)
- `notIdealFor` (string)
- `methodologyVersion` (string)
- `lastReviewedAt` (ISO string)

Optional fields:
- `overallScore` (0–100)
- `categoryScores` (object of 0–100 by category)
- `verdictBlocks` (array of structured sections for the review page)
- `faq` (array of Q/A)

Scoring must be reproducible from stored inputs (weights + category rules) when used.

### 3.3 Offer model (promos / affiliate)
Offers must be separate records referenced by firm ID.

Minimum:
- `id`
- `name`
- `trackingUrl`
- `terms`
- `startAt?`, `endAt?`
- `regions?`
- `propFirmIds[]`

**Never** hardcode tracking URLs in page templates.

## 4) Reuse & Rendering Rules

### 4.1 Component rule
Build reusable components that accept a firm object:
- `PropFirmCard(firm)`
- `PropFirmRow(firm, context)`
- `PropFirmBadges(firm)`
- `RulesTable(firm)`
- `PricingTable(firm)`
- `ScoreBlock(review)`
- `OfferCTA(offers)`

No component should contain firm-specific hardcoded values.

### 4.2 “One fact, one field”
If a metric appears on:
- rankings table
- firm detail page
- comparison view
…it must come from the same path in the `PropFirm` record.

### 4.3 Missing data policy
Use consistent rendering for unknowns:
- Show `—` or “Not disclosed”
- Never treat missing numeric data as `0`
- Never invent values

## 5) Pages & Routing (Astro)
Required pages:
- `/prop-firms` (directory + filters + sorting)
- `/prop-firms/{slug}` (review page)
- `/compare` (compare selected firms via query params)

Optional:
- `/best/{category}` (best for scalping, best payouts, etc.) generated from data queries
- `/methodology` (scoring & how rankings work)

## 6) Interactive Features Requirements

### 6.1 Filters & sorting
Implement:
- Sorting: `overallScore`, `price`, `maxDrawdown`, `profitSplit`, etc. (where data exists)
- Filters: model type (1-step/2-step/instant), platform, rules (news/weekend/copy), payout frequency, etc.

Rules:
- Filters must sync to URL query params (shareable).
- Filtering should not break SEO; default indexable page is `/prop-firms` with canonical to itself.

### 6.2 Comparison
- Allow selecting up to N firms (e.g., 3–5).
- `/compare?ids=...` where ids are firm IDs or slugs.
- Normalize formatting (percentages, currency, timeframes).
- Highlight differences.

### 6.3 Calculators (optional, later)
- Challenge fee breakeven estimator
- Payout timeline estimator
All calculators must use canonical numeric fields and handle missing inputs.

## 7) SEO Requirements (Astro)
- Prefer static generation for directory and firm pages.
- Add:
  - `@astrojs/sitemap`
  - canonical URLs
  - `robots.txt`
  - OpenGraph + Twitter cards
- Structured data:
  - ItemList for `/prop-firms` rankings
  - Review schema for firm pages **only if** you have legitimate review/rating data

Use truthful `lastUpdatedAt` / `lastReviewedAt` from data.

## 8) Data Validation & CI
Create schemas (Zod or JSON Schema) for:
- PropFirm
- Review
- Offer

Build must fail if:
- Duplicate slugs
- Missing required fields
- Orphan references (review missing for firm)
- Invalid ranges (scores not 0–100, drawdown impossible, etc.)

Add a `data:lint` script to:
- validate all records
- check references
- enforce formatting conventions

## 9) Data Maintenance Workflow
- Keep a `DATA_SOURCES.md` describing how facts are verified (T&Cs, dashboards, firm docs).
- Maintain an update log (structured JSON or markdown):
  - `entityId`
  - `date`
  - `fieldsChanged`
  - `reason`
  - `source`

When updating any firm:
- Update the canonical record
- Update timestamps (`lastVerifiedAt`, `lastUpdatedAt`)
- Append to update log

## 10) Implementation Order (Do in this sequence)
1. Create schemas + types
2. Seed 3–5 prop firms + reviews + offers
3. Build `/prop-firms` directory from data
4. Build `/prop-firms/[slug]` from data + review
5. Add scoring (methodology v1) if needed
6. Add filters/sort with URL state
7. Add compare page
8. Add SEO: sitemap, canonicals, JSON-LD, robots
9. Add validation + lint + CI hooks
10. Add update log + “last updated” UI

## 11) Definition of Done (for any task)
A task is complete only if:
- No duplicated firm data was introduced
- Schemas updated (if new attributes were added)
- UI renders from canonical records via reusable components
- Validation + lint pass
- SEO tags remain correct
- Missing data is handled safely