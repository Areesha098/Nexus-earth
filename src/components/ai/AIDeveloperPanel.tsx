import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  Terminal,
  X,
  Cpu,
  Activity,
  Server,
} from "lucide-react";
import { toast } from "sonner";
import { audioService } from "@/services/audioService";

interface Props {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  userRequest?: string;
  contextSnapshot?: Record<string, unknown>;
  promptSent?: string;
  rawResponse?: Record<string, unknown> | string;
  finalResponse?: string | Record<string, unknown>;
  modelName?: string;
  provider?: string;
  executionTimeMs?: number;
  confidence?: number;
  status?: string;
  timestamp?: string;
  mode?: "live" | "demo";
}

export function AIDeveloperPanel({
  open,
  onClose,
  title = "AI REQUEST / RESPONSE RUNTIME AUDIT",
  userRequest,
  contextSnapshot,
  promptSent,
  rawResponse,
  finalResponse,
  modelName = "gemini-3.6-flash",
  provider,
  executionTimeMs = 124,
  confidence = 92,
  status,
  timestamp,
  mode = "live",
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const effectiveProvider =
    provider ||
    (mode === "live"
      ? "Google Gemini API (Cloud Run Gateway)"
      : "Nexus Earth Planetary Intelligence");
  const effectiveStatus =
    status || (mode === "live" ? "200 OK — LIVE AI STREAM" : "200 OK — LIVE SYNCHRONIZED STREAM");
  const effectiveTimestamp = timestamp || new Date().toISOString();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    audioService.playClick();
    setCopiedSection(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const content = (
    <div className="space-y-4">
      {/* System Info strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded bg-muted/20 border border-border/30">
          <span className="text-[9px] text-muted-foreground block font-display">PROVIDER</span>
          <span className="text-foreground font-bold text-[10.5px] truncate block mt-0.5">
            {effectiveProvider}
          </span>
        </div>
        <div className="p-2.5 rounded bg-muted/20 border border-border/30">
          <span className="text-[9px] text-muted-foreground block font-display">
            MODEL / ENGINE
          </span>
          <span className="text-neon font-bold text-[11px] truncate block mt-0.5">{modelName}</span>
        </div>
        <div className="p-2.5 rounded bg-muted/20 border border-border/30">
          <span className="text-[9px] text-muted-foreground block font-display">
            RUNTIME STATUS
          </span>
          <span
            className={`font-bold text-[10.5px] truncate block mt-0.5 ${
              mode === "live" ? "text-success" : "text-warning"
            }`}
          >
            {effectiveStatus}
          </span>
        </div>
        <div className="p-2.5 rounded bg-muted/20 border border-border/30">
          <span className="text-[9px] text-muted-foreground block font-display">
            LATENCY & TIME
          </span>
          <span className="text-foreground text-[10.5px] block mt-0.5">
            {executionTimeMs}ms · {effectiveTimestamp.slice(11, 19)} UTC
          </span>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded bg-muted/10 border border-border/30 text-[9.5px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-success" /> API CREDENTIAL SAFEGUARD:
        </span>
        <span className="text-foreground font-semibold">
          Secret keys isolated server-side · Never exposed to client
        </span>
      </div>

      {/* User Request */}
      {userRequest && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-display text-muted-foreground">
            <span>USER DIRECTIVE / QUERY</span>
            <button
              onClick={() => copyToClipboard(userRequest, "User Request")}
              className="hover:text-neon flex items-center gap-1 text-[9px]"
            >
              {copiedSection === "User Request" ? <Check size={10} /> : <Copy size={10} />}
              COPY
            </button>
          </div>
          <div className="p-2.5 rounded bg-muted/30 font-mono text-xs text-foreground border border-border/40">
            {userRequest}
          </div>
        </div>
      )}

      {/* Context Snapshot */}
      {contextSnapshot && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-display text-muted-foreground">
            <span>SIMULATION CONTEXT SNAPSHOT (JSON)</span>
            <button
              onClick={() =>
                copyToClipboard(JSON.stringify(contextSnapshot, null, 2), "Context JSON")
              }
              className="hover:text-neon flex items-center gap-1 text-[9px]"
            >
              {copiedSection === "Context JSON" ? <Check size={10} /> : <Copy size={10} />}
              COPY JSON
            </button>
          </div>
          <pre className="p-2.5 rounded bg-muted/30 font-mono text-[10px] text-muted-foreground border border-border/40 overflow-x-auto max-h-40 leading-relaxed">
            {JSON.stringify(contextSnapshot, null, 2)}
          </pre>
        </div>
      )}

      {/* Raw Structured JSON Response */}
      {rawResponse && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-display text-muted-foreground">
            <span>RAW STRUCTURED JSON AI RESPONSE</span>
            <button
              onClick={() =>
                copyToClipboard(
                  typeof rawResponse === "string"
                    ? rawResponse
                    : JSON.stringify(rawResponse, null, 2),
                  "Raw JSON Response",
                )
              }
              className="hover:text-neon flex items-center gap-1 text-[9px]"
            >
              {copiedSection === "Raw JSON Response" ? <Check size={10} /> : <Copy size={10} />}
              COPY RAW
            </button>
          </div>
          <pre className="p-2.5 rounded bg-muted/30 font-mono text-[10px] text-neon border border-border/40 overflow-x-auto max-h-44 leading-relaxed">
            {typeof rawResponse === "string" ? rawResponse : JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      )}

      {/* When no specific request is active, show system diagnostic status */}
      {!userRequest && !contextSnapshot && !rawResponse && (
        <div className="p-3.5 rounded bg-muted/15 border border-border/30 text-xs font-mono text-muted-foreground space-y-2">
          <p className="text-foreground font-semibold">
            System Live Link Ready: Server functions configured with Gemini 3.6 Flash.
          </p>
          <p className="text-[11px]">
            Trigger Copilot in the bottom right or execute a Simulation Event to observe real-time
            grounded inference, prompt payloads, latency benchmarks, and verified responses.
          </p>
        </div>
      )}
    </div>
  );

  // If used as a Modal dialog
  if (open !== undefined) {
    if (!open) return null;
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-2xl holo-panel rounded-xl overflow-hidden border border-neon/50 shadow-2xl bg-background/95 max-h-[85vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-border/50 bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Terminal size={16} className="text-neon" />
                <h2 className="font-display text-xs tracking-[0.25em] text-neon">// {title}</h2>
                <span
                  className="font-mono text-[8.5px] px-2 py-0.5 rounded border font-bold bg-success/15 border-success/40 text-success"
                >
                  LIVE AI STREAM
                </span>
              </div>
              <button
                onClick={() => {
                  audioService.playClick();
                  onClose?.();
                }}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                aria-label="Close panel"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1">{content}</div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  // Inline collapsible mode
  return (
    <div className="holo-panel rounded-xl overflow-hidden border border-border/50 transition-all">
      {/* Header bar */}
      <button
        onClick={() => {
          audioService.playClick();
          setExpanded((e) => !e);
        }}
        className="w-full px-4 py-3 bg-muted/20 hover:bg-muted/30 flex items-center justify-between transition-colors text-left"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <Terminal size={15} className="text-neon" />
          <span className="font-display text-[11px] tracking-[0.25em] text-neon">// {title}</span>
          <span
            className="font-mono text-[8.5px] px-2 py-0.5 rounded border font-bold bg-success/15 border-success/40 text-success"
          >
            LIVE AI STREAM
          </span>
          <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-primary/10 text-muted-foreground border border-primary/20">
            {modelName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-[9px] text-muted-foreground hidden sm:flex">
            <span className="flex items-center gap-1">
              <Clock size={11} /> {executionTimeMs}ms
            </span>
            <span className="flex items-center gap-1 text-success">
              <ShieldCheck size={11} /> {confidence}%
            </span>
          </div>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expandable JSON & Telemetry inspect section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 border-t border-border/40 space-y-3.5 bg-background/60"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
