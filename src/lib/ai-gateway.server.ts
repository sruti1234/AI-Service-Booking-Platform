import { createOpenAI } from "@ai-sdk/openai";

export function createAppAiProvider() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  return createOpenAI({
    apiKey,
  });
}