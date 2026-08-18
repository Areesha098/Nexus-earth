import type { StatKey } from "@/lib/game-store";

export const TWIN_START = 2026;
export const TWIN_END = 2050;

export interface TwinMetric {
  id: string;
  label: string;
  /** 0..100, higher is always better */
  value: number;
  /** display suffix */
  suffix?: string;
  invertedLabel?: boolean;
}

export interface TwinProjection {
  year: number;
  health: number; // 0..1
  sdg: number; // 0..100
  impact: number; // 0..100
  state: "healthy" | "moderate" | "critical";
  metrics: TwinMetric[];
  climateRisk: number;
  floodRisk: number;
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

/**
 * Deterministic projection of the live simulation stats forward in time.
 * Decisions already taken bend the curve: a strong record slows decay.
 */
export function projectYear(
  stats: Record<StatKey, number>,
  year: number,
  decisions = 0,
): TwinProjection {
  const t = (year - TWIN_START) / (TWIN_END - TWIN_START); // 0..1
  const avg = Object.values(stats).reduce((a, b) => a + b, 0) / 6;
  // momentum: below-average worlds decay faster, strong records recover
  const momentum = (avg - 50) / 50 + Math.min(decisions, 12) / 24;
  const drift = (k: StatKey, weight: number) =>
    clamp(stats[k] + t * (momentum * 34 - weight * (1 - momentum) * 12));

  const climate = drift("climate", 1.6);
  const water = drift("water", 1.2);
  // Empirical Agronomic Causal Linkage (FAO-33 Yield Response):
  // Water stress directly penalizes agricultural output and food security
  const waterInducedCropStress = Math.max(0, (55 - water) * 0.32);
  const food = clamp(drift("food", 1.1) - waterInducedCropStress);
  const health = drift("health", 0.9);
  const energy = drift("energy", 0.6);
  const economy = drift("economy", 0.8);

  const flood = clamp(100 - (100 - climate) * 0.85 - t * 8 * (1 - momentum));
  const composite = (climate + water + food + health + energy + economy) / 6;

  const sdg = clamp(composite * 0.92 + Math.min(decisions, 10) * 0.8);
  const impact = clamp(composite * 0.85 + climate * 0.15);

  return {
    year,
    health: composite / 100,
    sdg: Math.round(sdg),
    impact: Math.round(impact),
    state: composite >= 62 ? "healthy" : composite >= 38 ? "moderate" : "critical",
    climateRisk: Math.round(100 - climate),
    floodRisk: Math.round(100 - flood),
    metrics: [
      {
        id: "climate",
        label: "Climate Risk",
        value: Math.round(100 - climate),
        invertedLabel: true,
      },
      { id: "flood", label: "Flood Risk", value: Math.round(100 - flood), invertedLabel: true },
      { id: "food", label: "Food Security", value: Math.round(food) },
      { id: "water", label: "Water Availability", value: Math.round(water) },
      { id: "health", label: "Health Status", value: Math.round(health) },
      { id: "energy", label: "Energy Stability", value: Math.round(energy) },
      { id: "economy", label: "Economic Index", value: Math.round(economy) },
    ],
  };
}

export function twinSeries(
  stats: Record<StatKey, number>,
  decisions = 0,
  step = 2,
): { year: number; value: number }[] {
  const out: { year: number; value: number }[] = [];
  for (let y = TWIN_START; y <= TWIN_END; y += step) {
    out.push({ year: y, value: projectYear(stats, y, decisions).impact });
  }
  return out;
}
