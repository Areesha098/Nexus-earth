import type { GameEvent, StatKey } from "@/lib/game-store";

export type ScenarioKey =
  | "flood"
  | "earthquake"
  | "wildfire"
  | "drought"
  | "heatwave"
  | "pandemic"
  | "famine"
  | "grid"
  | "cyber";

export interface ScenarioStage {
  label: string;
  /** relative duration weight — different disasters progress at different speeds */
  ms: number;
}

export interface ScenarioDef {
  key: ScenarioKey;
  title: string;
  category: string;
  themeColor: string;
  sdgs: { number: number; name: string }[];
  stages: ScenarioStage[];
}

export const SCENARIOS: Record<ScenarioKey, ScenarioDef> = {
  flood: {
    key: "flood",
    title: "Catastrophic Flood",
    category: "water",
    themeColor: "var(--neon)",
    sdgs: [
      { number: 6, name: "Clean Water & Sanitation" },
      { number: 11, name: "Sustainable Cities & Communities" },
      { number: 13, name: "Climate Action" },
    ],
    stages: [
      { label: "Rainfall Inundation", ms: 1600 },
      { label: "River Overflow", ms: 1800 },
      { label: "Urban Flooding", ms: 2200 },
      { label: "Search & Rescue", ms: 2000 },
      { label: "Basin Recovery", ms: 2400 },
    ],
  },
  earthquake: {
    key: "earthquake",
    title: "Seismic Megaquake",
    category: "natural",
    themeColor: "var(--danger)",
    sdgs: [
      { number: 9, name: "Industry, Innovation & Infrastructure" },
      { number: 11, name: "Sustainable Cities & Communities" },
      { number: 3, name: "Good Health & Well-being" },
    ],
    stages: [
      { label: "Primary Shock", ms: 900 },
      { label: "Infrastructure Damage", ms: 1400 },
      { label: "Aftershocks", ms: 1600 },
      { label: "Emergency Response", ms: 2000 },
      { label: "Structural Recovery", ms: 2600 },
    ],
  },
  wildfire: {
    key: "wildfire",
    title: "Megafire & Smoke Dispersion",
    category: "climate",
    themeColor: "var(--warning)",
    sdgs: [
      { number: 15, name: "Life on Land" },
      { number: 13, name: "Climate Action" },
      { number: 3, name: "Good Health & Well-being" },
    ],
    stages: [
      { label: "Smoke Inversion", ms: 1200 },
      { label: "Fire Front Spread", ms: 1500 },
      { label: "Urban Interface Risk", ms: 1800 },
      { label: "Aerial Containment", ms: 2200 },
      { label: "Ecosystem Recovery", ms: 2400 },
    ],
  },
  drought: {
    key: "drought",
    title: "Prolonged Megadrought",
    category: "water",
    themeColor: "oklch(0.75 0.18 55)",
    sdgs: [
      { number: 6, name: "Clean Water & Sanitation" },
      { number: 2, name: "Zero Hunger" },
      { number: 15, name: "Life on Land" },
    ],
    stages: [
      { label: "Rainfall Deficit", ms: 1600 },
      { label: "Soil Desiccation", ms: 1900 },
      { label: "Crop Yield Collapse", ms: 2200 },
      { label: "Water Rationing", ms: 2400 },
      { label: "Aquifer Recovery", ms: 2700 },
    ],
  },
  heatwave: {
    key: "heatwave",
    title: "Wet-Bulb Heat Dome",
    category: "climate",
    themeColor: "oklch(0.7 0.22 35)",
    sdgs: [
      { number: 3, name: "Good Health & Well-being" },
      { number: 13, name: "Climate Action" },
      { number: 7, name: "Affordable & Clean Energy" },
    ],
    stages: [
      { label: "Temperature Rise", ms: 1400 },
      { label: "Heat Dome Stagnation", ms: 1700 },
      { label: "Health Emergency", ms: 2000 },
      { label: "Cooling Protocols", ms: 2100 },
      { label: "Thermal Recovery", ms: 2300 },
    ],
  },
  pandemic: {
    key: "pandemic",
    title: "Synthetic Pathogen Outbreak",
    category: "pandemic",
    themeColor: "oklch(0.68 0.24 300)",
    sdgs: [
      { number: 3, name: "Good Health & Well-being" },
      { number: 8, name: "Decent Work & Economic Growth" },
      { number: 17, name: "Partnerships for the Goals" },
    ],
    stages: [
      { label: "Outbreak Cluster", ms: 2000 },
      { label: "Community Spread", ms: 2400 },
      { label: "Healthcare Strain", ms: 2600 },
      { label: "Vaccine Deployment", ms: 2800 },
      { label: "Epidemic Clearance", ms: 3000 },
    ],
  },
  grid: {
    key: "grid",
    title: "Continental Grid Collapse",
    category: "energy",
    themeColor: "oklch(0.78 0.18 190)",
    sdgs: [
      { number: 7, name: "Affordable & Clean Energy" },
      { number: 9, name: "Industry, Innovation & Infrastructure" },
      { number: 8, name: "Decent Work & Economic Growth" },
    ],
    stages: [
      { label: "Load Surge Spike", ms: 1100 },
      { label: "Cascading Outage", ms: 1400 },
      { label: "Blackout Zones", ms: 1700 },
      { label: "System Islanding & Restart", ms: 2000 },
      { label: "Grid Normalization", ms: 2200 },
    ],
  },
  famine: {
    key: "famine",
    title: "Global Food Supply Shock",
    category: "food",
    themeColor: "oklch(0.76 0.17 95)",
    sdgs: [
      { number: 2, name: "Zero Hunger" },
      { number: 12, name: "Responsible Consumption & Production" },
      { number: 1, name: "No Poverty" },
    ],
    stages: [
      { label: "Crop Yield Collapse", ms: 1800 },
      { label: "Commodity Price Shock", ms: 2000 },
      { label: "Supply Chain Rationing", ms: 2400 },
      { label: "Emergency Aid Corridors", ms: 2600 },
      { label: "Agricultural Recovery", ms: 2800 },
    ],
  },
  cyber: {
    key: "cyber",
    title: "Sovereign Cyber Infiltration",
    category: "cyber",
    themeColor: "var(--neon)",
    sdgs: [
      { number: 9, name: "Industry, Innovation & Infrastructure" },
      { number: 16, name: "Peace, Justice & Strong Institutions" },
      { number: 8, name: "Decent Work & Economic Growth" },
    ],
    stages: [
      { label: "Intrusion Telemetry", ms: 900 },
      { label: "Systems Compromised", ms: 1200 },
      { label: "Service Blackout", ms: 1500 },
      { label: "Countermeasures", ms: 1800 },
      { label: "Sovereign Restoration", ms: 2000 },
    ],
  },
};

