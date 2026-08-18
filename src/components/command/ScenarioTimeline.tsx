import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { SCENARIOS, type ScenarioKey } from "@/lib/scenario";

/**
 * Animated disaster progression. Restarts whenever `runKey` changes so it
 * resets automatically after every simulation.
 */
export function ScenarioTimeline({
  scenarioKey,
  runKey,
}: {
  scenarioKey: ScenarioKey;
  runKey: number;
}) {
  const def = SCENARIOS[scenarioKey] ?? SCENARIOS.flood;
  const [stage, setStage] = useState(0);

  useEffect(() => {
    setStage(0);
    const timers: number[] = [];
    let elapsed = 0;
    def.stages.forEach((s, i) => {
      elapsed += s.ms;
      timers.push(window.setTimeout(() => setStage(i + 1), elapsed));
    });
    return () => timers.forEach(clearTimeout);
  }, [def, runKey]);

  const progress = (stage / def.stages.length) * 100;
  const currentLabel =
    stage >= def.stages.length
      ? "Recovery complete"
      : (def.stages[stage]?.label ?? def.stages[0]!.label);

  return (
    <div className="holo-panel rounded-xl px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-display text-[10px] tracking-widest text-muted-foreground flex items-center gap-2">
          <Activity size={12} className="text-neon" /> SCENARIO · {def.title.toUpperCase()}
        </p>
        <span className="font-display text-[10px] tracking-widest text-neon animate-flicker">
          {currentLabel.toUpperCase()}
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-0 right-0 top-[7px] h-px bg-border" />
        <motion.div
          className="absolute left-0 top-[7px] h-px"
          style={{ background: "var(--neon)", boxShadow: "0 0 8px var(--neon)" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <div className="relative flex justify-between">
          {def.stages.map((s, i) => {
            const done = i < stage;
            const active = i === stage;
            return (
              <div key={s.label} className="flex flex-col items-center gap-2 flex-1">
                <motion.span
                  className="h-3.5 w-3.5 rounded-full border"
                  animate={{
                    scale: active ? [1, 1.35, 1] : 1,
                    background: done ? "var(--neon)" : active ? "var(--neon-2)" : "var(--muted)",
                    boxShadow: done || active ? "0 0 12px var(--neon)" : "0 0 0 transparent",
                  }}
                  transition={{ duration: 1, repeat: active ? Infinity : 0 }}
                />
                <span
                  className={`font-display text-[8px] tracking-widest text-center leading-tight ${
                    done || active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
