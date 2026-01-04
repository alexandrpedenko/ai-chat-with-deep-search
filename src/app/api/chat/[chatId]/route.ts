import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { chats, messages } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { chatId } = await params;

    // Verify chat belongs to user
    const chat = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, session.user.id)))
      .limit(1);

    if (!chat.length) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Get messages for this chat
    const chatMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.order);

    return NextResponse.json({
      chat: chat[0],
      messages: chatMessages,
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
