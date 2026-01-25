import { generateObject } from "ai";
import { z } from "zod";
import { model } from "~/model";
import { SystemContext } from "./system-context";

const AMOUNT_OF_CONTEXT_TO_KEEP = 5;

// Helper functions for building the prompt
function formatPreviousQueries(queries: string[]): string {
  if (queries.length === 0) return "";

  const queryList = queries
    .map((q, i) => `${i + 1}. "${q}"`)
    .join('\n');

  return `Previous queries already executed (DO NOT repeat these):\n${queryList}\n\n`;
}

function formatRecentSearchResults(searchHistory: string): string {
  if (!searchHistory) return "";
  return `Recent Search Results:\n${searchHistory}\n\n`;
}

function formatLatestFeedback(feedback: string | null): string {
  if (!feedback) return "";
  return `Latest Evaluation Feedback:\n${feedback}\n\n`;
}

function formatIterationWarning(step: number): string {
  if (step < 3) return "";
  return 'WARNING: Limited searches remaining. Be very targeted and efficient.\n\n';
}

function buildContextSections(context: SystemContext): string {
  const sections = [
    formatPreviousQueries(context.getPreviousQueries()),
    formatRecentSearchResults(context.getQueryHistory()),
    formatLatestFeedback(context.getLatestFeedback()),
    formatIterationWarning(context.getStep()),
  ];

  return sections.join('');
}

export const queryPlanSchema = z.object({
  plan: z
    .string()
    .describe(
      "A detailed research plan explaining the logical progression of information needed, dependencies between pieces of information, and the strategy for answering the question.",
    ),
  queries: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe(
      "Generate 1-3 search queries based on information needs. Use fewer queries (1-2) if you're refining specific details or close to answering. Use more queries (3) for complex questions requiring broad coverage or initial exploration. Each query should be specific, focused, written in natural language, and build upon previous ones.",
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

Current iteration: ${context.getStep() + 1}/${AMOUNT_OF_CONTEXT_TO_KEEP}
Remaining searches after this: ${AMOUNT_OF_CONTEXT_TO_KEEP - context.getStep() - 1}

${buildContextSections(context)}
Based on the question and context, create a research plan and generate 1-3 search queries:

- First iteration: Use 2-3 broad queries to establish foundational knowledge
- Middle iterations: Use 2-3 targeted queries to fill specific gaps
- Later iterations (3+): Use 1-2 highly focused queries to address remaining details

If this is a follow-up search (previous searches exist), your plan should:
- Address the specific information gaps identified in the feedback
- NEVER repeat previous queries - build upon what has been found
- Be more targeted and efficient as iterations increase
- Use fewer queries if close to having enough information

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
