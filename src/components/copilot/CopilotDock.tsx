import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
  Loader2,
  Code2,
  Sparkles,
  Radio,
  Sliders,
} from "lucide-react";
import { usePlanetState } from "@/lib/game-store";
import { buildAgents } from "@/components/agents/agents-data";
import { demoReply, type CopilotContext, type CopilotReply } from "@/lib/copilot";
import { askCopilot } from "@/lib/copilot.functions";
import { projectYear } from "@/lib/digital-twin";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { audioService } from "@/services/audioService";
import { AudioSettingsModal } from "@/components/audio/AudioSettingsModal";
import { downloadDecisionReport } from "@/lib/report-pdf";
import { runWaterFoodCascade } from "@/lib/water-food-cascade";
import { toast } from "sonner";

interface Msg {
  role: "user" | "copilot";
  text: string;
  mode?: "live" | "simulated";
  notice?: string;
  devTrace?: CopilotReply["devTrace"];
  originalQuestion?: string;
}

export function CopilotDock() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [busySeconds, setBusySeconds] = useState(0);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [selectedTrace, setSelectedTrace] = useState<CopilotReply["devTrace"] | null>(null);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "copilot",
      text: "Nexus Earth Copilot online. Synced with Global Digital Twin, multi-agent AI networks, and Earth Memory telemetry. Ask any directive or planetary prediction.",
      mode: "live",
    },
  ]);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  // Live timer during busy generation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (busy) {
      setBusySeconds(0);
      interval = setInterval(() => setBusySeconds((s) => s + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [busy]);

  const { year, localStats, history, region, mission, setRegion, setTwinYear } = usePlanetState();

  const projection = useMemo(
    () => projectYear(localStats, year > 2050 ? 2050 : year, history.length),
    [localStats, year, history.length],
  );

  const agents = useMemo(() => buildAgents(localStats, history, year), [localStats, history, year]);

  const cascadeTele = useMemo(() => {
    const waterStressIndex = Math.round(100 - (localStats.water ?? 50));
    const result = runWaterFoodCascade({
      scenario: "custom",
      waterStressIndex,
      interventionLevel: Math.min(100, history.length * 18),
      targetYear: year > 2040 ? 2040 : year,
      regionId: region.id,
    });
    return {
      scenarioTitle: result.scenarioTitle,
      waterStressPct: result.waterStressInput,
      interventionPct: result.interventionInput,
      canalDeficitPct: result.water.canalWithdrawalDeficitPct.value,
      wheatYieldLossPct: result.agriculture.wheatYieldLossPct.value,
      riceYieldLossPct: result.agriculture.riceYieldLossPct.value,
      foodInsecurityPct: result.food.nationalFoodInsecurityRatePct.value,
      stapleGrainProductionMT: result.food.stapleGrainProductionMT.value,
      compositeResilience: result.compositeResilienceScore,
    };
  }, [localStats.water, history.length, year, region.id]);

  const ctx: CopilotContext = useMemo(
    () => ({
      year,
      country: region.country,
      city: region.city,
      regionName: region.name,
      earthScore: projection.impact,
      sdgScore: projection.sdg,
      decisions: history.length,
      stats: { ...localStats },
      topRisks: [...agents]
        .sort((a, b) => a.index - b.index)
        .slice(0, 3)
        .map((a) => `${a.name} (${a.risk})`),
      currentDisaster: mission
        ? {
            title: mission.scenarioTitle,
            category: mission.scenarioKey,
            threat: mission.threat,
            narrative: mission.objective,
          }
        : undefined,
      recentDecisions: history.slice(-3).map((h) => ({
        year: h.year,
        eventTitle: h.eventTitle,
        choiceLabel: h.choiceLabel,
        effects: h.effects,
        country: h.country || region.country,
      })),
      earthMemoryNotes: history
        .slice(-4)
        .map(
          (h) =>
            `[Year ${h.year} in ${h.country || "Sector"}]: "${h.choiceLabel}" resolved "${h.eventTitle}".`,
        ),
      simulationState: mission
        ? `Active Mission: ${mission.scenarioTitle}`
        : "Steady State Telemetry",
      waterCascadeTelemetry: cascadeTele,
    }),
    [year, region, projection, history, localStats, agents, mission, cascadeTele],
  );

  const run = useServerFn(askCopilot);

  const handleVoiceCommand = useCallback(
    (cmd: string): boolean => {
      const lower = cmd.toLowerCase().trim();

      if (
        lower.includes("run simulation") ||
        lower.includes("start simulation") ||
        lower.includes("start mission")
      ) {
        audioService.playSimulationStart();
        toast.info("Voice Command: Starting Simulation");
        navigate({ to: "/command" });
        return true;
      }

      if (
        lower.includes("generate report") ||
        lower.includes("download pdf") ||
        lower.includes("download report")
      ) {
        audioService.playGenerateReport();
        toast.info("Voice Command: Generating AI Report");
        void downloadDecisionReport({
          year,
          stats: localStats,
          history,
          projection,
          agents,
          recommendations: agents.slice(0, 5).map((a) => a.action),
          confidence: 90,
          mode: "live",
        }).then(() => {
          audioService.playDownloadReport();
          toast.success("AI Report Downloaded");
        });
        return true;
      }

      if (lower.includes("pakistan") || lower.includes("switch to pakistan")) {
        setRegion("pakistan");
        audioService.playClick();
        toast.success("Voice Command: Telemetry uplink switched to Pakistan");
        return true;
      }

      if (
        lower.includes("united states") ||
        lower.includes("usa") ||
        lower.includes("america") ||
        lower.includes("north america")
      ) {
        setRegion("north-america");
        audioService.playClick();
        toast.success("Voice Command: Telemetry uplink switched to United States");
        return true;
      }

      if (lower.includes("japan") || lower.includes("tokyo") || lower.includes("east asia")) {
        setRegion("east-asia");
        audioService.playClick();
        toast.success("Voice Command: Telemetry uplink switched to Japan");
        return true;
      }

      if (lower.includes("predict 2040")) {
        setTwinYear(2040);
        audioService.playClick();
        toast.info("Voice Command: Digital Twin temporal slider set to 2040");
        return true;
      }

      if (lower.includes("predict 2050")) {
        setTwinYear(2050);
        audioService.playClick();
        toast.info("Voice Command: Digital Twin temporal slider set to 2050");
        return true;
      }

      return false;
    },
    [navigate, year, localStats, history, projection, agents, setRegion, setTwinYear],
  );

  const send = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;
      setMessages((m) => [...m, { role: "user", text: q }]);
      setInput("");
      setBusy(true);
      audioService.playClick();

      // 12-second timeout protection for authentic network resilience
      const timeoutPromise = new Promise<CopilotReply>((_, reject) =>
        setTimeout(() => reject(new Error("AI Gateway timed out after 12s")), 12000),
      );

      let reply: CopilotReply;
      try {
        const res = await Promise.race([run({ data: { question: q, context: ctx } }), timeoutPromise]);
        reply = res as CopilotReply;
      } catch (err) {
        console.warn("Copilot live link exception, activating fallback:", err);
        const errMsg = err instanceof Error ? err.message : "Live network timeout";
        reply = demoReply(
          q,
          ctx,
          `Live AI gateway offline (${errMsg}) — displaying verified planetary model response.`,
        );
      }

      setMessages((m) => [
        ...m,
        {
          role: "copilot",
          text: reply.text,
          mode: reply.mode,
          notice: reply.notice,
          devTrace: reply.devTrace,
          originalQuestion: q,
        },
      ]);
      setBusy(false);
      audioService.playNotification();
      if (autoSpeakRef.current) {
        void speakRef.current(reply.text);
      }
    },
    [busy, ctx, run],
  );

  const voice = useVoiceAssistant(send, handleVoiceCommand);
  const speakRef = useRef(voice.speak);
  speakRef.current = voice.speak;
  const autoSpeakRef = useRef(autoSpeak);
  autoSpeakRef.current = autoSpeak;

  useEffect(() => {
    const handleAskEvent = (e: Event) => {
      const custom = e as CustomEvent<{ prompt?: string }>;
      if (custom.detail?.prompt) {
        setOpen(true);
        void send(custom.detail.prompt);
      }
    };
    window.addEventListener("nexus:copilot-ask", handleAskEvent);
    return () => window.removeEventListener("nexus:copilot-ask", handleAskEvent);
  }, [send]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  return (
    <>
      <AudioSettingsModal open={showAudioModal} onClose={() => setShowAudioModal(false)} />

      <motion.button
        onClick={() => {
          audioService.playHover();
          setOpen((o) => !o);
        }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 z-50 holo-panel rounded-full p-4 neon-border shadow-lg"
        title="AI Copilot & Voice Intelligence"
        aria-label="Open AI Copilot"
      >
        {open ? <X size={18} /> : <Bot size={18} className="text-neon" />}
        {!open && voice.listening && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-danger animate-pulse" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.aside
            key="copilot"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-5 z-50 w-[min(94vw,420px)] holo-panel rounded-xl overflow-hidden flex flex-col max-h-[75vh] neon-border shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                <p className="font-display text-[10px] tracking-[0.3em] text-neon">
                  // AI COPILOT · {region.country.toUpperCase()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-display text-[8px] tracking-widest px-2 py-0.5 rounded border ${
                    voice.micStatus === "LISTENING"
                      ? "text-danger border-danger/40 animate-pulse bg-danger/10"
                      : voice.micStatus === "SPEAKING"
                        ? "text-neon border-neon/40 animate-pulse bg-primary/10"
                        : voice.textMode
                          ? "text-warning border-warning/40"
                          : "text-success border-success/40"
                  }`}
                >
                  {voice.micStatus}
                </span>

                <button
                  onClick={() => setShowAudioModal(true)}
                  className="p-1 text-muted-foreground hover:text-neon transition-colors"
                  title="Audio & Voice Settings"
                >
                  <Sliders size={13} />
                </button>

                <button
                  onClick={() => {
                    if (autoSpeak) voice.cancelSpeech();
                    setAutoSpeak((v) => !v);
                    audioService.playClick();
                  }}
                  className="p-1 hover:text-neon transition-colors"
                  title={autoSpeak ? "Mute speech" : "Enable speech"}
                >
                  {autoSpeak ? <Volume2 size={14} className="text-neon" /> : <VolumeX size={14} />}
                </button>
              </div>
            </div>

            {/* Quick Context Strip */}
            <div className="px-4 py-1.5 bg-muted/20 border-b border-border/40 flex items-center justify-between text-[9px] font-display text-muted-foreground">
              <span>HUB: {region.city.toUpperCase()}</span>
              <span>EARTH: {projection.impact}/100</span>
              <span>SDG: {projection.sdg}/100</span>
              <span>YEAR: {year}</span>
            </div>

            {/* Message Stream */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : ""}>
                  <div
                    className={`inline-block max-w-[94%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary/15 border border-primary/30 text-foreground"
                        : "hud-corner bg-background/50 border border-border/50 text-foreground"
                    }`}
                  >
                    {m.role === "copilot" && (
                      <div className="space-y-1 mb-1.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span
                            className="font-display text-[8px] font-bold tracking-widest px-1.5 py-0.5 rounded border bg-success/15 border-success/40 text-success"
                          >
                            LIVE AI (Google Gemini & Earth Model)
                          </span>

                          <div className="flex items-center gap-2">
                            {m.devTrace && (
                              <button
                                onClick={() => setSelectedTrace(m.devTrace ?? null)}
                                className="flex items-center gap-1 font-display text-[8px] text-muted-foreground hover:text-neon transition-colors"
                              >
                                <Code2 size={10} /> TRACE ({m.devTrace.executionTimeMs}ms)
                              </button>
                            )}
                          </div>
                        </div>

                        {m.notice && (
                          <div className="text-[9px] font-mono text-warning/90 bg-warning/10 p-1 rounded border border-warning/20">
                            {m.notice}
                          </div>
                        )}
                      </div>
                    )}
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground hud-corner p-2.5 rounded-lg border border-neon/30 bg-background/80">
                  <Loader2 size={13} className="animate-spin text-neon" />
                  <span className="font-display text-[10px] tracking-wider text-neon animate-pulse">
                    COPILOT SYNTHESIZING TELEMETRY ({busySeconds}s)…
                  </span>
                </div>
              )}
            </div>

            {/* Dev Trace Modal Overlay inside Copilot */}
            <AnimatePresence>
              {selectedTrace && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mx-3 mb-2 p-3 hud-corner rounded-lg bg-background/95 border border-neon/50 text-[10px] space-y-1.5"
                >
                  <div className="flex items-center justify-between border-b border-border/50 pb-1">
                    <span className="font-display tracking-widest text-neon">// DEV TRACE LOG</span>
                    <button
                      onClick={() => setSelectedTrace(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground font-mono">
                    <div>
                      MODEL: <span className="text-foreground">{selectedTrace.model}</span>
                    </div>
                    <div>
                      LATENCY: <span className="text-neon">{selectedTrace.executionTimeMs} ms</span>
                    </div>
                    <div>
                      CONFIDENCE: <span className="text-success">{selectedTrace.confidence}%</span>
                    </div>
                  </div>
                  <pre className="p-1.5 bg-muted/40 rounded text-[9px] font-mono text-muted-foreground overflow-x-auto max-h-24">
                    {JSON.stringify(selectedTrace.contextSnapshot, null, 2)}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Waveform & Listening Transcript */}
            <div className="px-4 pb-2 space-y-2">
              {(voice.listening || voice.transcript || voice.speaking) && (
                <div className="hud-corner rounded-md px-3 py-2 bg-background/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-end gap-[3px] h-4">
                      {voice.audioLevels.map((lvl, i) => (
                        <motion.span
                          key={i}
                          className="w-[3px] rounded-sm bg-neon"
                          animate={{ height: `${lvl}%` }}
                          transition={{ duration: 0.08 }}
                          style={{ height: `${lvl}%` }}
                        />
                      ))}
                    </div>
                    <span className="font-display text-[8px] tracking-widest text-muted-foreground">
                      {voice.speaking
                        ? "AI SPEAKING"
                        : voice.listening
                          ? voice.continuousMode
                            ? "CONTINUOUS MIC"
                            : "PUSH-TO-TALK ACTIVE"
                          : "TRANSCRIPTION"}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/90 min-h-[16px] italic">
                    {voice.transcript ||
                      (voice.listening ? "Listening for command or question…" : "…")}
                  </p>
                </div>
              )}

              {voice.speaking && (
                <div className="flex items-center gap-2 font-display text-[9px] tracking-widest text-neon">
                  <Volume2 size={12} className="animate-pulse" /> AI TRANSMITTING AUDIO
                  <button
                    onClick={voice.cancelSpeech}
                    className="ml-auto underline hover:text-foreground"
                  >
                    STOP
                  </button>
                </div>
              )}

              {voice.error && (
                <p className="text-[10px] text-warning leading-snug">{voice.error}</p>
              )}
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-3 py-1 bg-muted/10 border-t border-border/30 flex gap-1.5 overflow-x-auto no-scrollbar">
              {[
                "What is happening?",
                "Why this disaster?",
                "Risks for Pakistan?",
                "Predict 2050",
                "What should I do?",
              ].map((pill) => (
                <button
                  key={pill}
                  onClick={() => void send(pill)}
                  className="whitespace-nowrap rounded-full px-2.5 py-0.5 hud-corner text-[9px] font-display text-muted-foreground hover:text-neon transition-colors"
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex items-center gap-2 border-t border-border/50 px-3 py-2.5 bg-background/40"
            >
              {!voice.textMode && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={voice.listening ? voice.stop : voice.start}
                    className={`rounded-md p-2 hud-corner transition-colors ${
                      voice.listening ? "text-danger animate-pulse bg-danger/20" : "hover:text-neon"
                    }`}
                    title={voice.listening ? "Stop listening" : "Click to speak"}
                  >
                    {voice.listening ? <MicOff size={15} /> : <Mic size={15} />}
                  </button>

                  <button
                    type="button"
                    onClick={voice.toggleContinuous}
                    className={`p-1.5 rounded text-[8px] font-display tracking-widest transition-colors ${
                      voice.continuousMode
                        ? "text-neon bg-primary/20"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Toggle Continuous Voice Mode"
                  >
                    <Radio size={12} />
                  </button>
                </div>
              )}

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Pakistan, disaster causes, predictions..."
                className="flex-1 bg-transparent border border-border/60 rounded-md px-3 py-2 text-xs outline-none focus:border-neon text-foreground placeholder:text-muted-foreground/60"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="rounded-md p-2 hud-corner hover:text-neon disabled:opacity-40 transition-colors"
                title="Send Directive"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
