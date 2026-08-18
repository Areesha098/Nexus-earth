import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, X, Sliders, Mic, Sparkles } from "lucide-react";
import { audioService, type AudioSettings } from "@/services/audioService";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AudioSettingsModal({ open, onClose }: Props) {
  const [settings, setSettings] = useState<AudioSettings>(audioService.getSettings());

  useEffect(() => {
    return audioService.subscribe(setSettings);
  }, []);

  const update = (partial: Partial<AudioSettings>) => {
    audioService.updateSettings(partial);
    audioService.playClick();
  };

  const testVoice = () => {
    void audioService.speak("Nexus Earth audio and voice synthesis online. All systems nominal.");
  };

  const testSfx = () => {
    audioService.playSimulationStart();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative z-10 w-full max-w-md holo-panel rounded-2xl p-6 neon-border space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-neon" />
                <h3 className="font-display text-sm tracking-[0.3em] text-neon">
                  // AUDIO & VOICE CONTROL
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Master Mute Toggle */}
            <div className="flex items-center justify-between p-3 hud-corner rounded-lg">
              <div className="flex items-center gap-3">
                {settings.muted ? (
                  <VolumeX size={18} className="text-danger" />
                ) : (
                  <Volume2 size={18} className="text-neon" />
                )}
                <div>
                  <p className="font-display text-xs tracking-wider">MASTER AUDIO</p>
                  <p className="text-[11px] text-muted-foreground">
                    {settings.muted ? "Audio Muted" : "System Audio Active"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => update({ muted: !settings.muted })}
                className={`font-display text-[10px] tracking-widest px-3 py-1.5 rounded transition-all ${
                  settings.muted
                    ? "bg-danger/20 text-danger border border-danger/40"
                    : "bg-primary/20 text-neon border border-neon/40"
                }`}
              >
                {settings.muted ? "UNMUTE" : "MUTE ALL"}
              </button>
            </div>

            {/* Volume Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-display tracking-wider text-muted-foreground">
                    MASTER VOLUME
                  </span>
                  <span className="font-display text-neon">
                    {Math.round(settings.masterVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.masterVolume}
                  onChange={(e) => update({ masterVolume: parseFloat(e.target.value) })}
                  className="w-full accent-primary h-1.5 rounded-lg bg-muted/40 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-display tracking-wider text-muted-foreground">
                    AI VOICE VOLUME (TTS)
                  </span>
                  <span className="font-display text-neon">
                    {Math.round(settings.voiceVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.voiceVolume}
                  onChange={(e) => update({ voiceVolume: parseFloat(e.target.value) })}
                  className="w-full accent-primary h-1.5 rounded-lg bg-muted/40 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-display tracking-wider text-muted-foreground">
                    SFX / TELEMETRY VOLUME
                  </span>
                  <span className="font-display text-neon">
                    {Math.round(settings.effectsVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.effectsVolume}
                  onChange={(e) => update({ effectsVolume: parseFloat(e.target.value) })}
                  className="w-full accent-primary h-1.5 rounded-lg bg-muted/40 cursor-pointer"
                />
              </div>
            </div>

            {/* Individual Feature Toggles */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => update({ enableVoice: !settings.enableVoice })}
                className={`p-3 rounded-lg text-left transition-all border ${
                  settings.enableVoice
                    ? "border-neon/50 bg-primary/10 text-foreground"
                    : "border-border/40 bg-muted/20 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Mic size={14} className={settings.enableVoice ? "text-neon" : ""} />
                  <p className="font-display text-xs tracking-wider">AI SPEECH</p>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {settings.enableVoice ? "Enabled" : "Disabled"}
                </p>
              </button>

              <button
                onClick={() => update({ enableEffects: !settings.enableEffects })}
                className={`p-3 rounded-lg text-left transition-all border ${
                  settings.enableEffects
                    ? "border-neon/50 bg-primary/10 text-foreground"
                    : "border-border/40 bg-muted/20 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className={settings.enableEffects ? "text-neon" : ""} />
                  <p className="font-display text-xs tracking-wider">SFX AUDIO</p>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {settings.enableEffects ? "Enabled" : "Disabled"}
                </p>
              </button>
            </div>

            {/* Test Audio Buttons */}
            <div className="flex gap-2 pt-2 border-t border-border/50">
              <button
                onClick={testVoice}
                className="flex-1 rounded-md px-3 py-2 hud-corner text-xs font-display tracking-wider hover:text-neon transition-colors"
              >
                TEST VOICE
              </button>
              <button
                onClick={testSfx}
                className="flex-1 rounded-md px-3 py-2 hud-corner text-xs font-display tracking-wider hover:text-neon transition-colors"
              >
                TEST SFX
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
