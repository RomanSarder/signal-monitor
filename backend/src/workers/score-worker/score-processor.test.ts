import { describe, it, expect, vi } from "vitest";
import { createScoreProcessor } from "./score-processor";
import { mockDbMulti, mockJob } from "../../test-utils";

const RESULT_ID = "00000000-0000-0000-0000-000000000001";
const MONITOR_ID = "00000000-0000-0000-0000-000000000002";

// Noise result: keyword "signal" does NOT appear in snippet or title
const noiseResultRow = {
  id: RESULT_ID,
  monitorId: MONITOR_ID,
  source: "hn",
  sourceId: "hn-001",
  url: "https://example.com/noise",
  title: "some title",
  snippet: "some text about hiring",
  author: "user",
  publishedAt: new Date(),
  matchedKeywords: ["signal"],
  intentScore: null,
  intentCategory: null,
  intentReason: null,
  scoredAt: null,
  isRead: false,
  isSaved: false,
  createdAt: new Date(),
};

// Relevant result: keyword "signal" appears in snippet
const relevantResultRow = {
  ...noiseResultRow,
  snippet: "signal processing post",
};



describe("createScoreProcessor", () => {
  it("returns early when result is not found", async () => {
    const db = mockDbMulti([]);
    const classifyIntent = vi.fn();

    const result = await createScoreProcessor({ db, classifyIntent })(mockJob({ resultId: RESULT_ID }));

    expect(result).toBeUndefined();
    expect(classifyIntent).not.toHaveBeenCalled();
  });

  it("marks result as noise when not relevant", async () => {
    // DB calls: select → [noiseResultRow], update (noise) → []
    const db = mockDbMulti([noiseResultRow], []);
    const classifyIntent = vi.fn();

    await createScoreProcessor({ db, classifyIntent })(mockJob({ resultId: RESULT_ID }));

    expect(classifyIntent).not.toHaveBeenCalled();
  });

  it("classifies and updates result when relevant", async () => {
    // DB calls: select → [relevantResultRow], update (classification) → []
    const db = mockDbMulti([relevantResultRow], []);
    const classification = {
      score: 8,
      category: "pain_point" as const,
      reason: "User describes a pain point with signal processing.",
    };
    const classifyIntent = vi.fn().mockResolvedValue(classification);

    await createScoreProcessor({ db, classifyIntent })(mockJob({ resultId: RESULT_ID }));

    expect(classifyIntent).toHaveBeenCalledOnce();
    expect(classifyIntent).toHaveBeenCalledWith({
      id: RESULT_ID,
      matchedKeywords: ["signal"],
      title: "some title",
      snippet: "signal processing post",
    });
  });

  it("re-throws when classifyIntent fails", async () => {
    // DB calls: select → [relevantResultRow], classifyIntent throws before update
    const db = mockDbMulti([relevantResultRow]);
    const classifyIntent = vi.fn().mockRejectedValue(new Error("API timeout"));

    await expect(
      createScoreProcessor({ db, classifyIntent })(mockJob({ resultId: RESULT_ID })),
    ).rejects.toThrow("API timeout");
  });

  it("propagates error when db select throws", async () => {
    const db = mockDbMulti(new Error("db connection failed"));
    const classifyIntent = vi.fn();

    await expect(
      createScoreProcessor({ db, classifyIntent })(mockJob({ resultId: RESULT_ID })),
    ).rejects.toThrow("db connection failed");

    expect(classifyIntent).not.toHaveBeenCalled();
  });
});
