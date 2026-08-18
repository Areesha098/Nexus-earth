import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { EarthMount } from "@/components/earth/EarthMount";
import { useGame, usePlanetState, END_GAME_YEAR, START_GAME_YEAR } from "@/lib/game-store";
import { pickEventForYear, getEventForScenario } from "@/lib/events-data";
import {
  ArrowRight,
  History,
  RotateCcw,
  Radio,
  Network,
  LayoutDashboard,
  FlaskConical,
  Bot,
  FileText,
  Volume2,
  VolumeX,
  Sliders,
  Users,
  GitMerge,
  Terminal,
  MapPin,
  Flame,
  Droplets,
  Zap,
  Activity,
  Wheat,
  ShieldAlert,
} from "lucide-react";
import { AgentGrid } from "@/components/agents/AgentGrid";
import { AgentActivityPanel } from "@/components/agents/AgentActivityPanel";
import { TwinPanel, TwinSlider } from "@/components/twin/DigitalTwin";
import { projectYear, TWIN_START } from "@/lib/digital-twin";
import { ReportButton } from "@/components/report/ReportButton";
import { CopilotDock } from "@/components/copilot/CopilotDock";
import { LeftPanel } from "@/components/command/LeftPanel";
import { RightPanel } from "@/components/command/RightPanel";
import { ScenarioTimeline } from "@/components/command/ScenarioTimeline";
import { MissionBanner } from "@/components/command/MissionBanner";
import { ImpactChips } from "@/components/command/ImpactChips";
import { CausalChainViewer } from "@/components/causal/CausalChainViewer";
import { AIRecommendationsList } from "@/components/recommendations/AIRecommendationsList";
import { AIDeveloperPanel } from "@/components/ai/AIDeveloperPanel";
import { DecisionResultModal } from "@/components/results/DecisionResultModal";
import { AudioSettingsModal } from "@/components/audio/AudioSettingsModal";
import { ComplaintModal } from "@/components/complaints/ComplaintModal";
import { type ServiceType } from "@/lib/complaints-data";
import { RegionDeepDive } from "@/components/regions/RegionDeepDive";
import { WaterFoodCascadePanel } from "@/components/cascade/WaterFoodCascadePanel";
import { audioService } from "@/services/audioService";
import { REGIONS } from "@/lib/regions";
import { threatFrom, type ScenarioKey } from "@/lib/scenario";
import type { StatKey } from "@/lib/game-store";

export const Route = createFileRoute("/command")({
  component: Command,
});

type Section = "dashboard" | "lab" | "agents" | "copilot" | "reports";

const SECTIONS: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "DASHBOARD", icon: LayoutDashboard },
  { id: "lab", label: "SIMULATION LAB", icon: FlaskConical },
  { id: "agents", label: "MULTI-AGENT AI", icon: Users },
  { id: "copilot", label: "AI COPILOT", icon: Bot },
  { id: "reports", label: "REPORTS", icon: FileText },
];

