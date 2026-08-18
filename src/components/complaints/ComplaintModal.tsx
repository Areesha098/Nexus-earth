import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Droplets,
  Zap,
  Trash2,
  HelpCircle,
  Copy,
  Check,
  Building2,
  Sparkles,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Radio,
  FileText,
  MapPin,
  Filter,
  PlusCircle,
  Activity,
  PhoneCall,
  UserCheck,
} from "lucide-react";
import {
  SERVICE_OPTIONS,
  type ServiceType,
  type Complaint,
  type ComplaintStatus,
  getStoredComplaints,
  saveComplaintToStore,
  updateComplaintStatusInStore,
  generateComplaintId,
} from "@/lib/complaints-data";
import { classifyServiceComplaintFn } from "@/lib/ai-analysis.functions";
import { audioService } from "@/services/audioService";
import { usePlanetState } from "@/lib/game-store";

interface ComplaintModalProps {
  open: boolean;
  onClose: () => void;
  initialService?: ServiceType;
}

type TabMode = "new" | "track" | "detail";

export function ComplaintModal({ open, onClose, initialService }: ComplaintModalProps) {
  const planet = usePlanetState();
  const activeRegionName = planet?.region?.name ?? "Global Nexus Grid";
  const activeCityName = planet?.activeCity ?? "Metro Central";

  const [activeTab, setActiveTab] = useState<TabMode>("new");
  const [selectedService, setSelectedService] = useState<ServiceType>(initialService || "water");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(`${activeRegionName} / ${activeCityName}`);
  const [contact, setContact] = useState("");
  
  // Submission & Processing state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [newlyCreatedComplaint, setNewlyCreatedComplaint] = useState<Complaint | null>(null);

  // Tracking tab state
  const [complaintsList, setComplaintsList] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync initial service when opened or changed
  useEffect(() => {
    if (initialService) {
      setSelectedService(initialService);
    }
  }, [initialService]);

  // Load complaints from store on mount / open
  useEffect(() => {
    if (open) {
      setComplaintsList(getStoredComplaints());
      setErrorMsg(null);
      // Auto populate location if empty
      if (!location) {
        setLocation(`${activeRegionName} / ${activeCityName}`);
      }
    }
  }, [open, activeRegionName, activeCityName, location]);

  const activeServiceDef = useMemo(
    () => SERVICE_OPTIONS.find((s) => s.id === selectedService) || SERVICE_OPTIONS[0]!,
    [selectedService],
  );

  const filteredComplaints = useMemo(() => {
    return complaintsList.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serviceLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assignedDepartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [complaintsList, searchQuery, statusFilter]);

  const selectedComplaint = useMemo(
    () => complaintsList.find((c) => c.id === selectedComplaintId) || newlyCreatedComplaint,
    [complaintsList, selectedComplaintId, newlyCreatedComplaint],
  );

  const copyToClipboard = (text: string) => {
    try {
      audioService?.playClick?.();
    } catch {
      /* noop */
    }
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectPreset = (presetText: string) => {
    try {
      audioService?.playClick?.();
    } catch {
      /* noop */
    }
    setDescription(presetText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg("Please describe your issue so the AI can triage and route it.");
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      audioService?.playSimulationStart?.();
    } catch {
      /* noop */
    }

    try {
      setSubmissionStep("1. Scanning issue parameters & detecting severity telemetry...");
      await new Promise((r) => setTimeout(r, 450));

      setSubmissionStep("2. Consulting AI Civic Triage Model for department allocation...");
      
      let classification;
      try {
        classification = await classifyServiceComplaintFn({
          data: {
            serviceType: selectedService,
            description: description.trim(),
            location: location.trim(),
          },
        });
      } catch (fnErr) {
        console.warn("Server classification failed, using instant client fallback:", fnErr);
        // Instant local fallback
        classification = {
          mode: "simulated" as const,
          aiSummary: description.length > 100 ? `${description.slice(0, 97)}...` : description,
          urgency: "HIGH" as const,
          assignedDepartment: activeServiceDef.defaultDepartment,
          estimatedResolutionTime: "3 to 6 hours",
          aiTriageNotes: `Automated fast-path triage allocated to ${activeServiceDef.defaultDepartment}.`,
          keyActionsProposed: [
            "Assign priority telemetry ticket in municipal queue",
            "Route automated dispatch notification to local field team",
            "Enable real-time civic status tracking",
          ],
          confidence: 88,
        };
      }

      setSubmissionStep("3. Registering Reference ID and provisioning audit log...");
      await new Promise((r) => setTimeout(r, 350));

      const newId = generateComplaintId();
      const now = new Date().toISOString();

      const newComplaint: Complaint = {
        id: newId,
        serviceType: selectedService,
        serviceLabel: activeServiceDef.label,
        description: description.trim(),
        location: location.trim() || `${activeRegionName} / ${activeCityName}`,
        contactInfo: contact.trim() || undefined,
        urgency: classification.urgency,
        aiSummary: classification.aiSummary,
        assignedDepartment: classification.assignedDepartment,
        estimatedResolutionTime: classification.estimatedResolutionTime,
        aiTriageNotes: classification.aiTriageNotes,
        keyActionsProposed: classification.keyActionsProposed,
        status: "submitted",
        createdAt: now,
        updatedAt: now,
        auditTrail: [
          {
            timestamp: now,
            status: "submitted",
            note: `Public service complaint logged via Nexus Earth AI Portal. Classified as ${classification.urgency} urgency.`,
            actor: classification.mode === "live" ? "Gemini Civic Dispatcher" : "Nexus AI Dispatcher (Local)",
          },
        ],
        mode: classification.mode,
      };

      saveComplaintToStore(newComplaint);
      setComplaintsList(getStoredComplaints());
      setNewlyCreatedComplaint(newComplaint);
      setSelectedComplaintId(newComplaint.id);
      setActiveTab("detail");
      try {
        audioService?.playSuccess?.();
      } catch {
        /* noop */
      }
      setDescription("");
    } catch (err: unknown) {
      console.error("Submission failed", err);
      setErrorMsg("An error occurred during submission. Please try again.");
    } finally {
      setIsSubmitting(false);
      setSubmissionStep("");
    }
  };

  const handleAdvanceStatus = (id: string) => {
    audioService.playClick();
    const target = complaintsList.find((c) => c.id === id);
    if (!target) return;

    let nextStatus: ComplaintStatus = "under_review";
    let note = "Case reviewed by municipal engineering supervisor and approved for field dispatch.";
    
    if (target.status === "submitted") {
      nextStatus = "under_review";
      note = "Case evaluated by triage supervisor; scheduled for immediate inspection.";
    } else if (target.status === "under_review") {
      nextStatus = "in_progress";
      note = "Emergency field technicians deployed to site with specialized diagnostic tools.";
    } else if (target.status === "in_progress") {
      nextStatus = "resolved";
      note = "Field repairs completed, pressure and safety verified, case marked RESOLVED.";
    } else if (target.status === "resolved") {
      nextStatus = "submitted";
      note = "Case reopened by citizen for follow-up verification.";
    }

    const updated = updateComplaintStatusInStore(id, nextStatus, note);
    if (updated) {
      setComplaintsList(getStoredComplaints());
      if (newlyCreatedComplaint?.id === id) {
        setNewlyCreatedComplaint(updated);
      }
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-background/80 backdrop-blur-md">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col holo-panel rounded-2xl border border-neon/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden bg-background/95"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neon/10 border border-neon/40 flex items-center justify-center text-neon shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Activity size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-sm md:text-base font-bold tracking-wider text-foreground">
                    PUBLIC COMPLAINT & SERVICE REQUEST
                  </h2>
                  <span className="hud-corner rounded-full px-2 py-0.5 font-display text-[9px] tracking-widest text-neon bg-neon/10 border border-neon/30">
                    AI FAST-TRACK
                  </span>
                </div>
                <p className="text-[10px] md:text-[11px] text-muted-foreground font-sans">
                  Skip the long public queue · Instant AI triage, automatic department routing & live telemetry tracking
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                audioService.playClick();
                onClose();
              }}
              className="p-2 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Prototype / Demo Disclaimer Banner */}
          <div className="px-5 py-1.5 bg-neon/5 border-b border-neon/15 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5 text-cyan-300/90 font-mono">
              <Radio size={11} className="text-neon animate-pulse" />
              NEXUS EARTH CIVIC TRIAGE PORTAL · DEMO PROTOTYPE SUBSYSTEM
            </span>
            <span className="hidden sm:inline text-muted-foreground/70">
              Zero Queues · Multi-Agent Verification · Durable Local State
            </span>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center justify-between px-5 py-2 border-b border-border/40 bg-background/50">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  audioService.playClick();
                  setActiveTab("new");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display text-xs tracking-wider transition-all ${
                  activeTab === "new"
                    ? "bg-neon/20 text-neon border border-neon/50 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <PlusCircle size={14} /> NEW REQUEST
              </button>

              <button
                onClick={() => {
                  audioService.playClick();
                  setActiveTab("track");
                  setComplaintsList(getStoredComplaints());
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display text-xs tracking-wider transition-all ${
                  activeTab === "track"
                    ? "bg-neon/20 text-neon border border-neon/50 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <Search size={14} /> TRACK COMPLAINTS ({complaintsList.length})
              </button>

              {selectedComplaint && (
                <button
                  onClick={() => {
                    audioService.playClick();
                    setActiveTab("detail");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display text-xs tracking-wider transition-all ${
                    activeTab === "detail"
                      ? "bg-neon/20 text-neon border border-neon/50 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  <FileText size={14} /> TICKET: {selectedComplaint.id}
                </button>
              )}
            </div>

            <div className="text-[11px] font-mono text-muted-foreground hidden md:flex items-center gap-2">
              <MapPin size={12} className="text-neon" />
              <span>{activeRegionName} ({activeCityName})</span>
            </div>
          </div>

          {/* Modal Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* ================= TAB 1: NEW SERVICE REQUEST FORM ================= */}
            {activeTab === "new" && (
              <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto">
                {/* Step 1: Select Service Option */}
                <div>
                  <label className="block font-display text-[11px] tracking-widest text-muted-foreground mb-2">
                    1. SELECT PUBLIC SERVICE CATEGORY:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {SERVICE_OPTIONS.map((srv) => {
                      const Icon = srv.icon;
                      const isSelected = selectedService === srv.id;
                      return (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => {
                            audioService.playClick();
                            setSelectedService(srv.id);
                          }}
                          className={`p-3 rounded-xl text-left transition-all flex flex-col justify-between border ${
                            isSelected
                              ? "bg-neon/15 border-neon text-neon shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-neon/40"
                              : "bg-muted/20 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-2">
                            <Icon
                              size={18}
                              className={isSelected ? "text-neon" : "text-muted-foreground"}
                            />
                            {isSelected && <Check size={14} className="text-neon" />}
                          </div>
                          <span className="font-display text-xs font-bold leading-tight">
                            {srv.label.split("&")[0]?.trim()}
                          </span>
                          <span className="text-[9px] font-mono text-muted-foreground/80 mt-1 line-clamp-1">
                            {srv.defaultDepartment.split("&")[0]?.trim()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 italic">
                    {activeServiceDef.description}
                  </p>
                </div>

                {/* Step 2: Issue Description & Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-display text-[11px] tracking-widest text-muted-foreground">
                      2. DESCRIBE THE ISSUE / DISRUPTION:
                    </label>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {description.length} characters
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={`Describe the ${activeServiceDef.label} problem in detail (e.g. location, severity, duration, hazards)...`}
                    className="w-full rounded-xl bg-muted/20 border border-border/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
                  />

                  {/* Fast Preset Suggestions */}
                  <div className="pt-1">
                    <span className="text-[10px] font-display tracking-wider text-muted-foreground mr-2">
                      QUICK DEMO PRESETS:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {activeServiceDef.sampleIssues.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPreset(sample)}
                          className="text-[10px] text-left px-2.5 py-1 rounded-lg bg-muted/30 hover:bg-neon/15 hover:text-neon border border-border/40 transition-all line-clamp-1 max-w-md"
                          title={sample}
                        >
                          "{sample}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 3: Location & Optional Contact */}
                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-display text-[11px] tracking-widest text-muted-foreground mb-1.5">
                      3. LOCATION / NEIGHBORHOOD (OPTIONAL):
                    </label>
                    <div className="relative">
                      <MapPin
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Sector, Street Address"
                        className="w-full rounded-lg bg-muted/20 border border-border/60 pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-neon"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-display text-[11px] tracking-widest text-muted-foreground mb-1.5">
                      4. CONTACT FOR SMS / TELEMETRY ALERTS (OPTIONAL):
                    </label>
                    <div className="relative">
                      <PhoneCall
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="Mobile # or citizen email"
                        className="w-full rounded-lg bg-muted/20 border border-border/60 pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-neon"
                      />
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-danger/15 border border-danger/40 text-danger text-xs flex items-center gap-2">
                    <AlertTriangle size={14} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submitting step indicator */}
                {isSubmitting && (
                  <div className="p-3.5 rounded-xl bg-neon/10 border border-neon/30 space-y-2 animate-pulse">
                    <div className="flex items-center gap-2 text-xs font-display tracking-wider text-neon">
                      <RefreshCw size={14} className="animate-spin" />
                      <span>PROCESSING WITH AI CIVIC ENGINE...</span>
                    </div>
                    <p className="text-[11px] font-mono text-cyan-200">{submissionStep}</p>
                  </div>
                )}

                {/* Submit Action Button */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                    <Sparkles size={12} className="text-neon" />
                    <span>Instant AI triage will automatically classify urgency & route to field crew</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !description.trim()}
                    className="btn-neon px-6 py-2.5 inline-flex items-center gap-2 text-xs font-display tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        TRIAGING...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        SUBMIT REQUEST
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ================= TAB 2: TRACK & MANAGE ALL COMPLAINTS ================= */}
            {activeTab === "track" && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by Complaint ID, service, keyword, or location..."
                      className="w-full rounded-lg bg-muted/20 border border-border/60 pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-neon"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Filter size={13} className="text-muted-foreground" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-lg bg-muted/30 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-neon font-display"
                    >
                      <option value="all">ALL STATUSES</option>
                      <option value="submitted">SUBMITTED</option>
                      <option value="under_review">UNDER REVIEW</option>
                      <option value="in_progress">IN PROGRESS</option>
                      <option value="resolved">RESOLVED</option>
                    </select>

                    <button
                      onClick={() => {
                        audioService.playClick();
                        setComplaintsList(getStoredComplaints());
                      }}
                      className="p-2 rounded-lg bg-muted/30 hover:bg-muted/60 border border-border/60 text-muted-foreground hover:text-foreground"
                      title="Refresh List"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>

                {/* Complaints List */}
                {filteredComplaints.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border/60 bg-muted/10 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto text-muted-foreground">
                      <Search size={20} />
                    </div>
                    <p className="font-display text-xs tracking-wider text-muted-foreground">
                      NO COMPLAINTS FOUND MATCHING CRITERIA
                    </p>
                    <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                      Submit a new service request or reset your search filters.
                    </p>
                    <button
                      onClick={() => {
                        audioService.playClick();
                        setActiveTab("new");
                      }}
                      className="btn-neon text-xs px-4 py-2 inline-flex items-center gap-1.5"
                    >
                      <PlusCircle size={13} /> Submit New Request
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-2.5">
                    {filteredComplaints.map((item) => {
                      const serviceDef =
                        SERVICE_OPTIONS.find((s) => s.id === item.serviceType) ||
                        SERVICE_OPTIONS[0]!;
                      const Icon = serviceDef.icon;

                      const statusColors: Record<ComplaintStatus, string> = {
                        submitted: "bg-blue-500/15 text-blue-400 border-blue-500/40",
                        under_review: "bg-amber-500/15 text-amber-400 border-amber-500/40",
                        in_progress: "bg-cyan-500/15 text-cyan-400 border-cyan-500/40",
                        resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
                      };

                      const statusLabels: Record<ComplaintStatus, string> = {
                        submitted: "SUBMITTED",
                        under_review: "UNDER REVIEW",
                        in_progress: "IN PROGRESS",
                        resolved: "RESOLVED",
                      };

                      return (
                        <div
                          key={item.id}
                          className="holo-panel rounded-xl p-3.5 border border-border/60 hover:border-neon/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 bg-muted/15"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 rounded-lg bg-muted/30 text-neon border border-border/40 mt-0.5">
                              <Icon size={16} />
                            </div>
                            <div className="space-y-1 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-bold text-foreground">
                                  {item.id}
                                </span>
                                <span
                                  className={`rounded-full px-2 py-0.5 font-display text-[9px] tracking-wider border ${
                                    statusColors[item.status]
                                  }`}
                                >
                                  {statusLabels[item.status]}
                                </span>
                                <span className="rounded-full px-2 py-0.5 font-display text-[9px] tracking-wider bg-muted/40 text-muted-foreground border border-border/40">
                                  {item.urgency} URGENCY
                                </span>
                              </div>

                              <p className="text-xs font-medium text-foreground line-clamp-1">
                                {item.aiSummary || item.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Building2 size={11} className="text-neon" />
                                  {item.assignedDepartment}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={11} />
                                  ETA: {item.estimatedResolutionTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin size={11} />
                                  {item.location}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-center">
                            <button
                              onClick={() => {
                                audioService.playClick();
                                setSelectedComplaintId(item.id);
                                setActiveTab("detail");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-neon/15 hover:bg-neon/30 text-neon border border-neon/40 text-xs font-display tracking-wider flex items-center gap-1 transition-all"
                            >
                              VIEW DETAILS <ChevronRight size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 3: COMPLAINT DETAILS & AUDIT TRAIL ================= */}
            {activeTab === "detail" && selectedComplaint && (
              <div className="space-y-4 max-w-3xl mx-auto">
                {/* Top Success & ID banner */}
                <div className="holo-panel rounded-xl p-4 border border-neon/40 bg-neon/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-neon" />
                      <span className="font-display text-xs tracking-widest text-neon">
                        SERVICE REQUEST REGISTERED
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base md:text-lg font-black text-foreground">
                        {selectedComplaint.id}
                      </span>
                      <button
                        onClick={() => copyToClipboard(selectedComplaint.id)}
                        className="p-1 rounded bg-background/50 hover:bg-background border border-border/50 text-muted-foreground hover:text-foreground text-[10px] flex items-center gap-1"
                        title="Copy Reference ID"
                      >
                        {copiedId === selectedComplaint.id ? (
                          <>
                            <Check size={11} className="text-success" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={11} /> Copy ID
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="font-display text-[9px] tracking-widest text-muted-foreground">
                      CURRENT STATUS
                    </span>
                    <span className="px-3 py-1 rounded-full font-display text-xs font-bold tracking-wider bg-neon/20 border border-neon/50 text-neon shadow-[0_0_12px_rgba(6,182,212,0.25)] uppercase">
                      {selectedComplaint.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* AI Triage Card */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="holo-panel rounded-xl p-4 border border-border/60 bg-muted/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[10px] tracking-widest text-neon flex items-center gap-1.5">
                        <Sparkles size={12} /> AI PROBLEM SUMMARY
                      </span>
                      <span className="font-display text-[9px] tracking-wider px-2 py-0.5 rounded bg-muted/40 text-muted-foreground border border-border/40">
                        {selectedComplaint.urgency} URGENCY
                      </span>
                    </div>
                    <p className="text-xs text-foreground font-medium leading-relaxed">
                      {selectedComplaint.aiSummary}
                    </p>
                    <p className="text-[11px] text-muted-foreground italic border-t border-border/30 pt-2">
                      "{selectedComplaint.description}"
                    </p>
                  </div>

                  <div className="holo-panel rounded-xl p-4 border border-border/60 bg-muted/20 space-y-2.5">
                    <span className="font-display text-[10px] tracking-widest text-neon flex items-center gap-1.5">
                      <Building2 size={12} /> ASSIGNED CIVIC DEPARTMENT
                    </span>
                    <p className="text-xs font-bold text-foreground">
                      {selectedComplaint.assignedDepartment}
                    </p>
                    <div className="text-[11px] text-muted-foreground space-y-1 border-t border-border/30 pt-2">
                      <div className="flex items-center justify-between">
                        <span>ESTIMATED TURNAROUND:</span>
                        <span className="font-bold text-foreground">
                          {selectedComplaint.estimatedResolutionTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>LOCATION:</span>
                        <span className="text-foreground">{selectedComplaint.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Proposed Actions */}
                {selectedComplaint.keyActionsProposed && selectedComplaint.keyActionsProposed.length > 0 && (
                  <div className="holo-panel rounded-xl p-4 border border-border/60 bg-muted/15 space-y-2">
                    <span className="font-display text-[10px] tracking-widest text-neon flex items-center gap-1.5">
                      <ShieldCheck size={12} /> AUTOMATED AI DISPATCH DIRECTIVES:
                    </span>
                    <ul className="space-y-1.5">
                      {selectedComplaint.keyActionsProposed.map((act, i) => (
                        <li
                          key={i}
                          className="text-[11px] text-muted-foreground flex items-start gap-2 bg-background/30 p-2 rounded-lg"
                        >
                          <span className="w-4 h-4 rounded-full bg-neon/15 text-neon text-[9px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-foreground/90">{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lifecycle Simulator & Audit Trail */}
                <div className="holo-panel rounded-xl p-4 border border-border/60 bg-muted/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-[10px] tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Activity size={12} className="text-neon" /> DISPATCH AUDIT LOG & STATUS LIFECYCLE
                    </span>

                    {/* Interactive lifecycle advancement button */}
                    <button
                      onClick={() => handleAdvanceStatus(selectedComplaint.id)}
                      className="text-[10px] font-display tracking-wider px-2.5 py-1 rounded bg-neon/15 hover:bg-neon/30 text-neon border border-neon/40 flex items-center gap-1 transition-all"
                      title="Advance to next status in workflow for demo demonstration"
                    >
                      <RefreshCw size={11} /> ADVANCE LIFECYCLE STATE →
                    </button>
                  </div>

                  <div className="space-y-2 relative pl-4 border-l border-neon/30 ml-2 py-1">
                    {selectedComplaint.auditTrail.map((entry, idx) => (
                      <div key={idx} className="relative space-y-0.5">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_8px_var(--neon)]" />
                        <div className="flex items-center gap-2">
                          <span className="font-display text-[9px] tracking-wider text-neon uppercase">
                            {entry.status.replace("_", " ")}
                          </span>
                          <span className="text-[9px] font-mono text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="text-[9px] text-muted-foreground font-medium">
                            · {entry.actor}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{entry.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Back to track or new */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      audioService.playClick();
                      setActiveTab("track");
                    }}
                    className="text-xs font-display tracking-wider text-muted-foreground hover:text-neon flex items-center gap-1"
                  >
                    ← BACK TO ALL COMPLAINTS
                  </button>

                  <button
                    onClick={() => {
                      audioService.playClick();
                      setActiveTab("new");
                    }}
                    className="btn-neon text-xs px-4 py-2 flex items-center gap-1.5"
                  >
                    <PlusCircle size={13} /> SUBMIT ANOTHER REQUEST
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
