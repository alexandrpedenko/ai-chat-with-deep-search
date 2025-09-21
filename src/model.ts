import { openai } from "@ai-sdk/openai";

// Configure the OpenAI model
// The API key is automatically read from OPENAI_API_KEY environment variable
// export const model = openai("gpt-4o");

// Alternative models you can try:
export const model = openai("gpt-4o-mini");
// export const model = openai("gpt-3.5-turbo");
// export const model = openai("gpt-4");