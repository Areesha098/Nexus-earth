import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getRegion, regionalStats } from "@/lib/regions";
import {
  headlinesFor,
  missionName,
  scenarioForCategory,
  threatFrom,
  livesAtRisk,
} from "@/lib/scenario";
import { evaluateEarthMemoryLinkage } from "@/lib/earth-memory";

export type StatKey = "climate" | "economy" | "health" | "food" | "energy" | "water";

export interface StatEffect {
  climate?: number;
  economy?: number;
  health?: number;
  food?: number;
  energy?: number;
  water?: number;
}

export interface Choice {
  id: string;
  label: string;
  description: string;
  effects: StatEffect;
}

export interface GameEvent {
  id: string;
  category: "climate" | "pandemic" | "ai" | "energy" | "water" | "food" | "cyber";
  title: string;
  subtitle: string;
  narrative: string;
  image: string;
  choices: Choice[];
}

export interface HistoryEntry {
  year: number;
  eventTitle: string;
  choiceLabel: string;
  effects: StatEffect;
  category: GameEvent["category"];
  region?: string;
  country?: string;
  city?: string;
  earthScoreBefore?: number;
  earthScoreAfter?: number;
  sdgScoreBefore?: number;
  sdgScoreAfter?: number;
  explanation?: string;
  timestamp?: number;
}

export interface DecisionResultDetails {
  eventTitle: string;
  choiceLabel: string;
  country: string;
  city: string;
  year: number;
  previousStats: Record<StatKey, number>;
  newStats: Record<StatKey, number>;
  effects: StatEffect;
  earthScoreBefore: number;
  earthScoreAfter: number;
  sdgScoreBefore: number;
  sdgScoreAfter: number;
  explanation: string;
  memoryLinkage?: string;
}

export interface NewsItem {
  id: string;
  text: string;
  tone: "good" | "bad" | "neutral";
  ts: number;
}

export interface Mission {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
  country: string;
  city: string;
  year: number;
  scenarioKey: string;
  scenarioTitle: string;
  threat: string;
  livesAtRisk: string;
  objective: string;
  status: "active" | "complete";
  startedAt: number;
  startAvg: number;
  /** filled on completion */
  endAvg?: number;
  sdgDelta?: number;
  livesSaved?: string;
  outcome?: string;
  choiceLabel?: string;
}

export interface ImpactBurst {
  id: number;
  effects: StatEffect;
  label: string;
}

export interface SmartAlert {
  id: string;
  type: "warning" | "critical" | "info";
  title: string;
  location: string;
  metric: StatKey;
  severity: number; // 0-100
  recommendation: string;
}

interface GameState {
  started: boolean;
  year: number;
  stats: Record<StatKey, number>;
  history: HistoryEntry[];
  currentEventId: string | null;
  gameOver: boolean;

  // ---- planetState extensions (single source of truth) ----
  regionId: string;
  selectedCity: string | null;
  twinYear: number;
  mission: Mission | null;
  news: NewsItem[];
  impact: ImpactBurst | null;
  lastDecisionResult: DecisionResultDetails | null;
  aiStatus: "idle" | "analyzing" | "live" | "offline";
  scenarioRunKey: number;

  start: () => void;
  reset: () => void;
  setCurrentEvent: (id: string) => void;
  applyChoice: (event: GameEvent, choice: Choice) => void;
  advanceYear: () => void;
  setRegion: (id: string) => void;
  setSelectedCity: (city: string | null) => void;
  setTwinYear: (y: number) => void;
  setAiStatus: (s: GameState["aiStatus"]) => void;
  startMission: (event: GameEvent) => void;
  pushNews: (text: string, tone?: NewsItem["tone"]) => void;
  clearImpact: () => void;
  clearLastDecisionResult: () => void;
  emergencyReset: (preserveHistory?: boolean) => void;
}

const START_YEAR = 2026;
const END_YEAR = 2050;

const initialStats: Record<StatKey, number> = {
  climate: 60,
  economy: 65,
  health: 70,
  food: 65,
  energy: 55,
  water: 60,
};

const clamp = (n: number) => Math.max(0, Math.min(100, n));
const average = (s: Record<StatKey, number>) =>
  Math.round(Object.values(s).reduce((a, b) => a + b, 0) / 6);

const baseState = {
  started: false,
  year: START_YEAR,
  stats: { ...initialStats },
  history: [] as HistoryEntry[],
  currentEventId: null,
  gameOver: false,
  regionId: "pakistan",
  selectedCity: null as string | null,
  twinYear: 2026,
  mission: null as Mission | null,
  news: [] as NewsItem[],
  impact: null as ImpactBurst | null,
  lastDecisionResult: null as DecisionResultDetails | null,
  aiStatus: "live" as const,
  scenarioRunKey: 0,
};

