import { describe, it, expect } from "vitest";
import { buildApp, mockDb, mockPollQueue } from "../test-utils";
import { monitor } from "./index";

const MONITOR_ID = "00000000-0000-0000-0000-000000000001";

const monitorRow = {
  id: MONITOR_ID,
  userId: "user-id",
  name: "Test Monitor",
  keywords: ["keyword"],
  sources: ["source"],
  intervalMinutes: 30,
  status: "active",
  lastRunAt: null,
  lastResultCount: 0,
  createdAt: new Date().toISOString(),
};

const validCreateBody = {
  name: "Test Monitor",
  intervalMinutes: 30,
  sources: ["source"],
  keywords: ["keyword"],
};

function build(dbResult: unknown, authenticated = true, queue = mockPollQueue()) {
  const app = buildApp(mockDb(dbResult), { authenticated, pollQueue: queue });
  app.register(monitor);
  return { app, queue };
}

describe("GET /monitors", () => {
  it("returns monitor list when authenticated", async () => {
    const { app } = build([monitorRow]);
    const res = await app.inject({ method: "GET", url: "/monitors" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([monitorRow]);
  });

  it("returns 401 when not authenticated", async () => {
    const { app } = build([], false);
    const res = await app.inject({ method: "GET", url: "/monitors" });
    expect(res.statusCode).toBe(401);
  });
});

describe("POST /monitors", () => {
  it("creates a monitor with userId from JWT and schedules the job", async () => {
    const { app, queue } = build([monitorRow]);
    const res = await app.inject({
      method: "POST",
      url: "/monitors",
      payload: validCreateBody,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().userId).toBe("user-id");
    expect(queue.upsertJobScheduler).toHaveBeenCalledWith(
      MONITOR_ID,
      { every: monitorRow.intervalMinutes * 60 * 1000 },
      { name: "poll-request", data: { monitorId: MONITOR_ID } },
    );
  });

  it("returns 400 when required fields are missing", async () => {
    const { app } = build([]);
    const res = await app.inject({
      method: "POST",
      url: "/monitors",
      payload: { name: "Only name" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    const { app } = build([], false);
    const res = await app.inject({
      method: "POST",
      url: "/monitors",
      payload: validCreateBody,
    });
    expect(res.statusCode).toBe(401);
  });
});

describe("GET /monitors/:id", () => {
  it("returns the monitor when found", async () => {
    const { app } = build([monitorRow]);
    const res = await app.inject({
      method: "GET",
      url: `/monitors/${MONITOR_ID}`,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().id).toBe(MONITOR_ID);
  });

  it("returns 404 when not found", async () => {
    const { app } = build([]);
    const res = await app.inject({
      method: "GET",
      url: `/monitors/${MONITOR_ID}`,
    });
    expect(res.statusCode).toBe(404);
  });

  it("returns 400 for invalid UUID param", async () => {
    const { app } = build([]);
    const res = await app.inject({
      method: "GET",
      url: "/monitors/not-a-uuid",
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    const { app } = build([], false);
    const res = await app.inject({
      method: "GET",
      url: `/monitors/${MONITOR_ID}`,
    });
    expect(res.statusCode).toBe(401);
  });
});

describe("PATCH /monitors/:id", () => {
  it("returns updated monitor when found", async () => {
    const updated = { ...monitorRow, name: "Updated" };
    const { app } = build([updated]);
    const res = await app.inject({
      method: "PATCH",
      url: `/monitors/${MONITOR_ID}`,
      payload: { name: "Updated" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().name).toBe("Updated");
  });

  it("returns 404 when not found", async () => {
    const { app } = build([]);
    const res = await app.inject({
      method: "PATCH",
      url: `/monitors/${MONITOR_ID}`,
      payload: { name: "Updated" },
    });
    expect(res.statusCode).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { app } = build([], false);
    const res = await app.inject({
      method: "PATCH",
      url: `/monitors/${MONITOR_ID}`,
      payload: { name: "Updated" },
    });
    expect(res.statusCode).toBe(401);
  });
});

describe("DELETE /monitors/:id", () => {
  it("returns deleted monitor and removes job scheduler", async () => {
    const { app, queue } = build([monitorRow]);
    const res = await app.inject({
      method: "DELETE",
      url: `/monitors/${MONITOR_ID}`,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().id).toBe(MONITOR_ID);
    expect(queue.removeJobScheduler).toHaveBeenCalledWith(MONITOR_ID);
  });

  it("returns 404 when not found", async () => {
    const { app } = build([]);
    const res = await app.inject({
      method: "DELETE",
      url: `/monitors/${MONITOR_ID}`,
    });
    expect(res.statusCode).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { app } = build([], false);
    const res = await app.inject({
      method: "DELETE",
      url: `/monitors/${MONITOR_ID}`,
    });
    expect(res.statusCode).toBe(401);
  });
});

describe("POST /monitors/:id/status/pause", () => {
  it("sets status to paused and removes job scheduler", async () => {
    const paused = { ...monitorRow, status: "paused" };
    const { app, queue } = build([paused]);
    const res = await app.inject({
      method: "POST",
      url: `/monitors/${MONITOR_ID}/status/pause`,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe("paused");
    expect(queue.removeJobScheduler).toHaveBeenCalledWith(MONITOR_ID);
  });

  it("returns 404 when not found", async () => {
    const { app } = build([]);
    const res = await app.inject({
      method: "POST",
      url: `/monitors/${MONITOR_ID}/status/pause`,
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /monitors/:id/status/resume", () => {
  it("sets status to active and reschedules job", async () => {
    const active = { ...monitorRow, status: "active" };
    const { app, queue } = build([active]);
    const res = await app.inject({
      method: "POST",
      url: `/monitors/${MONITOR_ID}/status/resume`,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe("active");
    expect(queue.upsertJobScheduler).toHaveBeenCalledWith(
      MONITOR_ID,
      { every: monitorRow.intervalMinutes * 60 * 1000 },
      { name: "poll-request", data: { monitorId: MONITOR_ID } },
    );
  });

  it("returns 404 when not found", async () => {
    const { app } = build([]);
    const res = await app.inject({
      method: "POST",
      url: `/monitors/${MONITOR_ID}/status/resume`,
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /monitors/:id/run", () => {
  it("enqueues a poll job when monitor is found", async () => {
    const { app, queue } = build([monitorRow]);
    const res = await app.inject({
      method: "POST",
      url: `/monitors/${MONITOR_ID}/run`,
    });
    expect(res.statusCode).toBe(200);
    expect(queue.add).toHaveBeenCalledWith("poll-request", { monitorId: MONITOR_ID });
  });

  it("returns 404 when not found", async () => {
    const { app } = build([]);
    const res = await app.inject({
      method: "POST",
      url: `/monitors/${MONITOR_ID}/run`,
    });
    expect(res.statusCode).toBe(404);
  });

  it("returns 400 for invalid UUID param", async () => {
    const { app } = build([]);
    const res = await app.inject({
      method: "POST",
      url: "/monitors/not-a-uuid/run",
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    const { app } = build([], false);
    const res = await app.inject({
      method: "POST",
      url: `/monitors/${MONITOR_ID}/run`,
    });
    expect(res.statusCode).toBe(401);
  });
});
