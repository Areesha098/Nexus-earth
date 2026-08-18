/**
 * Nexus Earth Audio & Voice Intelligence Engine
 * - Zero external asset dependency: Synthesizes sci-fi sound effects via Web Audio API.
 * - Manages Web Speech Synthesis with calm female AI mission-control voice.
 * - LocalStorage audio settings persistence & speech queue / overlap protection.
 */

export interface AudioSettings {
  masterVolume: number; // 0..1
  voiceVolume: number; // 0..1
  effectsVolume: number; // 0..1
  muted: boolean;
  enableVoice: boolean;
  enableEffects: boolean;
}

const SETTINGS_KEY = "nexus_earth_audio_settings";

const defaultSettings: AudioSettings = {
  masterVolume: 0.8,
  voiceVolume: 0.9,
  effectsVolume: 0.7,
  muted: false,
  enableVoice: true,
  enableEffects: true,
};

class AudioManager {
  private settings: AudioSettings;
  private ctx: AudioContext | null = null;
  private listeners: Set<(settings: AudioSettings) => void> = new Set();
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private activeUtterances: Set<SpeechSynthesisUtterance> = new Set();
  private keepAliveTimer: number | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private hasUserInteracted: boolean = false;
  private pendingNarration: {
    lines: string[];
    onLineStart?: (idx: number) => void;
    onComplete?: () => void;
  } | null = null;

  constructor() {
    this.playClick = this.playClick.bind(this);
    this.playHover = this.playHover.bind(this);
    this.playNav = this.playNav.bind(this);
    this.playSimulationStart = this.playSimulationStart.bind(this);
    this.playSimulationComplete = this.playSimulationComplete.bind(this);
    this.playAgentPulse = this.playAgentPulse.bind(this);
    this.playEmergencyAlarm = this.playEmergencyAlarm.bind(this);
    this.playSuccess = this.playSuccess.bind(this);
    this.playNotification = this.playNotification.bind(this);
    this.playGenerateReport = this.playGenerateReport.bind(this);
    this.playDownloadReport = this.playDownloadReport.bind(this);
    this.playVoiceActivate = this.playVoiceActivate.bind(this);
    this.speak = this.speak.bind(this);
    this.speakSequence = this.speakSequence.bind(this);
    this.stopSpeaking = this.stopSpeaking.bind(this);
    this.cancelSpeech = this.cancelSpeech.bind(this);
    this.toggleMute = this.toggleMute.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
    this.getSettings = this.getSettings.bind(this);
    this.subscribe = this.subscribe.bind(this);

    this.settings = this.loadSettings();
    if (typeof window !== "undefined") {
      this.initVoiceEngine();
      this.initUserGestureUnlock();
    }
  }

