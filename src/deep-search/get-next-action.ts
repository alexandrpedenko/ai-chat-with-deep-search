import { generateObject } from "ai";
import { z } from "zod";
import { model } from "~/model";
import { SystemContext } from "./system-context";

export interface SearchAction {
  type: "search";
  query: string;
}

export interface AnswerAction {
  type: "answer";
}

export type Action = SearchAction | AnswerAction;

export const actionSchema = z.object({
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
    system: `You are a helpful AI assistant that can search the web or answer questions. Your goal is to determine the next best action to take based on the current context.`,
    prompt: `Message History: ${context.getMessageHistory()}

Based on this context, choose the next action:
1. If you need more information, use 'search' with a relevant query
2. If you have enough information to answer the question, use 'answer'

Remember:
- Only use 'search' if you need more information
- Use 'answer' when you have enough information to provide a complete answer

Here is the search history:

${context.getQueryHistory()}
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