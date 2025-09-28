import type { Message } from "ai";
import {
    streamText,
    createDataStreamResponse,
} from "ai";
import { z } from "zod";
import { model } from "~/model";
import { auth } from "~/server/auth";
import { searchSerper } from "~/serper";

export const maxDuration = 60;

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 });
    }

    const body = (await request.json()) as {
        messages: Array<Message>;
    };

    return createDataStreamResponse({
        execute: async (dataStream) => {
            const { messages } = body;

            const result = streamText({
                model,
                messages,
                system: `You are a helpful AI assistant with access to web search capabilities. When answering questions, you should:
1. Always attempt to use the searchWeb tool to find current and relevant information
2. Provide comprehensive answers that combine your knowledge with the latest web search results
3. Always cite your sources using inline links in markdown format: [source title](url)
4. If you find multiple relevant sources, include several citations to provide complete information
5. Be transparent about when information comes from web search vs your training data
6. Prioritize recent and authoritative sources when available

Remember to search for relevant terms and provide well-sourced, up-to-date responses.`,
                maxSteps: 10,
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
                            }));
                        },
                    },
                },
            });

            result.mergeIntoDataStream(dataStream);
        },
        onError: (e) => {
            console.error(e);
            return "Oops, an error occured!";
        },
    });
}