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

export class SystemContext {
  private step = 0;
  private readonly messages: Message[];
  private queryHistory: QueryResult[] = [];


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

  shouldStop() {
    return this.step >= 10;
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
    return this.queryHistory
      .map((query) =>
        [
          `## Query: "${query.query}"`,
          ...query.results.map(toQueryResult),
        ].join("\n\n"),
      )
      .join("\n\n");
  }

  getInitialQuestion(): string {
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
}