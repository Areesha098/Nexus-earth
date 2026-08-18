import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AIAnalysis, AIAnalysisInput } from "@/lib/ai-analysis";
import type {
  MultiAgentInsights,
  FiveRecommendationsResult,
  ServiceComplaintClassification,
} from "@/services/aiService";
import type { CausalChain } from "@/lib/earth-memory";
import type { Agent } from "@/components/agents/agents-data";
import type { StatKey } from "@/lib/game-store";
import { aiService } from "@/services/aiService";

const InputSchema = z.object({
  year: z.number(),
  region: z.string(),
  disasterType: z.string(),
  earthScore: z.number(),
  sdgScore: z.number(),
  eventTitle: z.string(),
  eventNarrative: z.string(),
});

export const analyzeSimulation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AIAnalysis> => {
    const input = data as AIAnalysisInput;
    return aiService.analyzeScenario(input);
  });

const MultiAgentInputSchema = z.object({
  agents: z.array(z.any()),
  stats: z.record(z.number()),
  year: z.number(),
  country: z.string().optional(),
});

export const fetchMultiAgentInsights = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MultiAgentInputSchema.parse(input))
  .handler(async ({ data }): Promise<MultiAgentInsights> => {
    return aiService.getMultiAgentInsights(
      data.agents as Agent[],
      data.stats as Record<StatKey, number>,
      data.year,
      data.country,
    );
  });

const FiveRecsInputSchema = z.object({
  stats: z.record(z.number()),
  year: z.number(),
  country: z.string(),
  city: z.string(),
  eventTitle: z.string().optional(),
});

export const fetchFiveRecommendations = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => FiveRecsInputSchema.parse(input))
  .handler(async ({ data }): Promise<FiveRecommendationsResult> => {
    return aiService.getFiveRecommendations(
      data.stats as Record<StatKey, number>,
      data.year,
      data.country,
      data.city,
      data.eventTitle,
    );
  });

const CausalChainInputSchema = z.object({
  category: z.string(),
  eventTitle: z.string(),
  country: z.string(),
  city: z.string(),
});

export const fetchCausalChain = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CausalChainInputSchema.parse(input))
  .handler(async ({ data }): Promise<CausalChain> => {
    return aiService.getCausalChain(data.category, data.eventTitle, data.country, data.city);
  });

const ComplaintTriageInputSchema = z.object({
  serviceType: z.string(),
  description: z.string(),
  location: z.string().optional(),
});

export const classifyServiceComplaintFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ComplaintTriageInputSchema.parse(input))
  .handler(async ({ data }): Promise<ServiceComplaintClassification> => {
    return aiService.classifyServiceComplaint(data.serviceType, data.description, data.location);
  });

