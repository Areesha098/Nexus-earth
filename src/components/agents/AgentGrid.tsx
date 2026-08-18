import { useState } from "react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { buildAgents, riskColor, type Agent } from "./agents-data";
import { useGame } from "@/lib/game-store";
import { Cpu, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function AgentGrid() {
  const stats = useGame((s) => s.stats);
  const history = useGame((s) => s.history);
  const year = useGame((s) => s.year);
  const [activeId, setActiveId] = useState<string | null>(null);

  const agents = buildAgents(stats, history, year);
  const active = agents.find((a) => a.id === activeId) ?? null;
  const critical = agents.filter((a) => a.risk === "CRITICAL" || a.risk === "HIGH").length;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <Cpu size={16} className="text-neon" />
        <h2 className="font-display text-sm tracking-[0.4em] text-neon">MULTI-AGENT AI COUNCIL</h2>
        <div className="h-px flex-1 bg-border" />
        <span className="font-display text-[10px] tracking-widest text-muted-foreground">
          {agents.length} SPECIALISTS + SYNTHESIS AGENT · {critical} FLAGGED
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {agents.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.button
              key={a.id}
              onClick={() => setActiveId(a.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="holo-panel rounded-xl p-4 text-left transition-shadow hover:neon-border"
            >
              <div className="flex items-start justify-between">
                <div
                  className="rounded-lg p-2"
                  style={{
                    background: "color-mix(in oklab, var(--neon) 12%, transparent)",
                    boxShadow: "0 0 18px color-mix(in oklab, var(--neon) 25%, transparent)",
                  }}
                >
                  <Icon size={18} className="text-neon" />
                </div>
                <span
                  className="flex items-center gap-1.5 rounded-full border border-border/60 px-2 py-0.5 font-display text-[9px] tracking-widest"
                  style={{ color: riskColor(a.risk) }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full animate-pulse"
                    style={{ background: riskColor(a.risk) }}
                  />
                  {a.risk}
                </span>
              </div>

              <p className="mt-3 font-display text-sm font-bold">{a.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.description}</p>

              <div className="mt-3 flex items-baseline gap-2">
                <span
                  className="font-display text-2xl font-black"
                  style={{ color: riskColor(a.risk) }}
                >
                  {Math.round(a.index)}
                </span>
                <span className="text-[10px] text-muted-foreground">/ 100</span>
                <Trend value={a.trend} />
              </div>

              <div className="mt-3">
                <div className="flex justify-between font-display text-[9px] tracking-widest text-muted-foreground">
                  <span>AI CONFIDENCE</span>
                  <span className="text-neon">{a.confidence}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted/60">
                  <motion.div
                    className="h-full"
                    style={{ background: "var(--gradient-neon)" }}
                    initial={false}
                    animate={{ width: `${a.confidence}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActiveId(null)}>
        <SheetContent className="w-full overflow-y-auto border-l border-border/60 bg-background/95 backdrop-blur-xl sm:max-w-md">
          {active && <AgentDetail agent={active} year={year} />}
        </SheetContent>
      </Sheet>
    </section>
  );
}

function AgentDetail({ agent, year }: { agent: Agent; year: number }) {
  const Icon = agent.icon;
  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-3 font-display tracking-widest">
          <Icon size={18} className="text-neon" />
          {agent.name}
        </SheetTitle>
      </SheetHeader>

      <div className="space-y-4 px-4 pb-8">
        <div className="flex items-center justify-between text-[11px] p-2.5 rounded-lg bg-muted/20 border border-border/60">
          <div>
            <span className="font-display text-[9px] text-muted-foreground block">DOMAIN CATEGORY</span>
            <span className="font-semibold text-foreground">{agent.category}</span>
          </div>
          <div className="text-right">
            <span className="font-display text-[9px] text-muted-foreground block">EXECUTION WINDOW</span>
            <span className="font-mono text-[10px] text-neon">{agent.executionTimeMs}ms ({agent.completedAt})</span>
          </div>
        </div>

        <div className="text-[11px] p-2.5 rounded-lg bg-muted/20 border border-border/60">
          <span className="font-display text-[9px] text-neon block tracking-wider">LIVE TELEMETRY DATA FEED</span>
          <span className="font-mono text-[11px] text-foreground/90">{agent.dataSource}</span>
        </div>

        <Block label={`CURRENT STATUS · ${year}`}>{agent.status}</Block>

        <div className="grid grid-cols-2 gap-3">
          <div className="holo-panel rounded-lg p-4">
            <p className="font-display text-[10px] tracking-widest text-muted-foreground">
              RISK LEVEL
            </p>
            <p
              className="mt-1 font-display text-2xl font-black"
              style={{
                color: riskColor(agent.risk),
                textShadow: `0 0 18px ${riskColor(agent.risk)}`,
              }}
            >
              {agent.risk}
            </p>
          </div>
          <div className="holo-panel rounded-lg p-4">
            <p className="font-display text-[10px] tracking-widest text-muted-foreground">
              {agent.unit}
            </p>
            <p className="mt-1 flex items-center gap-2 font-display text-2xl font-black">
              {Math.round(agent.index)}
              <Trend value={agent.trend} />
            </p>
          </div>
        </div>

        <div className="holo-panel rounded-lg p-4">
          <p className="font-display text-[10px] tracking-widest text-muted-foreground">
            MONITORED INDICATORS
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {agent.watches.map((w) => (
              <span
                key={w}
                className="rounded-full border border-border/60 px-2 py-0.5 font-display text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                {w}
              </span>
            ))}
          </div>
        </div>

        <Block label="AI ANALYSIS">{agent.analysis_text}</Block>
        <Block label="RECOMMENDED ACTION">{agent.action}</Block>

        <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
          <span className="font-display text-[10px] tracking-widest text-muted-foreground">
            FORECAST CONFIDENCE
          </span>
          <span className="font-display text-lg font-black text-neon">{agent.confidence}%</span>
        </div>
      </div>
    </>
  );
}

function Trend({ value }: { value: number }) {
  if (value > 1)
    return (
      <span className="flex items-center gap-0.5 font-display text-[10px] text-success">
        <TrendingUp size={12} /> +{value.toFixed(1)}
      </span>
    );
  if (value < -1)
    return (
      <span className="flex items-center gap-0.5 font-display text-[10px] text-danger">
        <TrendingDown size={12} /> {value.toFixed(1)}
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 font-display text-[10px] text-muted-foreground">
      <Minus size={12} /> stable
    </span>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="holo-panel rounded-lg p-4">
      <p className="font-display text-[10px] tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm leading-relaxed">{children}</p>
    </div>
  );
}
