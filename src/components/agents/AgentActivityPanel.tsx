import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import {
  Brain,
  Activity,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Sparkles,
} from "lucide-react";
import { buildAgents, type Agent, type AgentProcessStatus } from "@/components/agents/agents-data";
import { usePlanetState } from "@/lib/game-store";
import { fetchMultiAgentInsights } from "@/lib/ai-analysis.functions";
import type { MultiAgentInsights } from "@/services/aiService";
import { audioService } from "@/services/audioService";

export function AgentActivityPanel() {
  const { localStats, history, year, region } = usePlanetState();
  const [isProcessing, setIsProcessing] = useState(false);
  const [insights, setInsights] = useState<MultiAgentInsights | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>("climate");

  const runMultiAgent = useServerFn(fetchMultiAgentInsights);

  const agents = useMemo(
    () => buildAgents(localStats, history, year, { isRunning: isProcessing }),
    [localStats, history, year, isProcessing],
  );

  const executeAnalysis = async () => {
    setIsProcessing(true);
    audioService.playAgentPulse();
    try {
      const res = await runMultiAgent({
        data: {
          agents,
          stats: localStats,
          year,
          country: region.country,
        },
      });
      setInsights(res);
    } catch (e) {
      console.warn("Multi-agent fetch error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    void executeAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, region.id]);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0]!;

  return (
    <div className="holo-panel rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-neon animate-pulse" />
          <h3 className="font-display text-xs tracking-[0.3em] text-neon">
            // MULTI-AGENT AI COUNCIL ({agents.length} SPECIALISTS + SYNTHESIS AGENT)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void executeAnalysis()}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hud-corner text-[10px] font-display text-muted-foreground hover:text-neon disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={11} className={isProcessing ? "animate-spin text-neon" : ""} />
            {isProcessing ? "ORCHESTRATING..." : "RE-ANALYZE COUNCIL"}
          </button>
          <span className="font-display text-[9px] tracking-widest px-2 py-0.5 rounded border text-success border-success/40 bg-success/10 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
            LIVE MULTI-AGENT AI
          </span>
        </div>
      </div>

      {/* Orchestrator Overall Synthesis Banner & Combined Decision */}
      <div className="p-4 hud-corner rounded-lg bg-primary/10 border border-neon/40 space-y-3 shadow-[0_0_20px_rgba(0,255,200,0.07)]">
        <div className="flex items-center justify-between text-[10px] font-display flex-wrap gap-2">
          <span className="text-neon flex items-center gap-1.5 font-bold tracking-wider">
            <Cpu size={14} className="text-neon" /> SYNTHESIS AGENT · MULTI-AGENT CONSENSUS DIRECTIVE
          </span>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-[10px]">
              REGION: <strong className="text-foreground">{region.country.toUpperCase()}</strong>
            </span>
            <span className="text-neon font-mono text-[10px] px-2 py-0.5 rounded bg-primary/20 border border-neon/30">
              SYNTHESIS CONFIDENCE: <strong>{insights?.synthesisAgent?.confidence ?? insights?.confidence ?? 91}%</strong>
            </span>
          </div>
        </div>

        {/* Primary Combined Recommendation */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-display uppercase tracking-wider text-neon">
            ★ Strategic Synthesis Recommendation
          </div>
          <p className="text-sm font-semibold text-foreground leading-snug">
            {insights?.synthesisAgent?.strategicRecommendation ||
              `Initiate synchronized climate stabilization and deploy resilience buffers across critical infrastructure.`}
          </p>
        </div>

        {/* Rationale & Trade-offs */}
        <div className="grid md:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-2.5 rounded bg-background/60 border border-border/60 space-y-1">
            <span className="font-display text-[9px] tracking-widest text-muted-foreground flex items-center gap-1">
              <Sparkles size={11} className="text-neon" /> SELECTION RATIONALE (WHY THIS DECISION)
            </span>
            <p className="text-foreground/90 text-[11px] leading-relaxed">
              {insights?.synthesisAgent?.rationale ||
                `Synthesized across 6 specialist domains. Addresses highest-leverage vulnerability while preventing cross-system failure cascades.`}
            </p>
          </div>

          <div className="p-2.5 rounded bg-background/60 border border-border/60 space-y-1">
            <span className="font-display text-[9px] tracking-widest text-muted-foreground flex items-center gap-1">
              <Activity size={11} className="text-neon" /> CROSS-DOMAIN TRADE-OFF ANALYSIS
            </span>
            <p className="text-foreground/90 text-[11px] leading-relaxed">
              {insights?.synthesisAgent?.tradeOffAnalysis ||
                `Balancing short-term fiscal expenditure against multi-year systemic resilience.`}
            </p>
          </div>
        </div>

        {/* Priority Interventions across Domains */}
        {insights?.synthesisAgent?.priorityInterventions && insights.synthesisAgent.priorityInterventions.length > 0 && (
          <div className="pt-1 space-y-1.5 border-t border-border/40">
            <span className="font-display text-[9px] tracking-widest text-muted-foreground">
              MULTI-AGENT SYNCHRONIZED INTERVENTIONS:
            </span>
            <div className="grid sm:grid-cols-3 gap-2">
              {insights.synthesisAgent.priorityInterventions.map((action, idx) => (
                <div key={idx} className="text-[10px] p-2 rounded bg-muted/20 border border-border/40 text-foreground/90 leading-tight flex items-start gap-1.5">
                  <span className="font-mono text-neon font-bold shrink-0">0{idx + 1}.</span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights?.urgentRisk && (
          <div className="flex items-center gap-2 text-[10px] text-danger font-display tracking-wider pt-1">
            <ShieldAlert size={12} className="shrink-0" />
            <span>PRIMARY CONCERN: {insights.urgentRisk}</span>
          </div>
        )}
      </div>

      {/* 6 Specialist Agent Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isSelected = agent.id === selectedAgentId;
          const status = isProcessing ? "Running" : agent.agentStatus;

          return (
            <motion.button
              key={agent.id}
              onClick={() => {
                setSelectedAgentId(agent.id);
                audioService.playClick();
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-2.5 rounded-lg text-left transition-all border relative overflow-hidden ${
                isSelected
                  ? "neon-border bg-primary/15"
                  : "hud-corner bg-background/40 hover:border-neon/40"
              }`}
            >
              {isProcessing && (
                <motion.div
                  className="absolute inset-0 bg-primary/10"
                  animate={{ opacity: [0.2, 0.7, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}

              <div className="flex items-center justify-between mb-1.5">
                <Icon size={14} className={isSelected ? "text-neon" : "text-muted-foreground"} />
                <StatusBadge status={status} />
              </div>

              <p className="font-display text-[10px] tracking-wider truncate">{agent.name}</p>
              <div className="mt-1 flex items-baseline justify-between text-[11px]">
                <span className="font-display text-xs font-bold">{Math.round(agent.index)}%</span>
                <span className="text-[8px] font-mono text-muted-foreground">
                  {agent.executionTimeMs}ms
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Agent Detailed Telemetry & Analysis Panel */}
      {selectedAgent && (
        <motion.div
          key={selectedAgent.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 hud-corner rounded-lg bg-background/50 border border-border/60 space-y-3"
        >
          <div className="flex items-center justify-between border-b border-border/40 pb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <selectedAgent.icon size={18} className="text-neon" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display text-xs tracking-wider font-bold">
                    {selectedAgent.name.toUpperCase()}
                  </p>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground">
                    {selectedAgent.category}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">{selectedAgent.description}</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-3">
              <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
                <Clock size={11} /> {selectedAgent.executionTimeMs}ms
                <span className="text-border">|</span>
                <span className="text-[9px] text-muted-foreground">{selectedAgent.completedAt}</span>
              </div>
              <span className="font-display text-[9px] text-neon px-2 py-0.5 rounded bg-primary/15 border border-neon/30">
                CONFIDENCE {selectedAgent.confidence}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] px-2.5 py-1.5 rounded bg-muted/20 border border-border/40 text-muted-foreground">
            <span className="font-display text-[9px] tracking-wider text-neon shrink-0">DATA TELEMETRY FEED:</span>
            <span className="font-mono text-[10px] text-foreground/90 truncate">{selectedAgent.dataSource}</span>
          </div>

          <div className="grid md:grid-cols-3 gap-3 text-xs">
            {/* Input */}
            <div className="p-2.5 rounded bg-muted/20 border border-border/40 space-y-1">
              <span className="font-display text-[9px] tracking-widest text-muted-foreground flex items-center gap-1">
                <Activity size={11} className="text-neon" /> INPUT TELEMETRY
              </span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {selectedAgent.inputSummary}
              </p>
            </div>

            {/* Analysis & Causes */}
            <div className="p-2.5 rounded bg-muted/20 border border-border/40 space-y-1">
              <span className="font-display text-[9px] tracking-widest text-muted-foreground flex items-center gap-1">
                <Brain size={11} className="text-neon" /> AGENT KEY FINDING & CAUSAL CHAIN
              </span>
              <p className="text-foreground/90 text-[11px] leading-relaxed">
                {selectedAgent.keyFinding || selectedAgent.causes}
              </p>
            </div>

            {/* Action / Output */}
            <div className="p-2.5 rounded bg-muted/20 border border-border/40 space-y-1">
              <span className="font-display text-[9px] tracking-widest text-muted-foreground flex items-center gap-1">
                <Sparkles size={11} className="text-neon" /> AGENT DIRECTIVE PROPOSAL
              </span>
              <p className="text-foreground text-[11px] font-medium leading-relaxed">
                {selectedAgent.action}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: AgentProcessStatus }) {
  if (status === "Running") {
    return (
      <span className="flex items-center gap-1 text-[8px] font-display tracking-widest text-neon animate-pulse">
        <RefreshCw size={8} className="animate-spin" /> RUN
      </span>
    );
  }
  if (status === "Warning") {
    return (
      <span className="flex items-center gap-1 text-[8px] font-display tracking-widest text-danger">
        <AlertTriangle size={8} /> WARN
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[8px] font-display tracking-widest text-success">
      <CheckCircle2 size={8} /> OK
    </span>
  );
}