  private initVoiceEngine() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const updateVoices = () => {
      try {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) {
          this.cachedVoices = v;
        }
      } catch {
        /* noop */
      }
    };
    updateVoices();
    if (typeof window.speechSynthesis.onvoiceschanged !== "undefined") {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  private initUserGestureUnlock() {
    if (typeof window === "undefined") return;
    const unlock = () => {
      this.hasUserInteracted = true;
      this.unlockAudioContext();
      if ("speechSynthesis" in window) {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch {
          /* noop */
        }
      }
      if (this.pendingNarration) {
        const p = this.pendingNarration;
        this.pendingNarration = null;
        void this.speakSequence(p.lines, { onLineStart: p.onLineStart }).then(() => {
          p.onComplete?.();
        });
      }
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("click", unlock, { passive: true });
  }

  public unlockAudioContext() {
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {
        /* noop */
      }
    }
  }

  private loadSettings(): AudioSettings {
    if (typeof window === "undefined") return defaultSettings;
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        return { ...defaultSettings, ...JSON.parse(raw) };
      }
    } catch {
      /* fallback */
    }
    return defaultSettings;
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...partial };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      } catch {
        /* noop */
      }
    }
    if (this.settings.muted || !this.settings.enableVoice) {
      this.cancelSpeech();
    }
    this.notify();
  }

  public toggleMute(): boolean {
    const nextMuted = !this.settings.muted;
    this.updateSettings({ muted: nextMuted });
    return nextMuted;
  }

  public subscribe(cb: (settings: AudioSettings) => void): () => void {
    this.listeners.add(cb);
    cb(this.getSettings());
    return () => this.listeners.delete(cb);
  }

  private notify() {
    const s = this.getSettings();
    this.listeners.forEach((cb) => cb(s));
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private getEffectiveEffectsVol(): number {
    if (this.settings.muted || !this.settings.enableEffects) return 0;
    return this.settings.masterVolume * this.settings.effectsVolume;
  }

  private getEffectiveVoiceVol(): number {
    if (this.settings.muted || !this.settings.enableVoice) return 0;
    return this.settings.masterVolume * this.settings.voiceVolume;
  }

  // ==========================================
  // WEBAUDIO SFX SYNTHESIZERS
  // ==========================================

  /** Subtle soft sci-fi hover sound */
  public playHover() {
    const vol = this.getEffectiveEffectsVol();
    if (vol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

      gain.gain.setValueAtTime(0.04 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      /* ignore audio context restrictions */
    }
  }

  /** Digital confirmation click sound */
  public playClick() {
    const vol = this.getEffectiveEffectsVol();
    if (vol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(720, now);
      osc.frequency.exponentialRampToValueAtTime(1440, now + 0.06);

      gain.gain.setValueAtTime(0.08 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      /* ignore */
    }
  }

  /** Smooth navigation / transition sweep */
  public playNav() {
    const vol = this.getEffectiveEffectsVol();
    if (vol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);

      gain.gain.setValueAtTime(0.06 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      /* ignore */
    }
  }

  /** System activation chord on simulation start */
  public playSimulationStart() {
    const vol = this.getEffectiveEffectsVol();
    if (vol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const freqs = [220, 330, 440, 660];
      const now = ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.25);

        gain.gain.setValueAtTime(0.05 * vol, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + 0.35);
      });
    } catch {
      /* ignore */
    }
  }

  /** Mission complete harmonic chime */
  public playSimulationComplete() {
    const vol = this.getEffectiveEffectsVol();
    if (vol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio
      const now = ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.06 * vol, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.45);
      });
    } catch {
      /* ignore */
    }
  }

  /** Generate report processing tick */
  public playGenerateReport() {
    const vol = this.getEffectiveEffectsVol();
    if (vol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.setValueAtTime(1200, now + 0.05);

      gain.gain.setValueAtTime(0.06 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      /* ignore */
    }
  }

  /** Download report success chime */
  public playDownloadReport() {
    const vol = this.getEffectiveEffectsVol();
    if (vol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const freqs = [659.25, 880, 1174.66];
      const now = ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.07 * vol, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch {
      /* ignore */
    }
  }

  /** Crisp positive confirmation / success chime */
  public playSuccess() {
    const vol = this.getEffectiveEffectsVol();
    if (vol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      const now = ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.06 * vol, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.3);
      });
    } catch {
      /* ignore */
    }
  }

  /** Short futuristic alert beep */
  public playNotification() {
    const vol = this.getEffectiveEffectsVol();
    if (vol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.06);

      gain.gain.setValueAtTime(0.07 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      /* ignore */
    }
  }

  /** Microphone activation ping */
  public playVoiceActivate() {
    const vol = this.getEffectiveEffectsVol();
    if (vol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.09);

      gain.gain.setValueAtTime(0.08 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      /* ignore */
    }
  }

  /** Agent calculation pulse */
  public playAgentPulse() {
    const vol = this.getEffectiveEffectsVol();
    if (vol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(380 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.05);

      gain.gain.setValueAtTime(0.03 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      /* ignore */
    }
  }

  /** Critical emergency alarm tone */
  public playEmergencyAlarm() {
    const vol = this.getEffectiveEffectsVol();
    if (vol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [880, 440, 880, 440];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.06 * vol, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.07);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.07);
      });
    } catch {
      /* ignore */
    }
  }

  // ==========================================
  // SPEECH SYNTHESIS ENGINE (NON-OVERLAPPING)
  // ==========================================

  public cancelSpeech() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (this.keepAliveTimer !== null) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
    this.activeUtterances.clear();
    this.currentUtterance = null;
  }

  public stopSpeaking() {
    this.cancelSpeech();
  }

  public stop() {
    this.cancelSpeech();
  }

  public pickFemaleVoice(): SpeechSynthesisVoice | null {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const voices =
      this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();

    if (!voices || voices.length === 0) return null;

    // Prefer natural English female voices
    const preferredNames = [
      "Google US English",
      "Samantha",
      "Victoria",
      "Karen",
      "Microsoft Zira",
      "Microsoft Jenny",
      "Google UK English Female",
      "Natural",
    ];

    for (const name of preferredNames) {
      const found = voices.find(
        (v) =>
          v.name.toLowerCase().includes(name.toLowerCase()) ||
          (v.lang.startsWith("en") && v.name.toLowerCase().includes("female")),
      );
      if (found) return found;
    }

    const enVoice = voices.find((v) => v.lang.startsWith("en"));
    return enVoice ?? voices[0] ?? null;
  }

  /**
   * Speaks a line of text using Web Speech Synthesis.
   * Cancels prior speech to guarantee zero overlapping.
   * Returns a promise that resolves when speech completes or errors.
   */
  public speak(
    text: string,
    options?: { onStart?: () => void; onEnd?: () => void; rate?: number; pitch?: number },
  ): Promise<void> {
    return new Promise((resolve) => {
      const vol = this.getEffectiveVoiceVol();
      if (vol <= 0 || typeof window === "undefined" || !("speechSynthesis" in window)) {
        options?.onStart?.();
        options?.onEnd?.();
        resolve();
        return;
      }

      this.cancelSpeech();

      // Clean speech text from special markdown characters, links, and symbols
      const clean = text
        .replace(/[*_#`~[\]]/g, "")
        .replace(/\/\//g, "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/—/g, ", ")
        .replace(/·/g, ", ")
        .replace(/\s+/g, " ")
        .trim();

      if (!clean) {
        options?.onStart?.();
        options?.onEnd?.();
        resolve();
        return;
      }

      // Resume synthesis if suspended/paused in Chromium
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {
        /* noop */
      }

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.volume = vol;
      utterance.rate = options?.rate ?? 0.98;
      utterance.pitch = options?.pitch ?? 1.02;

      const voice = this.pickFemaleVoice();
      if (voice) {
        utterance.voice = voice;
      }

      let isFinished = false;
      let watchdogTimer: number | null = null;

      const cleanup = () => {
        if (isFinished) return;
        isFinished = true;
        if (watchdogTimer !== null) {
          clearTimeout(watchdogTimer);
          watchdogTimer = null;
        }
        if (this.keepAliveTimer !== null) {
          clearInterval(this.keepAliveTimer);
          this.keepAliveTimer = null;
        }
        this.activeUtterances.delete(utterance);
        if (this.currentUtterance === utterance) {
          this.currentUtterance = null;
        }
        options?.onEnd?.();
      };

      utterance.onstart = () => {
        options?.onStart?.();
        // Chrome 15s pause workaround: keep synthesis active
        if (this.keepAliveTimer !== null) clearInterval(this.keepAliveTimer);
        this.keepAliveTimer = window.setInterval(() => {
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            try {
              if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
                window.speechSynthesis.pause();
                window.speechSynthesis.resume();
              }
            } catch {
              /* noop */
            }
          }
        }, 4500);
      };

      utterance.onend = () => {
        cleanup();
        resolve();
      };

      utterance.onerror = (e) => {
        console.debug("Speech synthesis notice:", e?.error ?? "finished");
        cleanup();
        resolve();
      };

      // Watchdog timer: safety resolve if browser freezes speech event
      const estimatedDurationMs = Math.max(3500, Math.min(25000, clean.length * 90));
      watchdogTimer = window.setTimeout(() => {
        if (!isFinished) {
          cleanup();
          resolve();
        }
      }, estimatedDurationMs);

      this.currentUtterance = utterance;
      this.activeUtterances.add(utterance);

      try {
        window.speechSynthesis.speak(utterance);
        // Force resume in case browser queued it in paused state
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (err) {
        console.debug("SpeechSynthesis.speak failed", err);
        cleanup();
        resolve();
      }
    });
  }

  /**
   * Speaks a list of phrases in strict sequential order with a small pause between lines.
   */
  public async speakSequence(
    phrases: string[],
    options?: { onLineStart?: (index: number) => void },
  ): Promise<void> {
    for (let i = 0; i < phrases.length; i++) {
      const phrase = phrases[i];
      if (!phrase) continue;
      options?.onLineStart?.(i);
      await this.speak(phrase);
      // Brief pause between lines
      await new Promise((r) => setTimeout(r, 280));
    }
  }

  /**
   * Queues or starts the startup intro narration.
   * If autoplay is blocked on initial mount, triggers automatically on first user click.
   */
  public queueStartupNarration(
    lines: string[],
    onLineStart?: (index: number) => void,
    onComplete?: () => void,
  ): void {
    this.pendingNarration = { lines, onLineStart, onComplete };
    // Attempt immediate playback
    void this.speakSequence(lines, { onLineStart })
      .then(() => {
        this.pendingNarration = null;
        onComplete?.();
      })
      .catch(() => {
        /* fallback stored in pendingNarration */
      });
  }
}

export const audioService = new AudioManager();