export const SDG_MAP: Record<StatKey, { id: number; code: string; title: string }> = {
  climate: { id: 13, code: "SDG 13", title: "Climate Action" },
  water: { id: 6, code: "SDG 6", title: "Clean Water & Sanitation" },
  food: { id: 2, code: "SDG 2", title: "Zero Hunger" },
  health: { id: 3, code: "SDG 3", title: "Good Health & Well-being" },
  energy: { id: 7, code: "SDG 7", title: "Affordable & Clean Energy" },
  economy: { id: 8, code: "SDG 8", title: "Decent Work & Economic Growth" },
};

const CATEGORY_MAP: Record<string, ScenarioKey> = {
  water: "flood",
  flood: "flood",
  climate: "heatwave",
  heatwave: "heatwave",
  drought: "drought",
  wildfire: "wildfire",
  earthquake: "earthquake",
  natural: "earthquake",
  food: "famine",
  famine: "famine",
  pandemic: "pandemic",
  energy: "grid",
  grid: "grid",
  cyber: "cyber",
  ai: "cyber",
};

export function scenarioForCategory(category: string): ScenarioDef {
  return SCENARIOS[CATEGORY_MAP[category] ?? "flood"] ?? SCENARIOS.flood;
}

export function scenarioDuration(def: ScenarioDef) {
  return def.stages.reduce((s, st) => s + st.ms, 0);
}

