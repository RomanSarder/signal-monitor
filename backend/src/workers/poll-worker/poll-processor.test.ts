import { describe, it, expect, vi } from "vitest";
import { createPollProcessor } from "./poll-processor";
import { RateLimitError } from "../../source/errors";
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

const makeDeps = (overrides: any = {}) => ({
  redis: { set: vi.fn() },
  scoreQueue: { add: vi.fn() },
  pollQueue: { add: vi.fn().mockResolvedValue(undefined) },
  ...overrides,
});

describe("createPollProcessor", () => {
  it("returns early when monitor is not found", async () => {
    const db = mockDbMulti([]);
    const hnAdapter = { fetchKeyword: vi.fn() };
    const deps = makeDeps({ db, adapters: { hn: hnAdapter } });

    await createPollProcessor(deps)(mockJob({ monitorId: MONITOR_ID }));

    expect(hnAdapter.fetchKeyword).not.toHaveBeenCalled();
    expect(deps.scoreQueue.add).not.toHaveBeenCalled();
  });

  it("returns early when monitor is paused", async () => {
    const db = mockDbMulti([{ ...monitorRow, status: "paused" }]);
    const hnAdapter = { fetchKeyword: vi.fn() };
    const deps = makeDeps({ db, adapters: { hn: hnAdapter } });

    await createPollProcessor(deps)(mockJob({ monitorId: MONITOR_ID }));

    expect(hnAdapter.fetchKeyword).not.toHaveBeenCalled();
    expect(deps.scoreQueue.add).not.toHaveBeenCalled();
  });

  it("inserts result and enqueues score job for a new hit", async () => {
    // DB calls: select monitor, insert jobRun, insert result, insert jobRunSources, update monitors, update jobRuns
    const db = mockDbMulti([monitorRow], [jobRunRow], [{ id: RESULT_ID }], [], [], []);
    const hnAdapter = { fetchKeyword: vi.fn().mockResolvedValue([hitRow]) };
    const deps = makeDeps({ db, redis: { set: vi.fn().mockResolvedValue("OK") }, adapters: { hn: hnAdapter } });

    await createPollProcessor(deps)(mockJob({ monitorId: MONITOR_ID }));

    expect(hnAdapter.fetchKeyword).toHaveBeenCalledWith("signal", expect.any(Number));
    expect(deps.redis.set).toHaveBeenCalledWith(
      `dedup:${MONITOR_ID}:hn:${hitRow.source_id}`,
      1,
      "EX",
      30 * 24 * 60 * 60,
      "NX",
    );
    expect(deps.scoreQueue.add).toHaveBeenCalledOnce();
    expect(deps.scoreQueue.add).toHaveBeenCalledWith("score-request", { resultId: RESULT_ID });
  });

  it("skips insert and score job for a redis-duplicate hit", async () => {
    // DB calls: select monitor, insert jobRun, insert jobRunSources, update monitors, update jobRuns
    const db = mockDbMulti([monitorRow], [jobRunRow], [], [], []);
    const hnAdapter = { fetchKeyword: vi.fn().mockResolvedValue([hitRow]) };
    const deps = makeDeps({ db, redis: { set: vi.fn().mockResolvedValue(null) }, adapters: { hn: hnAdapter } });

    await createPollProcessor(deps)(mockJob({ monitorId: MONITOR_ID }));

    expect(deps.scoreQueue.add).not.toHaveBeenCalled();
  });

  it("skips score job when result already exists in db", async () => {
    // DB calls: select monitor, insert jobRun, insert result (conflict → empty), insert jobRunSources, update monitors, update jobRuns
    const db = mockDbMulti([monitorRow], [jobRunRow], [], [], [], []);
    const hnAdapter = { fetchKeyword: vi.fn().mockResolvedValue([hitRow]) };
    const deps = makeDeps({ db, redis: { set: vi.fn().mockResolvedValue("OK") }, adapters: { hn: hnAdapter } });

    await createPollProcessor(deps)(mockJob({ monitorId: MONITOR_ID }));

    expect(deps.scoreQueue.add).not.toHaveBeenCalled();
  });

  it("completes with errors when a keyword fetch fails with a non-rate-limit error", async () => {
    // DB calls: select monitor, insert jobRun, insert jobRunSources, update monitors, update jobRuns
    const db = mockDbMulti([monitorRow], [jobRunRow], [], [], []);
    const hnAdapter = { fetchKeyword: vi.fn().mockRejectedValue(new Error("fetch failed")) };
    const deps = makeDeps({ db, adapters: { hn: hnAdapter } });

    await expect(
      createPollProcessor(deps)(mockJob({ monitorId: MONITOR_ID })),
    ).resolves.toBeUndefined();

    expect(deps.scoreQueue.add).not.toHaveBeenCalled();
    expect(deps.pollQueue.add).not.toHaveBeenCalled();
  });

  it("marks job run as failed when an outer db operation throws", async () => {
    // DB calls: select monitor, insert jobRun, insert jobRunSources (throws), update jobRuns (failed)
    const db = mockDbMulti([monitorRow], [jobRunRow], new Error("db error"), []);
    const hnAdapter = { fetchKeyword: vi.fn().mockResolvedValue([]) };
    const deps = makeDeps({ db, adapters: { hn: hnAdapter } });

    await expect(
      createPollProcessor(deps)(mockJob({ monitorId: MONITOR_ID })),
    ).rejects.toThrow("db error");
  });

  it("skips unknown source and completes without error", async () => {
    // DB calls: select monitor, insert jobRun, update monitors, update jobRuns
    const db = mockDbMulti([{ ...monitorRow, sources: ["unknown"] }], [jobRunRow], [], []);
    const hnAdapter = { fetchKeyword: vi.fn() };
    const deps = makeDeps({ db, adapters: { hn: hnAdapter } });

    await createPollProcessor(deps)(mockJob({ monitorId: MONITOR_ID }));

    expect(hnAdapter.fetchKeyword).not.toHaveBeenCalled();
  });
});