let newsSeq = 0;
const makeNews = (text: string, tone: NewsItem["tone"]): NewsItem => ({
  id: `n${Date.now()}-${newsSeq++}`,
  text,
  tone,
  ts: Date.now(),
});

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...baseState,
      start: () => set({ ...baseState, started: true }),
      reset: () => set({ ...baseState }),
      emergencyReset: (preserveHistory = true) => {
        set((s) => {
          const region = getRegion("pakistan");
          const preservedHistory = preserveHistory ? s.history : [];
          return {
            ...baseState,
            started: true,
            year: START_YEAR,
            twinYear: START_YEAR,
            stats: { ...initialStats },
            regionId: "pakistan",
            selectedCity: region.cities[0]?.name ?? region.city,
            history: preservedHistory,
            news: [
              makeNews(
                "EMERGENCY RESET: Planetary telemetry restored to 2026 baseline. System operational.",
                "good",
              ),
              ...(preserveHistory ? s.news : []),
            ].slice(0, 12),
            scenarioRunKey: s.scenarioRunKey + 1,
            impact: null,
            lastDecisionResult: null,
            currentEventId: null,
            mission: null,
            gameOver: false,
            aiStatus: "live",
          };
        });
      },
      setCurrentEvent: (id) => set({ currentEventId: id }),
      setRegion: (id) => {
        const region = getRegion(id);
        set((s) => ({
          regionId: id,
          selectedCity: region.cities[0]?.name ?? region.city,
          news: [
            makeNews(
              `Command uplink re-tasked to ${region.name} (${region.country}) ${region.flag}`,
              "neutral",
            ),
            ...s.news,
          ].slice(0, 12),
        }));
      },
      setSelectedCity: (city) => {
        set((s) => {
          const region = getRegion(s.regionId);
          return {
            selectedCity: city,
            news: [
              makeNews(
                `Local sensor telemetry focused on ${city ?? region.city}, ${region.country}`,
                "neutral",
              ),
              ...s.news,
            ].slice(0, 12),
          };
        });
      },
      setTwinYear: (y) => set({ twinYear: y }),
      setAiStatus: (aiStatus) => set({ aiStatus }),
      startMission: (event) => {
        const { stats, year, regionId, selectedCity } = get();
        const region = getRegion(regionId);
        const scenario = scenarioForCategory(event.category);
        const avg = average(regionalStats(stats, region));
        const activeCity = selectedCity ?? region.city;
        set((s) => ({
          currentEventId: event.id,
          scenarioRunKey: s.scenarioRunKey + 1,
          mission: {
            id: `${event.id}-${year}`,
            name: missionName(event, region.name),
            regionId,
            regionName: region.name,
            country: region.country,
            city: activeCity,
            year,
            scenarioKey: scenario.key,
            scenarioTitle: scenario.title,
            threat: threatFrom(avg).label,
            livesAtRisk: livesAtRisk(avg, region.population),
            objective: event.subtitle,
            status: "active",
            startedAt: Date.now(),
            startAvg: avg,
          },
          news: [
            makeNews(
              `MISSION STARTED · ${scenario.title} response in ${region.name} (${activeCity})`,
              "neutral",
            ),
            ...s.news,
          ].slice(0, 12),
        }));
      },
      pushNews: (text, tone = "neutral") =>
        set((s) => ({ news: [makeNews(text, tone), ...s.news].slice(0, 12) })),
      clearImpact: () => set({ impact: null }),
      clearLastDecisionResult: () => set({ lastDecisionResult: null }),
      applyChoice: (event, choice) => {
        const { stats, year, history, regionId, selectedCity, mission } = get();
        const region = getRegion(regionId);
        const activeCity = selectedCity ?? region.city;

        // Evaluate Earth Memory effect
        const memoryLink = evaluateEarthMemoryLinkage(history, event.category, year);

        const previousStats = { ...stats };
        const newStats = { ...stats };

        (Object.keys(choice.effects) as StatKey[]).forEach((k) => {
          const baseEff = choice.effects[k] ?? 0;
          // Apply minor memory resilience modifier
          const memMod = baseEff !== 0 ? memoryLink.resilienceModifier : 0;
          newStats[k] = clamp(newStats[k] + baseEff + memMod);
        });

        // Add subtle stochastic drift
        (Object.keys(newStats) as StatKey[]).forEach((k) => {
          newStats[k] = clamp(newStats[k] + Math.round(Math.random() * 2 - 1));
        });

        const anyCollapsed = Object.values(newStats).some((v) => v <= 0);
        const beforeAvg = average(regionalStats(stats, region));
        const afterAvg = average(regionalStats(newStats, region));
        const delta = afterAvg - beforeAvg;

        const earthScoreBefore = beforeAvg;
        const earthScoreAfter = afterAvg;
        const sdgScoreBefore = Math.round(beforeAvg * 0.95);
        const sdgScoreAfter = Math.round(afterAvg * 0.95);

        const explanation =
          delta >= 0
            ? `Directive "${choice.label}" successfully fortified systemic capacities across ${region.country} (${activeCity}). Local indicators registered an average +${Math.abs(delta)}% uplift.`
            : `Directive "${choice.label}" strained regional capital and exposed secondary vulnerabilities in ${region.country} (${activeCity}), shifting the planetary balance by ${delta}%.`;

        const headlines = headlinesFor(choice.effects, region.name, year).map((h) =>
          makeNews(h.text, h.tone),
        );

        const resultDetails: DecisionResultDetails = {
          eventTitle: event.title,
          choiceLabel: choice.label,
          country: region.country,
          city: activeCity,
          year,
          previousStats,
          newStats,
          effects: choice.effects,
          earthScoreBefore,
          earthScoreAfter,
          sdgScoreBefore,
          sdgScoreAfter,
          explanation,
          memoryLinkage: memoryLink.hasLink ? memoryLink.explanation : undefined,
        };

        const newEntry: HistoryEntry = {
          year,
          eventTitle: event.title,
          choiceLabel: choice.label,
          effects: choice.effects,
          category: event.category,
          region: region.name,
          country: region.country,
          city: activeCity,
          earthScoreBefore,
          earthScoreAfter,
          sdgScoreBefore,
          sdgScoreAfter,
          explanation,
          timestamp: Date.now(),
        };

        const memoryNotification = memoryLink.hasLink
          ? [makeNews(memoryLink.explanation, memoryLink.resilienceModifier > 0 ? "good" : "bad")]
          : [];

        set({
          stats: newStats,
          history: [...history, newEntry],
          currentEventId: null,
          gameOver: anyCollapsed || year >= END_YEAR,
          twinYear: Math.min(year + 2, END_YEAR), // auto animate digital twin forward
          impact: { id: Date.now(), effects: choice.effects, label: choice.label },
          lastDecisionResult: resultDetails,
          mission: mission
            ? {
                ...mission,
                status: "complete",
                endAvg: afterAvg,
                sdgDelta: Math.round(delta * 0.92),
                livesSaved: livesAtRisk(Math.max(0, 100 - Math.abs(delta) * 6), region.population),
                outcome:
                  delta > 4
                    ? "DECISIVE SUCCESS"
                    : delta > 0
                      ? "STABILISED"
                      : delta > -5
                        ? "PARTIAL LOSS"
                        : "SETBACK",
                choiceLabel: choice.label,
              }
            : null,
          news: [
            makeNews(`MISSION COMPLETED · ${choice.label}`, delta >= 0 ? "good" : "bad"),
            ...memoryNotification,
            ...headlines,
            ...get().news,
          ].slice(0, 15),
        });
      },
      advanceYear: () => {
        const { year } = get();
        const next = Math.min(year + 2, END_YEAR);
        set({ year: next, twinYear: next });
      },
    }),
    { name: "earth-01-save" },
  ),
);

