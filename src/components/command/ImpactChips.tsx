import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useGame, type StatKey } from "@/lib/game-store";

const LABEL: Record<StatKey, string> = {
  climate: "Climate",
  water: "Water",
  food: "Food",
  health: "Health",
  energy: "Energy",
  economy: "Economy",
};

/** Floating impact chips that rise after a decision is executed. */
export function ImpactChips() {
  const impact = useGame((s) => s.impact);
  const clearImpact = useGame((s) => s.clearImpact);

  useEffect(() => {
    if (!impact) return;
    const t = window.setTimeout(clearImpact, 3200);
    return () => clearTimeout(t);
  }, [impact, clearImpact]);

  const entries = impact
    ? (Object.keys(impact.effects) as StatKey[]).filter((k) => (impact.effects[k] ?? 0) !== 0)
    : [];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex flex-col items-center gap-2">
      <AnimatePresence>
        {entries.map((k, i) => {
          const v = impact!.effects[k] ?? 0;
          const good = v > 0;
          return (
            <motion.div
              key={`${impact!.id}-${k}`}
              initial={{ opacity: 0, y: 30, scale: 0.85 }}
              animate={{ opacity: 1, y: -i * 6, scale: 1 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 140, damping: 16 }}
              className="rounded-full px-4 py-1.5 font-display text-xs tracking-widest backdrop-blur"
              style={{
                background: good
                  ? "color-mix(in oklab, var(--success) 18%, transparent)"
                  : "color-mix(in oklab, var(--danger) 18%, transparent)",
                color: good ? "var(--success)" : "var(--danger)",
                boxShadow: `0 0 22px ${good ? "var(--success)" : "var(--danger)"}`,
              }}
            >
              {LABEL[k]} {good ? "+" : ""}
              {v}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
