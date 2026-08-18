import type { ServiceType } from "./complaints-data";

export interface ComplaintIntentResult {
  isComplaint: boolean;
  serviceType?: ServiceType;
  categoryLabel?: string;
  suggestedDescription?: string;
  suggestedLocation?: string;
}

/**
 * Accurately detects whether a user prompt represents a municipal/civic service grievance
 * (which must open the Complaint portal and bypass Gemini) vs a systemic planetary/science query
 * (which should proceed to the planetary AI Copilot).
 */
export function detectComplaintIntent(
  rawInput: string,
  defaultLocation = "Sector Zone",
): ComplaintIntentResult {
  const q = rawInput.toLowerCase().trim();

  // If query is an analytical/simulation/foresight query, NOT a municipal complaint:
  const isAnalyticalQuery =
    q.includes("what happens if") ||
    q.includes("what if") ||
    q.includes("explain") ||
    q.includes("why did") ||
    q.includes("why is") ||
    q.includes("how does") ||
    q.includes("simulate") ||
    q.includes("predict") ||
    q.includes("forecast") ||
    q.includes("cascade") ||
    q.includes("sdg") ||
    q.includes("earth score") ||
    q.includes("recommend") ||
    q.includes("directive") ||
    q.includes("strategy") ||
    q.includes("telemetry") ||
    q.includes("model");

  if (isAnalyticalQuery) {
    return { isComplaint: false };
  }

  // Keywords indicating a personal/civic service grievance
  const complaintKeywords = [
    "complain",
    "complaint",
    "grievance",
    "report issue",
    "report problem",
    "file a complaint",
    "lodge complaint",
    "register complaint",
    "no gas",
    "no water",
    "no power",
    "no electricity",
    "outage",
    "blackout",
    "load shedding",
    "leaking pipe",
    "broken pipe",
    "low pressure",
    "smell gas",
    "gas leak",
    "dirty water",
    "sewage overflow",
    "trash not collected",
    "garbage",
    "meter fault",
  ];

  const hasComplaintKeyword = complaintKeywords.some((k) => q.includes(k));

  if (!hasComplaintKeyword) {
    return { isComplaint: false };
  }

  // Determine specific service domain
  let serviceType: ServiceType = "other";
  let categoryLabel = "General Civic Service";

  if (q.includes("gas") || q.includes("sui gas") || q.includes("lpg") || q.includes("cylinder")) {
    serviceType = "gas";
    categoryLabel = "Gas Supply & Pipeline Grid";
  } else if (
    q.includes("water") ||
    q.includes("pipeline") ||
    q.includes("sewage") ||
    q.includes("tap") ||
    q.includes("drainage")
  ) {
    serviceType = "water";
    categoryLabel = "Water Supply & Catchment";
  } else if (
    q.includes("electric") ||
    q.includes("power") ||
    q.includes("voltage") ||
    q.includes("blackout") ||
    q.includes("transformer") ||
    q.includes("grid")
  ) {
    serviceType = "electricity";
    categoryLabel = "Electric Grid & Energy";
  } else if (
    q.includes("trash") ||
    q.includes("garbage") ||
    q.includes("waste") ||
    q.includes("sanitation") ||
    q.includes("cleanliness")
  ) {
    serviceType = "sanitation";
    categoryLabel = "Sanitation & Waste Management";
  }

  return {
    isComplaint: true,
    serviceType,
    categoryLabel,
    suggestedDescription: rawInput.trim(),
    suggestedLocation: defaultLocation,
  };
}
