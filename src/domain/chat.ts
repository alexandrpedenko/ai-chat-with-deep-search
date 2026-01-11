import type { Message } from "ai";
import type { MessageAnnotation } from "./annotation";

/**
 * Chat message with all fields including parts and annotations
 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  parts?: Message["parts"];
  annotations?: MessageAnnotation[];
}

/**
 * Full chat with all messages and metadata
 */
export interface Chat {
  id: string;
  userId: string;
  title: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  messages: ChatMessage[];
}

/**
 * Lightweight chat info for lists (without messages)
 */
export interface UserChat {
  id: string;
  title: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}
