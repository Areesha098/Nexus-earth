import {
  CloudSun,
  Siren,
  HeartPulse,
  Wheat,
  Droplets,
  Zap,
  LineChart,
  type LucideIcon,
} from "lucide-react";
import type { HistoryEntry, StatKey } from "@/lib/game-store";

export type AgentRisk = "LOW" | "ELEVATED" | "HIGH" | "CRITICAL";
export type AgentProcessStatus = "Running" | "Completed" | "Warning" | "Failed";

export interface AgentDef {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  category: string;
  dataSource: string;
  /** Stats this agent watches. First one is its primary indicator. */
  watches: StatKey[];
  unit: string;
  /** Narrative fragments keyed by severity, worst first. */
  analysis: [string, string, string, string];
  actions: [string, string, string, string];
}

export interface Agent extends AgentDef {
  /** 0-100 health of the systems this agent watches */
  index: number;
  confidence: number;
  status: string;
  risk: AgentRisk;
  analysis_text: string;
  action: string;
  /** change in index since the previous decision */
  trend: number;
  executionTimeMs: number;
  agentStatus: AgentProcessStatus;
  inputSummary: string;
  causes: string;
  expectedImpact: string;
  keyFinding: string;
  startedAt: string;
  completedAt: string;
}

export const AGENT_DEFS: AgentDef[] = [
  {
    id: "climate",
    name: "Climate Agent",
    icon: CloudSun,
    category: "Atmospheric & Thermal Stability",
    dataSource: "Open-Meteo Weather & Copernicus CAMS Telemetry",
    description:
      "Monitors temperature trajectories, thermal anomalies, extreme weather risks, carbon emissions, and long-term climate tipping points.",
    watches: ["climate", "energy"],
    unit: "CLIMATE STABILITY",
    analysis: [
      "Runaway thermal feedback detected. Permafrost methane release and ocean heat content exceeding safe boundary corridors.",
      "Equatorial heat stress index elevated. 48-hour extreme heatwave probability exceeding 80% across regional urban belts.",
      "Atmospheric carbon load is elevated but manageable. Seasonal temperature anomalies require active thermal mitigation.",
      "Radiative balance tracking within safe planetary corridor. Regional carbon capture and emissions curve targets on track.",
    ],
    actions: [
      "Deploy emergency solar-radiation thermal shields and reinforce urban cooling shelters.",
      "Prioritize regional carbon drawdown corridors and harden coastal thermal buffers.",
      "Accelerate clean grid decarbonization and expand bio-corridor reforestation.",
      "Maintain active biosphere surveillance and sustain current decarbonization policy.",
    ],
  },
  {
    id: "water",
    name: "Water Agent",
    icon: Droplets,
    category: "Hydrology & Catchment Resilience",
    dataSource: "NASA EONET Hydrological & River Basin Sensor Feeds",
    description:
      "Analyzes freshwater availability, aquifer depletion, hydrological stress, drought/flood vulnerability, and infrastructure resilience.",
    watches: ["water", "climate"],
    unit: "FRESHWATER SECURITY",
    analysis: [
      "Major transboundary aquifers are severely depleted. Delta salinity intrusion rendering regional catchments non-potable.",
      "Groundwater extraction far outpaces natural seasonal recharge. Arid agricultural corridors facing imminent dry-well thresholds.",
      "Basin telemetry indicates seasonal deficits. Reservoir reserve levels hovering near lower operational boundaries.",
      "Aquifer recharge rates keeping pace with consumption. Catchment storage buffers operating at optimal nominal capacity.",
    ],
    actions: [
      "Commission emergency desalination conduits and implement strict basin-level water quotas.",
      "Deploy automated leak-detection telemetry and enforce industrial groundwater extraction caps.",
      "Modernize irrigation networks to high-efficiency drip systems and expand wastewater recycling.",
      "Sustain watershed reforestation and maintain standard aquifer preservation quotas.",
    ],
  },
  {
    id: "food",
    name: "Food Agent",
    icon: Wheat,
    category: "Agricultural Security & Food Supply",
    dataSource: "FAO Agro-Telemetry & Earth Observation Crop Health Feed",
    description:
      "Evaluates staple crop yields, soil moisture deficits, supply chain disruptions, and nutritional availability.",
    watches: ["food", "climate", "water"],
    unit: "FOOD SUPPLY",
    analysis: [
      "Simultaneous multi-breadbasket harvest failure. Global grain reserves depleted to critical multi-decade lows.",
      "Soil moisture deficits across primary grain belts project double-digit staple crop yield reductions this harvest cycle.",
      "Crop yields under moderate stress from localized heat spikes; regional food buffer stocks drawing down faster than baseline.",
      "Staple crop yield models nominal across agricultural regions. Strategic caloric reserves remain comfortably above target thresholds.",
    ],
    actions: [
      "Release emergency strategic grain reserves and convert processing capacity to fortified synthetic proteins.",
      "Redirect surplus caloric distribution to deficit regions and distribute climate-resilient drought-proof seeds.",
      "Invest in precision regenerative agriculture, soil microbiomes, and diversified staple crop portfolios.",
      "Maintain strategic storage reserves and continue routine soil-enrichment subsidy programs.",
    ],
  },
  {
    id: "energy",
    name: "Energy Agent",
    icon: Zap,
    category: "Grid Reliability & Clean Transition",
    dataSource: "Global Supergrid Telemetry & Regional Load Dispatch Logs",
    description:
      "Monitors global energy demand, baseload security, renewable transition velocity, and grid transmission stability.",
    watches: ["energy", "economy"],
    unit: "ENERGY SECURITY",
    analysis: [
      "Severe grid fragmentation. Rolling blackouts across key industrial and residential nodes due to generation collapse.",
      "Peak cooling/heating demand outstripping local generation capacity. Interconnected transmission lines operating near thermal limits.",
      "Energy supply meets baseline demand, but spinning reserve margins are narrow during peak climate events.",
      "Grid-scale battery buffers absorbing load fluctuations smoothly. Clean renewable share tracking ahead of projected corridor.",
    ],
    actions: [
      "Enforce priority life-support power routing and commission emergency modular microgrids.",
      "Fast-track grid-scale battery storage deployments and activate standby low-emission dispatch buffers.",
      "Expand high-voltage DC transmission interconnects and accelerate solar/wind farm integration.",
      "Continue storage infrastructure expansion and decommission legacy high-emission peak assets.",
    ],
  },
  {
    id: "economy",
    name: "Economy Agent",
    icon: LineChart,
    category: "Macroeconomics & Capital Deployment",
    dataSource: "Planetary Fiscal Reserves & Supply-Chain Index Telemetry",
    description:
      "Quantifies GDP/economic strain, disaster recovery budgets, critical supply-chain bandwidth, and capital allocation.",
    watches: ["economy", "energy", "food"],
    unit: "ECONOMIC RESILIENCE",
    analysis: [
      "Compounding climate disaster costs have overwhelmed municipal capital reserves. Reconstruction capacity paralyzed.",
      "Disaster repair expenditures compounding faster than regional tax base growth, throttling critical infrastructure upgrades.",
      "Economic output remains positive but vulnerable to input price volatility and elevated climate insurance risk premiums.",
      "Capital formation robust. Disaster-contingency reserves well-capitalized and critical trade supply lines fully diversified.",
    ],
    actions: [
      "Activate emergency multilateral reconstruction fund and freeze non-essential public capital outflows.",
      "Establish regional climate-resilience credit facilities and subsidize critical supply chain hardening.",
      "Provide targeted tax incentives for climate-proofing commercial assets and stabilize commodity markets.",
      "Maintain proactive infrastructure reinvestment rates and continue diversifying bilateral trade channels.",
    ],
  },
  {
    id: "health",
    name: "Health Agent",
    icon: HeartPulse,
    category: "Public Health & Epidemiological Defense",
    dataSource: "WHO Global Outbreak Surveillance & ICU Utilization Network",
    description:
      "Assesses pandemic risk, healthcare infrastructure load, population vulnerability, vector expansion, and humanitarian impact.",
    watches: ["health", "water"],
    unit: "PUBLIC HEALTH",
    analysis: [
      "Healthcare networks overwhelmed by concurrent epidemic transmission and extreme heat casualties. Critical medical supplies exhausted.",
      "Intensive care demand approaching regional capacity limits. Vector-borne pathogen transmission windows expanding into new latitudes.",
      "Surveillance systems operational, but hospital triage load elevated due to respiratory stress and water-borne flare-ups.",
      "Genomic epidemiological surveillance nominal. Hospital surge capacity comfortably exceeds worst-case seasonal projections.",
    ],
    actions: [
      "Institute emergency epidemiological triage protocols, deploy field hospitals, and surge medical logistics.",
      "Mobilize rapid-response mobile clinics and pre-position antiviral and oral-rehydration reserves in dense nodes.",
      "Expand community preventive health outreach and increase primary-care medical staffing subsidies.",
      "Sustain routine vaccination coverage and maintain active pathogen surveillance sensor grids.",
    ],
  },
];

