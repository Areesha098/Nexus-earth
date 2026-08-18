import type { LucideIcon } from "lucide-react";
import { Droplets, Flame, Zap, Trash2, HelpCircle } from "lucide-react";

export type ServiceType = "water" | "gas" | "electricity" | "sanitation" | "other";

export type ComplaintStatus = "submitted" | "under_review" | "in_progress" | "resolved";

export type UrgencyLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface AuditEntry {
  timestamp: string;
  status: ComplaintStatus;
  note: string;
  actor: string;
}

export interface Complaint {
  id: string;
  serviceType: ServiceType;
  serviceLabel: string;
  description: string;
  location: string;
  contactInfo?: string;
  urgency: UrgencyLevel;
  aiSummary: string;
  assignedDepartment: string;
  estimatedResolutionTime: string;
  aiTriageNotes: string;
  keyActionsProposed: string[];
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  auditTrail: AuditEntry[];
  mode: "live" | "simulated";
}

export interface ServiceOptionDef {
  id: ServiceType;
  label: string;
  icon: LucideIcon;
  defaultDepartment: string;
  description: string;
  sampleIssues: string[];
}

export const SERVICE_OPTIONS: ServiceOptionDef[] = [
  {
    id: "water",
    label: "Water Supply & Catchment",
    icon: Droplets,
    defaultDepartment: "Municipal Water Works & Catchment Division",
    description: "Low pressure, broken pipeline, contaminated supply, leakages, meter faults",
    sampleIssues: [
      "Main water pipeline rupture causing low pressure and flooding near Sector 4 residential block.",
      "Brown discolored tap water with high sediment and sulfur odor reported across 3 streets.",
      "Smart water flow meter displaying error code ERR-09 and billing excessive usage.",
    ],
  },
  {
    id: "gas",
    label: "Gas & Pipeline Infrastructure",
    icon: Flame,
    defaultDepartment: "Gas Grid Safety & Pipeline Emergency Response",
    description: "Gas leaks, odor detection, pipeline damage, regulator fault, low pressure",
    sampleIssues: [
      "Strong gas odor detected near street distribution valve outside primary school.",
      "Domestic gas line pressure dropped to near zero during peak evening cooking hours.",
      "Damaged gas pipeline casing after road excavation crew hit underground conduit.",
    ],
  },
  {
    id: "electricity",
    label: "Electricity / Smart Meter",
    icon: Zap,
    defaultDepartment: "Supergrid Distribution & Smart Metering Agency",
    description: "Power blackout, sparking transformer, smart meter error, voltage fluctuation",
    sampleIssues: [
      "Frequent high-voltage surges burning out household appliances across 20 homes.",
      "Sparking overhead transformer emitting smoke near market junction.",
      "Smart electricity meter disconnected unexpectedly despite full payment balance.",
    ],
  },
  {
    id: "sanitation",
    label: "Sanitation & Waste Management",
    icon: Trash2,
    defaultDepartment: "Urban Sanitation & Solid Waste Logistics Department",
    description: "Overflowing dumpster, missed trash collection, open drain hazard, sewage backup",
    sampleIssues: [
      "Commercial market dumpster overflowing for 6 consecutive days blocking pedestrian walkway.",
      "Blocked main sewage line causing foul wastewater overflow into street alleyway.",
      "Hazardous industrial packaging dumped illegally along drainage canal bank.",
    ],
  },
  {
    id: "other",
    label: "Other Public Service",
    icon: HelpCircle,
    defaultDepartment: "Civil Public Works & General Civic Administration",
    description: "Streetlights, pothole road hazard, public park maintenance, storm drainage",
    sampleIssues: [
      "Dangerous deep pothole and missing manhole cover on main arterial boulevard.",
      "Entire corridor of 14 LED streetlights failed leaving pedestrian zone completely dark.",
      "Storm water drain clogged with debris threatening localized flash flood during rain.",
    ],
  },
];

const STORAGE_KEY = "nexus_earth_service_requests_v1";

