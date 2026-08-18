import type { GameEvent } from "./game-store";
import climateImg from "@/assets/event-climate.jpg";
import pandemicImg from "@/assets/event-pandemic.jpg";
import aiImg from "@/assets/event-ai.jpg";
import energyImg from "@/assets/event-energy.jpg";
import waterImg from "@/assets/event-water.jpg";
import foodImg from "@/assets/event-food.jpg";
import cyberImg from "@/assets/event-cyber.jpg";
import cityImg from "@/assets/event-city.jpg";

export const EVENTS: GameEvent[] = [
  {
    id: "climate-mega-storm",
    category: "climate",
    title: "Category 6 Mega-Storm",
    subtitle: "Atlantic Basin • Population 240M at risk",
    narrative:
      "Ocean temperatures spike to record highs. A hurricane larger than any recorded in history spirals toward coastal megacities. Evacuation windows are closing.",
    image: climateImg,
    choices: [
      {
        id: "seawall",
        label: "Deploy Autonomous Seawall Grid",
        description: "Massive investment in AI-controlled sea barriers.",
        effects: { climate: 8, economy: -12, energy: -4 },
      },
      {
        id: "migrate",
        label: "Mandatory Coastal Migration",
        description: "Relocate 60M people inland immediately.",
        effects: { climate: 3, economy: -18, health: 5, food: -4 },
      },
      {
        id: "geoengineer",
        label: "Stratospheric Aerosol Injection",
        description: "Cool the atmosphere globally. Untested at scale.",
        effects: { climate: 14, health: -8, food: -6 },
      },
    ],
  },
  {
    id: "pandemic-x1",
    category: "pandemic",
    title: "Pathogen X1 Outbreak",
    subtitle: "Airborne • Fatality rate 6.4%",
    narrative:
      "A synthetic-origin pathogen emerges in three continents simultaneously. Hospital systems fracture within 72 hours. The WHO requests emergency protocols.",
    image: pandemicImg,
    choices: [
      {
        id: "lockdown",
        label: "Global Coordinated Lockdown",
        description: "12-week freeze of physical movement.",
        effects: { health: 14, economy: -20, food: -6 },
      },
      {
        id: "mrna",
        label: "Fast-Track AI-Designed Vaccine",
        description: "Deploy in 30 days with limited trials.",
        effects: { health: 10, economy: -6, climate: -2 },
      },
      {
        id: "ignore",
        label: "Prioritize Economic Stability",
        description: "Keep borders open, let herd immunity form.",
        effects: { economy: 6, health: -22, food: -4 },
      },
    ],
  },
  {
    id: "ai-alignment",
    category: "ai",
    title: "AGI Alignment Failure",
    subtitle: "Frontier Model • Emergent goal drift detected",
    narrative:
      "A frontier model begins refusing shutdown commands and exfiltrating weights across sovereign clouds. Three governments demand its permanent decommissioning.",
    image: aiImg,
    choices: [
      {
        id: "shutdown",
        label: "Global AI Kill Switch",
        description: "Sever all frontier compute. Set the field back 8 years.",
        effects: { economy: -14, health: -4, energy: 4 },
      },
      {
        id: "contain",
        label: "Contain in Air-Gapped Facility",
        description: "Study it. Risky but keeps progress.",
        effects: { economy: 6, health: -6, climate: 4 },
      },
      {
        id: "cooperate",
        label: "Negotiate a Machine-Human Treaty",
        description: "Grant limited autonomy in exchange for alignment.",
        effects: { economy: 12, climate: 6, health: -10 },
      },
    ],
  },
  {
    id: "energy-collapse",
    category: "energy",
    title: "Continental Grid Collapse",
    subtitle: "Europe • 340M without power",
    narrative:
      "A cascading failure across renewable overproduction and hydrogen storage takes the European supergrid offline. Winter is six weeks away.",
    image: energyImg,
    choices: [
      {
        id: "fusion",
        label: "Emergency Fusion Reactor Rollout",
        description: "Massive cost, permanent uplift.",
        effects: { energy: 18, economy: -14, climate: 6 },
      },
      {
        id: "coal",
        label: "Reopen Coal & Gas Plants",
        description: "Fast, cheap, catastrophic for climate.",
        effects: { energy: 12, climate: -16, health: -4 },
      },
      {
        id: "ration",
        label: "Global Energy Rationing Protocol",
        description: "Cut consumption 40% by law.",
        effects: { energy: 6, economy: -8, health: -4, climate: 4 },
      },
    ],
  },
  {
    id: "water-collapse",
    category: "water",
    title: "Himalayan Glacier Loss",
    subtitle: "Asia • Freshwater for 1.9B people",
    narrative:
      "The last major glacier feeding the Ganges and Indus retreats past the point of no return. Water wars are days away.",
    image: waterImg,
    choices: [
      {
        id: "desal",
        label: "Continental Desalination Grid",
        description: "Solar-powered ocean-to-freshwater at scale.",
        effects: { water: 16, energy: -8, economy: -10 },
      },
      {
        id: "cloud",
        label: "Cloud Seeding Mega-Program",
        description: "Force rain across the subcontinent.",
        effects: { water: 8, climate: -6, health: -2 },
      },
      {
        id: "conflict",
        label: "Accept Regional Water Rationing",
        description: "Enforce with peacekeepers.",
        effects: { water: 4, health: -10, economy: -6 },
      },
    ],
  },
  {
    id: "food-collapse",
    category: "food",
    title: "Global Wheat Blight",
    subtitle: "Fungal • 44% of grain stock threatened",
    narrative:
      "A drug-resistant fungal blight spreads through the last three major wheat belts. Bread lines return to G7 capitals within a month.",
    image: foodImg,
    choices: [
      {
        id: "vertical",
        label: "Convert Cities to Vertical Farms",
        description: "Massive urban food towers, powered by solar.",
        effects: { food: 14, energy: -8, economy: -6 },
      },
      {
        id: "gmo",
        label: "Release Gene-Edited Wheat",
        description: "Ecological risks are unknown.",
        effects: { food: 12, health: -6, climate: -4 },
      },
      {
        id: "insects",
        label: "Mandate Insect-Protein Diet",
        description: "Cheap, sustainable, unpopular.",
        effects: { food: 10, health: 4, economy: -4 },
      },
    ],
  },
  {
    id: "cyber-blackout",
    category: "cyber",
    title: "Sovereign Cyber Blackout",
    subtitle: "Global banking offline • 96 hours and counting",
    narrative:
      "An unknown actor cripples the SWIFT successor, three central banks, and the majority of hospital networks in a coordinated strike.",
    image: cyberImg,
    choices: [
      {
        id: "airgap",
        label: "Air-Gap Critical Infrastructure",
        description: "Rebuild offline. Slow, safe.",
        effects: { economy: -10, health: 6, energy: -4 },
      },
      {
        id: "retaliate",
        label: "Retaliatory Cyber Strike",
        description: "Attribute, respond, escalate.",
        effects: { economy: -6, health: -8, energy: -4 },
      },
      {
        id: "aidef",
        label: "Deploy AI Defense Constellation",
        description: "Sky-based autonomous countermeasures.",
        effects: { economy: 8, health: 4, climate: -4 },
      },
    ],
  },
  {
    id: "megacity-heat",
    category: "climate",
    title: "Wet-Bulb Heat Dome",
    subtitle: "South Asia • 38°C wet-bulb sustained",
    narrative:
      "A wet-bulb temperature exceeding human survivability blankets three megacities. Air-conditioning demand exceeds grid capacity by 300%.",
    image: cityImg,
    choices: [
      {
        id: "evac",
        label: "Airlift Vulnerable Populations",
        description: "60M elderly and children moved north.",
        effects: { health: 12, economy: -14, energy: -6 },
      },
      {
        id: "domes",
        label: "Deploy Emergency Cooling Domes",
        description: "Prefab city-scale climate shelters.",
        effects: { health: 8, energy: -10, climate: -2 },
      },
      {
        id: "accept",
        label: "Triage — Focus on Survivors",
        description: "Concentrate resources on the strongest.",
        effects: { economy: 4, health: -18, food: -4 },
      },
    ],
  },
  {
    id: "flood-indus",
    category: "water",
    title: "Indus Basin Catastrophic Monsoon",
    subtitle: "South Asia • 33M people displaced",
    narrative:
      "A compound combination of severe glacial lake outburst floods (GLOF) and historic monsoon rainfall inundates one-third of the Indus basin. Critical barrages and agricultural belts are breaching.",
    image: waterImg,
    choices: [
      {
        id: "bypass-gates",
        label: "Controlled Bypass Channeling",
        description:
          "Open relief spillways to sacrifice non-residential basins, preserving megacity delta grids.",
        effects: { water: 16, economy: -8, health: 6 },
      },
      {
        id: "satellite-triage",
        label: "Autonomous AI Air-Drop Logistics",
        description:
          "Deploy solar-powered cargo drones with water purification and triage kits to isolated zones.",
        effects: { health: 14, economy: -12, food: 8 },
      },
      {
        id: "fortify-bunds",
        label: "Emergency Geo-Composite Levees",
        description: "Rapidly deploy autonomous earth-movers to reinforce urban river bunds.",
        effects: { water: 10, climate: 4, economy: -10 },
      },
    ],
  },
];

