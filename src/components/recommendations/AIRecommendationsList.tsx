import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import {
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Target,
  CheckCircle2,
} from "lucide-react";
import { fetchFiveRecommendations } from "@/lib/ai-analysis.functions";
import type { AIRecommendationItem, FiveRecommendationsResult } from "@/services/aiService";
import { usePlanetState } from "@/lib/game-store";
import { audioService } from "@/services/audioService";

interface Props {
  onSelectAction?: (title: string) => void;
}

export function AIRecommendationsList({ onSelectAction }: Props) {
  const { localStats, year, region, mission } = usePlanetState();
  const [data, setData] = useState<FiveRecommendationsResult | null>(null);
  const [loading, setLoading] = useState(false);

  const getRecs = useServerFn(fetchFiveRecommendations);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const res = await getRecs({
        data: {
          stats: localStats,
          year,
          country: region.country,
          city: region.city,
          eventTitle: mission?.scenarioTitle,
        },
      });
      setData(res);
    } catch (e) {
      console.warn("Failed to fetch 5 AI recommendations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, region.id, mission?.scenarioKey]);

  return (
    <div className="holo-panel rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-neon animate-pulse" />
          <h3 className="font-display text-xs tracking-[0.3em] text-neon">
            // STRATEGIC AI RECOMMENDATIONS (TOP 5)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              audioService.playClick();
              void loadRecommendations();
            }}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1 rounded hud-corner text-[10px] font-display text-muted-foreground hover:text-neon disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={11} className={loading ? "animate-spin text-neon" : ""} />
            {loading ? "GENERATING..." : "REFRESH"}
          </button>
          <span className="font-display text-[9px] tracking-widest px-2 py-0.5 rounded border text-success border-success/40 bg-success/10 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
            LIVE AI RECOMMENDATIONS
          </span>
        </div>
      </div>

      {data?.rationale && (
        <p className="text-xs text-muted-foreground italic font-display border-l-2 border-neon/50 pl-3">
          "{data.rationale}"
        </p>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-border/40 bg-muted/10 animate-pulse space-y-2"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 bg-muted/40 rounded w-1/3" />
                <div className="h-3 bg-muted/40 rounded w-16" />
              </div>
              <div className="h-3 bg-muted/40 rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Recommendations list */}
      {!loading && data && (
        <div className="space-y-2.5">
          {data.recommendations.map((rec, i) => {
            const isCritical = rec.priority === "CRITICAL";
            const isHigh = rec.priority === "HIGH";

            return (
              <motion.div
                key={rec.id || i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`p-3.5 rounded-lg border hud-corner transition-all relative group ${
                  isCritical
                    ? "bg-danger/5 border-danger/40 hover:border-danger"
                    : isHigh
                      ? "bg-warning/5 border-warning/40 hover:border-warning"
                      : "bg-background/40 border-border/50 hover:border-neon/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[10px] font-bold text-neon">0{i + 1}</span>
                    <h4 className="font-display text-xs font-bold text-foreground">{rec.title}</h4>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`font-display text-[8px] tracking-widest px-2 py-0.5 rounded font-bold ${
                        isCritical
                          ? "bg-danger/20 text-danger border border-danger/40"
                          : isHigh
                            ? "bg-warning/20 text-warning border border-warning/40"
                            : "bg-primary/20 text-neon border border-primary/40"
                      }`}
                    >
                      {rec.priority}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {rec.confidence}% CONF
                    </span>
                  </div>
                </div>

                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {rec.explanation}
                </p>

                <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between flex-wrap gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5 text-success">
                    <TrendingUp size={12} />
                    <span className="font-medium">{rec.expectedImpact}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {rec.affectedIndicators.map((ind) => (
                      <span
                        key={ind}
                        className="font-display text-[8px] tracking-widest px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground uppercase"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>

                {onSelectAction && (
                  <button
                    onClick={() => {
                      audioService.playClick();
                      onSelectAction(rec.title);
                    }}
                    className="mt-2 w-full py-1 text-center font-display text-[9px] tracking-widest text-neon hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    SELECT DIRECTIVE ➔
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