export const END_GAME_YEAR = END_YEAR;
export const START_GAME_YEAR = START_YEAR;

export function generateSmartAlerts(
  stats: Record<StatKey, number>,
  regionName: string,
  cityName: string,
): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  if (stats.water < 50) {
    alerts.push({
      id: "alert-water",
      type: stats.water < 35 ? "critical" : "warning",
      title: "Freshwater & Aquifer Stress",
      location: `${cityName}, ${regionName}`,
      metric: "water",
      severity: 100 - stats.water,
      recommendation: "Deploy satellite desalination grid & agricultural water conservation.",
    });
  }
  if (stats.climate < 50) {
    alerts.push({
      id: "alert-climate",
      type: stats.climate < 35 ? "critical" : "warning",
      title: "Wet-Bulb Thermal Anomaly",
      location: `${cityName}, ${regionName}`,
      metric: "climate",
      severity: 100 - stats.climate,
      recommendation: "Activate municipal cooling domes & urban canopy shading.",
    });
  }
  if (stats.food < 50) {
    alerts.push({
      id: "alert-food",
      type: stats.food < 35 ? "critical" : "warning",
      title: "Staple Grain Supply Deficit",
      location: `${cityName}, ${regionName}`,
      metric: "food",
      severity: 100 - stats.food,
      recommendation: "Establish emergency grain corridors & vertical farm conversion.",
    });
  }
  if (stats.health < 50) {
    alerts.push({
      id: "alert-health",
      type: stats.health < 35 ? "critical" : "warning",
      title: "Epidemic Hospital Strain",
      location: `${cityName}, ${regionName}`,
      metric: "health",
      severity: 100 - stats.health,
      recommendation: "Distribute autonomous mobile triage hubs & rapid AI diagnostics.",
    });
  }
  if (stats.energy < 50) {
    alerts.push({
      id: "alert-energy",
      type: stats.energy < 35 ? "critical" : "warning",
      title: "Substation Grid Congestion",
      location: `${cityName}, ${regionName}`,
      metric: "energy",
      severity: 100 - stats.energy,
      recommendation: "Bring molten salt thermal storage & microgrid islanding online.",
    });
  }
  return alerts;
}

/** Derived planetState — every widget should read from here. */
export function usePlanetState() {
  const state = useGame();
  const region = getRegion(state.regionId);
  const activeCity = state.selectedCity ?? region.city;
  const local = regionalStats(state.stats, region);
  const smartAlerts = generateSmartAlerts(local, region.name, activeCity);

  return {
    ...state,
    region,
    activeCity,
    localStats: local,
    globalAvg: average(state.stats),
    regionAvg: average(local),
    smartAlerts,
  };
}
