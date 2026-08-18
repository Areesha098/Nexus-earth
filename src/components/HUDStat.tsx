import { motion } from "framer-motion";
import type { StatKey } from "@/lib/game-store";
import {
  Thermometer,
  TrendingUp,
  HeartPulse,
  Wheat,
  Zap,
  Droplets,
  type LucideIcon,
} from "lucide-react";

const META: Record<StatKey, { label: string; icon: LucideIcon; hue: string }> = {
  climate: { label: "Climate", icon: Thermometer, hue: "200" },
  economy: { label: "Economy", icon: TrendingUp, hue: "155" },
  health: { label: "Health", icon: HeartPulse, hue: "25" },
  food: { label: "Food", icon: Wheat, hue: "80" },
  energy: { label: "Energy", icon: Zap, hue: "305" },
  water: { label: "Water", icon: Droplets, hue: "230" },
};

export function HUDStat({
  id,
  value,
  preview,
  pulse = false,
}: {
  id: StatKey;
  value: number;
  /** ghost projection shown on decision hover */
  preview?: number;
  /** flash the card after a decision lands */
  pulse?: boolean;
}) {
  const { label, icon: Icon, hue } = META[id];
  const color = `oklch(0.75 0.2 ${hue})`;
  const rounded = Math.round(value);
  const ghost = preview === undefined ? null : Math.round(preview);
  const diff = ghost === null ? 0 : ghost - rounded;
  const ghostColor = diff >= 0 ? "var(--success)" : "var(--danger)";

  return (
    <motion.div
      className="glass rounded-xl p-4 relative overflow-hidden"
      animate={
        pulse
          ? { boxShadow: [`0 0 0 ${color}`, `0 0 26px ${color}`, `0 0 0 ${color}`] }
          : { boxShadow: "0 0 0 rgba(0,0,0,0)" }
      }
      transition={{ duration: 1.1 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="rounded-md p-1.5"
            style={{ background: `color-mix(in oklab, ${color} 20%, transparent)` }}
          >
            <Icon size={16} style={{ color }} />
          </div>
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-display">
            {label}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          {ghost !== null && diff !== 0 && (
            <span
              className="font-display text-[10px] tracking-widest tabular-nums"
              style={{ color: ghostColor }}
            >
              {diff > 0 ? "+" : ""}
              {diff}
            </span>
          )}
          <span
            className="font-display text-lg font-bold tabular-nums"
            style={{ color, textShadow: `0 0 10px ${color}` }}
          >
            {rounded}
          </span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden relative">
        {ghost !== null && (
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full opacity-40"
            style={{ background: ghostColor }}
            initial={{ width: `${rounded}%` }}
            animate={{ width: `${ghost}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          />
        )}
        <motion.div
          className="h-full rounded-full relative"
          style={{
            background: `linear-gradient(90deg, ${color}, oklch(0.85 0.15 ${hue}))`,
            boxShadow: `0 0 10px ${color}`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${rounded}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
        />
      </div>
    </motion.div>
  );
}
