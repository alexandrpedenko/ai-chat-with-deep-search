import {
  streamText,
  type Message,
  type TelemetrySettings,
  type StreamTextResult,
} from "ai";
import { runDeepSearchLoop } from "./deep-search/run-deep-search-loop";
import type { OurMessageAnnotation } from "./deep-search/get-next-action";

export function streamFromDeepSearch(opts: {
  messages: Message[];
  onFinish: Parameters<typeof streamText>[0]["onFinish"];
  telemetry: TelemetrySettings;
  writeMessageAnnotation: (annotation: OurMessageAnnotation) => void;
}): Promise<StreamTextResult<{}, string>> {
  return runDeepSearchLoop(opts.messages, {
    langfuseTraceId: opts.telemetry.metadata?.langfuseTraceId as string,
    onFinish: opts.onFinish,
    writeMessageAnnotation: opts.writeMessageAnnotation,
  });
}

export async function askDeepSearch(messages: Message[]) {
  const result = await streamFromDeepSearch({
    messages,
    onFinish: () => { },
    telemetry: {
      isEnabled: false,
      functionId: "askDeepSearch",
      metadata: {},
    },
    writeMessageAnnotation: () => { },
  });

  await result.consumeStream();
  return await result.text;
}