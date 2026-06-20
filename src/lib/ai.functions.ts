import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const Input = z.object({
  name: z.string().min(1).max(80),
  category: z.string().min(1).max(40),
  city: z.string().min(1).max(40),
  experience: z.number().int().min(0).max(60),
  rating: z.number().min(0).max(5),
  reviews: z.number().int().min(0).max(10000),
});

export const generateProviderSummary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("Missing OPENAI_API_KEY");

    const { createAppAiProvider } = await import("./ai-gateway.server");
    const openai = createAppAiProvider();

    const prompt = `You write short, customer-friendly summaries for a service-booking app.

Provider:
- Name: ${data.name}
- Category: ${data.category}
- City: ${data.city}
- Experience: ${data.experience} years
- Average rating: ${data.rating} / 5 (${data.reviews} reviews)

Write exactly 2 sentences (max 55 words total). Highlight strengths, ideal use cases, and trust signals. No emojis. No markdown. No bullet points.`;

    try {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt,
      });

      return { summary: text.trim() };
    } catch (err: unknown) {
      const e = err as { statusCode?: number; status?: number; message?: string };
      const status = e.statusCode ?? e.status;

      if (status === 429) throw new Error("OpenAI rate limit reached. Please retry in a moment.");
      if (status === 401) throw new Error("Invalid OpenAI API key.");
      if (status === 402) throw new Error("OpenAI billing or quota issue.");
      throw new Error(e.message ?? "AI request failed");
    }
  }); 