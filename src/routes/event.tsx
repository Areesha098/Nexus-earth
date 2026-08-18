import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Starfield } from "@/components/Starfield";
import { AICore } from "@/components/AICore";
import { AIAnalysisPanel } from "@/components/ai/AIAnalysisPanel";
import { useGame, usePlanetState, type StatKey, type Choice } from "@/lib/game-store";
import { REGIONS as GEO_REGIONS } from "@/lib/regions";
import { HUDStat } from "@/components/HUDStat";
import { EVENTS, pickEventForYear } from "@/lib/events-data";
import { projectYear } from "@/lib/digital-twin";
import { AlertTriangle, ArrowLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/event")({
  component: EventScreen,
});

type Beat = "alert" | "briefing" | "analyzing" | "decision";

function EventScreen() {
  const navigate = useNavigate();
  const { year, stats, currentEventId, history, applyChoice, advanceYear } = useGame();
  const startMission = useGame((s) => s.startMission);
  const setStoreRegion = useGame((s) => s.setRegion);
  const { region: geoRegion, localStats } = usePlanetState();
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [beat, setBeat] = useState<Beat>("alert");
  const [region, setRegion] = useState<string>(geoRegion.name);

  const event = useMemo(() => {
    if (currentEventId) {
      const found = EVENTS.find((e) => e.id === currentEventId);
      if (found) return found;
    }
    return pickEventForYear(year, history);
  }, [currentEventId, year, history]);

  // Task the mission (single source of truth) for this event
  useEffect(() => {
    startMission(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id]);

  function handleRegionChange(name: string) {
    setRegion(name);
    const match = GEO_REGIONS.find(
      (r) =>
        r.name.toLowerCase() === name.toLowerCase() ||
        name.toLowerCase().includes(r.name.toLowerCase()),
    );
    if (match) setStoreRegion(match.id);
  }

  // Cinematic beat progression
  useEffect(() => {
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setBeat("briefing"), 1500));
    timers.push(window.setTimeout(() => setBeat("analyzing"), 4200));
    return () => timers.forEach(clearTimeout);
  }, []);

  const projection = useMemo(
    () => projectYear(stats, Math.min(year, 2050), history.length),
    [stats, year, history.length],
  );

  const aiInput = useMemo(
    () => ({
      year,
      disasterType: event.category,
      earthScore: projection.impact,
      sdgScore: projection.sdg,
      eventTitle: event.title,
      eventNarrative: event.narrative,
    }),
    [year, event, projection.impact, projection.sdg],
  );

  const active = event.choices.find((c) => c.id === selected) ?? null;

  function commit() {
    if (!active) return;
    applyChoice(event, active);
    advanceYear();
    navigate({ to: "/command" });
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <Starfield dense={80} />

      {/* Persistent bg image, dimmed */}
      <motion.img
        src={event.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: beat === "briefing" ? 0.9 : 0.35 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background pointer-events-none" />
      <div className="absolute inset-0 scanlines-strong opacity-25 pointer-events-none" />
      <div className="scan-line" />

      {/* BEAT A — ALERT */}
      <AnimatePresence>
        {beat === "alert" && (
          <motion.div
            key="alert"
            className="absolute inset-0 z-30 grid place-items-center animate-alert-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: [0.9, 1.03, 1] }}
              transition={{ duration: 0.8 }}
              className="text-center px-6"
            >
              <AlertTriangle size={64} className="mx-auto text-danger animate-pulse" />
              <p className="mt-6 font-display text-danger text-4xl md:text-6xl font-black tracking-[0.3em] glitch-text">
                GLOBAL EVENT
              </p>
              <p className="mt-3 font-display text-xs tracking-[0.6em] text-muted-foreground">
                YEAR {year} · CATEGORY {event.category.toUpperCase()}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip / abort */}
      <button
        onClick={() => navigate({ to: "/command" })}
        className="absolute top-5 left-5 z-40 holo-panel rounded-md px-3 py-2 font-display text-[10px] tracking-widest flex items-center gap-2"
      >
        <ArrowLeft size={12} /> ABORT
      </button>

      {/* BEAT B — BRIEFING title (persists into later beats as header) */}
      <AnimatePresence>
        {beat !== "alert" && (
          <motion.div
            key="briefing-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-6xl mx-auto pt-24 px-6 md:px-12"
          >
            <div className="inline-flex items-center gap-2 holo-panel rounded-full px-3 py-1 mb-4">
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              <span className="font-display text-[10px] tracking-widest text-danger">
                GLOBAL EVENT · YEAR {year}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight max-w-4xl glitch-text">
              {event.title}
            </h1>
            <p className="mt-2 font-display text-xs tracking-widest text-muted-foreground">
              {event.subtitle}
            </p>
            <p className="mt-6 max-w-3xl text-base md:text-lg text-muted-foreground leading-relaxed">
              {event.narrative}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BEAT C — AI CORE ANALYSIS (real AI workflow) */}
      {(beat === "analyzing" || beat === "decision") && (
        <motion.section
          key="analyze"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 mt-8"
        >
          {beat === "analyzing" && (
            <div className="flex flex-col items-center mb-6">
              <AICore size={180} />
              <p className="mt-3 font-display text-[10px] tracking-[0.5em] text-neon animate-flicker">
                // AI CORE — FORESIGHT PROTOCOL
              </p>
            </div>
          )}
          <AIAnalysisPanel
            input={aiInput}
            region={region}
            onRegionChange={handleRegionChange}
            onDone={() => setBeat("decision")}
          />
        </motion.section>
      )}

      {/* BEAT D — DECISION */}
      <AnimatePresence>
        {beat === "decision" && (
          <motion.main
            key="decision"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pb-12 mt-8"
          >
            <h2 className="font-display text-xs tracking-[0.4em] text-neon">// SELECT DIRECTIVE</h2>
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              {event.choices.map((c, i) => {
                const isSelected = selected === c.id;
                return (
                  <motion.button
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    onMouseEnter={() => setHovered(c.id)}
                    onMouseLeave={() => setHovered((h) => (h === c.id ? null : h))}
                    onFocus={() => setHovered(c.id)}
                    onBlur={() => setHovered((h) => (h === c.id ? null : h))}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                    whileHover={{ y: -4 }}
                    className={`text-left holo-panel rounded-xl p-5 transition-all ${
                      isSelected ? "neon-border" : "hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-display text-[10px] tracking-widest text-muted-foreground">
                        OPTION {String.fromCharCode(65 + i)}
                      </span>
                      {isSelected && (
                        <span className="font-display text-[10px] tracking-widest text-neon animate-flicker">
                          SELECTED
                        </span>
                      )}
                    </div>
                    <p className="font-display text-lg font-bold leading-snug">{c.label}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{c.description}</p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {(Object.keys(c.effects) as StatKey[]).map((k) => {
                        const v = c.effects[k] ?? 0;
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
                  </motion.button>
                );
              })}
            </div>

            <ImpactPreview
              choice={event.choices.find((c) => c.id === (hovered ?? selected)) ?? null}
              stats={localStats}
            />

            <div className="mt-10 flex justify-end">
              <button
                onClick={commit}
                disabled={!active}
                className="btn-neon inline-flex items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Execute directive
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}

const PREVIEW_ORDER: StatKey[] = ["climate", "water", "food", "health", "energy", "economy"];

/** Live ghost-bar preview of a directive before it is executed. */
function ImpactPreview({
  choice,
  stats,
}: {
  choice: Choice | null;
  stats: Record<StatKey, number>;
}) {
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  const projected = PREVIEW_ORDER.reduce<Record<StatKey, number>>(
    (acc, k) => {
      acc[k] = clamp(stats[k] + (choice?.effects[k] ?? 0));
      return acc;
    },
    { ...stats },
  );
  const beforeAvg = PREVIEW_ORDER.reduce((s, k) => s + stats[k], 0) / 6;
  const afterAvg = PREVIEW_ORDER.reduce((s, k) => s + projected[k], 0) / 6;
  const delta = Math.round(afterAvg - beforeAvg);

  return (
    <AnimatePresence>
      {choice && (
        <motion.div
          key={choice.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="mt-6 holo-panel rounded-xl p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <p className="font-display text-[10px] tracking-[0.4em] text-neon animate-flicker">
              // IMPACT PREVIEW
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full border border-border/60 px-2 py-0.5 font-display text-[9px] tracking-widest text-muted-foreground">
                EARTH SCORE{" "}
                <span className={delta >= 0 ? "text-success" : "text-danger"}>
                  {delta > 0 ? "+" : ""}
                  {delta}
                </span>
              </span>
              <span className="rounded-full border border-border/60 px-2 py-0.5 font-display text-[9px] tracking-widest text-muted-foreground">
                SDG{" "}
                <span className={delta >= 0 ? "text-success" : "text-danger"}>
                  {delta > 0 ? "+" : ""}
                  {Math.round(delta * 0.92)}
                </span>
              </span>
              <span className="rounded-full border border-border/60 px-2 py-0.5 font-display text-[9px] tracking-widest text-muted-foreground">
                AI CONFIDENCE{" "}
                <span className="text-neon">{72 + Math.min(20, Math.abs(delta) * 3)}%</span>
              </span>
              <span className="rounded-full border border-border/60 px-2 py-0.5 font-display text-[9px] tracking-widest text-muted-foreground">
                OUTCOME{" "}
                <span className={delta >= 0 ? "text-success" : "text-danger"}>
                  {delta > 4
                    ? "STRONG GAIN"
                    : delta > 0
                      ? "STABILISED"
                      : delta > -4
                        ? "MINOR LOSS"
                        : "SETBACK"}
                </span>
              </span>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PREVIEW_ORDER.map((k) => (
              <HUDStat key={k} id={k} value={stats[k]} preview={projected[k]} />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