describe("createPollProcessor — rate limit handling", () => {
  const multiKeywordMonitor = { ...monitorRow, keywords: ["signal", "monitor", "hacker"] };

  it("schedules follow-up job with remaining keywords when rate limited on a middle keyword", async () => {
    const db = mockDbMulti([multiKeywordMonitor], [jobRunRow], [], [], []);
    const hnAdapter = {
      fetchKeyword: vi.fn()
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new RateLimitError(60 * 60 * 1000)),
    };
    const deps = makeDeps({ db, adapters: { hn: hnAdapter } });

    await createPollProcessor(deps)(mockJob({ monitorId: MONITOR_ID }));

    expect(hnAdapter.fetchKeyword).toHaveBeenCalledTimes(2);
    expect(deps.pollQueue.add).toHaveBeenCalledWith(
      "poll-request",
      { monitorId: MONITOR_ID, remainingWork: [{ source: "hn", keywords: ["monitor", "hacker"] }] },
      { delay: 60 * 60 * 1000 },
    );
  });

  it("schedules follow-up with all keywords when rate limited on the first keyword", async () => {
    const db = mockDbMulti([multiKeywordMonitor], [jobRunRow], [], [], []);
    const hnAdapter = { fetchKeyword: vi.fn().mockRejectedValue(new RateLimitError(60 * 60 * 1000)) };
    const deps = makeDeps({ db, adapters: { hn: hnAdapter } });

    await createPollProcessor(deps)(mockJob({ monitorId: MONITOR_ID }));

    expect(hnAdapter.fetchKeyword).toHaveBeenCalledTimes(1);
    expect(deps.pollQueue.add).toHaveBeenCalledWith(
      "poll-request",
      { monitorId: MONITOR_ID, remainingWork: [{ source: "hn", keywords: ["signal", "monitor", "hacker"] }] },
      { delay: 60 * 60 * 1000 },
    );
  });

  it("uses Retry-After delay from RateLimitError when header is provided", async () => {
    const db = mockDbMulti([monitorRow], [jobRunRow], [], [], []);
    const hnAdapter = { fetchKeyword: vi.fn().mockRejectedValue(new RateLimitError(30 * 60 * 1000)) };
    const deps = makeDeps({ db, adapters: { hn: hnAdapter } });

    await createPollProcessor(deps)(mockJob({ monitorId: MONITOR_ID }));

    expect(deps.pollQueue.add).toHaveBeenCalledWith(
      "poll-request",
      expect.anything(),
      { delay: 30 * 60 * 1000 },
    );
  });

  it("only processes specified source/keyword pairs when remainingWork is present", async () => {
    const db = mockDbMulti([monitorRow], [jobRunRow], [], [], []);
    const hnAdapter = { fetchKeyword: vi.fn().mockResolvedValue([]) };
    const deps = makeDeps({ db, adapters: { hn: hnAdapter } });

    await createPollProcessor(deps)(
      mockJob({ monitorId: MONITOR_ID, remainingWork: [{ source: "hn", keywords: ["subset"] }] }),
    );

    expect(hnAdapter.fetchKeyword).toHaveBeenCalledWith("subset", expect.any(Number));
    expect(hnAdapter.fetchKeyword).toHaveBeenCalledTimes(1);
    expect(deps.pollQueue.add).not.toHaveBeenCalled();
  });

  it("does not schedule follow-up when no rate limits are hit", async () => {
    const db = mockDbMulti([monitorRow], [jobRunRow], [], [], []);
    const hnAdapter = { fetchKeyword: vi.fn().mockResolvedValue([]) };
    const deps = makeDeps({ db, adapters: { hn: hnAdapter } });

    await createPollProcessor(deps)(mockJob({ monitorId: MONITOR_ID }));

    expect(deps.pollQueue.add).not.toHaveBeenCalled();
  });
});
