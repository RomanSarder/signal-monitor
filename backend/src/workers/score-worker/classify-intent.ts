import Anthropic from "@anthropic-ai/sdk";
import * as z from "zod";

const SYSTEM_PROMPT = `You are an intent classifier for a keyword monitoring tool.
  Analyze the given post and return ONLY a JSON object with no preamble or markdown.

  Each post can belong to one of the categories:
  - hiring — actively looking to hire or contract someone, either directly or indirectly and must be a legitimate, specific job opportunity with clear technical role or skills mentioned; or includes posts that redirect to hiring threads or reference job postings. Hiring signals must come from someone seeking to hire, not from someone seeking to be hired. Posts where an individual is looking for work are not hiring signals.
  - pain_point — describing a real problem that a senior engineer's skills could address
  - discussion — technical conversation, learning, sharing, no clear signal
  - noise — keyword appears incidentally — the primary subject is something other than the matched keyword, or the content is unrelated to software/technology entirely

  Scoring guide:
  - 9-10 — clear hiring signal, actively seeking an engineer
  - 7-8 — strong pain point, real problem these skills solve
  - 5-6 — adjacent discussion, relevant topic, indirect signal
  - 3-4 — general discussion, on-topic but no actionable signal
  - 1-2 — noise, keyword incidental

  Category and score are related — hiring scores 7-10, pain_point 5-8, discussion 3-6, noise 1-2.
  `;

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
}

Return only these three fields. Do not add any additional fields.`;
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
    .replace(/\s*```$/, "") // remove closing fence
    .trim();
  return intentSchema.parse(JSON.parse(raw));
}
