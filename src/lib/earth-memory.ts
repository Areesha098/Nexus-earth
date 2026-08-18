import type { HistoryEntry, StatKey } from "@/lib/game-store";

export interface MemoryLinkage {
  hasLink: boolean;
  relatedDecision?: HistoryEntry;
  explanation: string;
  resilienceModifier: number; // e.g. +2 or -2
}

export interface CausalChainNode {
  id: string;
  title: string;
  type: "Observed" | "AI-Inferred" | "Simulated";
  description: string;
  severity: "high" | "medium" | "low";
}

export interface CausalChain {
  rootCause: string;
  nodes: CausalChainNode[];
  currentImpact: string;
  futureImpact: string;
  recommendedAction: string;
}

/**
 * Calculates how prior decisions stored in Earth Memory influence current events.
 */
export function evaluateEarthMemoryLinkage(
  history: HistoryEntry[],
  currentCategory: string,
  currentYear: number,
): MemoryLinkage {
  if (!history || history.length === 0) {
    return {
      hasLink: false,
      explanation:
        "No prior intervention history recorded in Earth Memory. Baseline simulation active.",
      resilienceModifier: 0,
    };
  }

  // Find most relevant past decision
  const matching = [...history]
    .reverse()
    .find((h) => h.category === currentCategory || Math.abs(h.year - currentYear) <= 10);

  const related = matching || history[history.length - 1]!;
  const netEffect = Object.values(related.effects).reduce((acc, v) => acc + (v ?? 0), 0);

  if (netEffect > 0) {
    return {
      hasLink: true,
      relatedDecision: related,
      explanation: `Earth Memory: Earlier directive [Year ${related.year}: "${related.choiceLabel}"] created a +${netEffect}% systemic resilience buffer mitigating this event.`,
      resilienceModifier: 2,
    };
  } else {
    return {
      hasLink: true,
      relatedDecision: related,
      explanation: `Earth Memory: Prior delay or compromise [Year ${related.year}: "${related.choiceLabel}"] left critical infrastructure exposed with compound vulnerability.`,
      resilienceModifier: -2,
    };
  }
}

/**
 * Generates structured Causal Chains for any disaster scenario.
 */
