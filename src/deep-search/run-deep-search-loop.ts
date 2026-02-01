import type { Message, StreamTextResult } from "ai";
import { streamText } from "ai";
import { getNextAction } from "./get-next-action";
import { rewriteQuery } from "./query-rewriter";
import type { MessageAnnotation, Action } from "~/domain/annotation";
import { SystemContext } from "./system-context";
import { performSearch } from "./perform-search";
import { answerQuestion } from "./answer-question";
import { checkIsSafe } from "./check-is-safe";
import { model } from "~/model";

export async function runDeepSearchLoop(
  messages: Message[],
  opts: {
    langfuseTraceId?: string;
    onFinish?: Parameters<typeof streamText>[0]["onFinish"];
    writeMessageAnnotation: (annotation: MessageAnnotation) => void;
  },
): Promise<StreamTextResult<{}, string>> {
  const ctx = new SystemContext(messages);

  // Check if the query is safe before proceeding
  const safetyCheck = await checkIsSafe(ctx);

  if (safetyCheck.classification === "refuse") {
    // Return a refusal message if the query violates safety guidelines
    return streamText({
      model,
      prompt: `The user has asked a question that violates our safety guidelines. Politely explain that you cannot assist with this request.

Reason: ${safetyCheck.reason || "The request violates our content safety policy."}

Provide a brief, respectful response that:
1. Acknowledges their question
2. Explains you cannot help with this specific request
3. Does not provide any information that could be used for harmful purposes
4. Optionally suggests legitimate alternatives if applicable`,
      onFinish: opts.onFinish,
    });
  }

  while (ctx.shouldStop() === false) {
    // Step 1: Generate query plan
    const queryPlan = await rewriteQuery(ctx, {
      langfuseTraceId: opts.langfuseTraceId,
    });

    opts.writeMessageAnnotation({
      type: "QUERY_PLAN",
      queryPlan: queryPlan,
    } satisfies MessageAnnotation);

    // Step 2: Execute searches in parallel
    await Promise.all(
      queryPlan.queries.map((query) => performSearch(ctx, query))
    );

    // Step 3: Evaluate if we should continue or answer
    const nextAction = await getNextAction(ctx, {
      langfuseTraceId: opts.langfuseTraceId,
    });

    // Store the feedback from the evaluator
    ctx.setLatestFeedback(nextAction.feedback);

    opts.writeMessageAnnotation({
      type: "NEW_ACTION",
      action: nextAction as Action,
    } satisfies MessageAnnotation);

    if (nextAction.type === "answer") {
      return answerQuestion(ctx, { isFinal: false, ...opts });
    }

    // If continue, loop again
    ctx.incrementStep();
  }

  return answerQuestion(ctx, { isFinal: true, ...opts });
};