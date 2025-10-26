import {
  streamText,
  type Message,
  type TelemetrySettings,
  type StreamTextResult,
} from "ai";
import { runDeepSearchLoop } from "./deep-search/run-deep-search-loop";

export function streamFromDeepSearch(opts: {
  messages: Message[];
  onFinish: Parameters<typeof streamText>[0]["onFinish"];
  telemetry: TelemetrySettings;
}): Promise<StreamTextResult<{}, string>> {
  return runDeepSearchLoop(opts.messages, {
    langfuseTraceId: opts.telemetry.metadata?.langfuseTraceId as string,
    onFinish: opts.onFinish,
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
  });

  await result.consumeStream();
  return await result.text;
}