import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { EarthMount } from "@/components/earth/EarthMount";
import { Starfield } from "@/components/Starfield";
import { useGame } from "@/lib/game-store";
import { ArrowRight, SkipForward, Volume2, VolumeX, Sliders, Activity } from "lucide-react";
import { audioService } from "@/services/audioService";
import { AudioSettingsModal } from "@/components/audio/AudioSettingsModal";
import { ComplaintModal } from "@/components/complaints/ComplaintModal";

export const Route = createFileRoute("/")({
  component: Landing,
});

const BOOT_LINES = [
  "Welcome Commander.",
  "Initializing Nexus Earth.",
  "Connecting Multi-Agent AI.",
  "Global Digital Twin Online.",
];

function Landing() {
  const navigate = useNavigate();
  const start = useGame((s) => s.start);
  const hasSave = useGame((s) => s.started && !s.gameOver);
  const savedYear = useGame((s) => s.year);
  const savedDecisions = useGame((s) => s.history.length);

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [activeLine, setActiveLine] = useState(0);
  const [audioModal, setAudioModal] = useState(false);
  const [complaintModal, setComplaintModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  // 0 boot, 1 earth-reveal, 2 title, 3 cta

  useEffect(() => {
    setMounted(true);
    setIsMuted(audioService.getSettings().muted);
    return audioService.subscribe((s) => setIsMuted(s.muted));
  }, []);

  // Voice narration sequence for boot lines synchronized with visual lines
  useEffect(() => {
    let isCancelled = false;
    const timers: number[] = [];

    const playSequence = async () => {
      for (let i = 0; i < BOOT_LINES.length; i++) {
        if (isCancelled) return;
        setActiveLine(i);
        await audioService.speak(BOOT_LINES[i]!);
        if (isCancelled) return;
        await new Promise((r) => setTimeout(r, 260));
      }

      if (isCancelled) return;

      // Finished all 4 boot lines -> Reveal Earth, then Title, then CTA
      const t1 = window.setTimeout(() => {
        if (!isCancelled) setStep(1);
      }, 500);
      timers.push(t1);

      const t2 = window.setTimeout(() => {
        if (!isCancelled) setStep(2);
      }, 3000);
      timers.push(t2);

      const t3 = window.setTimeout(() => {
        if (!isCancelled) setStep(3);
      }, 5800);
      timers.push(t3);
    };

    void playSequence();

    return () => {
      isCancelled = true;
      timers.forEach(clearTimeout);
      audioService.stopSpeaking();
    };
  }, []);

  function beginNew() {
    audioService.playClick();
    start();
    navigate({ to: "/command" });
  }

  const skip = () => {
    audioService.stopSpeaking();
    audioService.playClick();
    setStep(3);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <Starfield dense={160} />
      <div className="pointer-events-none absolute inset-0 scanlines-strong opacity-30" />
      <div className="scan-line" />

      {/* Audio controls */}
      <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
        <button
          onClick={() => {
            audioService.playClick();
            setComplaintModal(true);
          }}
          className="glass rounded-md px-3 py-1.5 font-display text-[10px] tracking-widest text-neon hover:neon-border transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
          title="Complaint / Service Request Portal"
        >
          <Activity size={13} className="text-neon animate-pulse" />
          <span>SERVICE REQUEST</span>
        </button>

        <button
          onClick={() => {
            audioService.updateSettings({ muted: !isMuted });
            audioService.playClick();
          }}
          className="glass rounded-md p-2 hover:neon-border transition-all"
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? (
            <VolumeX size={14} className="text-danger" />
          ) : (
            <Volume2 size={14} className="text-neon" />
          )}
        </button>
        <button
          onClick={() => setAudioModal(true)}
          className="glass rounded-md p-2 hover:neon-border transition-all"
          title="Audio Settings"
        >
          <Sliders size={14} className="text-muted-foreground hover:text-neon" />
        </button>

        {/* Skip button */}
        {step < 3 && (
          <button
            onClick={skip}
            className="glass rounded-md px-3 py-2 font-display text-[10px] tracking-widest flex items-center gap-2 hover:neon-border"
          >
            <SkipForward size={12} /> SKIP INTRO
          </button>
        )}
      </div>

      <AudioSettingsModal open={audioModal} onClose={() => setAudioModal(false)} />
      <ComplaintModal open={complaintModal} onClose={() => setComplaintModal(false)} />

      {/* Earth stage */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              key="earth"
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <EarthMount health={0.75} zoom={step < 3 ? 0.8 : 0} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Boot log with glowing blue text */}
      <AnimatePresence>
        {step === 0 && (
          <motion.div
            key="boot"
            className="absolute inset-0 z-20 grid place-items-center px-6"
            exit={{ opacity: 0 }}
          >
            <div className="font-display text-sm md:text-base tracking-[0.25em] space-y-3 max-w-xl text-center">
              {BOOT_LINES.map((l, i) => (
                <motion.div
                  key={l}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: i <= activeLine ? 1 : 0.25,
                    y: 0,
                    scale: i === activeLine ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.4 }}
                  className={`transition-colors py-1 ${
                    i === activeLine
                      ? "text-cyan-400 font-bold text-shadow-neon drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                      : i < activeLine
                        ? "text-cyan-600/70"
                        : "text-muted-foreground/30"
                  }`}
                >
                  &gt; {l.toUpperCase()}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title reveal */}
      <AnimatePresence>
        {step === 2 && (
          <motion.div
            key="title"
            className="absolute inset-0 z-20 grid place-items-center px-6 text-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>
              <motion.p
                initial={{ letterSpacing: "0.1em", opacity: 0 }}
                animate={{ letterSpacing: "0.6em", opacity: 1 }}
                transition={{ duration: 1.2 }}
                className="font-display text-neon text-xs md:text-sm mb-4"
              >
                YEAR 2026
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="font-display text-4xl md:text-7xl font-black glitch-text"
              >
                NEXUS EARTH
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-4 font-display text-xs md:text-base tracking-[0.35em] text-muted-foreground"
              >
                THE AI OPERATING SYSTEM FOR HUMANITY
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="mt-3 font-display text-[10px] md:text-xs tracking-[0.5em] text-neon"
              >
                PREDICT · SIMULATE · TRANSFORM
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final CTA / commander interface */}
      <AnimatePresence>
        {step >= 3 && (
          <motion.div
            key="cta"
            className="absolute inset-0 z-20 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* top HUD */}
            <header className="flex items-center justify-between px-6 md:px-12 py-6">
              <div className="flex items-center gap-3 hud-corner rounded-md px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <p className="font-display text-[10px] tracking-[0.4em] text-muted-foreground">
                  NEXUS EARTH · COMMAND UPLINK
                </p>
              </div>
              <div className="font-display text-[10px] tracking-widest text-muted-foreground hidden md:flex gap-6">
                <span>SECTOR 04 · SOL-III</span>
                <span>UTC 04:12:07</span>
              </div>
            </header>

            <main className="flex-1 grid lg:grid-cols-[1.1fr_1fr] gap-8 px-6 md:px-12 pb-10 items-center">
              {/* Left panel */}
              <div className="holo-panel rounded-xl p-6 md:p-8 max-w-xl animate-flicker">
                <p className="font-display text-[10px] tracking-[0.5em] text-neon mb-3">
                  // CLASSIFIED · DIRECTIVE 2026-A
                </p>
                <h2 className="font-display text-3xl md:text-5xl font-black leading-tight">
                  Commander,
                  <br />
                  <span className="text-gradient">Earth needs you.</span>
                </h2>
                <p className="mt-5 text-sm md:text-base text-muted-foreground leading-relaxed">
                  Seventy-four years. Six global systems. Cascading extinction-tier events. The AI
                  Core has modeled millions of futures — only a few end with humanity intact. Your
                  directives will decide which one becomes real.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button onClick={beginNew} className="btn-neon inline-flex items-center gap-3">
                    {mounted && hasSave ? "New Simulation" : "Initiate Simulation"}
                    <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={() => {
                      audioService.playClick();
                      setComplaintModal(true);
                    }}
                    className="hud-corner rounded-md px-4 py-3 font-display tracking-widest text-xs border border-neon/40 text-neon hover:bg-neon/10 hover:neon-border flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  >
                    <Activity size={15} className="animate-pulse" />
                    PUBLIC SERVICE REQUEST
                  </button>
                  {mounted && hasSave && (
                    <button
                      onClick={() => navigate({ to: "/command" })}
                      className="hud-corner rounded-md px-5 py-3 font-display tracking-widest text-xs border border-border/60 hover:neon-border"
                    >
                      RESUME SESSION
                    </button>
                  )}
                </div>
                {mounted && hasSave && (
                  <p className="mt-3 font-display text-[10px] tracking-widest text-muted-foreground">
                    SAVED SESSION RESTORED · YEAR {savedYear} · {savedDecisions} DIRECTIVE
                    {savedDecisions === 1 ? "" : "S"}
                  </p>
                )}

                <div className="mt-8 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["6", "GLOBAL SYSTEMS"],
                    ["74", "YEAR HORIZON"],
                    ["∞", "FUTURES MODELED"],
                  ].map(([n, l]) => (
                    <div key={l} className="hud-corner rounded-md px-2 py-3">
                      <p className="font-display text-2xl font-black text-neon">{n}</p>
                      <p className="font-display text-[9px] tracking-widest text-muted-foreground mt-1">
                        {l}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — telemetry corner readouts */}
              <div className="relative min-h-[300px] hidden lg:block">
                <div className="absolute top-4 right-4 holo-panel rounded-md px-3 py-2">
                  <p className="font-display text-[9px] tracking-widest text-muted-foreground">
                    POPULATION
                  </p>
                  <p className="font-display text-lg font-black text-neon">8.14 B</p>
                </div>
                <div className="absolute top-32 right-8 holo-panel rounded-md px-3 py-2">
                  <p className="font-display text-[9px] tracking-widest text-muted-foreground">
                    ATMOSPHERE
                  </p>
                  <p className="font-display text-sm font-bold text-warning">+1.4°C</p>
                </div>
                <div className="absolute bottom-8 right-16 holo-panel rounded-md px-3 py-2">
                  <p className="font-display text-[9px] tracking-widest text-muted-foreground">
                    THREAT LEVEL
                  </p>
                  <p className="font-display text-sm font-bold text-danger">ELEVATED</p>
                </div>
                {/* radar sweep */}
                <div
                  className="absolute bottom-4 left-4 w-40 h-40 rounded-full border border-neon/40 overflow-hidden"
                  style={{
                    boxShadow: "inset 0 0 30px color-mix(in oklab, var(--neon) 20%, transparent)",
                  }}
                >
                  <div
                    className="absolute inset-0 animate-radar"
                    style={{
                      background:
                        "conic-gradient(from 0deg, color-mix(in oklab, var(--neon) 40%, transparent), transparent 25%)",
                    }}
                  />
                  <div className="absolute inset-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon" />
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
