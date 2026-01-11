import type { JSONValue } from "ai";

/**
 * Domain types for annotations and reasoning steps
 */
export interface SearchAction {
  type: "search";
  query: string;
  title: string;
  reasoning: string;
}

export interface AnswerAction {
  type: "answer";
  title: string;
  reasoning: string;
}

export type Action = SearchAction | AnswerAction;

export interface MessageAnnotation {
  type: "NEW_ACTION";
  action: Action;
}

/**
 * Type guard to check if an annotation is a MessageAnnotation
 */
export function isMessageAnnotation(value: unknown): value is MessageAnnotation {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    obj.type === "NEW_ACTION" &&
    typeof obj.action === "object" &&
    obj.action !== null
  );
}

/**
 * Helper to safely parse annotations from JSONValue[]
 */
export function parseAnnotations(annotations: unknown): MessageAnnotation[] {
  if (!Array.isArray(annotations)) return [];
  return annotations.filter(isMessageAnnotation);
}

export function toJSONValue(annotation: MessageAnnotation): JSONValue {
  return annotation as unknown as JSONValue;
}

export function toJSONValueArray(annotations: MessageAnnotation[]): JSONValue[] {
  return annotations.map((annotation) => toJSONValue(annotation)!);
}