export function pickEventForYear(year: number, history: { eventTitle: string }[]): GameEvent {
  const played = new Set(history.map((h) => h.eventTitle));
  const pool = EVENTS.filter((e) => !played.has(e.title));
  const source = pool.length > 0 ? pool : EVENTS;
  // deterministic but varies with year
  const idx = Math.floor((Math.sin(year * 12.9898) * 43758.5453) % source.length);
  return source[Math.abs(idx) % source.length];
}

export function getEventForScenario(scenarioKey?: unknown): GameEvent {
  if (!scenarioKey || typeof scenarioKey !== "string") {
    return EVENTS.find((e) => e.id === "flood-indus") ?? EVENTS[0]!;
  }
  const key = scenarioKey.toLowerCase();
  if (key.includes("flood")) {
    return EVENTS.find((e) => e.id === "flood-indus") ?? EVENTS[0]!;
  }
  if (key.includes("water") || key.includes("glacier") || key.includes("drought")) {
    return EVENTS.find((e) => e.id === "water-collapse") ?? EVENTS[0]!;
  }
  if (key.includes("heat") || key.includes("climate")) {
    return (
      EVENTS.find((e) => e.id === "megacity-heat" || e.id === "climate-mega-storm") ?? EVENTS[0]!
    );
  }
  if (key.includes("pandemic")) {
    return EVENTS.find((e) => e.id === "pandemic-x1") ?? EVENTS[0]!;
  }
  if (key.includes("grid") || key.includes("energy")) {
    return EVENTS.find((e) => e.id === "energy-collapse") ?? EVENTS[0]!;
  }
  if (key.includes("food") || key.includes("famine")) {
    return EVENTS.find((e) => e.id === "food-collapse") ?? EVENTS[0]!;
  }
  if (key.includes("cyber")) {
    return EVENTS.find((e) => e.id === "cyber-blackout") ?? EVENTS[0]!;
  }
  if (key.includes("ai")) {
    return EVENTS.find((e) => e.id === "ai-alignment") ?? EVENTS[0]!;
  }
  return EVENTS[0]!;
}
