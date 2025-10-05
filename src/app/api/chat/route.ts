import type { Message } from "ai";
import {
  streamText,
  createDataStreamResponse,
  appendResponseMessages,
} from "ai";
import { z } from "zod";
import { model } from "~/model";
import { auth } from "~/server/auth";
import { searchSerper } from "~/serper";
import { db } from "~/server/db";
import { userRequests, users } from "~/server/db/schema";
import { upsertChat } from "~/server/db/chat";
import { and, count, eq, gte } from "drizzle-orm";
import { Langfuse } from "langfuse";
import { env } from "~/env";

const langfuse = new Langfuse({
  environment: env.NODE_ENV,
});

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

    const hourlyLimit = 10; // Adjust as needed
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
    chatId?: string;
  };

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const { messages, chatId } = body;

      // Generate chat ID if not provided
      const finalChatId = chatId || crypto.randomUUID();
      const isNewChat = !chatId;

      // Create Langfuse trace with session and user tracking
      const trace = langfuse.trace({
        sessionId: finalChatId,
        name: "chat",
        userId: session.user.id,
      });

      // Generate chat title from first user message (fallback to generic title)
      const firstUserMessage = messages.find(msg => msg.role === 'user');
      const chatTitle = firstUserMessage?.content.slice(0, 50) || "New Chat";

      // Create/update chat with initial messages before streaming
      // This protects against broken streams and ensures we don't lose data
      await upsertChat({
        userId,
        chatId: finalChatId,
        title: chatTitle,
        messages,
      });

      // If this is a new chat, send the chat ID to the frontend
      if (isNewChat) {
        dataStream.writeData({
          type: "NEW_CHAT_CREATED",
          chatId: finalChatId,
        });
      }

      const result = streamText({
        model,
        messages,
        system: getSystemMessage(),
        maxSteps: 10,
        experimental_telemetry: {
          isEnabled: true,
          functionId: `agent`,
          metadata: {
            langfuseTraceId: trace.id,
          },
        },
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
        onFinish: async ({ text, finishReason, usage, response }) => {
          try {
            const responseMessages = response.messages;

            const updatedMessages = appendResponseMessages({
              messages,
              responseMessages,
            });

            await upsertChat({
              userId,
              chatId: finalChatId,
              title: chatTitle,
              messages: updatedMessages,
            });
            await langfuse.flushAsync();
          } catch (error) {
            console.error("Failed to save chat:", error);
          }
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