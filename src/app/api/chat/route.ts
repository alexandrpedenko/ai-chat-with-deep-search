import type { Message } from "ai";
import {
  createDataStreamResponse,
  appendResponseMessages,
} from "ai";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { userRequests, users } from "~/server/db/schema";
import { upsertChat } from "~/server/db/chat";
import { and, count, eq, gte } from "drizzle-orm";
import { Langfuse } from "langfuse";
import { env } from "~/env";
import { streamFromDeepSearch } from "~/deep-search";
import { checkRateLimit, recordRateLimit, type RateLimitConfig } from "~/server/rate-limit";
import type { MessageAnnotation } from "~/domain/annotation";
import { toJSONValue, toJSONValueArray } from "~/domain/annotation";

const langfuse = new Langfuse({
  environment: env.NODE_ENV,
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

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

      const finalChatId = chatId || crypto.randomUUID();
      const isNewChat = !chatId;
      const annotations: MessageAnnotation[] = [];

      const trace = langfuse.trace({
        sessionId: finalChatId,
        name: "chat",
        userId: session.user.id,
      });

      const firstUserMessage = messages.find(msg => msg.role === 'user');
      const chatTitle = firstUserMessage?.content.slice(0, 50) || "New Chat";

      await upsertChat({
        userId,
        chatId: finalChatId,
        title: chatTitle,
        messages,
      });

      if (isNewChat) {
        dataStream.writeData({
          type: "NEW_CHAT_CREATED",
          chatId: finalChatId,
        });
      }

      const globalRateLimitConfig: RateLimitConfig = {
        maxRequests: 1, // For testing - only 1 request allowed
        windowMs: 5_000, // For testing - 5 second window
        keyPrefix: "global_llm",
        maxRetries: 3,
      };
      const rateLimitCheck = await checkRateLimit(globalRateLimitConfig);

      if (!rateLimitCheck.allowed) {
        console.log("Global LLM rate limit exceeded, waiting for reset...");
        const isAllowed = await rateLimitCheck.retry();

        if (!isAllowed) {
          console.error("Global LLM rate limit still exceeded after retries");
        }
      }

      // Record the LLM request
      await recordRateLimit({
        windowMs: globalRateLimitConfig.windowMs,
        keyPrefix: globalRateLimitConfig.keyPrefix,
      });

      const result = await streamFromDeepSearch({
        messages,
        telemetry: {
          isEnabled: true,
          functionId: `agent`,
          metadata: {
            langfuseTraceId: trace.id,
          },
        },
        writeMessageAnnotation: (annotation) => {
          annotations.push(annotation);
          if (annotation) {
            dataStream.writeMessageAnnotation(toJSONValue(annotation));
          }
        },
        onFinish: async ({ response }) => {
          try {
            const responseMessages = response.messages;

            const updatedMessages = appendResponseMessages({
              messages,
              responseMessages,
            });

            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage && annotations.length > 0) {
              lastMessage.annotations = toJSONValueArray(annotations);
            }

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