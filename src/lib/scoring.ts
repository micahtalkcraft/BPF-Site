/**
 * Scoring methodology v1
 * Weights must sum to 1.0
 * Category scores are 0–100; overall score is derived from weights.
 */

export const METHODOLOGY_VERSION = "1.0";

export const BROKER_WEIGHTS = {
  fees: 0.25,
  trust: 0.20,
  platforms: 0.15,
  execution: 0.15,
  conditions: 0.10,
  support: 0.10,
  ux: 0.05,
} as const satisfies Record<string, number>;

export const PROP_FIRM_WEIGHTS = {
  trust: 0.25,
  conditions: 0.20,
  fees: 0.20,
  platforms: 0.15,
  support: 0.10,
  ux: 0.05,
  execution: 0.05,
} as const satisfies Record<string, number>;

type CategoryScores = {
  fees: number;
  platforms: number;
  trust: number;
  execution: number;
  support: number;
  conditions: number;
  ux: number;
};

type Weights = Record<keyof CategoryScores, number>;

/**
 * Derives an overall score from category scores and weights.
 * Returns a value 0–100 rounded to one decimal place.
 */
export function deriveOverallScore(
  categoryScores: CategoryScores,
  weights: Weights
): number {
  let total = 0;
  for (const key of Object.keys(weights) as Array<keyof CategoryScores>) {
    total += categoryScores[key] * weights[key];
  }
  return Math.round(total * 10) / 10;
}
