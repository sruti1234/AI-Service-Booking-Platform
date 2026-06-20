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
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const prompt = `You write short, customer-friendly summaries for a service-booking app.

Provider:
- Name: ${data.name}
- Category: ${data.category}
- City: ${data.city}
- Experience: ${data.experience} years
- Average rating: ${data.rating} / 5 (${data.reviews} reviews)

Write 2 sentences (max 55 words total). Highlight strengths, ideal use cases, and trust signals. No emojis. No markdown. No bullet points.`;

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        prompt,
      });
      return { summary: text.trim() };
    } catch (err: unknown) {
      const e = err as { statusCode?: number; status?: number; message?: string };
      const status = e.statusCode ?? e.status;
      if (status === 429) throw new Error("AI rate limit reached. Please retry in a moment.");
      if (status === 402) throw new Error("AI credits exhausted for this workspace.");
      throw new Error(e.message ?? "AI request failed");
    }
  });
