import { generateObject } from "ai";
import { z } from "zod";
import { model } from "~/model";
import { SystemContext } from "./system-context";
import type { MessageAnnotation } from "~/domain/annotation";

// Type alias for clarity in this module
export type OurMessageAnnotation = MessageAnnotation;

export const actionSchema = z.object({
  title: z
    .string()
    .describe(
      "The title of the action, to be displayed in the UI. Be extremely concise. 'Searching Saka's injury history', 'Checking HMRC industrial action', 'Comparing toaster ovens'",
    ),
  reasoning: z
    .string()
    .describe("The reason you chose this step."),
  feedback: z
    .string()
    .describe(
      "Detailed evaluation feedback. If type is 'search': Explain what specific information is missing, what gaps exist, and why this search will help. If type is 'answer': Confirm that all required information has been found and the question can be fully answered.",
    ),
  type: z
    .enum(["search", "answer"])
    .describe(
      `The type of action to take.
      - 'search': Search the web for more information.
      - 'answer': Answer the user's question and complete the loop.`,
    ),
  query: z
    .string()
    .describe(
      "The query to search for. Required if type is 'search'.",
    )
    .optional(),
});

export const getNextAction = async (
  context: SystemContext,
  opts: { langfuseTraceId?: string } = {},
) => {
  const result = await generateObject({
    model,
    schema: actionSchema,
    system: `You are a research query optimizer. Your task is to analyze search results against the original research goal and either decide to answer the question or to search for more information.

PROCESS:
1. Identify ALL information explicitly requested in the original research goal
2. Analyze what specific information has been successfully retrieved in the search results
3. Identify ALL information gaps between what was requested and what was found
4. For entity-specific gaps: Create targeted queries for each missing attribute of identified entities
5. For general knowledge gaps: Create focused queries to find the missing conceptual information

Your feedback should be detailed and specific - explain exactly what information is still missing or what has been found.`,
    prompt: `Message History: ${context.getMessageHistory()}

Search History:
${context.getQueryHistory()}

${context.getLatestFeedback() ? `Latest Evaluation Feedback:\n${context.getLatestFeedback()}\n\n` : ''}Based on this context, evaluate the current state and choose the next action:
1. If you need more information, use 'search' with a relevant query and explain what gaps exist
2. If you have enough information to answer the question, use 'answer' and confirm completeness

In your feedback, be specific about:
- What information was successfully found
- What information is still missing (if searching)
- Why the current information is sufficient (if answering)
`,
    experimental_telemetry: opts.langfuseTraceId
      ? {
        isEnabled: true,
        functionId: "get-next-action",
        metadata: {
          langfuseTraceId: opts.langfuseTraceId,
        },
      }
      : undefined,
  });

  return result.object;
};