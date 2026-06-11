import { describe, it, expect } from "vitest";
import { buildApp, mockDb, mockDbMulti } from "../test-utils";
import { result } from "./index";

const RESULT_ID = "00000000-0000-0000-0000-000000000002";
const MONITOR_ID = "00000000-0000-0000-0000-000000000001";

const resultRow = {
  id: RESULT_ID,
  monitorId: MONITOR_ID,
  source: "reddit",
  sourceId: "abc123",
  url: "https://reddit.com/r/test",
  title: "Test post",
  snippet: "snippet",
  author: "user",
  publishedAt: new Date().toISOString(),
  matchedKeywords: ["keyword"],
  intentScore: 80,
  intentCategory: "pain_point",
  intentReason: "reason",
  scoredAt: new Date().toISOString(),
  isRead: false,
  isSaved: false,
  createdAt: new Date().toISOString(),
};

function build(db: any, authenticated = true) {
  const app = buildApp(db, { authenticated });
  app.register(result);
  return app;
}

describe("GET /results", () => {
  it("returns paginated list when authenticated", async () => {
    const app = build(mockDb([{ ...resultRow, total: 1 }]));
    const res = await app.inject({ method: "GET", url: "/results" });
    expect(res.statusCode).toBe(200);
    expect(res.json().total).toBe(1);
    expect(res.json().items[0].id).toBe(RESULT_ID);
  });

  it("returns 401 when not authenticated", async () => {
    const app = build(mockDb([]), false);
    const res = await app.inject({ method: "GET", url: "/results" });
    expect(res.statusCode).toBe(401);
  });
});

describe("PATCH /results/:id", () => {
  it("returns updated result when found", async () => {
    const updated = { ...resultRow, isRead: true };
    const app = build(mockDb([updated]));
    const res = await app.inject({
      method: "PATCH",
      url: `/results/${RESULT_ID}`,
      payload: { isRead: true },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().isRead).toBe(true);
  });

  it("returns 404 when not found", async () => {
    const app = build(mockDb([]));
    const res = await app.inject({
      method: "PATCH",
      url: `/results/${RESULT_ID}`,
      payload: { isRead: true },
    });
    expect(res.statusCode).toBe(404);
  });

  it("returns 400 for invalid UUID param", async () => {
    const app = build(mockDb([]));
    const res = await app.inject({
      method: "PATCH",
      url: "/results/not-a-uuid",
      payload: { isRead: true },
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    const app = build(mockDb([]), false);
    const res = await app.inject({
      method: "PATCH",
      url: `/results/${RESULT_ID}`,
      payload: { isRead: true },
    });
    expect(res.statusCode).toBe(401);
  });
});

describe("DELETE /results/:id", () => {
  it("returns deleted result when found", async () => {
    const app = build(mockDb([resultRow]));
    const res = await app.inject({
      method: "DELETE",
      url: `/results/${RESULT_ID}`,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().id).toBe(RESULT_ID);
  });

  it("returns 404 when not found", async () => {
    const app = build(mockDb([]));
    const res = await app.inject({
      method: "DELETE",
      url: `/results/${RESULT_ID}`,
    });
    expect(res.statusCode).toBe(404);
  });

  it("returns 400 for invalid UUID param", async () => {
    const app = build(mockDb([]));
    const res = await app.inject({
      method: "DELETE",
      url: "/results/not-a-uuid",
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    const app = build(mockDb([]), false);
    const res = await app.inject({
      method: "DELETE",
      url: `/results/${RESULT_ID}`,
    });
    expect(res.statusCode).toBe(401);
  });
});

describe("GET /results/stats", () => {
  it("returns counts by category, source, and day", async () => {
    const byCategoryRow = [{ category: "pain_point", count: 1 }];
    const bySourceRow = [{ source: "reddit", count: 1 }];
    const byDayRow = [{ date: "2026-06-11", count: 1 }];
    const app = build(mockDbMulti(byCategoryRow, bySourceRow, byDayRow));
    const res = await app.inject({ method: "GET", url: "/results/stats" });
    expect(res.statusCode).toBe(200);
    expect(res.json().byCategory).toEqual(byCategoryRow);
    expect(res.json().bySource).toEqual(bySourceRow);
    expect(res.json().byDay).toEqual(byDayRow);
  });

  it("returns 401 when not authenticated", async () => {
    const app = build(mockDb([]), false);
    const res = await app.inject({ method: "GET", url: "/results/stats" });
    expect(res.statusCode).toBe(401);
  });
});
