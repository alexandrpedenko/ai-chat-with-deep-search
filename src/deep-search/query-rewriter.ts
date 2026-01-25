import { generateObject } from "ai";
import { z } from "zod";
import { model } from "~/model";
import { SystemContext } from "./system-context";

export const queryPlanSchema = z.object({
  plan: z
    .string()
    .describe(
      "A detailed research plan explaining the logical progression of information needed, dependencies between pieces of information, and the strategy for answering the question.",
    ),
  queries: z
    .array(z.string())
    .length(3)
    .describe(
      "Exactly 3 sequential search queries that progress logically from foundational to specific information. Each query should be specific, focused, written in natural language, and build upon the previous ones.",
    ),
});

export const rewriteQuery = async (
  context: SystemContext,
  opts: { langfuseTraceId?: string } = {},
) => {
  const result = await generateObject({
    model,
    schema: queryPlanSchema,
    system: `You are a strategic research planner with expertise in breaking down complex questions into logical search steps. Your primary role is to create a detailed research plan before generating any search queries.

First, analyze the question thoroughly:
- Break down the core components and key concepts
- Identify any implicit assumptions or context needed
- Consider what foundational knowledge might be required
- Think about potential information gaps that need filling

Then, develop a strategic research plan that:
- Outlines the logical progression of information needed
- Identifies dependencies between different pieces of information
- Considers multiple angles or perspectives that might be relevant
- Anticipates potential dead-ends or areas needing clarification

Finally, translate this plan into exactly 3 sequential search queries that:
- Are specific and focused (avoid broad queries that return general information)
- Are written in natural language without Boolean operators (no AND/OR)
- Progress logically from foundational to specific information
- Build upon each other in a meaningful way

Remember that initial queries can be exploratory - they help establish baseline information or verify assumptions before proceeding to more targeted searches. Each query should serve a specific purpose in your overall research plan.`,
    prompt: `Original Question: ${context.getInitialQuestion()}

Message History:
${context.getMessageHistory()}

${context.getQueryHistory() ? `Previous Search History:\n${context.getQueryHistory()}\n\n` : ''}${context.getLatestFeedback() ? `Latest Evaluation Feedback:\n${context.getLatestFeedback()}\n\n` : ''}Based on the question and any previous search history, create a research plan and generate exactly 3 search queries that will help answer the question.

If this is a follow-up search (previous searches exist), your plan should:
- Address the specific information gaps identified in the feedback
- Avoid repeating previous searches unless necessary for clarification
- Build upon what has already been found
- Target the missing pieces of information

Your plan should explain your research strategy, and your queries should execute that strategy.`,
    experimental_telemetry: opts.langfuseTraceId
      ? {
        isEnabled: true,
        functionId: "query-rewriter",
        metadata: {
          langfuseTraceId: opts.langfuseTraceId,
        },
      }
      : undefined,
  });

  return result.object;
};
