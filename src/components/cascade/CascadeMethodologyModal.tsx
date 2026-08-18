import { motion } from "framer-motion";
import { X, BookOpen, Database, Calculator, GitBranch, ShieldCheck, AlertCircle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CascadeMethodologyModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto holo-panel rounded-2xl p-6 md:p-8 space-y-6 border border-neon/40 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neon/10 border border-neon/40 text-neon">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                How the Cascade Works · Methodology & Empirical Grounding
              </h2>
              <p className="text-xs text-muted-foreground">
                Deterministic Indus Basin Water → Agriculture → Food Security Causal Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Disclaimer Banner */}
        <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 flex items-start gap-3 text-xs text-foreground">
          <ShieldCheck size={18} className="text-neon shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-neon font-display tracking-wider">
              DECISION-SUPPORT MODEL DISCLAIMER
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This simulation is a deterministic decision-support model designed for stress-testing policy interventions and compound environmental shocks. It does not claim absolute meteorological or econometric forecasting accuracy. Every metric is categorized as either <strong>REAL DATA</strong> (benchmarked from verified public repositories) or <strong>MODELED OUTPUT</strong> (derived from agronomic yield equations).
            </p>
          </div>
        </div>

        {/* 3 Step Mathematical Chain */}
        <div className="space-y-4">
          <h3 className="font-display text-xs tracking-widest text-neon uppercase flex items-center gap-2">
            <Calculator size={14} /> The 3-Stage Mathematical Cascade
          </h3>

          <div className="space-y-3 text-xs">
            {/* Stage 1 */}
            <div className="p-4 rounded-xl bg-background/50 border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-neon">STAGE 1: Water Stress & Hydrology</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  REAL BENCHMARK: PCRWR & IRSA
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Inputs water stress index (0-100) and technological intervention. Computes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1 font-mono text-[11px]">
                <li><strong className="text-foreground">Per Capita Water:</strong> Baseline 860 m³/yr adjusted for 1.6%/yr population pressure and aquifer recharge.</li>
                <li><strong className="text-foreground">Canal Deficit (%):</strong> Diverted water shortage against historic 114 MAF Indus Basin allocation: <span className="text-neon">Deficit = (Stress × 0.42) - (Intervention × 0.28) + (YearDelta × 0.35)</span>.</li>
                <li><strong className="text-foreground">Groundwater Depletion:</strong> Annual water table drop across sweet-water Indus zone (m/yr).</li>
              </ul>
            </div>

            {/* Stage 2 */}
            <div className="p-4 rounded-xl bg-background/50 border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-neon">STAGE 2: Irrigation & Agricultural Pressure</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  FAO-33 YIELD EQUATION
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Implements the standard FAO Crop-Water Production function: <span className="text-neon font-mono">(1 - Ya/Ym) = Ky × (1 - ETa/ETm)</span>:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1 font-mono text-[11px]">
                <li><strong className="text-foreground">Wheat Yield Loss:</strong> Rabi staple sensitivity factor <span className="text-neon">Ky = 1.05</span>.</li>
                <li><strong className="text-foreground">Rice Yield Loss:</strong> Kharif high-water duty sensitivity factor <span className="text-neon">Ky = 1.20</span>.</li>
                <li><strong className="text-foreground">Stressed Acreage:</strong> Cultivated canal command area (out of 19.5M Ha total) under acute moisture stress.</li>
              </ul>
            </div>

            {/* Stage 3 */}
            <div className="p-4 rounded-xl bg-background/50 border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-neon">STAGE 3: Food Security & Socioeconomic Outcomes</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  PBS & WFP ELASTICITY
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Computes national food availability, caloric balances, and price inflation:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1 font-mono text-[11px]">
                <li><strong className="text-foreground">Total Grain Harvest:</strong> Modeled national wheat + rice tonnage (Baseline ~37.0 MT; domestic requirement ~32.5 MT).</li>
                <li><strong className="text-foreground">Food Insecurity (%):</strong> Real baseline 38.5% (PBS 2024), scaled deterministically by grain harvest deficit and policy buffers.</li>
                <li><strong className="text-foreground">Caloric Deficit:</strong> Average per capita intake shortfall against WHO 2,350 kcal baseline.</li>
                <li><strong className="text-foreground">Food Inflation Index:</strong> Consumer Price Index pressure derived from grain supply elasticity (-0.45).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Real Data Sources Table */}
        <div className="space-y-3">
          <h3 className="font-display text-xs tracking-widest text-neon uppercase flex items-center gap-2">
            <Database size={14} /> Traceable Public Data Sources
          </h3>
          <div className="border border-border/60 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/40 text-muted-foreground text-[10px] font-display tracking-wider">
                <tr>
                  <th className="p-2.5">Institution / Agency</th>
                  <th className="p-2.5">Dataset & Metric</th>
                  <th className="p-2.5">Real Baseline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-muted-foreground">
                <tr>
                  <td className="p-2.5 font-bold text-foreground">PCRWR</td>
                  <td className="p-2.5">National Water Scarcity & Aquifer Depletion</td>
                  <td className="p-2.5 font-mono text-neon">860 m³/person/yr · -0.65m/yr GWA</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-foreground">IRSA / WAPDA</td>
                  <td className="p-2.5">Indus Basin Canal Diversion & Reservoir Levels</td>
                  <td className="p-2.5 font-mono text-neon">104 MAF Canal Release / 114 MAF historic</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-foreground">PBS (Pakistan Bureau of Statistics)</td>
                  <td className="p-2.5">National Nutrition & Food Insecurity Prevalence</td>
                  <td className="p-2.5 font-mono text-neon">38.5% moderate-to-severe food stress</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-foreground">Ministry of National Food Security</td>
                  <td className="p-2.5">Annual Staple Grain Harvest (Wheat & Rice)</td>
                  <td className="p-2.5 font-mono text-neon">~28.0 MT Wheat · ~9.0 MT Rice</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-foreground">FAO (Irrigation Paper 33)</td>
                  <td className="p-2.5">Crop Yield Response Factor (Ky)</td>
                  <td className="p-2.5 font-mono text-neon">Ky = 1.05 (Wheat), Ky = 1.20 (Rice)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Reproducibility & AI Rule */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border/60 flex items-start gap-3 text-xs">
          <AlertCircle size={16} className="text-neon shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-foreground font-display">100% DETERMINISTIC EXECUTION GUARANTEE</p>
            <p className="text-muted-foreground">
              Every slider adjustment executes pure deterministic algebraic and agronomic equations. Gemini/AI never fabricates numerical values. When you query the AI Copilot, it receives the exact calculated telemetry snapshot to explain causal mechanisms and suggest executive decisions.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="btn-neon text-xs px-6 py-2">
            Close Methodology Inspector
          </button>
        </div>
      </motion.div>
    </div>
  );
}
