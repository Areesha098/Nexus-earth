import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import {
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  Activity,
} from "lucide-react";
import { usePlanetState, type StatKey } from "@/lib/game-store";
import { audioService } from "@/services/audioService";

interface Props {
  onContinue: () => void;
}

export function DecisionResultModal({ onContinue }: Props) {
  const { lastDecisionResult, clearLastDecisionResult } = usePlanetState();

  useEffect(() => {
    if (lastDecisionResult) {
      audioService.playSimulationComplete();
    }
  }, [lastDecisionResult]);

  if (!lastDecisionResult) return null;

  const {
    eventTitle,
    choiceLabel,
    country,
    city,
    year,
    previousStats,
    newStats,
    effects,
    earthScoreBefore,
    earthScoreAfter,
    sdgScoreBefore,
    sdgScoreAfter,
    explanation,
    memoryLinkage,
  } = lastDecisionResult;

  const earthDelta = earthScoreAfter - earthScoreBefore;
  const isOverallGood = earthDelta >= 0;

  const effectKeys = (Object.keys(effects) as StatKey[]).filter(
    (k) => effects[k] !== undefined && effects[k] !== 0,
  );

  const handleClose = () => {
    audioService.playClick();
    clearLastDecisionResult();
    onContinue();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="w-full max-w-xl holo-panel rounded-2xl p-6 border neon-border shadow-2xl space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isOverallGood ? "bg-success animate-pulse" : "bg-warning animate-pulse"
                }`}
              />
              <span className="font-display text-xs tracking-[0.3em] text-neon">
                // SIMULATION OUTCOME · YEAR {year}
              </span>
            </div>
            <span className="font-display text-[10px] tracking-widest text-muted-foreground">
              {country.toUpperCase()} · {city.toUpperCase()}
            </span>
          </div>

          {/* Mission & Decision Banner */}
          <div className="p-3.5 hud-corner rounded-lg bg-background/50 border border-border/60 space-y-1">
            <span className="font-display text-[9px] tracking-widest text-muted-foreground">
              DIRECTIVE EXECUTED FOR: {eventTitle.toUpperCase()}
            </span>
            <h3 className="font-display text-base font-bold text-foreground">"{choiceLabel}"</h3>
          </div>

          {/* Primary Scores Delta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/20 border border-border/40 text-center">
              <span className="font-display text-[9px] tracking-widest text-muted-foreground">
                EARTH SCORE
              </span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="font-display text-lg font-bold text-muted-foreground">
                  {earthScoreBefore}
                </span>
                <ArrowRight size={14} className="text-neon" />
                <span className="font-display text-2xl font-black text-foreground">
                  {earthScoreAfter}
                </span>
                <span
                  className={`font-display text-xs font-bold ${
                    earthDelta >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  ({earthDelta >= 0 ? `+${earthDelta}` : earthDelta}%)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/20 border border-border/40 text-center">
              <span className="font-display text-[9px] tracking-widest text-muted-foreground">
                SDG RESILIENCE
              </span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="font-display text-lg font-bold text-muted-foreground">
                  {sdgScoreBefore}
                </span>
                <ArrowRight size={14} className="text-neon" />
                <span className="font-display text-2xl font-black text-foreground">
                  {sdgScoreAfter}
                </span>
                <span
                  className={`font-display text-xs font-bold ${
                    sdgScoreAfter - sdgScoreBefore >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  (
                  {sdgScoreAfter - sdgScoreBefore >= 0
                    ? `+${sdgScoreAfter - sdgScoreBefore}`
                    : sdgScoreAfter - sdgScoreBefore}
                  %)
                </span>
              </div>
            </div>
          </div>

          {/* Affected Indicators breakdown */}
          <div className="space-y-2">
            <span className="font-display text-[9px] tracking-widest text-muted-foreground">
              INDICATOR TELEMETRY SHIFTS
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {effectKeys.map((k) => {
                const prev = previousStats[k] ?? 50;
                const next = newStats[k] ?? 50;
                const diff = next - prev;
                const isPos = diff >= 0;

                return (
                  <motion.div
                    key={k}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="p-2 rounded bg-background/60 border border-border/50 text-xs"
                  >
                    <div className="flex items-center justify-between text-[9px] font-display text-muted-foreground uppercase">
                      <span>{k}</span>
                      <span className={isPos ? "text-success" : "text-danger"}>
                        {isPos ? `+${diff}%` : `${diff}%`}
                      </span>
                    </div>
                    <div className="font-display text-sm font-bold text-foreground mt-0.5">
                      {prev}% ➔ {next}%
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* AI Explanation */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-1">
            <span className="font-display text-[9px] tracking-widest text-neon flex items-center gap-1">
              <Sparkles size={11} /> AI CAUSAL EXPLANATION
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">{explanation}</p>
          </div>

          {/* Earth Memory Linkage (if triggered) */}
          {memoryLinkage && (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 space-y-1">
              <span className="font-display text-[9px] tracking-widest text-warning flex items-center gap-1">
                <BookOpen size={11} /> EARTH MEMORY LINKAGE
              </span>
              <p className="text-xs text-foreground/90 leading-relaxed font-mono">
                {memoryLinkage}
              </p>
            </div>
          )}

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleClose}
              className="btn-neon w-full sm:w-auto px-6 py-2.5 font-display text-xs tracking-widest flex items-center justify-center gap-2"
            >
              ADVANCE SIMULATION <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
