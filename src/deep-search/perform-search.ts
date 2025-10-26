import { searchSerper } from "~/serper";
import type { SystemContext } from "./system-context";

export const performSearch = async (ctx: SystemContext, query?: string) => {
  if (!query) {
    throw new Error("Query is required for search action");
  }

  const results = await searchSerper(
    { q: query, num: 10 },
    undefined,
  );

  ctx.reportQueries([
    {
      query,
      results: results.organic.map((result) => ({
        date: result.date || new Date().toISOString(),
        title: result.title,
        url: result.link,
        snippet: result.snippet,
      })),
    },
  ]);
};