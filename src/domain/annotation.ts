import type { JSONValue } from "ai";

/**
 * Domain types for annotations and reasoning steps
 */
export interface ContinueAction {
  type: "continue";
  title: string;
  reasoning: string;
  feedback: string;
}

export interface AnswerAction {
  type: "answer";
  title: string;
  reasoning: string;
  feedback: string;
}

export type Action = ContinueAction | AnswerAction;

export interface QueryPlan {
  plan: string;
  queries: string[];
}

export type MessageAnnotation =
  | { type: "NEW_ACTION"; action: Action }
  | { type: "QUERY_PLAN"; queryPlan: QueryPlan };

/**
 * Type guard to check if an annotation is a MessageAnnotation
 */
export function isMessageAnnotation(value: unknown): value is MessageAnnotation {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    (obj.type === "NEW_ACTION" &&
      typeof obj.action === "object" &&
      obj.action !== null) ||
    (obj.type === "QUERY_PLAN" &&
      typeof obj.queryPlan === "object" &&
      obj.queryPlan !== null)
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