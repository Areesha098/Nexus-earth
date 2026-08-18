import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import {
  projectYear,
  twinSeries,
  TWIN_END,
  TWIN_START,
  type TwinProjection,
} from "@/lib/digital-twin";
import type { StatKey } from "@/lib/game-store";
import { Activity, Globe2, Sparkles } from "lucide-react";

export function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 90, damping: 18 });
  const text = useTransform(spring, (v) => `${Math.round(v)}${suffix}`);
  useEffect(() => {
    mv.set(value);
  }, [value, mv]);
  return <motion.span className="tabular-nums">{text}</motion.span>;
}

function tone(value: number, inverted?: boolean) {
  const good = inverted ? 100 - value : value;
  if (good >= 65) return "oklch(0.78 0.18 155)";
  if (good >= 40) return "oklch(0.82 0.17 80)";
  return "oklch(0.68 0.24 25)";
}

export function TwinSlider({
  year,
  onYearChange,
  projection,
}: {
  year: number;
  onYearChange: (y: number) => void;
  projection: TwinProjection;
}) {
  const label =
    projection.state === "healthy"
      ? "BIOSPHERE STABLE"
      : projection.state === "moderate"
        ? "ELEVATED STRESS"
        : "CRITICAL DEGRADATION";

  return (
    <div className="holo-panel rounded-xl px-6 py-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <p className="font-display text-[10px] tracking-[0.35em] text-muted-foreground flex items-center gap-2">
          <Globe2 size={12} className="text-neon" /> DIGITAL TWIN · TIMELINE
        </p>
        <span
          className="font-display text-[10px] tracking-widest"
          style={{ color: tone(projection.health * 100) }}
        >
          {label}
        </span>
      </div>

      <div className="flex items-end justify-center gap-4 mb-5">
        <motion.p
          key={year}
          initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.35 }}
          className="font-display text-6xl font-black text-gradient leading-none"
        >
          {year}
        </motion.p>
        <div className="pb-1 space-y-0.5">
          <p className="font-display text-[10px] tracking-widest text-muted-foreground">
            SDG SCORE{" "}
            <span className="text-neon">
              <AnimatedNumber value={projection.sdg} />
            </span>
          </p>
          <p className="font-display text-[10px] tracking-widest text-muted-foreground">
            EARTH IMPACT{" "}
            <span className="text-neon">
              <AnimatedNumber value={projection.impact} />
            </span>
          </p>
        </div>
      </div>

      <Slider
        value={[year]}
        min={TWIN_START}
        max={TWIN_END}
        step={1}
        onValueChange={(v) => onYearChange(v[0] ?? TWIN_START)}
        className="cursor-pointer"
      />
      <div className="flex justify-between text-[10px] font-display tracking-widest text-muted-foreground mt-2">
        <span>{TWIN_START}</span>
        <span>2038</span>
        <span>{TWIN_END}</span>
      </div>
    </div>
  );
}

export function TwinPanel({
  projection,
  stats,
  decisions,
}: {
  projection: TwinProjection;
  stats: Record<StatKey, number>;
  decisions: number;
}) {
  const series = useMemo(() => twinSeries(stats, decisions), [stats, decisions]);
  const path = useMemo(() => {
    const w = 240;
    const h = 52;
    return series
      .map((p, i) => {
        const x = (i / (series.length - 1)) * w;
        const y = h - (p.value / 100) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [series]);

  const markerX = ((projection.year - TWIN_START) / (TWIN_END - TWIN_START)) * 240;

  return (
    <div className="holo-panel rounded-xl p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="font-display text-[10px] tracking-widest text-neon animate-flicker flex items-center gap-2 whitespace-nowrap">
          <Activity size={12} /> // SIMULATION READOUT
        </p>
        <span className="font-display text-[10px] tracking-widest text-muted-foreground whitespace-nowrap">
          YEAR {projection.year}
        </span>
      </div>

      <svg viewBox="0 0 240 52" className="w-full h-14 mb-4 overflow-visible">
        <motion.path
          d={path}
          fill="none"
          stroke="var(--neon)"
          strokeWidth={1.6}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 6px var(--neon))" }}
        />
        <motion.g
          animate={{ x: markerX }}
          initial={false}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
          <line x1={0} x2={0} y1={-4} y2={56} stroke="var(--neon-2)" strokeDasharray="3 3" />
          <circle cx={0} cy={26} r={2.5} fill="var(--neon-2)" />
        </motion.g>
      </svg>

      <ul className="space-y-3">
        {projection.metrics.map((m) => {
          const color = tone(m.value, m.invertedLabel);
          return (
            <li key={m.id}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="font-display font-bold" style={{ color }}>
                  <AnimatedNumber value={m.value} suffix="%" />
                </span>
              </div>
              <div className="h-1 rounded-full bg-muted/60 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                  animate={{ width: `${m.value}%` }}
                  transition={{ type: "spring", stiffness: 90, damping: 20 }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed flex gap-2">
        <Sparkles size={12} className="text-neon shrink-0 mt-0.5" />
        {projection.state === "healthy"
          ? "Twin model projects regenerative equilibrium; atmospheric albedo and hydrology hold within safe bands."
          : projection.state === "moderate"
            ? "Twin model detects compounding stress: heat anomalies and hydrological variance rising through the decade."
            : "Twin model forecasts cascading failure: wildfire regimes, aerosol loading and crop collapse reinforcing each other."}
      </p>
    </div>
  );
}

export { projectYear };
