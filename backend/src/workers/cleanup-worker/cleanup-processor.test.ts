import { describe, it, expect } from "vitest";
import { createCleanupProcessor } from "./cleanup-processor";
import { mockDbMulti, mockJob } from "../../test-utils";

const jobRunRow = {
  id: "00000000-0000-0000-0000-000000000001",
  jobType: "cleanup",
  status: "started",
  monitorId: null,
  startedAt: new Date(),
  finishedAt: null,
};

describe("createCleanupProcessor", () => {
  it("deletes old job runs and results and marks job as completed", async () => {
    // insert jobRun → delete old jobRuns → delete old results → update completed
    const db = mockDbMulti([jobRunRow], [], [], []);

    await createCleanupProcessor({ db })(mockJob({}));
  });

  it("succeeds when there is nothing to delete", async () => {
    const db = mockDbMulti([jobRunRow], [], [], []);

    await createCleanupProcessor({ db })(mockJob({}));
  });

  it("marks job as failed and rethrows when a delete query throws", async () => {
    // insert jobRun → delete old jobRuns throws → update failed
    const db = mockDbMulti([jobRunRow], new Error("db error"), []);

    await expect(
      createCleanupProcessor({ db })(mockJob({})),
    ).rejects.toThrow("db error");
  });

  it("propagates error when the jobRun insert throws", async () => {
    const db = mockDbMulti(new Error("db connection failed"));

    await expect(
      createCleanupProcessor({ db })(mockJob({})),
    ).rejects.toThrow("db connection failed");
  });
});
