import { describe, it, expect } from "vitest";
import { buildApp, mockDb } from "../test-utils";
import { jobRun } from "./index";

const MONITOR_ID = "00000000-0000-0000-0000-000000000001";
const JOB_RUN_ID = "00000000-0000-0000-0000-000000000002";

const jobRunRow = {
  id: JOB_RUN_ID,
  monitorId: MONITOR_ID,
  jobType: "poll",
  status: "completed",
  startedAt: new Date().toISOString(),
  finishedAt: new Date().toISOString(),
};

function build(db: any, authenticated = true) {
  const app = buildApp(db, { authenticated });
  app.register(jobRun);
  return app;
}

describe("GET /job-runs", () => {
  it("returns job runs for a monitor when authenticated", async () => {
    const app = build(mockDb([jobRunRow]));
    const res = await app.inject({
      method: "GET",
      url: `/job-runs?monitorId=${MONITOR_ID}`,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(1);
    expect(res.json()[0].id).toBe(JOB_RUN_ID);
    expect(res.json()[0].jobType).toBe("poll");
    expect(res.json()[0].status).toBe("completed");
  });

  it("returns 400 when monitorId is missing", async () => {
    const app = build(mockDb([]));
    const res = await app.inject({ method: "GET", url: "/job-runs" });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when monitorId is not a valid UUID", async () => {
    const app = build(mockDb([]));
    const res = await app.inject({
      method: "GET",
      url: "/job-runs?monitorId=not-a-uuid",
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    const app = build(mockDb([]), false);
    const res = await app.inject({
      method: "GET",
      url: `/job-runs?monitorId=${MONITOR_ID}`,
    });
    expect(res.statusCode).toBe(401);
  });
});
