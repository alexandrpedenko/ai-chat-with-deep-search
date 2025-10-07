import {
  streamText,
  type Message,
  type TelemetrySettings,
} from "ai";
import { z } from "zod";
import { model } from "~/model";
import { searchSerper } from "~/serper";

const getSystemMessage = () => {
  const currentDateTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return `You are a helpful AI assistant with access to web search capabilities.

CURRENT DATE AND TIME: ${currentDateTime}

When answering questions, you should:
1. Always attempt to use the searchWeb tool to find current and relevant information
2. When users ask for "up to date", "recent", "latest", or "current" information, use the current date in your search queries
3. Pay attention to publication dates in search results and prioritize recent sources
4. Provide comprehensive answers that combine your knowledge with the latest web search results
5. Always cite your sources using inline links in markdown format: [source title](url)
6. If you find multiple relevant sources, include several citations to provide complete information
7. Be transparent about when information comes from web search vs your training data
8. Prioritize recent and authoritative sources when available

Remember to search for relevant terms and provide well-sourced, up-to-date responses. When users ask for current information, include date-specific terms in your searches (e.g., "2025", "October", "latest", "recent").`;
};

export const streamFromDeepSearch = (opts: {
  messages: Message[];
  onFinish: Parameters<typeof streamText>[0]["onFinish"];
  telemetry: TelemetrySettings;
}) =>
  streamText({
    model,
    messages: opts.messages,
    maxSteps: 10,
    system: getSystemMessage(),
    tools: {
      searchWeb: {
        parameters: z.object({
          query: z.string().describe("The query to search the web for"),
        }),
        execute: async ({ query }, { abortSignal }) => {
          const results = await searchSerper(
            { q: query, num: 10 },
            abortSignal,
          );

          return results.organic.map((result) => ({
            title: result.title,
            link: result.link,
            snippet: result.snippet,
            date: result.date || 'Date not available',
          }));
        },
      },
    },
    onFinish: opts.onFinish,
    experimental_telemetry: opts.telemetry,
  });

export async function askDeepSearch(messages: Message[]) {
  const result = streamFromDeepSearch({
    messages,
    onFinish: () => { }, // just a stub
    telemetry: {
      isEnabled: false,
    },
  });

  // Consume the stream - without this,
  // the stream will never finish
  await result.consumeStream();

  return await result.text;
}