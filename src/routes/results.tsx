import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Starfield } from "@/components/Starfield";
import { EarthMount } from "@/components/earth/EarthMount";
import { useGame, type StatKey } from "@/lib/game-store";
import { HUDStat } from "@/components/HUDStat";
import { RotateCcw, History, FileDown, Loader2 } from "lucide-react";
import { buildAgents } from "@/components/agents/agents-data";
import { projectYear } from "@/lib/digital-twin";
import { downloadDecisionReport } from "@/lib/report-pdf";

export const Route = createFileRoute("/results")({
  component: Results,
});

const ORDER: StatKey[] = ["climate", "economy", "health", "food", "energy", "water"];

function Results() {
  const navigate = useNavigate();
  const { stats, year, history, reset } = useGame();
  const [reportBusy, setReportBusy] = useState(false);

  const score = Math.round(Object.values(stats).reduce((a, b) => a + b, 0) / ORDER.length);
  const verdict = getVerdict(score, stats);

  function playAgain() {
    reset();
    navigate({ to: "/" });
  }

  async function downloadReport() {
    if (reportBusy) return;
    setReportBusy(true);
    try {
      const agents = buildAgents(stats, history, year);
      const ranked = [...agents].sort((a, b) => a.index - b.index);
      await downloadDecisionReport({
        year,
        stats,
        history,
        projection: projectYear(stats, Math.min(year, 2050), history.length),
        agents,
        recommendations: ranked.slice(0, 5).map((a) => a.action),
        confidence: Math.round(
          agents.reduce((s, a) => s + a.confidence, 0) / Math.max(1, agents.length),
        ),
        mode: "live",
      });
      toast.success("AI Decision Report downloaded");
    } catch (err) {
      console.error("Report generation failed", err);
      toast.error("Report generation failed. Please try again.");
    } finally {
      setReportBusy(false);
    }
  }

  return (
    <div className="min-h-screen relative">
      <Starfield dense={140} />

      <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-xs tracking-[0.5em] text-neon"
        >
          // FINAL TRANSMISSION · YEAR {year}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-5xl md:text-7xl font-black leading-tight"
        >
          <span className="text-gradient">{verdict.title}</span>
        </motion.h1>

        <div className="mt-10 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-8"
            >
              <p className="font-display text-[10px] tracking-widest text-muted-foreground">
                HUMANITY SURVIVAL SCORE
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <span
                  className="font-display text-8xl font-black"
                  style={{ color: verdict.color, textShadow: `0 0 30px ${verdict.color}` }}
                >
                  {score}
                </span>
                <span className="text-muted-foreground">/ 100</span>
              </div>
              <p className="mt-4 text-muted-foreground leading-relaxed">{verdict.narrative}</p>
            </motion.div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
              {ORDER.map((k) => (
                <HUDStat key={k} id={k} value={stats[k]} />
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <button onClick={playAgain} className="btn-neon inline-flex items-center gap-3">
                <RotateCcw size={16} /> Restart timeline
              </button>
              <button
                onClick={() => navigate({ to: "/history" })}
                className="glass rounded-lg px-5 py-3 font-display text-xs tracking-widest hover:neon-border inline-flex items-center gap-3"
              >
                <History size={14} /> Review decisions
              </button>
              <button
                onClick={() => void downloadReport()}
                disabled={reportBusy}
                className="glass rounded-lg px-5 py-3 font-display text-xs tracking-widest hover:neon-border inline-flex items-center gap-3 disabled:opacity-50"
              >
                {reportBusy ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FileDown size={14} />
                )}
                Download AI report
              </button>
            </div>

            <p className="mt-8 text-xs text-muted-foreground">
              {history.length} decisions logged across {year - 2026} years.
            </p>
          </div>

          <div className="relative min-h-[440px] w-full">
            <EarthMount health={score / 100} interactive={false} />
          </div>
        </div>
      </main>
    </div>
  );
}

function getVerdict(score: number, stats: Record<StatKey, number>) {
  const collapsed = Object.entries(stats)
    .filter(([, v]) => v <= 5)
    .map(([k]) => k);
  if (collapsed.length > 0) {
    return {
      title: "Extinction Event Recorded",
      color: "oklch(0.68 0.24 25)",
      narrative: `Humanity failed to maintain ${collapsed.join(", ")}. Life support systems for civilization have collapsed. The Nexus Earth simulation concludes with a dark timeline.`,
    };
  }
  if (score >= 80)
    return {
      title: "Interstellar Civilization",
      color: "oklch(0.75 0.19 155)",
      narrative:
        "Under your command, humanity survived the great filter. Fusion powers the cities. The biosphere is stable. First deep-space colonies are being seeded. History will remember 2100 as the beginning.",
    };
  if (score >= 60)
    return {
      title: "Stable Century",
      color: "oklch(0.82 0.17 80)",
      narrative:
        "Humanity endured. Not without scars — regional collapses, painful adaptations — but the species is still standing at 2100 with a functioning global order.",
    };
  if (score >= 40)
    return {
      title: "Fragmented Survival",
      color: "oklch(0.82 0.17 60)",
      narrative:
        "Civilization holds together, barely. Great nations have fallen. New confederations have risen. The species survives, at a diminished scale, on a wounded planet.",
    };
  return {
    title: "Collapse Timeline",
    color: "oklch(0.68 0.24 25)",
    narrative:
      "The systems that sustained 8 billion humans could not be repaired in time. Pockets of civilization remain, but the century closes on a species in retreat.",
  };
}
