import { useCallback, useEffect, useRef, useState } from "react";
import { audioService } from "@/services/audioService";

interface SpeechRecognitionResultItemLike {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionResultItemLike;
}

interface SpeechRecognitionResultListLike {
  readonly length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike {
  readonly error?: string;
  readonly message?: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

type Ctor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): Ctor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: Ctor; webkitSpeechRecognition?: Ctor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface VoiceState {
  supported: boolean;
  listening: boolean;
  speaking: boolean;
  continuousMode: boolean;
  transcript: string;
  error: string | null;
  textMode: boolean;
  audioLevels: number[];
  micStatus: "IDLE" | "LISTENING" | "THINKING" | "SPEAKING" | "TEXT MODE" | "ERROR";
  start: () => void;
  stop: () => void;
  toggleContinuous: () => void;
  speak: (text: string) => Promise<void>;
  cancelSpeech: () => void;
  clearTranscript: () => void;
}

export function useVoiceAssistant(
  onFinal: (text: string) => void,
  onVoiceCommand?: (command: string) => boolean,
): VoiceState {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [textMode, setTextMode] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 25, 40, 30, 20, 35, 18]);

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const listeningRef = useRef(listening);
  listeningRef.current = listening;
  const finalRef = useRef(onFinal);
  finalRef.current = onFinal;
  const commandRef = useRef(onVoiceCommand);
  commandRef.current = onVoiceCommand;

  // Waveform animation loop when listening or speaking
  useEffect(() => {
    if (!listening && !speaking) {
      setAudioLevels([12, 12, 12, 12, 12, 12, 12]);
      return;
    }
    const interval = window.setInterval(() => {
      setAudioLevels(
        Array.from({ length: 7 }, () =>
          listening
            ? Math.floor(25 + Math.random() * 70)
            : speaking
              ? Math.floor(35 + Math.random() * 60)
              : 15,
        ),
      );
    }, 90);
    return () => clearInterval(interval);
  }, [listening, speaking]);

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    const speech = typeof window !== "undefined" && "speechSynthesis" in window;
    setSupported(Boolean(Ctor));
    if (!Ctor) {
      setTextMode(true);
      if (!speech) setError("Voice features are unavailable in this browser — text mode active.");
      return;
    }

    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = continuousMode;
    rec.interimResults = true;

    rec.onresult = (e: SpeechRecognitionEventLike) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      const current = final || interim;
      setTranscript(current);

      if (final.trim()) {
        const text = final.trim();
        // Check if this matches a voice command first
        const handled = commandRef.current ? commandRef.current(text) : false;
        if (!handled) {
          finalRef.current(text);
        }
        if (!continuousMode) {
          setListening(false);
        }
      }
    };

    rec.onerror = (e: SpeechRecognitionErrorEventLike) => {
      const code = String(e?.error ?? "unknown");
      setListening(false);
      if (code === "not-allowed" || code === "service-not-allowed") {
        setTextMode(true);
        setError("Microphone permission denied — switched to text mode.");
      } else if (code !== "aborted" && code !== "no-speech") {
        setError(`Voice input error (${code}). Type your question instead.`);
      }
    };

    rec.onend = () => {
      if (continuousMode && listeningRef.current) {
        try {
          rec.start();
        } catch {
          setListening(false);
        }
      } else {
        setListening(false);
      }
    };

    recRef.current = rec;

    return () => {
      try {
        rec.abort();
      } catch {
        /* noop */
      }
      recRef.current = null;
    };
  }, [continuousMode]);

  const start = useCallback(() => {
    const rec = recRef.current;
    if (!rec) {
      setTextMode(true);
      return;
    }
    setError(null);
    setTranscript("");
    audioService.playVoiceActivate();
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => {
    const rec = recRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    }
    setListening(false);
  }, []);

  const toggleContinuous = useCallback(() => {
    setContinuousMode((c) => !c);
    audioService.playClick();
  }, []);

  const speak = useCallback(async (text: string) => {
    setSpeaking(true);
    await audioService.speak(text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
    setSpeaking(false);
  }, []);

  const cancelSpeech = useCallback(() => {
    audioService.cancelSpeech();
    setSpeaking(false);
  }, []);

  const clearTranscript = useCallback(() => setTranscript(""), []);

  const micStatus: VoiceState["micStatus"] = textMode
    ? "TEXT MODE"
    : error
      ? "ERROR"
      : speaking
        ? "SPEAKING"
        : listening
          ? "LISTENING"
          : "IDLE";

  return {
    supported,
    listening,
    speaking,
    continuousMode,
    transcript,
    error,
    textMode,
    audioLevels,
    micStatus,
    start,
    stop,
    toggleContinuous,
    speak,
    cancelSpeech,
    clearTranscript,
  };
}
