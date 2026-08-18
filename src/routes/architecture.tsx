import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Brain,
  Cpu,
  Database,
  Gauge,
  LayoutDashboard,
  Network,
  User,
  FileText,
} from "lucide-react";
import { Starfield } from "@/components/Starfield";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "AI Architecture — Nexus Earth Platform Blueprint" },
      {
        name: "description",
        content:
          "Explore the Nexus Earth AI architecture: copilot, orchestrator, multi-agent layer, simulation and decision engines, data sources and reporting pipeline.",
      },
      { property: "og:title", content: "AI Architecture — Nexus Earth Platform Blueprint" },
      {
        property: "og:description",
        content:
          "Interactive diagram of the Nexus Earth AI stack — from user intent to multi-agent reasoning, simulation and downloadable decision reports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Architecture,
});

type Status = "Implemented" | "Configurable" | "Planned";

const NODES = [
  {
    id: "user",
    label: "User",
    icon: User,
    status: "Implemented" as Status,
    detail:
      "The commander. Issues directives, moves the Digital Twin time slider and speaks to the copilot. Session state persists locally between visits.",
    tech: ["React 19", "TanStack Router", "localStorage session"],
  },
  {
    id: "copilot",
    label: "AI Copilot",
    icon: Bot,
    status: "Implemented" as Status,
    detail:
      "Floating assistant with speech recognition, live transcription and speech synthesis. Falls back to text mode when microphone permission is denied.",
    tech: ["Web Speech API", "Framer Motion", "Server function RPC"],
  },
  {
    id: "orchestrator",
    label: "AI Orchestrator",
    icon: Network,
    status: "Implemented" as Status,
    detail:
      "Server-side routing layer. Assembles live telemetry context, coordinates parallel specialist agent calls, enforces validation schemas, and synthesizes strategic directives.",
    tech: ["TanStack Start server functions", "Zod validation", "Gemini 3.6 / 2.5 Flash Engines"],
  },
  {
    id: "agents",
    label: "Multi-Agent AI",
    icon: Brain,
    status: "Implemented" as Status,
    detail:
      "Seven specialist agents — Climate, Disaster, Health, Food, Water, Energy, Economy — each scoring its own indicators, risk tier, trend and confidence.",
    tech: ["Agent registry", "Live indicator binding", "Confidence modelling"],
  },
  {
    id: "sim",
    label: "Simulation Engine",
    icon: Cpu,
    status: "Implemented" as Status,
    detail:
      "Deterministic & AI-guided planetary model 2026–2100. Applies decision effects, systemic momentum, and projects the Digital Twin forward year by year.",
    tech: ["Zustand store", "Digital Twin projection", "Three.js Earth", "Runge-Kutta drift math"],
  },
  {
    id: "memory",
    label: "Earth Memory",
    icon: Database,
    status: "Implemented" as Status,
    detail:
      "Persistent historical causal memory. Tracks past directives, systemic debts, and long-term feedback loops across decades (e.g. earlier dam investments mitigating future floods).",
    tech: ["EarthMemory Ledger", "Causal Chain Engine", "Decision Linkages"],
  },
  {
    id: "decision",
    label: "Decision Engine",
    icon: Gauge,
    status: "Implemented" as Status,
    detail:
      "Turns model output into ranked risks, recommended actions, pre-execution impact previews, and post-decision outcome evaluations with confidence scoring.",
    tech: ["Structured LLM output", "Risk tiering", "Impact estimation", "Decision Modal"],
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    status: "Implemented" as Status,
    detail:
      "Command view: full-bleed 3D Earth, six indicator HUD, foresight engine, agent grid and the Digital Twin time slider.",
    tech: ["Tailwind CSS v4", "Framer Motion", "React Three Fiber"],
  },
  {
    id: "reports",
    label: "Reports",
    icon: FileText,
    status: "Implemented" as Status,
    detail:
      "One-click AI Decision Report as PDF: executive summary, simulation details, agent analysis, top risks, recommendations, charts and timestamp.",
    tech: ["jsPDF", "Client-side generation", "No data leaves the browser"],
  },
];

const STACK: { group: string; icon: typeof Cpu; items: [string, Status][] }[] = [
  {
    group: "Frontend",
    icon: LayoutDashboard,
    items: [
      ["React 19 + TypeScript", "Implemented"],
      ["TanStack Router (file-based, SSR)", "Implemented"],
      ["Tailwind CSS v4 design tokens", "Implemented"],
      ["Framer Motion cinematics", "Implemented"],
      ["Three.js / React Three Fiber Earth", "Implemented"],
    ],
  },
  {
    group: "Backend",
    icon: Cpu,
    items: [
      ["TanStack Start server functions", "Implemented"],
      ["Zod request validation", "Implemented"],
      ["Edge runtime (Workers)", "Implemented"],
      ["Persistent scenario database", "Planned"],
      ["Authenticated commander accounts", "Planned"],
    ],
  },
  {
    group: "AI Layer",
    icon: Brain,
    items: [
      ["Gemini 3.6 Flash reasoning model", "Implemented"],
      ["Server-side AI Service", "Implemented"],
      ["Structured JSON output schemas", "Implemented"],
      ["Live Multi-Agent Synthesis", "Implemented"],
      ["Voice I/O (speech ↔ text)", "Implemented"],
      ["Retrieval over live climate corpora", "Planned"],
    ],
  },
  {
    group: "Data Sources",
    icon: Database,
    items: [
      ["Built-in scenario library (2026–2100)", "Implemented"],
      ["Live simulation telemetry", "Implemented"],
      ["SDG indicator framework", "Implemented"],
      ["NASA EONET Real-time Natural Events", "Implemented"],
      ["Open-Meteo & Copernicus Air Quality APIs", "Implemented"],
    ],
  },
];

