import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CopilotContext, CopilotReply } from "@/lib/copilot";
import { aiService } from "@/services/aiService";

const InputSchema = z.object({
  question: z.string().min(1).max(1000),
  context: z.object({
    year: z.number(),
    country: z.string().optional().default("Global Sector"),
    city: z.string().optional().default("Urban Center"),
    regionName: z.string().optional().default("Global Sector"),
    earthScore: z.number(),
    sdgScore: z.number(),
    decisions: z.number(),
    stats: z.record(z.number()),
    topRisks: z.array(z.string()),
    currentDisaster: z
      .object({
        title: z.string(),
        category: z.string(),
        threat: z.string(),
        narrative: z.string(),
      })
      .optional(),
    recentDecisions: z
      .array(
        z.object({
          year: z.number(),
          eventTitle: z.string(),
          choiceLabel: z.string(),
          effects: z.record(z.number()),
          country: z.string().optional(),
        }),
      )
      .optional()
      .default([]),
    earthMemoryNotes: z.array(z.string()).optional().default([]),
    simulationState: z.string().optional(),
  }),
});

export const askCopilot = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<CopilotReply> => {
    const ctx = data.context as unknown as CopilotContext;
    return aiService.queryCopilot(data.question, ctx);
  });
