import type { Message, StreamTextResult } from "ai";
import { streamText } from "ai";
import { getNextAction } from "./get-next-action";
import type { MessageAnnotation, Action } from "~/domain/annotation";
import { SystemContext } from "./system-context";
import { performSearch } from "./perform-search";
import { answerQuestion } from "./answer-question";

export async function runDeepSearchLoop(
  messages: Message[],
  opts: {
    langfuseTraceId?: string;
    onFinish?: Parameters<typeof streamText>[0]["onFinish"];
    writeMessageAnnotation: (annotation: MessageAnnotation) => void;
  },
): Promise<StreamTextResult<{}, string>> {
  const ctx = new SystemContext(messages);

  while (ctx.getStep() < 10) {
    const nextAction = await getNextAction(ctx, {
      langfuseTraceId: opts.langfuseTraceId,
    });

    opts.writeMessageAnnotation({
      type: "NEW_ACTION",
      action: nextAction as Action,
    } satisfies MessageAnnotation);

    if (nextAction.type === "search") {
      await performSearch(ctx, nextAction.query);
    } else if (nextAction.type === "answer") {
      return answerQuestion(ctx, { isFinal: false, ...opts });
    }

    ctx.incrementStep();
  }

  return answerQuestion(ctx, { isFinal: true, ...opts });
};