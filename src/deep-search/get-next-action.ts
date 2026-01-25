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
      "The title of the action, to be displayed in the UI. Be extremely concise. 'Need more information', 'Ready to answer', 'Continuing research'",
    ),
  reasoning: z
    .string()
    .describe("The reason you chose this step."),
  feedback: z
    .string()
    .describe(
      "Detailed evaluation feedback. If type is 'continue': Explain what specific information is still missing and what gaps exist. If type is 'answer': Confirm that all required information has been found and the question can be fully answered.",
    ),
  type: z
    .enum(["continue", "answer"])
    .describe(
      `The type of action to take.
      - 'continue': Continue researching - more information is needed.
      - 'answer': Answer the user's question and complete the loop - we have enough information.`,
    ),
});

export const getNextAction = async (
  context: SystemContext,
  opts: { langfuseTraceId?: string } = {},
) => {
  const result = await generateObject({
    model,
    schema: actionSchema,
    system: `You are a research evaluator. Your sole task is to determine if enough information has been gathered to answer the user's question.

You do NOT generate search queries - that's handled by a separate planning system.

Your job is to:
1. Review the original question and identify what information is required
2. Analyze the search results that have been gathered
3. Determine if there are critical information gaps
4. Decide whether to CONTINUE researching or provide an ANSWER

Be strict in your evaluation - only choose 'answer' if you have comprehensive information to fully address the question.`,
    prompt: `Original Question: ${context.getInitialQuestion()}

Message History:
${context.getMessageHistory()}

Search History:
${context.getQueryHistory()}

${context.getLatestFeedback() ? `Your Previous Evaluation:\n${context.getLatestFeedback()}\n\n` : ''}Based on this context, evaluate whether we have enough information to answer the question:

1. If critical information is still missing, choose 'continue' and explain what gaps remain
2. If you have comprehensive information to fully answer the question, choose 'answer'

In your feedback, be specific about:
- What information was successfully found
- What critical information is still missing (if continuing)
- Why the current information is sufficient to provide a complete answer (if answering)
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