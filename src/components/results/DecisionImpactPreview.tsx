import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Zap, ShieldCheck } from "lucide-react";
import type { StatEffect, StatKey } from "@/lib/game-store";

interface Props {
  effects: StatEffect;
  choiceLabel: string;
  currentStats: Record<StatKey, number>;
}

export function DecisionImpactPreview({ effects, choiceLabel, currentStats }: Props) {
  const entries = Object.entries(effects).filter(([, v]) => v !== undefined && v !== 0) as [
    StatKey,
    number,
  ][];

  if (entries.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="p-3 rounded-lg bg-primary/10 border border-neon/40 hud-corner space-y-2 text-xs"
    >
      <div className="flex items-center justify-between font-display text-[9px] tracking-widest text-neon">
        <span className="flex items-center gap-1">
          <Zap size={11} /> PRE-EXECUTION SIMULATION IMPACT PREVIEW
        </span>
        <span className="text-muted-foreground">{choiceLabel}</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
        {entries.map(([stat, val]) => {
          const current = currentStats[stat] ?? 50;
          const projected = Math.max(0, Math.min(100, current + val));
          const isPositive = val > 0;

          return (
            <div
              key={stat}
              className={`p-2 rounded border text-center ${
                isPositive
                  ? "bg-success/10 border-success/30 text-success"
                  : "bg-danger/10 border-danger/30 text-danger"
              }`}
            >
              <p className="font-display text-[8px] tracking-widest text-muted-foreground uppercase">
                {stat}
              </p>
              <div className="font-display text-xs font-bold flex items-center justify-center gap-0.5 mt-0.5">
                {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {isPositive ? `+${val}%` : `${val}%`}
              </div>
              <p className="font-mono text-[8px] text-muted-foreground mt-0.5">
                {current} ➔ <strong className="text-foreground">{projected}</strong>
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
