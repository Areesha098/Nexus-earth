import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Starfield } from "@/components/Starfield";
import { useGame, type StatKey } from "@/lib/game-store";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

const CATEGORY_HUE: Record<string, string> = {
  climate: "200",
  pandemic: "25",
  ai: "270",
  energy: "305",
  water: "230",
  food: "80",
  cyber: "0",
};

function HistoryPage() {
  const navigate = useNavigate();
  const { history } = useGame();

  return (
    <div className="min-h-screen relative">
      <Starfield dense={70} />

      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <button
          onClick={() => navigate({ to: "/command" })}
          className="glass rounded-md px-3 py-2 font-display text-[10px] tracking-widest flex items-center gap-2 hover:neon-border"
        >
          <ArrowLeft size={12} /> COMMAND
        </button>
        <p className="font-display text-xs tracking-[0.4em] text-muted-foreground">DECISION LOG</p>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-10">
        <h1 className="text-4xl md:text-6xl font-black">
          <span className="text-gradient">Timeline</span> of humanity
        </h1>
        <p className="mt-3 text-muted-foreground">
          {history.length} directives issued. Every choice reshaped the century.
        </p>

        <div className="mt-12 relative">
          {/* vertical spine */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary to-transparent" />

          {history.length === 0 && (
            <div className="glass rounded-xl p-8 text-center text-muted-foreground">
              No decisions yet. Return to command and begin the simulation.
            </div>
          )}

          <ul className="space-y-8">
            {history.map((h, i) => {
              const hue = CATEGORY_HUE[h.category] ?? "210";
              const color = `oklch(0.75 0.2 ${hue})`;
              const side = i % 2 === 0;
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-10"
                >
                  <div
                    className="absolute left-3 md:left-1/2 top-4 w-3 h-3 -translate-x-1/2 rounded-full"
                    style={{ background: color, boxShadow: `0 0 15px ${color}` }}
                  />
                  <div className={side ? "md:pr-10 md:text-right" : "md:col-start-2 md:pl-10"}>
                    <p
                      className="font-display text-3xl font-black"
                      style={{ color, textShadow: `0 0 15px ${color}` }}
                    >
                      {h.year}
                    </p>
                    <p className="mt-1 font-display text-[10px] tracking-widest text-muted-foreground uppercase">
                      {h.category}
                    </p>
                  </div>
                  <div className={side ? "md:col-start-2 md:pl-10" : "md:pr-10 md:text-right"}>
                    <div className="glass rounded-xl p-4">
                      <p className="font-display text-sm text-muted-foreground">{h.eventTitle}</p>
                      <p className="mt-1 font-display font-bold">{h.choiceLabel}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(Object.keys(h.effects) as StatKey[]).map((k) => {
                          const v = h.effects[k] ?? 0;
                          return (
                            <span
                              key={k}
                              className="text-[10px] font-display tracking-widest px-2 py-0.5 rounded-full"
                              style={{
                                background:
                                  v >= 0
                                    ? "color-mix(in oklab, var(--success) 15%, transparent)"
                                    : "color-mix(in oklab, var(--danger) 15%, transparent)",
                                color: v >= 0 ? "var(--success)" : "var(--danger)",
                              }}
                            >
                              {k.toUpperCase()} {v > 0 ? "+" : ""}
                              {v}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </main>
    </div>
  );
}