export function riskColor(risk: AgentRisk) {
  if (risk === "LOW") return "var(--success)";
  if (risk === "ELEVATED") return "var(--warning)";
  return "var(--danger)";
}

function riskFor(index: number): AgentRisk {
  if (index >= 70) return "LOW";
  if (index >= 50) return "ELEVATED";
  if (index >= 30) return "HIGH";
  return "CRITICAL";
}

/** 0 = worst tier, 3 = best tier — matches the analysis/actions tuples */
function tierFor(index: number) {
  if (index < 30) return 0;
  if (index < 50) return 1;
  if (index < 70) return 2;
  return 3;
}

function statusFor(def: AgentDef, index: number, trend: number, year: number) {
  const dir = trend > 1 ? "improving" : trend < -1 ? "degrading" : "holding steady";
  return `${def.unit} at ${Math.round(index)}% and ${dir} as of ${year}.`;
}

function causesFor(def: AgentDef, index: number): string {
  if (index < 40)
    return `Severe systemic depletion in ${def.watches.join(" & ")} feeds compounding instability.`;
  if (index < 65)
    return `Cyclic load variations and localized demand surges impacting ${def.watches[0]}.`;
  return `Nominal buffer margins with stable replenishment cycles across ${def.watches.join(", ")}.`;
}

