import { Job } from "bullmq";
import { eq, lt } from "drizzle-orm";
import { CleanupJob } from "../../queues";
import { results } from "../../db/schema";
import { jobRuns } from "../../db/schema/jobRuns";
import { logger } from "../../logger";

const log = logger.child({ worker: "cleanup-worker" });

export interface CleanupProcessorDeps {
  db: any;
}

export function createCleanupProcessor({ db }: CleanupProcessorDeps) {
  return async (_job: Job<CleanupJob>) => {
    const [jobRun] = await db
      .insert(jobRuns)
      .values({ jobType: "cleanup", status: "started", monitorId: null, startedAt: new Date() })
      .returning();

    log.info("cleanup job started");

    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      await db.delete(jobRuns).where(lt(jobRuns.startedAt, oneWeekAgo));
      log.info({ cutoff: oneWeekAgo }, "old job runs deleted");

      const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      await db.delete(results).where(lt(results.createdAt, threeMonthsAgo));
      log.info({ cutoff: threeMonthsAgo }, "old results deleted");

      await db.update(jobRuns).set({ status: "completed", finishedAt: new Date() }).where(eq(jobRuns.id, jobRun.id));
      log.info("cleanup job finished");
    } catch (e) {
      await db.update(jobRuns).set({ status: "failed", finishedAt: new Date() }).where(eq(jobRuns.id, jobRun.id));
      throw e;
    }
  };
}
