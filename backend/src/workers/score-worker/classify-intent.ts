import Anthropic from "@anthropic-ai/sdk";
import * as z from "zod";

const SYSTEM_PROMPT =
  "You are an intent classifier for a keyword monitoring tool. Analyze the given post and return ONLY a JSON object with no preamble or markdown.";

const intentSchema = z.strictObject({
  score: z.number().min(1).max(10),
  category: z.enum(["hiring", "pain_point", "discussion", "noise"]),
  reason: z.string(),
});

export type IntentClassification = z.infer<typeof intentSchema>;

function buildUserPrompt(
  matchedKeywords: string[],
  title: string | null,
  snippet: string,
): string {
  return `Classify this post's intent.

Keywords that matched: ${matchedKeywords.join(", ")}
Title: ${title ?? ""}
Content: ${snippet}

Return exactly this JSON shape:
{
  "score": <1-10>,
  "category": <"hiring" | "pain_point" | "discussion" | "noise">,
  "reason": <one sentence explanation>
}`;
}

export async function classifyIntent(params: {
  id: string;
  matchedKeywords: string[];
  title: string | null;
  snippet: string;
}): Promise<IntentClassification> {
  const client = new Anthropic({ timeout: 30_000, maxRetries: 1 });
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildUserPrompt(
          params.matchedKeywords,
          params.title,
          params.snippet,
        ),
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error(`No text response for result ${params.id}`);
  }

  // Claude sometimes wraps the response in a markdown code fence (```json ... ```)
  // despite being instructed not to. Strip leading and trailing fences before parsing
  // so JSON.parse doesn't throw on the backtick characters.
  const raw = textBlock.text
    .replace(/^```(?:json)?\s*/i, "") // remove opening fence with optional "json" tag
    .replace(/\s*```$/, "")           // remove closing fence
    .trim();
  return intentSchema.parse(JSON.parse(raw));
}
