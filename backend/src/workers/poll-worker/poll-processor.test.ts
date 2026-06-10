import { describe, it, expect, vi } from "vitest";
import { createPollProcessor } from "./poll-processor";
import { mockDbMulti, mockJob } from "../../test-utils";

const MONITOR_ID = "00000000-0000-0000-0000-000000000001";
const JOB_RUN_ID = "00000000-0000-0000-0000-000000000002";
const RESULT_ID = "00000000-0000-0000-0000-000000000003";

const monitorRow = {
  id: MONITOR_ID,
  userId: "user-id",
  name: "Test Monitor",
  keywords: ["signal"],
  sources: ["hn"],
  intervalMinutes: 30,
  status: "active",
  lastRunAt: null,
  lastResultCount: 0,
  createdAt: new Date(),
};

const jobRunRow = {
  id: JOB_RUN_ID,
  monitorId: MONITOR_ID,
  jobType: "poll",
  status: "started",
  startedAt: new Date(),
  finishedAt: null,
};

const hitRow = {
  source_id: "hn-123",
  title: "Test post",
  snippet: "content",
  url: "https://example.com",
  author: "user",
  published_at: new Date(),
};



describe("createPollProcessor", () => {
  it("returns early when monitor is not found", async () => {
    const db = mockDbMulti([]);
    const hnAdapter = { fetchKeyword: vi.fn() };
    const scoreQueue = { add: vi.fn() };
    const redis = { eval: vi.fn() };

    await createPollProcessor({ db, redis, scoreQueue, hnAdapter })(mockJob({ monitorId: MONITOR_ID }));

    expect(hnAdapter.fetchKeyword).not.toHaveBeenCalled();
    expect(scoreQueue.add).not.toHaveBeenCalled();
  });

  it("returns early when monitor is paused", async () => {
    const db = mockDbMulti([{ ...monitorRow, status: "paused" }]);
    const hnAdapter = { fetchKeyword: vi.fn() };
    const scoreQueue = { add: vi.fn() };
    const redis = { eval: vi.fn() };

    await createPollProcessor({ db, redis, scoreQueue, hnAdapter })(mockJob({ monitorId: MONITOR_ID }));

    expect(hnAdapter.fetchKeyword).not.toHaveBeenCalled();
    expect(scoreQueue.add).not.toHaveBeenCalled();
  });

  it("inserts result and enqueues score job for a new hit", async () => {
    // DB calls: select monitor, insert jobRun, insert result, update monitors, update jobRuns, insert jobRunSources
    const db = mockDbMulti([monitorRow], [jobRunRow], [{ id: RESULT_ID }], [], [], []);
    const redis = { eval: vi.fn().mockResolvedValue(0) }; // 0 = not a duplicate
    const scoreQueue = { add: vi.fn().mockResolvedValue(undefined) };
    const hnAdapter = { fetchKeyword: vi.fn().mockResolvedValue([hitRow]) };

    await createPollProcessor({ db, redis, scoreQueue, hnAdapter })(mockJob({ monitorId: MONITOR_ID }));

    expect(hnAdapter.fetchKeyword).toHaveBeenCalledWith("signal", expect.any(Number));
    expect(scoreQueue.add).toHaveBeenCalledOnce();
    expect(scoreQueue.add).toHaveBeenCalledWith("score-request", { resultId: RESULT_ID });
  });

  it("skips insert and score job for a duplicate hit", async () => {
    // DB calls: select monitor, insert jobRun, update monitors, update jobRuns, insert jobRunSources
    const db = mockDbMulti([monitorRow], [jobRunRow], [], [], []);
    const redis = { eval: vi.fn().mockResolvedValue(1) }; // 1 = duplicate
    const scoreQueue = { add: vi.fn() };
    const hnAdapter = { fetchKeyword: vi.fn().mockResolvedValue([hitRow]) };

    await createPollProcessor({ db, redis, scoreQueue, hnAdapter })(mockJob({ monitorId: MONITOR_ID }));

    expect(scoreQueue.add).not.toHaveBeenCalled();
  });

  it("completes with errors when a keyword fetch fails", async () => {
    // DB calls: select monitor, insert jobRun, update monitors, update jobRuns, insert jobRunSources
    const db = mockDbMulti([monitorRow], [jobRunRow], [], [], []);
    const redis = { eval: vi.fn() };
    const scoreQueue = { add: vi.fn() };
    const hnAdapter = { fetchKeyword: vi.fn().mockRejectedValue(new Error("fetch failed")) };

    await expect(
      createPollProcessor({ db, redis, scoreQueue, hnAdapter })(mockJob({ monitorId: MONITOR_ID })),
    ).resolves.toBeUndefined();

    expect(scoreQueue.add).not.toHaveBeenCalled();
  });

  it("marks job run as failed when an outer db operation throws", async () => {
    // DB calls: select monitor, insert jobRun, update monitors (throws), update jobRuns (failed)
    const db = mockDbMulti([monitorRow], [jobRunRow], new Error("db error"), []);
    const redis = { eval: vi.fn() };
    const scoreQueue = { add: vi.fn() };
    const hnAdapter = { fetchKeyword: vi.fn().mockResolvedValue([]) };

    await expect(
      createPollProcessor({ db, redis, scoreQueue, hnAdapter })(mockJob({ monitorId: MONITOR_ID })),
    ).resolves.toBeUndefined();
  });
});
