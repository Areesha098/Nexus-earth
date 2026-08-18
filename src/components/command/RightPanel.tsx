import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, Sparkles, ShieldAlert } from "lucide-react";
import { HUDStat } from "@/components/HUDStat";
import { usePlanetState, type StatKey } from "@/lib/game-store";
import { buildAgents } from "@/components/agents/agents-data";
import { threatFrom } from "@/lib/scenario";
import { ReportButton } from "@/components/report/ReportButton";
import { Chip } from "@/components/command/LeftPanel";

const ORDER: StatKey[] = ["climate", "water", "food", "health", "energy", "economy"];

export function RightPanel({
  preview,
  pulseKeys,
}: {
  preview?: Partial<Record<StatKey, number>> | null;
  pulseKeys?: StatKey[];
}) {
  const { localStats, regionAvg, history, year, region, news } = usePlanetState();
  const threat = threatFrom(regionAvg);

  const agents = useMemo(() => buildAgents(localStats, history, year), [localStats, history, year]);
  const recommendations = useMemo(
    () => [...agents].sort((a, b) => a.index - b.index).slice(0, 3),
    [agents],
  );

  return (
    <div className="space-y-3">
      <div className="holo-panel rounded-xl p-4 flex items-center justify-between">
        <p className="font-display text-[10px] tracking-widest text-neon animate-flicker">
          // LIVE INDICATORS
        </p>
        <span className={`font-display text-[10px] tracking-widest ${threat.tone}`}>
          RISK {threat.label}
        </span>
      </div>

      <div className="space-y-2">
        {ORDER.map((k) => (
          <HUDStat
            key={k}
            id={k}
            value={localStats[k]}
            {...(preview?.[k] !== undefined ? { preview: preview[k] as number } : {})}
            pulse={pulseKeys?.includes(k) ?? false}
          />
        ))}
      </div>

      {/* AI recommendations */}
      <div className="holo-panel rounded-xl p-4">
        <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <Sparkles size={12} className="text-neon" /> AI RECOMMENDATIONS
        </p>
        <ul className="space-y-2">
          {recommendations.map((a) => (
            <li key={a.id} className="text-[11px] leading-snug flex gap-2">
              <ShieldAlert size={11} className="text-neon shrink-0 mt-0.5" />
              <span>
                <span className="font-display text-neon">{a.name}</span> — {a.action}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip label="SECTOR" value={region.name.toUpperCase()} />
          <Chip
            label="CONFIDENCE"
            value={`${Math.round(agents.reduce((s, a) => s + a.confidence, 0) / Math.max(1, agents.length))}%`}
            tone="text-neon"
          />
        </div>
      </div>

      {/* Live news */}
      <div className="holo-panel rounded-xl p-4">
        <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <Newspaper size={12} className="text-neon" /> LIVE GLOBAL NEWS
        </p>
        {news.length === 0 && (
          <p className="text-[11px] text-muted-foreground">Newswire quiet. Run a simulation.</p>
        )}
        <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {news.map((n) => (
              <motion.li
                key={n.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[11px] leading-snug flex gap-2 border-b border-border/40 pb-2 last:border-0"
              >
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full shrink-0"
                  style={{
                    background:
                      n.tone === "good"
                        ? "var(--success)"
                        : n.tone === "bad"
                          ? "var(--danger)"
                          : "var(--neon)",
                  }}
                />
                <span className="text-muted-foreground">{n.text}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      <div className="holo-panel rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="font-display text-[10px] tracking-widest text-muted-foreground">
            AI DECISION REPORT
          </p>
          <p className="text-[11px] text-muted-foreground">PDF · charts · agent analysis</p>
        </div>
        <ReportButton />
      </div>
    </div>
  );
}