/** Threat level from the aggregate indicator average. */
export function threatFrom(avg: number) {
  if (avg >= 70) return { label: "LOW", tone: "text-success" };
  if (avg >= 50) return { label: "ELEVATED", tone: "text-warning" };
  if (avg >= 30) return { label: "HIGH", tone: "text-danger" };
  return { label: "CRITICAL", tone: "text-danger" };
}

export function livesAtRisk(avg: number, populationLabel: string) {
  const base = parseFloat(populationLabel);
  const unit = populationLabel.includes("B") ? 1000 : 1;
  const millions = Math.max(1, Math.round(base * unit * ((100 - avg) / 100) * 0.06));
  return millions >= 1000 ? `${(millions / 1000).toFixed(1)}B` : `${millions}M`;
}

export function getImpactedSDGs(effects: Partial<Record<StatKey, number>>) {
  const keys = (Object.keys(effects) as StatKey[]).filter((k) => (effects[k] ?? 0) !== 0);
  return keys.map((k) => ({
    ...SDG_MAP[k],
    delta: effects[k] ?? 0,
  }));
}

const POSITIVE_NEWS: Record<StatKey, string[]> = {
  climate: [
    "Emission corridors stabilised",
    "Carbon drawdown array online",
    "Storm intensity easing",
  ],
  water: ["Flood barriers completed", "Aquifer recharge restored", "Desalination network scaled"],
  food: ["Food supply stabilized", "Harvest yields recovering", "Grain corridors reopened"],
  health: ["Health services restored", "Hospital load normalising", "Vaccination targets met"],
  energy: ["Power grid recovered", "Renewable capacity expanded", "Blackout zones cleared"],
  economy: [
    "Markets regaining confidence",
    "Reconstruction funding released",
    "Employment rebounding",
  ],
};

const NEGATIVE_NEWS: Record<StatKey, string[]> = {
  climate: [
    "Heat anomalies intensify",
    "Wildfire smoke advisories issued",
    "Sea level warnings raised",
  ],
  water: [
    "Reservoirs below critical line",
    "Flood defences overwhelmed",
    "Water rationing extended",
  ],
  food: ["Crop losses widen", "Food prices surge", "Emergency rations deployed"],
  health: [
    "Hospitals reach capacity",
    "Outbreak clusters expanding",
    "Medical supply gaps reported",
  ],
  energy: ["Rolling blackouts announced", "Grid frequency unstable", "Fuel reserves draining"],
  economy: [
    "Recession indicators flashing",
    "Reconstruction costs escalate",
    "Trade routes disrupted",
  ],
};

export function headlinesFor(
  effects: Partial<Record<StatKey, number>>,
  region: string,
  year: number,
): { text: string; tone: "good" | "bad" }[] {
  const entries = (Object.keys(effects) as StatKey[])
    .map((k) => [k, effects[k] ?? 0] as const)
    .filter(([, v]) => v !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 3);

  return entries.map(([k, v]) => {
    const pool = v > 0 ? POSITIVE_NEWS[k] : NEGATIVE_NEWS[k];
    const text = pool[Math.floor(Math.random() * pool.length)] ?? "Situation developing";
    return { text: `${region} · ${year} — ${text}`, tone: v > 0 ? "good" : "bad" };
  });
}

export function missionName(event: GameEvent, region: string) {
  const code = event.title.split(" ")[0]?.toUpperCase() ?? "NEXUS";
  return `OPERATION ${code} · ${region.toUpperCase()}`;
}