const DB_FLOW = [
  "Commander action captured in the client store",
  "State serialized to the local session vault (localStorage)",
  "Session rehydrated on refresh — Resume or New Simulation",
  "Telemetry snapshot assembled for each AI request",
  "Report generator reads the same snapshot for PDF export",
  "Managed cloud persistence for multi-device history",
];

const SIM_FLOW = [
  "Scan for the next global event at the current cycle",
  "Event briefing rendered with region and disaster type",
  "Telemetry packaged: year, region, disaster, Earth Score, SDG Score",
  "Multi-Agent Orchestrator executes specialist AI agents in parallel",
  "Synthesis Engine combines agent evaluations into consensus directive options",
  "Commander issues a directive; effects apply to six indicators",
  "Digital Twin reprojects 2026 → 2050 and the Earth re-renders",
];

function StatusBadge({ status }: { status: Status }) {
  const cls =
    status === "Implemented"
      ? "text-success border-success/40"
      : status === "Configurable"
        ? "text-warning border-warning/40"
        : "text-muted-foreground border-border";
  return (
    <span
      className={`font-display text-[9px] tracking-widest px-2 py-1 rounded border ${cls} whitespace-nowrap`}
    >
      {status.toUpperCase()}
    </span>
  );
}

function Architecture() {
  const [active, setActive] = useState(NODES[0]!.id);
  const node = NODES.find((n) => n.id === active) ?? NODES[0]!;
  const NodeIcon = node.icon;

  return (
    <div className="min-h-screen relative bg-background">
      <Starfield dense={110} />
      <div className="pointer-events-none absolute inset-0 scanlines-strong opacity-20" />

      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5">
        <div className="hud-corner flex items-center gap-3 px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
          <p className="font-display text-[10px] tracking-[0.4em] text-muted-foreground">
            NEXUS EARTH · SYSTEM BLUEPRINT
          </p>
        </div>
        <Link
          to="/command"
          className="holo-panel rounded-md px-3 py-2 font-display text-[10px] tracking-widest flex items-center gap-2 hover:neon-border"
        >
          <ArrowLeft size={12} /> DASHBOARD
        </Link>
      </header>

      <main className="relative z-10 px-4 md:px-10 pb-24 space-y-6">
        <div>
          <h1 className="font-display text-3xl md:text-5xl font-black text-gradient">
            AI Architecture
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed">
            How intent becomes planetary foresight. Select any node in the pipeline to inspect its
            responsibilities, technology and delivery status.
          </p>
        </div>

        {/* Interactive pipeline */}
        <section className="holo-panel rounded-xl p-5">
          <p className="font-display text-[10px] tracking-widest text-neon mb-4">
            // DECISION PIPELINE
          </p>
          <div className="flex flex-wrap items-stretch gap-2">
            {NODES.map((n, i) => {
              const Icon = n.icon;
              const on = n.id === active;
              return (
                <div key={n.id} className="flex items-center gap-2">
                  <motion.button
                    onClick={() => setActive(n.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`rounded-lg px-3 py-3 min-w-[122px] text-left transition-all ${
                      on ? "neon-border bg-primary/10" : "hud-corner hover:border-neon/50"
                    }`}
                  >
                    <Icon size={16} className={on ? "text-neon" : "text-muted-foreground"} />
                    <p className="font-display text-[11px] tracking-widest mt-2">{n.label}</p>
                    <p className="font-display text-[8px] tracking-widest text-muted-foreground mt-1">
                      {n.status.toUpperCase()}
                    </p>
                  </motion.button>
                  {i < NODES.length - 1 && (
                    <ArrowRight size={14} className="text-neon/50 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 hud-corner rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <NodeIcon size={18} className="text-neon" />
              <p className="font-display text-lg">{node.label}</p>
              <StatusBadge status={node.status} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{node.detail}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {node.tech.map((t) => (
                <span
                  key={t}
                  className="font-display text-[9px] tracking-widest px-2 py-1 rounded bg-muted/40"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Technology stack */}
        <section className="grid md:grid-cols-2 gap-4">
          {STACK.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.group} className="holo-panel rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={15} className="text-neon" />
                  <p className="font-display text-[11px] tracking-widest">
                    {s.group.toUpperCase()}
                  </p>
                </div>
                <ul className="space-y-2">
                  {s.items.map(([label, status]) => (
                    <li key={label} className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <StatusBadge status={status} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>

        {/* Flows */}
        <section className="grid md:grid-cols-2 gap-4">
          <div className="holo-panel rounded-xl p-5">
            <p className="font-display text-[11px] tracking-widest mb-3">DATABASE FLOW</p>
            <ol className="space-y-2">
              {DB_FLOW.map((s, i) => (
                <li key={s} className="flex gap-3 text-xs text-muted-foreground">
                  <span className="font-display text-neon">{String(i + 1).padStart(2, "0")}</span>
                  <span>{s}</span>
                  {i === DB_FLOW.length - 1 && <StatusBadge status="Planned" />}
                </li>
              ))}
            </ol>
          </div>
          <div className="holo-panel rounded-xl p-5">
            <p className="font-display text-[11px] tracking-widest mb-3">SIMULATION WORKFLOW</p>
            <ol className="space-y-2">
              {SIM_FLOW.map((s, i) => (
                <li key={s} className="flex gap-3 text-xs text-muted-foreground">
                  <span className="font-display text-neon">{String(i + 1).padStart(2, "0")}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
}
