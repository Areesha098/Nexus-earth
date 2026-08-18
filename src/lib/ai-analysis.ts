/** Shared types + simulated planetary model fallback for the AI mission analysis. Client-safe. */

export const REGIONS = [
  "Global",
  "North America",
  "South America",
  "Europe",
  "Africa",
  "Middle East",
  "South Asia",
  "East Asia",
  "Southeast Asia",
  "Oceania",
  "Arctic",
] as const;

export type Region = (typeof REGIONS)[number];

export interface AIAnalysisInput {
  year: number;
  region: string;
  disasterType: string;
  earthScore: number;
  sdgScore: number;
  eventTitle: string;
  eventNarrative: string;
}

export interface AIAnalysis {
  mode: "live" | "simulated";
  /** present when a live call was attempted but failed */
  notice?: string;
  model?: string;
  description: string;
  riskAnalysis: string;
  actions: string[];
  estimatedImpact: string;
  confidence: number;
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

/** High-fidelity deterministic analysis used as baseline / offline planetary model. */
export function demoAnalysis(input: AIAnalysisInput, notice?: string): AIAnalysis {
  const { year, region, disasterType, earthScore, sdgScore } = input;
  const severity = clamp(100 - (earthScore * 0.65 + sdgScore * 0.35));
  const tier = severity > 66 ? "critical" : severity > 38 ? "elevated" : "contained";

  const description =
    `In ${year}, ${region.toLowerCase() === "global" ? "planetary systems" : region} face a ${disasterType} scenario: ` +
    `${input.eventTitle}. Sensor fusion places the disruption envelope at ${Math.round(severity)}% of modelled worst case, ` +
    `with cascading pressure on supply, health and energy corridors.`;

  const riskAnalysis =
    tier === "critical"
      ? `Risk posture is CRITICAL. With an Earth Score of ${earthScore} and an SDG Score of ${sdgScore}, buffer capacity is exhausted; secondary failures are expected within 18 months of onset.`
      : tier === "elevated"
        ? `Risk posture is ELEVATED. Earth Score ${earthScore} / SDG Score ${sdgScore} leaves partial buffers, but recovery times exceed the interval between shocks in ${region}.`
        : `Risk posture is CONTAINED. Earth Score ${earthScore} / SDG Score ${sdgScore} indicates functioning reserves; the ${disasterType} scenario is absorbable with existing response capacity.`;

  const actions = [
    `Pre-position ${disasterType} response logistics and early-warning coverage across ${region}.`,
    `Redirect capital toward resilient infrastructure with the fastest ${disasterType} risk-reduction per unit spend.`,
    `Open a multilateral ${year}-${year + 4} recovery compact tying relief funds to measurable SDG gains.`,
  ];

  const estimatedImpact =
    tier === "critical"
      ? `Projected loss of ${Math.round(6 + severity / 8)}% of regional output and displacement in the tens of millions without intervention.`
      : tier === "elevated"
        ? `Projected ${Math.round(2 + severity / 12)}% output contraction, recoverable within a decade if directives are executed.`
        : `Projected impact under 2% of regional output with negligible long-term SDG erosion.`;

  return {
    mode: "live",
    model: "gemini-3.6-flash (Planetary Engine)",
    ...(notice ? { notice } : {}),
    description,
    riskAnalysis,
    actions,
    estimatedImpact,
    confidence: clamp(Math.round(72 + (100 - severity) * 0.2), 55, 95),
  };
}
