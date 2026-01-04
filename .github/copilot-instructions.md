# Deep Search Chat App - AI Agent Guide

## Architecture Overview

This is a Next.js 15 chat application that implements an **iterative deep-search loop** to answer questions by performing web searches and synthesizing answers. The core flow:

1. **Deep Search Loop** (`src/deep-search/run-deep-search-loop.ts`): Iterates up to 10 steps, deciding whether to search or answer
2. **Action Decision** (`get-next-action.ts`): LLM determines if more searches are needed or if ready to answer
3. **Search Execution** (`perform-search.ts`): Uses Serper API with Redis caching (6-hour TTL)
4. **Answer Generation** (`answer-question.ts`): Streams markdown response with citations using `markdown-joiner` transform

Key architectural decisions:
- **SystemContext** accumulates message history and search results across loop iterations
- All search results are formatted as markdown with structured `### date - title` headers
- Rate limiting is handled at the route level with per-user hourly limits (10 req/hr for non-admins)

## Environment & Configuration

All environment variables are validated using `@t3-oss/env-nextjs` in `src/env.js`. Required vars:
- `OPENAI_API_KEY`, `SERPER_API_KEY`, `LANGFUSE_*` for AI/telemetry
- `REDIS_URL`, `DATABASE_URL` for infrastructure
- `GITHUB_CLIENT_ID/SECRET` for OAuth
- `EVAL_DATASET` controls eval data: `dev` (default), `ci`, or `regression`

Model configuration is in `src/model.ts` - currently using `gpt-4o-mini`.

## Database & Auth

**Stack**: Drizzle ORM + PostgreSQL + NextAuth 5 beta with GitHub OAuth

Schema lives in `src/server/db/schema.ts` with multi-project prefix `my-chat-app_*`:
- `users` table has `isAdmin` boolean for rate limit bypass
- `chats` table stores conversation history with metadata (model, title)
- `userRequests` tracks rate limiting per user/hour

Commands:
```bash
npm run db:push       # Push schema changes (dev)
npm run db:generate   # Generate migrations
npm run db:migrate    # Run migrations
npm run db:studio     # Open Drizzle Studio
```

Auth config in `src/server/auth/config.ts` uses DrizzleAdapter. Session available via `await auth()`.

## Development Workflows

**Start dev server**: `npm run dev` (uses Next.js 15 with Turbopack)

**Run evaluations**:
```bash
npm run evals-run     # Run once on dataset (dev/ci/regression)
npm run evals-watch   # Watch mode for continuous testing
```

Eval structure (`evals/initial.eval.ts`):
- Uses `evalite` framework with custom scorers
- Scorers include `Factuality`, `AnswerRelevancy`, and custom "Contains Links" check
- Data files: `dev.ts` (default), `ci.ts`, `regression.ts` - controlled by `EVAL_DATASET` env var
- Test by calling `askDeepSearch(messages)` which returns final answer text

## Key Patterns & Conventions

### Path Aliases
All imports use `~` alias for `./src`: `import { model } from "~/model"`

### Redis Caching Pattern
Wrap async functions with `cacheWithRedis(keyPrefix, fn)` - automatically handles key generation with args as JSON suffix. Used in `serper.ts` for search result caching.

### Streaming Transforms
Answer streaming uses two transforms in sequence:
1. `markdownJoinerTransform()` - custom transform for joining markdown chunks intelligently
2. `smoothStream()` - AI SDK transform for gradual rendering (20ms delay, line chunking)

### Telemetry/Observability
- Langfuse integration via `instrumentation.ts` using `@vercel/otel`
- Pass `langfuseTraceId` through options chain for distributed tracing
- Route handler creates trace with `sessionId: chatId`

### Rate Limiting
Check `src/server/rate-limit.ts` for Redis-based sliding window implementation. API routes manually check user request counts before processing. Admin users (DB flag) bypass limits.

### Message Formatting
SystemContext serializes messages as `<User>content</User>` or `<Assistant>content</Assistant>` for prompt engineering. Search results formatted with date, title, URL, and snippet in markdown.

## Critical Files

- `src/deep-search.ts` - Public API entry point
- `src/deep-search/system-context.ts` - State accumulator for search loop
- `src/app/api/chat/route.ts` - Main streaming endpoint with auth, rate limiting, DB logging
- `src/components/chat-message.tsx` - Client-side message rendering
- `evals/dev.ts` - Primary evaluation dataset (TypeScript/Next.js focused)

## Testing Patterns

No traditional unit tests - uses LLM evaluations instead:
1. Define expected outputs in `evals/*.ts` data files
2. Run through `askDeepSearch` task function
3. Score with custom scorers (Factuality uses GPT-4o-mini, AnswerRelevancy checks statement-level relevance)

Scorers use `createScorer` from `evalite` and `generateObject` from AI SDK for structured LLM evaluation.
