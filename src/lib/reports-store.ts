import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReportInput } from "@/lib/report-pdf";

export interface StoredReport {
  id: string;
  timestamp: number;
  year: number;
  country: string;
  city: string;
  earthScore: number;
  sdgScore: number;
  confidence: number;
  topRisk: string;
  input: ReportInput;
}

interface ReportsStore {
  reports: StoredReport[];
  saveReport: (input: ReportInput, country: string, city: string, topRisk: string) => StoredReport;
  deleteReport: (id: string) => void;
  clearAllReports: () => void;
}

export const useReportsStore = create<ReportsStore>()(
  persist(
    (set) => ({
      reports: [],
      saveReport: (input, country, city, topRisk) => {
        const newReport: StoredReport = {
          id: `report-${Date.now()}`,
          timestamp: Date.now(),
          year: input.year,
          country,
          city,
          earthScore: input.projection.impact,
          sdgScore: input.projection.sdg,
          confidence: input.confidence,
          topRisk,
          input,
        };
        set((state) => ({
          reports: [newReport, ...state.reports.slice(0, 19)], // Keep up to 20 reports
        }));
        return newReport;
      },
      deleteReport: (id) =>
        set((state) => ({
          reports: state.reports.filter((r) => r.id !== id),
        })),
      clearAllReports: () => set({ reports: [] }),
    }),
    {
      name: "nexus-earth-reports-history",
    },
  ),
);