const INITIAL_SEED_COMPLAINTS: Complaint[] = [
  {
    id: "NX-PUB-2026-8941",
    serviceType: "water",
    serviceLabel: "Water Supply & Catchment",
    description:
      "Major underground pipeline crack detected along Main Boulevard Sector 4. Noticeable water loss and muddy contamination entering residential feed lines.",
    location: "South Asia / Karachi Sector 4 (North Corridor)",
    contactInfo: "citizen.ops@nexus.earth",
    urgency: "HIGH",
    aiSummary:
      "Underground main pipeline rupture causing pressure drop and sediment ingress in Sector 4 residential sector.",
    assignedDepartment: "Municipal Water Works & Catchment Division",
    estimatedResolutionTime: "4 to 8 hours",
    aiTriageNotes:
      "Telemetry correlates with regional water stress indicators. Automated valve isolation recommended to prevent secondary contamination loop.",
    keyActionsProposed: [
      "Dispatch acoustic leak detection rover unit to Sector 4 valve 12",
      "Issue localized boil-water precautionary telemetry bulletin",
      "Route standby mobile water tanker fleet to affected neighborhoods",
    ],
    status: "in_progress",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    auditTrail: [
      {
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        status: "submitted",
        note: "Service request logged and classified via AI Triage Engine.",
        actor: "Nexus AI Dispatcher",
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
        status: "under_review",
        note: "Assigned to Municipal Water Works Rapid Response Team B.",
        actor: "Municipal Dispatcher",
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        status: "in_progress",
        note: "Repair crew deployed with telemetry valve isolation tools on site.",
        actor: "Field Crew Unit #4",
      },
    ],
    mode: "live",
  },
  {
    id: "NX-PUB-2026-7203",
    serviceType: "electricity",
    serviceLabel: "Electricity / Smart Meter",
    description:
      "Distribution transformer sparking during evening peak heat load. Smart meters reporting irregular frequency fluctuations between 48Hz and 53Hz.",
    location: "Middle East & North Africa / Cairo Industrial District",
    contactInfo: "+20 100 892 4410",
    urgency: "CRITICAL",
    aiSummary:
      "Thermal overload on distribution transformer with frequency fluctuations posing grid trip risk.",
    assignedDepartment: "Supergrid Distribution & Smart Metering Agency",
    estimatedResolutionTime: "2 to 4 hours",
    aiTriageNotes:
      "High ambient heatwave load correlated with transformer thermal excursion. High risk of localized blackout if load is not shifted.",
    keyActionsProposed: [
      "Remotely shed non-critical commercial feeder lines to cool transformer",
      "Dispatch emergency transformer replacement and oil-cooling crew",
      "Notify local emergency medical facility backup generators",
    ],
    status: "under_review",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    auditTrail: [
      {
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: "submitted",
        note: "Critical severity request logged via Nexus Earth portal.",
        actor: "Nexus AI Dispatcher",
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
        status: "under_review",
        note: "Priority escalation triggered; Supergrid telemetry monitor assigned.",
        actor: "System AI Monitor",
      },
    ],
    mode: "live",
  },
  {
    id: "NX-PUB-2026-6119",
    serviceType: "sanitation",
    serviceLabel: "Sanitation & Waste Management",
    description:
      "Automated recycling collection station bin #08 sensor damaged; organic waste overflow near community clinic.",
    location: "Latin America / São Paulo East Sector",
    contactInfo: "sp.community@nexus.org",
    urgency: "MEDIUM",
    aiSummary:
      "Overflowing organic waste sensor fault near community healthcare clinic.",
    assignedDepartment: "Urban Sanitation & Solid Waste Logistics Department",
    estimatedResolutionTime: "12 to 24 hours",
    aiTriageNotes:
      "Sensor telemetry offline. Routine vacuum compactor truck can be rerouted on next shift cycle.",
    keyActionsProposed: [
      "Reroute compactor truck #19 for unscheduled pickup",
      "Replace smart fill-level optical sensor",
      "Sanitize container perimeter",
    ],
    status: "resolved",
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    auditTrail: [
      {
        timestamp: new Date(Date.now() - 3600000 * 26).toISOString(),
        status: "submitted",
        note: "Request logged via citizen service intake.",
        actor: "Nexus AI Dispatcher",
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        status: "in_progress",
        note: "Compactor vehicle dispatched for site collection.",
        actor: "Logistics Router",
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: "resolved",
        note: "Waste cleared, perimeter sanitized, and optical sensor recalibrated.",
        actor: "Sanitation Lead #7",
      },
    ],
    mode: "live",
  },
];

export function getStoredComplaints(): Complaint[] {
  if (typeof window === "undefined") return INITIAL_SEED_COMPLAINTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_COMPLAINTS));
      return INITIAL_SEED_COMPLAINTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_COMPLAINTS));
      return INITIAL_SEED_COMPLAINTS;
    }
    return parsed as Complaint[];
  } catch (err) {
    console.warn("Failed to read complaints from localStorage", err);
    return INITIAL_SEED_COMPLAINTS;
  }
}

export function saveComplaintToStore(complaint: Complaint): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredComplaints();
    const existingIndex = current.findIndex((c) => c.id === complaint.id);
    let next: Complaint[];
    if (existingIndex >= 0) {
      next = [...current];
      next[existingIndex] = complaint;
    } else {
      next = [complaint, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.error("Failed to save complaint to localStorage", err);
  }
}

export function updateComplaintStatusInStore(
  id: string,
  newStatus: ComplaintStatus,
  note?: string,
  actor: string = "Nexus Earth Commander",
): Complaint | null {
  if (typeof window === "undefined") return null;
  try {
    const current = getStoredComplaints();
    const index = current.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const target = current[index]!;
    const now = new Date().toISOString();
    const defaultNotes: Record<ComplaintStatus, string> = {
      submitted: "Request submitted and registered into public service queue.",
      under_review: "Request verified by triage unit and assigned to engineering division.",
      in_progress: "Field crew and telemetry diagnostic teams actively executing repair protocol.",
      resolved: "Service restoration confirmed and operational parameters returned to nominal.",
    };
    const updated: Complaint = {
      ...target,
      status: newStatus,
      updatedAt: now,
      auditTrail: [
        ...target.auditTrail,
        {
          timestamp: now,
          status: newStatus,
          note: note || defaultNotes[newStatus],
          actor,
        },
      ],
    };
    current[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return updated;
  } catch (err) {
    console.error("Failed to update complaint status", err);
    return null;
  }
}

export function deleteComplaintFromStore(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredComplaints();
    const filtered = current.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Failed to delete complaint", err);
  }
}

export function generateComplaintId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `NX-PUB-${year}-${randomNum}`;
}
