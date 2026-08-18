import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets,
  Wheat,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  BookOpen,
  RotateCcw,
  Sliders,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  Database,
  Cpu,
  Send,
} from "lucide-react";
import {
  runWaterFoodCascade,
  SCENARIO_PRESETS,
  type SimulationScenario,
  type MetricDataPoint,
} from "@/lib/water-food-cascade";
import { CascadeMethodologyModal } from "./CascadeMethodologyModal";
import { audioService } from "@/services/audioService";
import { toast } from "sonner";

interface Props {
  onAskCopilot?: (query: string) => void;
  compact?: boolean;
}

export function WaterFoodCascadePanel({ onAskCopilot, compact = false }: Props) {
  const [scenario, setScenario] = useState<SimulationScenario>("baseline");
  const [waterStress, setWaterStress] = useState<number>(SCENARIO_PRESETS.baseline.waterStress);
  const [intervention, setIntervention] = useState<number>(SCENARIO_PRESETS.baseline.intervention);
  const [targetYear, setTargetYear] = useState<number>(2026);
  const [showMethodology, setShowMethodology] = useState<boolean>(false);
  const [activeMetricTooltip, setActiveMetricTooltip] = useState<MetricDataPoint | null>(null);

  // When scenario preset changes, update inputs
  const handleScenarioChange = (s: SimulationScenario) => {
    audioService.playClick();
    setScenario(s);
    if (s === "baseline") {
      setWaterStress(SCENARIO_PRESETS.baseline.waterStress);
      setIntervention(SCENARIO_PRESETS.baseline.intervention);
    } else if (s === "increased_stress") {
      setWaterStress(SCENARIO_PRESETS.increased_stress.waterStress);
      setIntervention(SCENARIO_PRESETS.increased_stress.intervention);
    } else if (s === "intervention") {
      setWaterStress(SCENARIO_PRESETS.intervention.waterStress);
      setIntervention(SCENARIO_PRESETS.intervention.intervention);
    }
  };

  // Run deterministic calculation
  const cascadeResult = useMemo(() => {
    return runWaterFoodCascade({
      scenario,
      waterStressIndex: waterStress,
      interventionLevel: intervention,
      targetYear,
      regionId: "pakistan",
    });
  }, [scenario, waterStress, intervention, targetYear]);

  // If user adjusts custom sliders, flag as custom scenario
  const handleWaterStressSlider = (val: number) => {
    setWaterStress(val);
    if (scenario !== "custom") setScenario("custom");
  };

  const handleInterventionSlider = (val: number) => {
    setIntervention(val);
    if (scenario !== "custom") setScenario("custom");
  };

  const handleAskCopilot = () => {
    audioService.playClick();
    const prompt = `Analyze the Indus Basin Water-to-Food simulation telemetry for Year ${targetYear}: Water stress is at ${waterStress}% and intervention is at ${intervention}%. This causes a canal head withdrawal deficit of ${cascadeResult.water.canalWithdrawalDeficitPct.displayValue}, driving wheat yield loss to ${cascadeResult.agriculture.wheatYieldLossPct.displayValue}, resulting in a national food insecurity prevalence of ${cascadeResult.food.nationalFoodInsecurityRatePct.displayValue}. What causal mechanisms drove this outcome and what immediate policy directives are recommended?`;
    
    if (onAskCopilot) {
      onAskCopilot(prompt);
    } else {
      // Dispatch global event for copilot
      window.dispatchEvent(new CustomEvent("nexus:copilot-ask", { detail: { prompt } }));
      toast.success("Simulation telemetry dispatched to AI Copilot");
    }
  };

  return (
    <div className="holo-panel rounded-2xl p-5 md:p-6 space-y-6 border border-neon/30 relative overflow-hidden">
      {/* Background cyber accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-neon/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header with Badges */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-display font-black tracking-widest bg-primary text-primary-foreground">
              PRIMARY PROOF MVP
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Database size={10} /> REAL DATA: PCRWR · IRSA · PBS
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1">
              <Cpu size={10} /> 100% DETERMINISTIC MODEL
            </span>
          </div>
          <h2 className="font-display text-xl md:text-2xl font-black text-foreground flex items-center gap-2">
            Pakistan Water <ArrowRight size={18} className="text-neon" /> Agricultural Pressure <ArrowRight size={18} className="text-neon" /> Food Security
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Empirical Indus Basin hydrological cascade: Changing upstream water stress deterministically drives crop yields & food insecurity.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              audioService.playClick();
              setShowMethodology(true);
            }}
            className="px-3 py-1.5 rounded-lg border border-neon/40 bg-neon/10 hover:bg-neon/20 text-neon text-xs font-display tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <BookOpen size={13} /> How the Cascade Works
          </button>
          <button
            onClick={handleAskCopilot}
            className="btn-neon text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <Sparkles size={13} /> AI Interpret Telemetry
          </button>
        </div>
      </div>

      {/* Scenario Presets Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-display text-[10px] tracking-widest text-muted-foreground uppercase flex items-center gap-1.5">
            <Sliders size={12} className="text-neon" /> SELECT SCENARIO MODE:
          </span>
          <span className="text-[11px] font-mono text-neon">
            Active: <strong className="font-bold">{cascadeResult.scenarioTitle}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(["baseline", "increased_stress", "intervention", "custom"] as SimulationScenario[]).map((s) => {
            const isSelected = scenario === s;
            const preset = s !== "custom" ? SCENARIO_PRESETS[s] : null;

            return (
              <button
                key={s}
                onClick={() => handleScenarioChange(s)}
                className={`p-2.5 rounded-xl text-left border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? "bg-neon/15 border-neon shadow-[0_0_15px_rgba(0,255,204,0.2)]"
                    : "bg-background/40 border-border/50 hover:bg-muted/30 hover:border-border"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-display text-xs font-bold ${
                        isSelected ? "text-neon" : "text-foreground"
                      }`}
                    >
                      {s === "baseline"
                        ? "1. Baseline (Status Quo)"
                        : s === "increased_stress"
                          ? "2. Increased Stress"
                          : s === "intervention"
                            ? "3. High Intervention"
                            : "4. Custom Parameters"}
                    </span>
                    {preset && (
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {preset.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {preset
                      ? preset.description
                      : "User-defined custom water stress, policy intervention, and year horizon."}
                  </p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-border/30 flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                  <span>Stress: {s !== "custom" && preset ? preset.waterStress : waterStress}%</span>
                  <span>Intervention: {s !== "custom" && preset ? preset.intervention : intervention}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Sliders Grid */}
      <div className="grid md:grid-cols-3 gap-4 p-4 rounded-xl bg-background/50 border border-border/60">
        {/* Slider 1: Water Stress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-display font-bold text-foreground flex items-center gap-1.5">
              <Droplets size={14} className="text-blue-400" />
              WATER STRESS INDEX:
            </label>
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                waterStress > 75
                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                  : waterStress > 55
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              }`}
            >
              {waterStress}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="1"
            value={waterStress}
            onChange={(e) => handleWaterStressSlider(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg bg-muted appearance-none cursor-pointer accent-neon"
          />
          <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
            <span>Low (10%)</span>
            <span>Baseline (68%)</span>
            <span>Extreme (100%)</span>
          </div>
        </div>

        {/* Slider 2: Intervention */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-display font-bold text-foreground flex items-center gap-1.5">
              <Sparkles size={14} className="text-neon" />
              POLICY / TECH INTERVENTION:
            </label>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neon/15 text-neon border border-neon/30">
              {intervention}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={intervention}
            onChange={(e) => handleInterventionSlider(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg bg-muted appearance-none cursor-pointer accent-neon"
          />
          <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
            <span>None (0%)</span>
            <span>Lining + Drip (50%)</span>
            <span>Full Modernization (100%)</span>
          </div>
        </div>

        {/* Slider 3: Target Year */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-display font-bold text-foreground flex items-center gap-1.5">
              <RotateCcw size={14} className="text-purple-400" />
              TIME HORIZON:
            </label>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Year {targetYear}
            </span>
          </div>
          <input
            type="range"
            min="2026"
            max="2040"
            step="1"
            value={targetYear}
            onChange={(e) => setTargetYear(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg bg-muted appearance-none cursor-pointer accent-neon"
          />
          <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
            <span>2026 (Immediate)</span>
            <span>2033 (Mid-term)</span>
            <span>2040 (Long-term)</span>
          </div>
        </div>
      </div>

      {/* THE 3-STAGE CASCADE VISUAL FLOW */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-display text-xs tracking-widest text-neon uppercase">
            // LIVE CASCADE SIMULATION FLOW (STEP 1 ➔ STEP 2 ➔ STEP 3)
          </p>
          <span className="text-[10px] font-mono text-muted-foreground">
            Audit Hash: <span className="text-neon">{cascadeResult.reproducibilityHash}</span>
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 relative">
          {/* STEP 1: WATER */}
          <div className="p-4 rounded-xl bg-background/60 border border-blue-500/30 flex flex-col justify-between space-y-4 relative">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <Droplets size={14} /> 1. WATER HYDROLOGY
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  INPUT STAGE
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Indus Basin freshwater allocation & canal head releases.
              </p>
            </div>

            <div className="space-y-2.5">
              {cascadeResult.steps[0]?.metrics.map((m) => (
                <MetricRow
                  key={m.id}
                  metric={m}
                  onClick={() => setActiveMetricTooltip(m)}
                />
              ))}
            </div>

            <div className="pt-2 border-t border-border/30 text-[10px] text-muted-foreground flex items-center justify-between font-mono">
              <span>Transfer Function:</span>
              <span className="text-blue-400 font-bold">ΔCanal Release ➔ Crop Zone</span>
            </div>
          </div>

          {/* STEP 2: AGRICULTURE */}
          <div className="p-4 rounded-xl bg-background/60 border border-amber-500/30 flex flex-col justify-between space-y-4 relative">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Wheat size={14} /> 2. AGRICULTURAL PRESSURE
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  CALCULATED (FAO-33)
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Root-zone moisture deficits driving staple crop yield losses.
              </p>
            </div>

            <div className="space-y-2.5">
              {cascadeResult.steps[1]?.metrics.map((m) => (
                <MetricRow
                  key={m.id}
                  metric={m}
                  onClick={() => setActiveMetricTooltip(m)}
                />
              ))}
            </div>

            <div className="pt-2 border-t border-border/30 text-[10px] text-muted-foreground flex items-center justify-between font-mono">
              <span>Transfer Function:</span>
              <span className="text-amber-400 font-bold">Yield Reduction ➔ Food Balances</span>
            </div>
          </div>

          {/* STEP 3: FOOD SECURITY */}
          <div className="p-4 rounded-xl bg-background/60 border border-emerald-500/30 flex flex-col justify-between space-y-4 relative">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldAlert size={14} /> 3. FOOD SECURITY OUTCOME
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  DOWNSTREAM OUTCOME
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                National food insecurity rate, caloric deficits & price spikes.
              </p>
            </div>

            <div className="space-y-2.5">
              {cascadeResult.steps[2]?.metrics.map((m) => (
                <MetricRow
                  key={m.id}
                  metric={m}
                  onClick={() => setActiveMetricTooltip(m)}
                />
              ))}
            </div>

            <div className="pt-2 border-t border-border/30 text-[10px] text-muted-foreground flex items-center justify-between font-mono">
              <span>Composite Resilience:</span>
              <span
                className={`font-bold ${
                  cascadeResult.compositeResilienceScore >= 60
                    ? "text-emerald-400"
                    : cascadeResult.compositeResilienceScore >= 40
                      ? "text-amber-400"
                      : "text-red-400"
                }`}
              >
                {cascadeResult.compositeResilienceScore}/100 ({cascadeResult.overallStatus.toUpperCase()})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Summary Strip */}
      <div className="p-4 rounded-xl bg-muted/20 border border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              cascadeResult.overallStatus === "healthy"
                ? "bg-emerald-500/20 text-emerald-400"
                : cascadeResult.overallStatus === "moderate"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-red-500/20 text-red-400"
            }`}
          >
            {cascadeResult.overallStatus === "healthy" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}
          </div>
          <div>
            <p className="font-display font-bold text-foreground">
              {scenario === "intervention"
                ? "Resilience Gains: Agricultural modernization stabilizes wheat supply"
                : scenario === "increased_stress"
                  ? "Crisis Escalation: Compounded water stress pushes food insecurity to critical threshold"
                  : "Status Quo: Incremental yield decay under structural groundwater deficit"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              At Water Stress <strong>{waterStress}%</strong> and Intervention <strong>{intervention}%</strong>, national food insecurity is projected at <strong>{cascadeResult.food.nationalFoodInsecurityRatePct.displayValue}</strong> with <strong>{cascadeResult.food.stapleGrainProductionMT.displayValue}</strong> harvest.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleScenarioChange("baseline")}
            className="px-3 py-1 rounded-lg border border-border hover:bg-muted/40 text-[11px] font-display text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <RotateCcw size={11} /> Reset Baseline
          </button>
        </div>
      </div>

      {/* Active Metric Tooltip / Detail Modal */}
      <AnimatePresence>
        {activeMetricTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="p-4 rounded-xl bg-background border border-neon/40 shadow-xl space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-foreground">
                  {activeMetricTooltip.name}
                </span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                    activeMetricTooltip.classification === "REAL DATA"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                  }`}
                >
                  {activeMetricTooltip.classification}
                </span>
              </div>
              <button
                onClick={() => setActiveMetricTooltip(null)}
                className="text-muted-foreground hover:text-foreground text-[11px]"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-muted-foreground">{activeMetricTooltip.description}</p>
            <div className="grid md:grid-cols-2 gap-2 pt-1 text-[11px] font-mono text-muted-foreground bg-muted/30 p-2.5 rounded-lg">
              <div>
                <strong className="text-foreground">Source / Authority:</strong> {activeMetricTooltip.source}
              </div>
              <div>
                <strong className="text-foreground">Calculation Method:</strong> {activeMetricTooltip.methodology}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Methodology Modal */}
      <CascadeMethodologyModal
        open={showMethodology}
        onClose={() => setShowMethodology(false)}
      />
    </div>
  );
}

function MetricRow({
  metric,
  onClick,
}: {
  metric: MetricDataPoint;
  onClick: () => void;
}) {
  const isReal = metric.classification === "REAL DATA";

  return (
    <div
      onClick={onClick}
      className="p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border/40 hover:border-border transition-all cursor-pointer group flex items-center justify-between gap-2"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-display text-[11px] font-bold text-foreground truncate group-hover:text-neon transition-colors">
            {metric.name}
          </span>
          <span
            className={`text-[8px] font-mono px-1 py-0.2 rounded shrink-0 ${
              isReal
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
            }`}
          >
            {isReal ? "REAL DATA" : "MODELED"}
          </span>
        </div>
        <p className="text-[9px] font-mono text-muted-foreground truncate">{metric.source}</p>
      </div>

      <div className="text-right shrink-0">
        <span
          className={`font-mono text-xs font-bold ${
            metric.status === "critical"
              ? "text-red-400"
              : metric.status === "warning"
                ? "text-amber-400"
                : metric.status === "optimal"
                  ? "text-emerald-400"
                  : "text-foreground"
          }`}
        >
          {metric.displayValue}
        </span>
        <div className="text-[9px] font-mono text-muted-foreground flex items-center justify-end gap-0.5">
          {metric.deltaFromBaseline > 0 ? (
            <span className="text-red-400 flex items-center">
              +{metric.deltaFromBaseline}
            </span>
          ) : metric.deltaFromBaseline < 0 ? (
            <span className="text-emerald-400 flex items-center">
              {metric.deltaFromBaseline}
            </span>
          ) : (
            <span>Base</span>
          )}
        </div>
      </div>
    </div>
  );
}