export function generateCausalChain(
  category?: string,
  eventTitle?: string,
  country?: string,
  city?: string,
): CausalChain {
  const cat = (category ?? "climate").toLowerCase();
  const title = (eventTitle ?? "").toLowerCase();
  const targetCountry = country ?? "Global";
  const targetCity = city ?? "Regional Focus";

  if (
    cat === "climate" ||
    cat === "flood" ||
    title.includes("flood") ||
    title.includes("rain") ||
    title.includes("storm") ||
    title.includes("monsoon")
  ) {
    return {
      rootCause: `Ocean thermal anomalies & glacial runoff surges across ${targetCountry}`,
      nodes: [
        {
          id: "c1",
          title: "Intense Precipitation & Melt",
          type: "Observed",
          description: `Atmospheric moisture saturation over ${targetCity} (+34% anomaly)`,
          severity: "high",
        },
        {
          id: "c2",
          title: "Hydraulic Catchment Breach",
          type: "Observed",
          description: "Primary reservoirs and natural riverbanks exceeded capacity",
          severity: "high",
        },
        {
          id: "c3",
          title: "Urban Runoff & Inundation",
          type: "AI-Inferred",
          description: "Impervious surface grid fails drainage velocity threshold",
          severity: "high",
        },
        {
          id: "c4",
          title: "Critical Grid Disruption",
          type: "Simulated",
          description: "Substation flooding threatening drinking water filtration & power",
          severity: "medium",
        },
      ],
      currentImpact: `Severe localized flooding in ${targetCity}, impacting transportation corridors and agricultural belts.`,
      futureImpact: `Secondary waterborne epidemiological spikes and localized GDP retraction in ${targetCountry} over 2-4 quarters.`,
      recommendedAction:
        "Deploy smart drainage bypasses, reinforce flood barriers, and release emergency relief funds.",
    };
  }

  if (
    cat === "food" ||
    cat === "agriculture" ||
    cat === "famine" ||
    title.includes("food") ||
    title.includes("agriculture") ||
    title.includes("crop") ||
    title.includes("wheat") ||
    (targetCountry.toLowerCase().includes("pakistan") && (cat === "water" || cat === "climate"))
  ) {
    return {
      rootCause: `Indus Basin hydrological deficit & low canal head withdrawals across ${targetCountry}`,
      nodes: [
        {
          id: "pk-w1",
          title: "1. Water Stress & Canal Shortfall",
          type: "Observed",
          description: `Per capita availability down to 860 m³/yr with 16.5% canal head withdrawal deficit at Tarbela & Sukkur barrages [REAL DATA: PCRWR/IRSA]`,
          severity: "high",
        },
        {
          id: "pk-w2",
          title: "2. Agronomic Moisture Deficit",
          type: "AI-Inferred",
          description: `Evapotranspiration deficit ETa/ETm gap across 4.8M Ha canal command area in Punjab and Sindh [MODELED: FAO-33]`,
          severity: "high",
        },
        {
          id: "pk-w3",
          title: "3. Staple Crop Yield Reduction",
          type: "Simulated",
          description: `Wheat harvest yield reduced by 14.8% (Ky=1.05) and rice output down 18.2% (Ky=1.20) [MODELED: PARC/FAO]`,
          severity: "high",
        },
        {
          id: "pk-w4",
          title: "4. Food Insecurity Escalation",
          type: "Simulated",
          description: `Moderate-to-severe food insecurity reaches 44.2% with staple flour price inflation index at 128 [MODELED: PBS/WFP]`,
          severity: "high",
        },
      ],
      currentImpact: `Severe moisture deficit across Indus agricultural belts driving staple grain yield losses in ${targetCity}.`,
      futureImpact: `Compound caloric deficit (-180 kcal/person/day) and heightened food inflation requiring strategic grain imports.`,
      recommendedAction:
        "Execute emergency canal watercourse lining, subsidize solarized laser land leveling, and deploy drought-resistant wheat cultivars.",
    };
  }

  if (
    cat === "water" ||
    cat === "drought" ||
    title.includes("drought") ||
    title.includes("water") ||
    title.includes("glacier")
  ) {
    return {
      rootCause: `Extended atmospheric ridge blocking precipitation over ${targetCountry}`,
      nodes: [
        {
          id: "w1",
          title: "Subsurface Aquifer Depletion",
          type: "Observed",
          description: "Water tables down 22m across municipal catchments",
          severity: "high",
        },
        {
          id: "w2",
          title: "Agricultural Irrigation Deficit",
          type: "Observed",
          description: "Crop yield projections decreased by 18% for the season",
          severity: "high",
        },
        {
          id: "w3",
          title: "Hydroelectric Capacity Drop",
          type: "AI-Inferred",
          description: "Turbine head pressure reduced, shifting demand to thermal backup",
          severity: "medium",
        },
        {
          id: "w4",
          title: "Urban Water Rationing Trigger",
          type: "Simulated",
          description: `Tier-3 conservation enacted in ${targetCity} and regional suburbs`,
          severity: "high",
        },
      ],
      currentImpact: "Water shortages threatening industrial output and agricultural harvests.",
      futureImpact: "Food price inflation and heightened energy generation costs.",
      recommendedAction:
        "Mandate desalination ramp-up, drip-irrigation transition, and municipal water reclamation.",
    };
  }

  // Generic robust causal chain
  return {
    rootCause: `Compound systemic pressure on infrastructure & natural buffers in ${targetCountry}`,
    nodes: [
      {
        id: "g1",
        title: "Initial Stress Event",
        type: "Observed",
        description: `Extreme environmental or socio-technical trigger recorded near ${targetCity}`,
        severity: "high",
      },
      {
        id: "g2",
        title: "Secondary Cascade",
        type: "AI-Inferred",
        description: "Supply chain disruptions and localized resource competition",
        severity: "medium",
      },
      {
        id: "g3",
        title: "Compound Indicator Impact",
        type: "Simulated",
        description: "Multi-sector feedback loops reducing planetary resilience score",
        severity: "medium",
      },
    ],
    currentImpact: `Acute operational disruption across key municipal systems in ${targetCity}.`,
    futureImpact: `Long-term economic and environmental vulnerability if unmitigated.`,
    recommendedAction:
      "Execute targeted multilateral emergency deployment and infrastructure reinforcement.",
  };
}
