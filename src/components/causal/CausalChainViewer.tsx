import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import {
  GitMerge,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Eye,
  Brain,
  Cpu,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { fetchCausalChain } from "@/lib/ai-analysis.functions";
import type { CausalChain } from "@/lib/earth-memory";
import { generateCausalChain } from "@/lib/earth-memory";
import { usePlanetState } from "@/lib/game-store";
import { audioService } from "@/services/audioService";

interface Props {
  category?: string;
  eventTitle?: string;
  country?: string;
  city?: string;
}

export function CausalChainViewer({ category, eventTitle, country, city }: Props) {
  const planet = usePlanetState();
  const effectiveCategory = category ?? planet.mission?.scenarioKey ?? "climate";
  const effectiveEventTitle =
    eventTitle ?? planet.mission?.scenarioTitle ?? "Climate & Ecological Vulnerability";
  const effectiveCountry = country ?? planet.region.country ?? "Global";
  const effectiveCity = city ?? planet.activeCity ?? "Regional Focus";

  const [chain, setChain] = useState<CausalChain>(() =>
    generateCausalChain(effectiveCategory, effectiveEventTitle, effectiveCountry, effectiveCity),
  );
  const [loading, setLoading] = useState(false);
  const getChain = useServerFn(fetchCausalChain);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await getChain({
          data: {
            category: effectiveCategory,
            eventTitle: effectiveEventTitle,
            country: effectiveCountry,
            city: effectiveCity,
          },
        });
        if (!cancelled && res && res.nodes && res.nodes.length > 0) {
          setChain(res);
        } else if (!cancelled) {
          setChain(
            generateCausalChain(
              effectiveCategory,
              effectiveEventTitle,
              effectiveCountry,
              effectiveCity,
            ),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setChain(
            generateCausalChain(
              effectiveCategory,
              effectiveEventTitle,
              effectiveCountry,
              effectiveCity,
            ),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [effectiveCategory, effectiveEventTitle, effectiveCountry, effectiveCity, getChain]);

  const nodes = chain?.nodes ?? [];

  return (
    <div className="holo-panel rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <GitMerge size={16} className="text-neon" />
          <h3 className="font-display text-xs tracking-[0.3em] text-neon">
            // CAUSE & EFFECT ENGINE · CAUSAL CHAIN
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display text-[9px] tracking-widest px-2 py-0.5 rounded-full border border-neon/40 text-neon bg-primary/10">
            SYSTEMIC CASCADE
          </span>
          {loading && <RefreshCw size={12} className="animate-spin text-neon" />}
        </div>
      </div>

      {/* Root Cause Banner */}
      <div className="p-3.5 hud-corner rounded-lg bg-danger/10 border border-danger/40 space-y-1">
        <div className="flex items-center gap-2 font-display text-[10px] tracking-widest text-danger">
          <AlertTriangle size={12} /> ROOT CAUSE TRIGGER ({effectiveCountry.toUpperCase()})
        </div>
        <p className="text-xs text-foreground font-medium">
          {chain?.rootCause ?? `Compound environmental anomalies in ${effectiveCountry}`}
        </p>
      </div>

      {/* Interactive Causal Chain Nodes */}
      <div className="space-y-2.5">
        <p className="font-display text-[9px] tracking-widest text-muted-foreground">
          PROPAGATION PATHWAY (OBSERVED ➔ INFERRED ➔ SIMULATED)
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2 relative">
          {nodes.map((node, i) => {
            const isObserved = node.type === "Observed";
            const isInferred = node.type === "AI-Inferred";

            return (
              <motion.div
                key={node.id || `node-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-3 rounded-lg border hud-corner relative flex flex-col justify-between ${
                  isObserved
                    ? "bg-primary/5 border-primary/40"
                    : isInferred
                      ? "bg-warning/5 border-warning/40"
                      : "bg-danger/5 border-danger/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`font-display text-[8px] tracking-widest px-1.5 py-0.5 rounded ${
                        isObserved
                          ? "bg-primary/20 text-neon"
                          : isInferred
                            ? "bg-warning/20 text-warning"
                            : "bg-danger/20 text-danger"
                      }`}
                    >
                      {(node.type || "SIMULATED").toUpperCase()}
                    </span>
                    <span className="font-display text-[8px] text-muted-foreground">
                      STEP 0{i + 1}
                    </span>
                  </div>
                  <h4 className="font-display text-xs text-foreground font-semibold mb-1">
                    {node.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {node.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[9px] font-mono">
                  <span className="text-muted-foreground">SEVERITY:</span>
                  <span
                    className={`font-bold ${
                      node.severity === "high"
                        ? "text-danger"
                        : node.severity === "medium"
                          ? "text-warning"
                          : "text-success"
                    }`}
                  >
                    {(node.severity || "medium").toUpperCase()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Current vs Future Impact & Action */}
      <div className="grid md:grid-cols-3 gap-3 text-xs pt-2">
        <div className="p-3 rounded-lg bg-background/50 border border-border/50 hud-corner space-y-1">
          <span className="font-display text-[9px] tracking-widest text-warning flex items-center gap-1.5">
            <Eye size={12} /> CURRENT IMPACT
          </span>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            {chain?.currentImpact ?? `Critical infrastructure load elevated in ${effectiveCity}.`}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-background/50 border border-border/50 hud-corner space-y-1">
          <span className="font-display text-[9px] tracking-widest text-danger flex items-center gap-1.5">
            <Zap size={12} /> PROJECTED FUTURE IMPACT
          </span>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            {chain?.futureImpact ??
              `Potential secondary cascading stress on health and supply lines in ${effectiveCountry}.`}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-primary/10 border border-neon/40 hud-corner space-y-1">
          <span className="font-display text-[9px] tracking-widest text-neon flex items-center gap-1.5">
            <ShieldCheck size={12} /> RECOMMENDED ACTION
          </span>
          <p className="text-foreground text-[11px] font-medium leading-relaxed">
            {chain?.recommendedAction ??
              "Deploy automated bypass channels and pre-position emergency response reserves."}
          </p>
        </div>
      </div>
    </div>
  );
}
