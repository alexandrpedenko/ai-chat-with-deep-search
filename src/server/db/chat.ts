import type { Message } from "ai";
import type { Chat, ChatMessage, UserChat } from "~/domain/chat";
import { parseAnnotations } from "~/domain/annotation";
import { getTextFromParts } from "~/domain/message-helpers";
import { db } from "./index";
import { chats, messages } from "./schema";
import { eq, desc, and } from "drizzle-orm";

export const upsertChat = async (opts: {
  userId: string;
  chatId: string;
  title?: string;
  messages: Message[];
}) => {
  const { userId, chatId, title, messages: messageList } = opts;

  return await db.transaction(async (tx) => {
    // Check if chat exists and verify ownership
    const existingChat = await tx.query.chats.findFirst({
      where: eq(chats.id, chatId),
    });

    if (existingChat && existingChat.userId !== userId) {
      throw new Error("Chat does not belong to the logged in user");
    }

    // If chat doesn't exist, create it
    if (!existingChat) {
      await tx.insert(chats).values({
        id: chatId,
        userId,
        title: title || "New Chat",
      });
    } else {
      // Update existing chat title and updatedAt
      await tx
        .update(chats)
        .set({
          ...(title ? { title } : {}),
          updatedAt: new Date()
        })
        .where(eq(chats.id, chatId));
    }

    // Delete existing messages for this chat
    await tx.delete(messages).where(eq(messages.chatId, chatId));

    // Insert new messages
    if (messageList.length > 0) {
      const messageInserts = messageList.map((message, index) => ({
        chatId,
        role: message.role,
        parts: message.parts || null,
        annotations: message.annotations || null,
        order: index,
      }));

      await tx.insert(messages).values(messageInserts);
    }

    return chatId;
  });
};

export const getChat = async (chatId: string, userId: string): Promise<Chat | null> => {
  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
    with: {
      messages: {
        orderBy: [messages.order],
      },
    },
  });

  if (!chat) {
    return null;
  }

  // Transform messages to match AI SDK Message type
  const transformedMessages: ChatMessage[] = chat.messages.map((msg) => {
    const parts = msg.parts as Message["parts"] || undefined;
    const content = getTextFromParts(parts);

    return {
      id: msg.id,
      role: msg.role as "user" | "assistant" | "system",
      content, // Restored from parts for context/history
      parts,
      annotations: parseAnnotations(msg.annotations),
    };
  });

  return {
    ...chat,
    messages: transformedMessages,
  };
};

export const getChats = async (userId: string): Promise<UserChat[]> => {
  const userChats = await db.query.chats.findMany({
    where: eq(chats.userId, userId),
    orderBy: [desc(chats.updatedAt)],
    columns: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return userChats;
};