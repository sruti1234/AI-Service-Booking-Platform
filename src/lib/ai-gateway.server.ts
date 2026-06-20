import { createGoogleGenerativeAI } from "@ai-sdk/google";

export function createAppAiProvider() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  return createGoogleGenerativeAI({
    apiKey,
  });
}