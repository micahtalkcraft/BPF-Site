# Data Sources & Verification Protocol

This document describes how data is collected, verified, and maintained for all broker and prop firm entities.

## Primary Sources

### Broker Data
| Field Category | Primary Source | Verification Method |
|---|---|---|
| Regulation / Licences | Regulator public registers (ASIC, FCA, CySEC, etc.) | Direct register lookup by licence number |
| Spreads & Fees | Broker's own website (pricing/account pages) | Manual verification + screenshot |
| Min Deposit | Broker website (account opening page) | Manual verification |
| Platform list | Broker website (platforms page) | Manual verification |
| Execution model | Broker website (execution policy / FAQ) | Manual check |
| Trustpilot data | Trustpilot.com public API / profile page | Direct API or manual count |
| Instruments count | Broker website (instruments/products page) | Manual count |
| Support hours | Broker website (contact/support page) | Manual check |
| Restricted countries | Broker website (legal/compliance) | Manual verification |

### Prop Firm Data
| Field Category | Primary Source | Verification Method |
|---|---|---|
| Rules & drawdown | Firm's official challenge page or dashboard | Manual verification |
| Challenge fees | Firm's pricing page | Manual verification |
| Payout split | Firm's website (how it works / payouts page) | Manual verification |
| Trustpilot data | Trustpilot.com public profile | Direct lookup |
| Evaluation types | Firm's challenge product pages | Manual verification |

## Verification Schedule

- **New entities:** Full manual verification before publishing.
- **Existing entities:** Quarterly spot-checks for fees, spreads, and regulation status.
- **Breaking changes** (e.g. regulator suspension, fee change): Update within 48 hours of becoming aware.

## Update Process

1. Locate the entity JSON in `src/content/brokers/` or `src/content/prop-firms/`.
2. Update the relevant field(s).
3. Update `metadata.lastVerifiedAt` and `metadata.lastUpdatedAt` to today's date.
4. Add the source URL to `metadata.dataSources` if new.
5. Append an entry to `UPDATELOG.json`.
6. Run `npm run lint:data` to confirm no schema errors.
7. Commit with message: `data: update [entity-slug] — [field changed]`.

## Regulators Reference

| Regulator | Jurisdiction | Register URL |
|---|---|---|
| ASIC | Australia (AU) | https://connectonline.asic.gov.au |
| FCA | United Kingdom (GB) | https://register.fca.org.uk |
| CySEC | Cyprus (CY) | https://www.cysec.gov.cy/en-GB/entities/ |
| DFSA | Dubai / UAE (AE) | https://www.dfsa.ae/public-register |
| FSA | Seychelles (SC) | https://fsaseychelles.sc/regulated-entities |
| IFSC | Belize (BZ) | https://www.ifsc.gov.bz/register |
| NFA / CFTC | USA | https://www.nfa.futures.org/basicnet/ |
