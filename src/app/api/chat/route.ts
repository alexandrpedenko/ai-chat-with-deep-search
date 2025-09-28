import type { Message } from "ai";
import {
  streamText,
  createDataStreamResponse,
} from "ai";
import { z } from "zod";
import { model } from "~/model";
import { auth } from "~/server/auth";
import { searchSerper } from "~/serper";
import { db } from "~/server/db";
import { userRequests, users } from "~/server/db/schema";
import { and, count, eq, gte } from "drizzle-orm";

export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Rate limiting check
  const userId = session.user.id;
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Check if user is admin (admins bypass rate limits)
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { isAdmin: true }
  });

  if (!user?.isAdmin) {
    // Count requests in the last hour
    const requestCount = await db
      .select({ count: count() })
      .from(userRequests)
      .where(
        and(
          eq(userRequests.userId, userId),
          eq(userRequests.requestType, 'chat'),
          gte(userRequests.timestamp, oneHourAgo)
        )
      );

    const hourlyLimit = 1; // Adjust as needed
    const currentCount = requestCount[0]?.count ?? 0;
    if (currentCount >= hourlyLimit) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
          limit: hourlyLimit,
          resetTime: new Date(oneHourAgo.getTime() + 60 * 60 * 1000).toISOString()
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // Log the request
  await db.insert(userRequests).values({
    userId,
    requestType: 'chat',
    timestamp: now,
    ipAddress: request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown'
  });

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