import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { buildAgents } from "@/components/agents/agents-data";
import { projectYear } from "@/lib/digital-twin";
import { useGame } from "@/lib/game-store";
import { downloadDecisionReport } from "@/lib/report-pdf";

export function ReportButton({ className = "" }: { className?: string }) {
  const { year, stats, history } = useGame();
  const [busy, setBusy] = useState(false);

  async function handle() {
    if (busy) return;
    setBusy(true);
    try {
      const projection = projectYear(stats, Math.min(year, 2050), history.length);
      const agents = buildAgents(stats, history, year);
      const ranked = [...agents].sort((a, b) => a.index - b.index);
      await downloadDecisionReport({
        year,
        stats,
        history,
        projection,
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
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={busy}
      title="Download AI Decision Report (PDF)"
      className={`holo-panel rounded-md p-2 hover:neon-border transition-all disabled:opacity-50 ${className}`}
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
    </button>
  );
}
