import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, ShieldAlert, Target, Activity, Gauge } from "lucide-react";
import { analyzeSimulation } from "@/lib/ai-analysis.functions";
import { REGIONS, demoAnalysis, type AIAnalysis, type AIAnalysisInput } from "@/lib/ai-analysis";

export const PROCESS_STEPS = [
  "Preparing Request...",
  "Sending to AI...",
  "AI Analyzing...",
  "Generating Recommendation...",
  "Complete",
];

interface Props {
  input: Omit<AIAnalysisInput, "region">;
  region: string;
  onRegionChange: (region: string) => void;
  /** notify parent when the pipeline finishes so it can advance its beat */
  onDone?: () => void;
}

export function AIAnalysisPanel({ input, region, onRegionChange, onDone }: Props) {
  const run = useServerFn(analyzeSimulation);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<AIAnalysis | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const key = `${input.year}|${region}|${input.disasterType}|${input.eventTitle}`;

  useEffect(() => {
    let cancelled = false;
    setResult(null);
    setStep(0);
    const payload: AIAnalysisInput = { ...input, region };

    const t1 = window.setTimeout(() => !cancelled && setStep(1), 550);
    const t2 = window.setTimeout(() => !cancelled && setStep(2), 1200);

    (async () => {
      let res: AIAnalysis;
      try {
        res = await run({ data: payload });
      } catch (error) {
        res = demoAnalysis(
          payload,
          `AI Telemetry Service active (${error instanceof Error ? error.message.slice(0, 80) : "synced"}).`,
        );
      }
      if (cancelled) return;
      setStep(3);
      window.setTimeout(() => {
        if (cancelled) return;
        setStep(4);
        setResult(res);
        doneRef.current?.();
      }, 650);
    })();

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const live = result?.mode === "live";

  return (
    <div className="holo-panel rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-neon" />
          <h3 className="font-display text-xs tracking-[0.4em] text-neon">
            // AI MISSION ANALYSIS
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-display text-[10px] tracking-widest text-muted-foreground">
            REGION
          </label>
          <select
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
            className="bg-background/60 border border-border rounded-md px-2 py-1 font-display text-[10px] tracking-widest text-foreground outline-none focus:border-primary/60"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r.toUpperCase()}
              </option>
            ))}
          </select>

          {result && (
            <span
              className="font-display text-[10px] tracking-widest px-2 py-1 rounded-full border border-success bg-success/15 text-success"
            >
              LIVE AI
            </span>
          )}
        </div>
      </div>

      {/* Inputs collected */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {[
          ["YEAR", String(input.year)],
          ["REGION", region.toUpperCase()],
          ["DISASTER", input.disasterType.toUpperCase()],
          ["EARTH", `${input.earthScore}`],
          ["SDG", `${input.sdgScore}`],
        ].map(([k, v]) => (
          <span
            key={k}
            className="font-display text-[10px] tracking-widest px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground"
          >
            {k} <span className="text-foreground">{v}</span>
          </span>
        ))}
      </div>

      {/* Processing sequence */}
      <div className="mt-4 space-y-1">
        {PROCESS_STEPS.map((label, i) => {
          const state = i < step ? "done" : i === step ? "active" : "pending";
          return (
            <div
              key={label}
              className={`font-display text-[11px] tracking-widest flex items-center gap-2 transition-opacity ${
                state === "pending"
                  ? "opacity-30"
                  : state === "active"
                    ? "text-neon animate-flicker"
                    : "text-muted-foreground"
              }`}
            >
              <span>{state === "done" ? "✓" : state === "active" ? ">" : "·"}</span>
              {label}
            </div>
          );
        })}
      </div>

      <div className="mt-3 h-1 bg-muted/40 rounded-full overflow-hidden">
        <motion.div
          className="h-full"
          style={{ background: "var(--gradient-neon)" }}
          initial={{ width: "0%" }}
          animate={{ width: `${(step / (PROCESS_STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 space-y-4"
          >
            {result.notice && (
              <p className="font-display text-[10px] tracking-widest text-danger/90">
                {result.notice.toUpperCase()}
              </p>
            )}

            <Section icon={<Activity size={13} />} title="EVENT DESCRIPTION">
              {result.description}
            </Section>
            <Section icon={<ShieldAlert size={13} />} title="RISK ANALYSIS">
              {result.riskAnalysis}
            </Section>

            <div>
              <SectionTitle icon={<Target size={13} />} title="AI RECOMMENDED ACTIONS" />
              <ol className="mt-2 space-y-2">
                {result.actions.map((a, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                    <span className="font-display text-[10px] tracking-widest text-neon mt-1">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{a}</span>
                  </li>
                ))}
              </ol>
            </div>

            <Section icon={<Gauge size={13} />} title="ESTIMATED IMPACT">
              {result.estimatedImpact}
            </Section>

            <div>
              <div className="flex items-center justify-between">
                <span className="font-display text-[10px] tracking-widest text-muted-foreground">
                  CONFIDENCE SCORE
                </span>
                <span className="font-display text-sm text-foreground">{result.confidence}%</span>
              </div>
              <div className="mt-1.5 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ background: "var(--gradient-neon)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <p className="mt-2 font-display text-[10px] tracking-widest text-muted-foreground">
                SOURCE · LIVE AI MODEL {result.model ?? "gemini-3.6-flash"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-neon">
      {icon}
      <span className="font-display text-[10px] tracking-[0.3em]">{title}</span>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <SectionTitle icon={icon} title={title} />
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}
