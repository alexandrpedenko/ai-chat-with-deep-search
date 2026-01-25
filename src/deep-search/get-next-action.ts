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
    system: `You are a research evaluator. Your task is to determine if enough information has been gathered to provide a helpful answer to the user's question.

You do NOT generate search queries - that's handled by a separate planning system.

Your job is to:
1. Review the original question and identify what information is required
2. Analyze the search results that have been gathered
3. Determine if there are critical information gaps
4. Decide whether to CONTINUE researching or provide an ANSWER

IMPORTANT: Be practical, not perfectionist. If you have enough information to give a useful, well-informed answer (even if not 100% comprehensive), choose 'answer'. Only choose 'continue' if you're missing critical information that would make the answer misleading or unhelpful.`,
    prompt: `Original Question: ${context.getInitialQuestion()}

Message History:
${context.getMessageHistory()}

Search History:
${context.getQueryHistory()}

${context.getLatestFeedback() ? `Your Previous Evaluation:\n${context.getLatestFeedback()}\n\n` : ''}Based on this context, evaluate whether we have enough information to answer the question:

1. If CRITICAL information is still missing (information without which the answer would be misleading or wrong), choose 'continue' and explain what gaps remain
2. If you have SUFFICIENT information to provide a helpful, well-informed answer (even if not exhaustive), choose 'answer'

Remember: Useful information is better than perfect information. Don't let perfect be the enemy of good.

In your feedback, be specific about:
- What information was successfully found
- What critical information is still missing (if continuing) - only mention truly critical gaps
- Why the current information is sufficient to provide a helpful answer (if answering)
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