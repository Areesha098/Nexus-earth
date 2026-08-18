import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Radar, ShieldAlert, Activity, Cpu, CloudSun, Globe } from "lucide-react";
import { REGIONS, searchRegions } from "@/lib/regions";
import { usePlanetState } from "@/lib/game-store";
import { projectYear } from "@/lib/digital-twin";
import { threatFrom } from "@/lib/scenario";
import { AnimatedNumber } from "@/components/twin/DigitalTwin";

export function LeftPanel() {
  const { region, setRegion, localStats, regionAvg, twinYear, history, mission, news, aiStatus } =
    usePlanetState();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchRegions(query), [query]);
  const projection = useMemo(
    () => projectYear(localStats, twinYear, history.length),
    [localStats, twinYear, history.length],
  );
  const threat = threatFrom(regionAvg);
  const alerts = news.filter((n) => n.tone === "bad").slice(0, 3);

  return (
    <div className="space-y-3">
      {/* Region search */}
      <div className="holo-panel rounded-xl p-4">
        <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
          <Radar size={12} className="text-neon" /> REGION SEARCH
        </p>
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sector…"
            className="w-full rounded-md bg-muted/40 border border-border/60 pl-8 pr-2 py-1.5 text-xs outline-none focus:border-primary/60"
          />
        </div>
        <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => setRegion(r.id)}
              className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                r.id === region.id ? "neon-border bg-muted/40" : "hover:bg-muted/30"
              }`}
            >
              <span>{r.flag}</span>
              <span className="flex-1 truncate">{r.name}</span>
              <span className="text-[10px] text-muted-foreground">{r.population}</span>
            </button>
          ))}
          {results.length === 0 && (
            <p className="text-[11px] text-muted-foreground px-2 py-1">No sector match.</p>
          )}
        </div>
      </div>

      {/* Selected region card */}
      <motion.div
        key={region.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="holo-panel rounded-xl p-4"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{region.flag}</span>
          <div className="min-w-0">
            <p className="font-display text-lg font-black leading-tight truncate">{region.name}</p>
            <p className="text-[10px] font-display tracking-widest text-muted-foreground">
              POP {region.population} · {region.primaryThreat.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip label="RISK" value={threat.label} tone={threat.tone} />
          <Chip label="INDEX" value={`${regionAvg}`} />
          <Chip label="YEAR" value={`${twinYear}`} />
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed flex gap-1.5">
          <MapPin size={11} className="text-neon shrink-0 mt-0.5" />
          {region.riskProfile}
        </p>
      </motion.div>

      {/* Scores */}
      <div className="holo-panel rounded-xl p-4 grid grid-cols-2 gap-3">
        <Score label="EARTH SCORE" value={projection.impact} />
        <Score label="SDG SCORE" value={projection.sdg} />
      </div>

      {/* Active mission */}
      <div className="holo-panel rounded-xl p-4">
        <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
          <ShieldAlert size={12} className="text-neon" /> ACTIVE MISSION
        </p>
        {mission ? (
          <>
            <p className="font-display text-xs font-bold leading-snug">{mission.name}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chip label="STATUS" value={mission.status.toUpperCase()} />
              <Chip label="THREAT" value={mission.threat} />
              <Chip label="AT RISK" value={mission.livesAtRisk} />
            </div>
          </>
        ) : (
          <p className="text-[11px] text-muted-foreground">No mission tasked. Scan for an event.</p>
        )}
      </div>

      {/* Recent alerts */}
      <div className="holo-panel rounded-xl p-4">
        <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
          <Activity size={12} className="text-danger" /> RECENT ALERTS
        </p>
        <AnimatePresence initial={false}>
          {alerts.length === 0 && (
            <p className="text-[11px] text-muted-foreground">No active alerts.</p>
          )}
          {alerts.map((a) => (
            <motion.p
              key={a.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] text-muted-foreground leading-snug py-1 border-b border-border/40 last:border-0"
            >
              {a.text}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>

      {/* System status */}
      <div className="holo-panel rounded-xl p-4 space-y-2">
        <StatusRow
          icon={<Cpu size={11} className="text-neon" />}
          label="AI ENGINE"
          value={aiStatus === "analyzing" ? "ANALYZING" : "LIVE ONLINE"}
          tone="text-success"
        />
        <StatusRow
          icon={<CloudSun size={11} className="text-neon" />}
          label="OPEN-METEO"
          value="LIVE TELEMETRY"
          tone="text-success"
        />
        <StatusRow
          icon={<Globe size={11} className="text-neon" />}
          label="NASA EONET"
          value="FEED ACTIVE"
          tone="text-neon"
        />
        <StatusRow
          icon={<Radar size={11} className="text-neon" />}
          label="SIMULATION"
          value={mission?.status === "active" ? "RUNNING" : "STANDBY"}
          tone={mission?.status === "active" ? "text-neon" : "text-muted-foreground"}
        />
        <StatusRow
          icon={<MapPin size={11} className="text-neon" />}
          label="SECTORS"
          value={`${REGIONS.length} LINKED`}
          tone="text-muted-foreground"
        />
      </div>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-display text-[9px] tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-3xl font-black text-gradient leading-none">
        <AnimatedNumber value={value} />
      </p>
    </div>
  );
}

export function Chip({
  label,
  value,
  tone = "text-foreground",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <span className="rounded-full border border-border/60 px-2 py-0.5 font-display text-[9px] tracking-widest text-muted-foreground">
      {label} <span className={tone}>{value}</span>
    </span>
  );
}

function StatusRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex items-center justify-between font-display text-[10px] tracking-widest">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className={tone}>{value}</span>
    </div>
  );
}