function impactFor(def: AgentDef, index: number): string {
  if (index < 40)
    return `Critical risk of cascade failure into secondary human and economic systems.`;
  if (index < 65) return `Elevated operating costs and localized resource bottlenecks.`;
  return `Minimal systemic friction; adequate reserves available for emergency reallocation.`;
}

export function buildAgents(
  stats: Record<StatKey, number>,
  history: HistoryEntry[],
  year: number,
  overrideState?: { isRunning?: boolean },
): Agent[] {
  const last = history[history.length - 1];

  return AGENT_DEFS.map((def, idx) => {
    const index = def.watches.reduce((sum, k) => sum + (stats[k] ?? 50), 0) / def.watches.length;

    const trend = last
      ? def.watches.reduce((sum, k) => sum + (last.effects[k] ?? 0), 0) / def.watches.length
      : 0;

    const spread =
      Math.max(...def.watches.map((k) => stats[k] ?? 50)) -
      Math.min(...def.watches.map((k) => stats[k] ?? 50));
    const confidence = Math.round(
      Math.max(58, Math.min(98, 78 + Math.min(history.length, 10) * 1.4 - spread * 0.5)),
    );

    const tier = tierFor(index);
    const risk = riskFor(index);

    let agentStatus: AgentProcessStatus = "Completed";
    if (overrideState?.isRunning) {
      agentStatus = "Running";
    } else if (risk === "CRITICAL") {
      agentStatus = "Warning";
    }

    const executionTimeMs = 85 + idx * 23 + Math.round((100 - confidence) * 2);

    return {
      ...def,
      index,
      trend,
      confidence,
      risk,
      analysis_text: def.analysis[tier],
      action: def.actions[tier],
      status: statusFor(def, index, trend, year),
      executionTimeMs,
      agentStatus,
      inputSummary: `Telemetry: ${def.watches.map((k) => `${k.toUpperCase()} ${Math.round(stats[k] ?? 50)}%`).join(", ")}`,
      causes: causesFor(def, index),
      expectedImpact: impactFor(def, index),
      keyFinding: def.analysis[tier],
      startedAt: `T+00:${String(idx * 12).padStart(2, "0")}.000Z`,
      completedAt: `T+00:${String(idx * 12 + Math.round(executionTimeMs / 10)).padStart(2, "0")}.${String(executionTimeMs % 1000).padStart(3, "0")}Z`,
    };
  });
}
