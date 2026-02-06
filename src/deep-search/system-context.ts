import type { Message } from "ai";
import { getMessageText } from "~/domain/message-helpers";

type QueryResultSearchResult = {
  date: string;
  title: string;
  url: string;
  snippet: string;
};

type QueryResult = {
  query: string;
  results: QueryResultSearchResult[];
};

const toQueryResult = (query: QueryResultSearchResult) =>
  [`### ${query.date} - ${query.title}`, query.url, query.snippet].join("\n\n");

const AMOUNT_OF_CONTEXT_TO_KEEP = 5;

export class SystemContext {
  private step = 0;
  private readonly messages: Message[];
  private queryHistory: QueryResult[] = [];
  private latestFeedback: string | null = null;


  constructor(messages: Message[]) {
    this.messages = messages;
  }

  getMessageHistory(): string {
    return this.messages
      .map((message) => {
        const role = message.role === "user" ? "User" : "Assistant";
        const text = getMessageText(message);

        return `<${role}>${text}</${role}>`;
      })
      .join("\n\n");
  }

  /**
   * Get relevant message history based on the specific purpose/context.
   * This reduces token usage by only including necessary messages.
   */
  getRelevantHistory(purpose: 'safety' | 'clarification' | 'research' | 'answer'): string {
    switch (purpose) {
      case 'safety':
      case 'clarification':
        // Only need recent context for safety/clarification checks
        return this.getLastNMessages(3);

      case 'research':
        // Need original question context + recent clarifications
        return this.getOriginalQuestionWithContext();

      case 'answer':
        // Need full context for comprehensive answer
        return this.getMessageHistory();
    }
  }

  /**
   * Get the last N messages from the conversation.
   * Useful for contexts that only need recent history.
   */
  private getLastNMessages(n: number): string {
    const recentMessages = this.messages.slice(-n);
    return recentMessages
      .map((message) => {
        const role = message.role === "user" ? "User" : "Assistant";
        const text = getMessageText(message);
        return `<${role}>${text}</${role}>`;
      })
      .join("\n\n");
  }

  /**
   * Get original question with recent context.
   * Useful for research planning where we need to know the original intent
   * but also consider any clarifications.
   */
  private getOriginalQuestionWithContext(): string {
    if (this.messages.length <= 4) {
      // If conversation is short, return everything
      return this.getMessageHistory();
    }

    // Get first user message (original question)
    const firstUserMsg = this.messages.find(msg => msg.role === "user");
    const firstUserText = firstUserMsg ? getMessageText(firstUserMsg) : "";

    // Get last 2 messages for recent context
    const recentContext = this.getLastNMessages(2);

    return `Original Question:\n<User>${firstUserText}</User>\n\nRecent Context:\n${recentContext}`;
  }

  shouldStop() {
    return this.step >= AMOUNT_OF_CONTEXT_TO_KEEP;
  }

  incrementStep() {
    this.step++;
  }

  getStep() {
    return this.step;
  }

  reportQueries(queries: QueryResult[]) {
    this.queryHistory.push(...queries);
  }


  getQueryHistory(): string {
    // Keep only the most recent 3 queries to manage token usage
    const recentQueries = this.queryHistory.slice(-3);
    return recentQueries
      .map((query) =>
        [
          `## Query: "${query.query}"`,
          ...query.results.map(toQueryResult),
        ].join("\n\n"),
      )
      .join("\n\n");
  }

  getInitialQuestion(): string {
    // Get the FIRST user message as the original question
    // (subsequent user messages might be clarifications)
    const firstUserMessage = this.messages.find(msg => msg.role === "user");
    return firstUserMessage ? getMessageText(firstUserMessage) : "";
  }

  /**
   * Get the most recent user message.
   * Useful when you need the latest user input rather than the original question.
   */
  getLatestUserMessage(): string {
    const lastUserMessage = this.messages
      .filter(msg => msg.role === "user")
      .pop();
    return lastUserMessage ? getMessageText(lastUserMessage) : "";
  }

  getCurrentSearchResults() {
    const lastQuery = this.queryHistory[this.queryHistory.length - 1];
    return lastQuery?.results.map(result => ({
      title: result.title,
      link: result.url,
      snippet: result.snippet,
      date: result.date,
    }));
  }

  setLatestFeedback(feedback: string) {
    this.latestFeedback = feedback;
  }

  getLatestFeedback(): string | null {
    return this.latestFeedback;
  }

  getPreviousQueries(): string[] {
    return this.queryHistory.map(q => q.query);
  }
}