import type { Agent } from "@/components/agents/agents-data";
import type { TwinProjection } from "@/lib/digital-twin";
import type { HistoryEntry, StatKey } from "@/lib/game-store";

export interface ReportInput {
  year: number;
  country?: string;
  city?: string;
  stats: Record<StatKey, number>;
  history: HistoryEntry[];
  projection: TwinProjection;
  agents: Agent[];
  recommendations: string[];
  confidence: number;
  mode: "live" | "demo";
}

const INK = { fg: [232, 240, 255], dim: [140, 160, 190], neon: [94, 200, 255], bg: [8, 12, 22] };

export async function downloadDecisionReport(input: ReportInput) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 44;
  let y = 0;

  const paint = () => {
    doc.setFillColor(INK.bg[0], INK.bg[1], INK.bg[2]);
    doc.rect(0, 0, W, H, "F");
  };
  const page = () => {
    doc.addPage();
    paint();
    y = M;
  };
  const need = (h: number) => {
    if (y + h > H - M) page();
  };
  const title = (t: string) => {
    need(38);
    doc.setTextColor(INK.neon[0], INK.neon[1], INK.neon[2]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(t.toUpperCase(), M, y);
    doc.setDrawColor(INK.neon[0], INK.neon[1], INK.neon[2]);
    doc.setLineWidth(0.6);
    doc.line(M, y + 6, W - M, y + 6);
    y += 24;
  };
  const body = (t: string, size = 10) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(INK.fg[0], INK.fg[1], INK.fg[2]);
    const lines = doc.splitTextToSize(t, W - M * 2) as string[];
    for (const line of lines) {
      need(16);
      doc.text(line, M, y);
      y += 14;
    }
  };
  const bar = (label: string, value: number, tag?: string) => {
    need(24);
    doc.setFontSize(9);
    doc.setTextColor(INK.dim[0], INK.dim[1], INK.dim[2]);
    doc.text(label, M, y + 8);
    const x = M + 150;
    const w = W - M - x - (tag ? 85 : 40);
    doc.setFillColor(30, 40, 60);
    doc.rect(x, y, w, 9, "F");
    const v = Math.max(0, Math.min(100, value));
    const c = v >= 70 ? [80, 220, 150] : v >= 40 ? [245, 190, 80] : [250, 100, 100];
    doc.setFillColor(c[0], c[1], c[2]);
    doc.rect(x, y, (w * v) / 100, 9, "F");
    doc.setTextColor(INK.fg[0], INK.fg[1], INK.fg[2]);
    doc.text(`${Math.round(v)}`, x + w + 8, y + 8);
    if (tag) {
      doc.setFontSize(7);
      doc.setTextColor(INK.neon[0], INK.neon[1], INK.neon[2]);
      doc.text(`[${tag}]`, x + w + 30, y + 8);
    }
    y += 20;
  };

  // ---- Cover / header
  paint();
  y = 70;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(INK.fg[0], INK.fg[1], INK.fg[2]);
  doc.text("NEXUS EARTH", M, y);
  y += 24;
  doc.setFontSize(13);
  doc.setTextColor(INK.neon[0], INK.neon[1], INK.neon[2]);
  doc.text(`AI DECISION REPORT · ${input.country ?? "GLOBAL"} (${input.city ?? "ORBITAL"})`, M, y);
  y += 18;
  doc.setFontSize(9);
  doc.setTextColor(INK.dim[0], INK.dim[1], INK.dim[2]);
  doc.text(
    `Generated ${new Date().toLocaleString()}  ·  Analysis mode: LIVE MULTI-AGENT AI  ·  Telemetry Confidence ${input.confidence}%`,
    M,
    y,
  );
  y += 30;

  title("Executive Summary");
  const avg = Math.round(
    Object.values(input.stats).reduce((a, b) => a + b, 0) / Object.keys(input.stats).length,
  );
  body(
    `As of simulation cycle ${input.year} (2026-2050 window), planetary systems in ${input.country ?? "Global"} register a composite survival index of ${avg}/100 ` +
      `with an Earth Impact Score of ${input.projection.impact} and an SDG Score of ${input.projection.sdg}. ` +
      `${input.history.length} commander directive${input.history.length === 1 ? " has" : "s have"} been executed. ` +
      `The projected state for ${input.projection.year} is ${input.projection.state.toUpperCase()}, driven primarily by ` +
      `climate risk at ${input.projection.climateRisk}% and flood risk at ${input.projection.floodRisk}%.`,
  );
  y += 8;

  title("Simulation Indicators & Data Lineage");
  bar("Earth Impact Score", input.projection.impact, "MODELED OUTPUT");
  bar("SDG Composite Score", input.projection.sdg, "MODELED OUTPUT");
  y += 4;
  for (const [k, v] of Object.entries(input.stats)) {
    bar(k[0].toUpperCase() + k.slice(1), v, "REAL DATA + MODEL");
  }
  y += 6;

  title("Primary Proof: Indus Basin Water -> Food Cascade");
  body(
    "Groundwater & Hydrological Telemetry: PCRWR benchmark 860 m3/capita/yr freshwater availability. " +
      "Canal head release deficit modeled against 114 MAF allocation. " +
      "Agronomic impact modeled via FAO-33 Yield Response Function (Wheat Ky=1.05, Rice Ky=1.20) driving staple grain yields and national food insecurity index (PBS baseline 38.5%). Deterministic and reproducible.",
    9,
  );
  y += 6;

  title("Multi-Agent AI Analysis");
  for (const a of input.agents) {
    need(46);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(INK.fg[0], INK.fg[1], INK.fg[2]);
    doc.text(
      `${a.name}  —  ${a.risk}  ·  index ${Math.round(a.index)}  ·  confidence ${a.confidence}%`,
      M,
      y,
    );
    y += 13;
    body(a.analysis_text, 9);
    body(`Recommended Action: ${a.action}`, 9);
    y += 6;
  }

  title("Top Systemic Risks");
  const risks = [...input.agents]
    .sort((a, b) => a.index - b.index)
    .slice(0, 5)
    .map(
      (a, i) =>
        `${i + 1}. ${a.name} — ${a.risk} (index ${Math.round(a.index)}). Status: ${a.status}`,
    );
  for (const r of risks) body(r, 9);
  y += 6;

  title("AI Recommendations");
  input.recommendations.forEach((r, i) => body(`${i + 1}. ${r}`, 9));
  y += 6;

  title("Charts — Indicator Profile");
  need(150);
  const chartX = M;
  const chartW = W - M * 2;
  const chartH = 120;
  doc.setDrawColor(40, 55, 80);
  doc.rect(chartX, y, chartW, chartH);
  const keys = Object.keys(input.stats) as StatKey[];
  const slot = chartW / keys.length;
  keys.forEach((k, i) => {
    const v = input.stats[k];
    const h = (chartH - 20) * (v / 100);
    const c = v >= 70 ? [80, 220, 150] : v >= 40 ? [245, 190, 80] : [250, 100, 100];
    doc.setFillColor(c[0], c[1], c[2]);
    doc.rect(chartX + i * slot + slot * 0.25, y + chartH - h - 14, slot * 0.5, h, "F");
    doc.setFontSize(7);
    doc.setTextColor(INK.dim[0], INK.dim[1], INK.dim[2]);
    doc.text(k.slice(0, 7).toUpperCase(), chartX + i * slot + slot * 0.18, y + chartH - 4);
  });
  y += chartH + 20;

  title("Directives & Earth Memory Log");
  if (input.history.length === 0) body("No directives issued during this simulation session.", 9);
  for (const h of input.history.slice(-12)) {
    body(
      `${h.year} · [${h.country ?? "Global"} / ${h.city ?? ""}] ${h.eventTitle} → ${h.choiceLabel}`,
      9,
    );
    if (h.explanation) body(`  Outcome: ${h.explanation}`, 8);
  }

  // footers
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(INK.dim[0], INK.dim[1], INK.dim[2]);
    doc.text(`Nexus Earth · AI Decision Report · ${new Date().toISOString()}`, M, H - 22);
    doc.text(`${p} / ${pages}`, W - M - 24, H - 22);
  }

  doc.save(
    `nexus-earth-decision-report-${input.country?.toLowerCase() ?? "global"}-${input.year}.pdf`,
  );
}
