import type { Message } from "ai";

/**
 * Extracts text content from message parts.
 * Filters for text parts, extracts their text property, and joins with newlines.
 */
export function getTextFromParts(parts: Message["parts"]): string {
  if (!parts || parts.length === 0) {
    return "";
  }

  return parts
    .filter((part) => part.type === "text")
    .map((part) => {
      // Type assertion needed because TextPart interface varies
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (part as any).text as string;
    })
    .filter(Boolean)
    .join("\n");
}

/**
 * Gets text content from a message, preferring parts over content field.
 */
export function getMessageText(message: Message): string {
  // Prefer parts if available (more structured)
  if (message.parts && message.parts.length > 0) {
    return getTextFromParts(message.parts);
  }

  // Fallback to content field
  return message.content || "";
}