function Command() {
  const navigate = useNavigate();
  const planet = usePlanetState();
  const {
    started,
    year,
    gameOver,
    history,
    stats,
    localStats,
    regionAvg,
    region,
    activeCity,
    twinYear,
    mission,
    news,
    impact,
    scenarioRunKey,
    aiStatus,
  } = planet;
  const start = useGame((s) => s.start);
  const reset = useGame((s) => s.reset);
  const setTwinYear = useGame((s) => s.setTwinYear);
  const setRegion = useGame((s) => s.setRegion);
  const startMission = useGame((s) => s.startMission);

  const [section, setSection] = useState<Section>("dashboard");
  const [audioModal, setAudioModal] = useState(false);
  const [devPanel, setDevPanel] = useState(false);
  const [complaintModal, setComplaintModal] = useState(false);
  const [complaintInitialService, setComplaintInitialService] = useState<ServiceType | undefined>(undefined);
  const [isMuted, setIsMuted] = useState(false);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [selectedDisaster, setSelectedDisaster] = useState<string>("flood");

  const DISASTER_PRESETS = [
    { id: "flood", label: "Monsoon Flood Surge", icon: Droplets, metric: "Water / Climate" },
    { id: "heatwave", label: "Wet-Bulb Heat Dome", icon: Flame, metric: "Climate / Health" },
    { id: "glacier", label: "Glacier Loss & Stress", icon: Droplets, metric: "Water / Energy" },
    { id: "famine", label: "Agricultural Deficit", icon: Wheat, metric: "Food / Economy" },
    { id: "grid", label: "Supergrid Blackout", icon: Zap, metric: "Energy / Cyber" },
    { id: "pandemic", label: "Pathogen Outbreak", icon: Activity, metric: "Health / Defense" },
  ];

  useEffect(() => {
    setIsMuted(audioService.getSettings().muted);
    return audioService.subscribe((s) => setIsMuted(s.muted));
  }, []);

  useEffect(() => {
    if (!started) start();
  }, [started, start]);

  useEffect(() => {
    if (gameOver) navigate({ to: "/results" });
  }, [gameOver, navigate]);

  useEffect(() => {
    if (!twinYear) setTwinYear(TWIN_START);
  }, [twinYear, setTwinYear]);

  const projection = useMemo(
    () => projectYear(localStats, twinYear, history.length),
    [localStats, twinYear, history.length],
  );

  const pulseKeys = useMemo(
    () =>
      impact
        ? (Object.keys(impact.effects) as StatKey[]).filter((k) => (impact.effects[k] ?? 0) !== 0)
        : [],
    [impact],
  );

  const progress = Math.min(
    100,
    ((year - START_GAME_YEAR) / (END_GAME_YEAR - START_GAME_YEAR)) * 100,
  );
  const threat = threatFrom(regionAvg);
  const scenarioKey =
    (mission?.scenarioKey as ScenarioKey | undefined) ??
    (selectedDisaster as ScenarioKey) ??
    "flood";

  function triggerEvent(disasterKey?: unknown) {
    audioService.playSimulationStart();
    const targetKey = typeof disasterKey === "string" ? disasterKey : selectedDisaster;
    const ev = targetKey ? getEventForScenario(targetKey) : pickEventForYear(year, history);
    startMission(ev);
    navigate({ to: "/event" });
  }

  const prediction = predictOutcome(regionAvg, year);

  const earthBlock = (
    <div className="relative flex-1 min-h-[420px] rounded-xl">
      <div className="absolute top-3 left-3 hud-corner rounded-md px-2 py-1 font-display text-[10px] tracking-widest bg-background/40 backdrop-blur z-10">
        <Radio size={10} className="inline mr-1 text-neon" /> UPLINK STABLE
      </div>
      <div className="absolute top-3 right-3 hud-corner rounded-md px-2 py-1 font-display text-[10px] tracking-widest bg-background/40 backdrop-blur z-10 flex items-center gap-1.5">
        <span>{region.flag}</span>
        <span>{region.name.toUpperCase()}</span>
        <span className="text-muted-foreground">({activeCity})</span>
      </div>
      <div className="absolute bottom-3 right-3 hud-corner rounded-md px-2 py-1 font-display text-[10px] tracking-widest bg-background/40 backdrop-blur z-10">
        THREAT · <span className={threat.tone}>{threat.label}</span>
      </div>
      <div className="absolute bottom-3 left-3 hud-corner rounded-md px-2 py-1 font-display text-[10px] tracking-widest bg-background/40 backdrop-blur z-10">
        POP · {region.population}
      </div>

      {/* Region markers / satellite highlights */}
      {REGIONS.filter((r) => r.id !== "global").map((r) => {
        const active = r.id === region.id;
        return (
          <button
            key={r.id}
            onClick={() => {
              audioService.playClick();
              setRegion(r.id);
            }}
            title={`${r.name} (${r.country})`}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${r.marker.x}%`, top: `${r.marker.y}%` }}
          >
            <motion.span
              className="block rounded-full"
              animate={{
                width: active ? 16 : 8,
                height: active ? 16 : 8,
                opacity: active ? 1 : 0.55,
                boxShadow: active
                  ? `0 0 24px ${projection.state === "critical" ? "var(--danger)" : "var(--neon)"}`
                  : "0 0 6px var(--neon)",
              }}
              style={{
                background:
                  projection.state === "critical" && active ? "var(--danger)" : "var(--neon)",
              }}
              transition={{ duration: 0.4 }}
            />
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Full-bleed Earth — reacts to the live planetState */}
      <div className="absolute inset-0 z-0">
        <EarthMount health={projection.health} pulseKey={history.length} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/90 z-[1]" />
      <div className="pointer-events-none absolute inset-0 scanlines-strong opacity-20 z-[1]" />
      <div className="scan-line z-[1]" />

      {/* Top HUD bar */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 px-6 md:px-10 py-4">
        <div className="hud-corner flex items-center gap-3 px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <p className="font-display text-[10px] tracking-[0.4em] text-muted-foreground">
            NEXUS EARTH · AI DECISION COMMAND CENTER
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              audioService.playClick();
              audioService.toggleMute();
            }}
            className="holo-panel rounded-md p-2 hover:neon-border transition-all"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? (
              <VolumeX size={16} className="text-danger" />
            ) : (
              <Volume2 size={16} className="text-neon" />
            )}
          </button>

          <button
            onClick={() => {
              audioService.playClick();
              setAudioModal(true);
            }}
            className="holo-panel rounded-md p-2 hover:neon-border transition-all"
            title="Audio & Narration Settings"
          >
            <Sliders size={16} />
          </button>

          <button
            onClick={() => {
              audioService.playClick();
              setDevPanel(true);
            }}
            className="holo-panel rounded-md p-2 hover:neon-border transition-all"
            title="AI Developer Panel (Prompt & Telemetry Inspector)"
          >
            <Terminal size={16} />
          </button>

          <button
            onClick={() => {
              audioService.playClick();
              navigate({ to: "/architecture" });
            }}
            className="holo-panel rounded-md p-2 hover:neon-border transition-all"
            title="AI Architecture"
          >
            <Network size={16} />
          </button>

          <button
            onClick={() => {
              audioService.playClick();
              setComplaintInitialService(undefined);
              setComplaintModal(true);
            }}
            className="holo-panel rounded-md px-2.5 py-1.5 flex items-center gap-1.5 hover:neon-border transition-all bg-neon/10 border border-neon/40 text-neon shadow-[0_0_12px_rgba(6,182,212,0.25)]"
            title="Complaint / Service Request (Water, Gas, Electricity, Sanitation)"
          >
            <Activity size={14} className="animate-pulse text-neon" />
            <span className="font-display text-[10px] tracking-widest font-bold hidden sm:inline">
              SERVICE REQUEST
            </span>
          </button>

          <ReportButton />

          <button
            onClick={() => {
              audioService.playClick();
              navigate({ to: "/history" });
            }}
            className="holo-panel rounded-md p-2 hover:neon-border transition-all"
            title="History"
          >
            <History size={16} />
          </button>

          <button
            onClick={() => {
              audioService.playClick();
              reset();
              navigate({ to: "/" });
            }}
            className="holo-panel rounded-md p-2 hover:neon-border transition-all"
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      {/* Section navigation */}
      <nav className="relative z-10 px-4 md:px-8">
        <div className="holo-panel rounded-xl p-1.5 flex flex-wrap gap-1">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = section === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  audioService.playClick();
                  setSection(s.id);
                }}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 font-display text-[10px] tracking-widest transition-colors ${
                  active ? "text-neon" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="section-pill"
                    className="absolute inset-0 rounded-lg neon-border bg-muted/30"
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  />
                )}
                <Icon size={13} className="relative" />
                <span className="relative">{s.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => {
              audioService.playClick();
              navigate({ to: "/architecture" });
            }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 font-display text-[10px] tracking-widest text-muted-foreground hover:text-foreground"
          >
            <Network size={13} /> ARCHITECTURE
          </button>
          <button
            onClick={() => {
              audioService.playClick();
              setComplaintInitialService(undefined);
              setComplaintModal(true);
            }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 font-display text-[10px] tracking-widest text-neon hover:bg-neon/10 transition-colors ml-auto"
          >
            <Activity size={13} className="text-neon animate-pulse" /> SERVICE REQUEST
          </button>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {section === "dashboard" && (
          <motion.main
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="relative z-10 grid lg:grid-cols-[300px_1fr_320px] gap-4 p-4 md:px-8 md:pb-8"
          >
            <section className="order-2 lg:order-1 space-y-3">
              <LeftPanel />
            </section>

            <section className="order-1 lg:order-2 flex flex-col gap-4">
              <MissionBanner />

              <div className="holo-panel rounded-xl px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-display text-[10px] tracking-widest text-muted-foreground">
                    CURRENT CYCLE
                  </p>
                  <p className="font-display text-3xl font-black text-gradient">{year}</p>
                </div>
                <div className="flex-1 mx-6">
                  <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{ background: "var(--gradient-neon)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-display tracking-widest text-muted-foreground mt-1">
                    <span>{START_GAME_YEAR}</span>
                    <span>{END_GAME_YEAR}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-[10px] tracking-widest text-muted-foreground">
                    DECISIONS
                  </p>
                  <p className="font-display text-3xl font-black">{history.length}</p>
                </div>
              </div>

              {earthBlock}

              {/* Regional Deep Dive: Cities, Water/Food Data & Real-World Ground Truth */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    audioService.playClick();
                    setShowDeepDive(!showDeepDive);
                  }}
                  className="w-full holo-panel rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-display tracking-widest text-neon hover:border-primary/60 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <MapPin size={13} /> VIEW REGIONAL DATA (
                    {region.name.toUpperCase()} / {activeCity})
                  </span>
                  <span>{showDeepDive ? "▲ COLLAPSE" : "▼ EXPAND"}</span>
                </button>
                <AnimatePresence>
                  {showDeepDive && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                    >
                      <RegionDeepDive />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {mission && <ScenarioTimeline scenarioKey={scenarioKey} runKey={scenarioRunKey} />}

              <TwinSlider year={twinYear} onYearChange={setTwinYear} projection={projection} />

              <div className="flex justify-center">
                <motion.button
                  onClick={() => triggerEvent()}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-neon inline-flex items-center gap-3"
                >
                  Run simulation
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            </section>

            <section className="order-3 space-y-3">
              <RightPanel pulseKeys={pulseKeys} />
            </section>
          </motion.main>
        )}

        {section === "lab" && (
          <motion.main
            key="lab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="relative z-10 space-y-4 p-4 md:px-8 md:pb-8"
          >
            <MissionBanner />
            <div className="grid lg:grid-cols-[1fr_320px] gap-4">
              <div className="space-y-4">
                <WaterFoodCascadePanel />
                <RegionDeepDive />
                {mission && <ScenarioTimeline scenarioKey={scenarioKey} runKey={scenarioRunKey} />}
                <TwinSlider year={twinYear} onYearChange={setTwinYear} projection={projection} />
                <CausalChainViewer
                  category={scenarioKey}
                  eventTitle={mission?.scenarioTitle ?? "Compound Climate & Systemic Stress"}
                  country={region.country}
                  city={activeCity}
                />
                <AIRecommendationsList />
                <AgentGrid />
              </div>
              <div className="space-y-4">
                <TwinPanel projection={projection} stats={localStats} decisions={history.length} />
                <div className="holo-panel rounded-xl p-5">
                  <p className="font-display text-[10px] tracking-widest text-neon mb-2 animate-flicker">
                    // AI FORESIGHT ENGINE
                  </p>
                  <p className="font-display text-lg leading-snug">{prediction.headline}</p>
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                    {prediction.detail}
                  </p>
                </div>
                <div className="holo-panel rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-[10px] tracking-widest text-muted-foreground">
                      SIMULATION CONTROLS
                    </p>
                    <span className="font-display text-[9px] text-neon uppercase">
                      {region.country}
                    </span>
                  </div>

                  {/* Disaster Selection Grid */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-display tracking-widest text-muted-foreground">
                      DISASTER FOCUS:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {DISASTER_PRESETS.map((preset) => {
                        const Icon = preset.icon;
                        const isSelected = selectedDisaster === preset.id;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => {
                              audioService.playClick();
                              setSelectedDisaster(preset.id);
                            }}
                            className={`p-2 rounded-lg text-left transition-all flex flex-col justify-between ${
                              isSelected
                                ? "bg-neon/15 border border-neon text-neon shadow-sm"
                                : "bg-background/40 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/20"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <Icon
                                size={12}
                                className={isSelected ? "text-neon" : "text-muted-foreground"}
                              />
                              <span className="font-display text-[10px] font-bold leading-tight">
                                {preset.label}
                              </span>
                            </div>
                            <span className="text-[8px] font-mono text-muted-foreground mt-1">
                              {preset.metric}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => triggerEvent(selectedDisaster)}
                    className="btn-neon w-full inline-flex items-center justify-center gap-3 mt-2"
                  >
                    Run simulation <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.main>
        )}

        {section === "agents" && (
          <motion.main
            key="agents"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="relative z-10 space-y-4 p-4 md:px-8 md:pb-8"
          >
            <div className="grid lg:grid-cols-[1fr_380px] gap-4">
              <div className="space-y-4">
                <AgentGrid />
                <AIRecommendationsList />
              </div>
              <div className="space-y-4">
                <AgentActivityPanel />
              </div>
            </div>
          </motion.main>
        )}

        {section === "copilot" && (
          <motion.main
            key="copilot"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="relative z-10 grid lg:grid-cols-2 gap-4 p-4 md:px-8 md:pb-8"
          >
            <div className="holo-panel rounded-xl p-5 space-y-4">
              <p className="font-display text-[10px] tracking-widest text-neon mb-1 animate-flicker">
                // AI COPILOT · CHAT + VOICE
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Interact with the AI Copilot via text or microphone. The Copilot monitors live
                telemetry for <strong>{region.name}</strong> ({activeCity}), simulation year{" "}
                {twinYear}, composite Earth Score {projection.impact}/100, and SDG {projection.sdg}
                /100.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full border border-border/60 px-2 py-0.5 font-display text-[9px] tracking-widest text-muted-foreground">
                  STATUS <span className="text-neon">{aiStatus.toUpperCase()}</span>
                </span>
                <span className="rounded-full border border-border/60 px-2 py-0.5 font-display text-[9px] tracking-widest text-muted-foreground">
                  DIRECTIVES <span className="text-neon">{history.length}</span>
                </span>
                <span className="rounded-full border border-border/60 px-2 py-0.5 font-display text-[9px] tracking-widest text-muted-foreground">
                  ACTIVE CITY <span className="text-neon">{activeCity}</span>
                </span>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    audioService.playClick();
                    setDevPanel(true);
                  }}
                  className="btn-neon text-xs px-4 py-2 flex items-center gap-2"
                >
                  <Terminal size={14} /> Open AI Developer / Prompt Inspector
                </button>
              </div>
            </div>
            <div className="holo-panel rounded-xl p-5">
              <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-3">
                AI REASONING LOGS & TELEMETRY STREAM
              </p>
              <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {news.length === 0 && (
                  <li className="text-xs text-muted-foreground">No AI events logged yet.</li>
                )}
                {news.map((n) => (
                  <li
                    key={n.id}
                    className="text-[11px] text-muted-foreground border-b border-border/40 pb-1.5"
                  >
                    <span className="font-display text-neon mr-2">
                      {new Date(n.ts).toLocaleTimeString()}
                    </span>
                    {n.text}
                  </li>
                ))}
              </ul>
            </div>
          </motion.main>
        )}

        {section === "reports" && (
          <motion.main
            key="reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="relative z-10 grid lg:grid-cols-2 gap-4 p-4 md:px-8 md:pb-8"
          >
            <div className="holo-panel rounded-xl p-5 space-y-4">
              <p className="font-display text-[10px] tracking-widest text-neon mb-1 animate-flicker">
                // AI DECISION REPORT EXPORT
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generate high-resolution, professional PDF reports summarizing executive metrics,
                live indicators, multi-agent AI risk assessments, causal chains, SDG targets, and
                directives for <strong>{region.name}</strong> ({activeCity}).
              </p>
              <div className="flex items-center gap-3 pt-2">
                <ReportButton />
                <span className="font-display text-[10px] tracking-widest text-muted-foreground">
                  DOWNLOAD FULL PDF REPORT
                </span>
              </div>
            </div>
            <div className="holo-panel rounded-xl p-5">
              <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-3">
                SIMULATION DECISION LOG
              </p>
              {history.length === 0 && (
                <p className="text-xs text-muted-foreground">No directives issued yet.</p>
              )}
              <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {[...history].reverse().map((h, i) => (
                  <li key={i} className="text-[11px] border-b border-border/40 pb-1.5">
                    <span className="font-display text-neon">{h.year}</span>
                    <span className="mx-2 text-muted-foreground">·</span>
                    <span className="font-bold">{h.choiceLabel}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">
                      ({h.country ?? "Global"})
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  audioService.playClick();
                  navigate({ to: "/history" });
                }}
                className="mt-4 font-display text-[10px] tracking-widest text-neon hover:underline"
              >
                OPEN FULL TIMELINE →
              </button>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Overlays & Modals */}
      <DecisionResultModal onContinue={() => {}} />
      <AudioSettingsModal open={audioModal} onClose={() => setAudioModal(false)} />
      <AIDeveloperPanel open={devPanel} onClose={() => setDevPanel(false)} />
      <ComplaintModal
        open={complaintModal}
        onClose={() => setComplaintModal(false)}
        initialService={complaintInitialService}
      />

      <ImpactChips />
      <CopilotDock />
    </div>
  );
}

function predictOutcome(avg: number, year: number) {
  const yearsLeft = END_GAME_YEAR - year;
  if (avg >= 70)
    return {
      headline: "Trajectory: Post-Scarcity by 2050",
      detail: `Projected outcome in ${yearsLeft} years: expansion of regional capacity, clean energy transition, and climate stabilization.`,
    };
  if (avg >= 50)
    return {
      headline: "Trajectory: Managed Adaptation",
      detail: `Projected outcome in ${yearsLeft} years: humanity maintains systemic stability with localized stresses in key biomes.`,
    };
  if (avg >= 30)
    return {
      headline: "Trajectory: Fragmented Survival",
      detail: `Projected outcome in ${yearsLeft} years: significant resource stress, cascading infrastructure degradation, and supply chain fragility.`,
    };
  return {
    headline: "Trajectory: Civilizational Breakdown",
    detail: `Projected outcome in ${yearsLeft} years: multi-system failure across food, water, and power infrastructure.`,
  };
}
