import { Job } from "bullmq";
import { eq } from "drizzle-orm";
import { PollQueueJob } from "../../queues";
import { logger } from "../../logger";
import { monitors } from "../../db/schema";
import { results } from "../../db/schema/results";
import { jobRuns } from "../../db/schema/jobRuns";
import { jobRunSources } from "../../db/schema/jobRunSources";
import { SourceAdapter } from "../../source/adapter";

const log = logger.child({ worker: "poll-worker" });

export interface PollProcessorDeps {
  db: any;
  redis: { set: (key: string, value: number, mode: "EX", duration: number, flag: "NX") => Promise<"OK" | null> };
  scoreQueue: {
    add: (name: string, data: { resultId: string }) => Promise<any>;
  };
  hnAdapter: SourceAdapter;
}

export function createPollProcessor({
  db,
  redis,
  scoreQueue,
  hnAdapter,
}: PollProcessorDeps) {
  return async (job: Job<PollQueueJob>) => {
    const data = job.data;

    const [monitor] = await db
      .select()
      .from(monitors)
      .where(eq(monitors.id, data.monitorId));

    if (!monitor || monitor.status === "paused") {
      log.info(
        { monitorId: data.monitorId },
        "monitor not found or paused, skipping",
      );
      return;
    }

    const [jobRun] = await db
      .insert(jobRuns)
      .values({
        monitorId: monitor.id,
        jobType: "poll" as const,
        status: "started",
        startedAt: new Date(),
      })
      .returning();

    log.info(
      { monitorId: monitor.id, jobRunId: jobRun.id },
      "poll job started",
    );

    try {
      for (const source of ["hn"]) {
        let hasErrors = false;
        let hitsCount = 0;
        const failedKeywords: string[] = [];

        for (const keyword of monitor.keywords) {
          try {
            const sinceTimestamp =
              Math.floor(Date.now() / 1000) - monitor.intervalMinutes * 60;
            const t = Date.now();
            const hits = await hnAdapter.fetchKeyword(keyword, sinceTimestamp);
            const fetchDurationMs = Date.now() - t;

            let newCount = 0;
            let dedupCount = 0;
            hitsCount += hits.length;

            for (const hit of hits) {
              const dedupKey = `dedup:${monitor.id}:${source}:${hit.source_id}`;
              const dedup = await redis.set(dedupKey, 1, "EX", 30 * 24 * 60 * 60, "NX");

              if (dedup === null) {
                dedupCount++;
                continue;
              } else {
                const [inserted] = await db
                  .insert(results)
                  .values({
                    source,
                    sourceId: hit.source_id,
                    monitorId: monitor.id,
                    url: hit.url,
                    title: hit.title,
                    snippet: hit.snippet,
                    author: hit.author,
                    publishedAt: hit.published_at,
                    matchedKeywords: [keyword],
                  })
                  .onConflictDoNothing()
                  .returning({ id: results.id });

                if (inserted) {
                  newCount++;
                  await scoreQueue.add("score-request", {
                    resultId: inserted.id,
                  });
                }
              }
            }

            log.info(
              { monitorId: monitor.id, jobRunId: jobRun.id, keyword, hitCount: hits.length, newCount, dedupCount, fetchDurationMs },
              "keyword fetch complete",
            );
          } catch (e: any) {
            hasErrors = true;
            failedKeywords.push(keyword);
            log.error(
              { monitorId: monitor.id, jobRunId: jobRun.id, keyword, err: e },
              "failed to fetch keyword",
            );
          }
        }

        await db.update(monitors).set({
          lastRunAt: new Date(),
          lastResultCount: hitsCount,
        });

        const finalStatus = hasErrors ? "completed_with_errors" : "completed";
        log.info(
          {
            monitorId: monitor.id,
            jobRunId: jobRun.id,
            status: finalStatus,
            hitsCount,
          },
          "poll job finished",
        );

        await db
          .update(jobRuns)
          .set({ status: finalStatus, finishedAt: new Date() })
          .where(eq(jobRuns.id, jobRun.id));

        await db.insert(jobRunSources).values({
          jobRunId: jobRun.id,
          source,
          status: hasErrors ? "completed_with_errors" : "completed",
          resultFetched: hitsCount,
          failedKeywords,
          createdAt: new Date(),
        });
      }
    } catch (e) {
      log.error(
        { monitorId: monitor.id, jobRunId: jobRun.id, err: e },
        "poll job failed",
      );
      await db
        .update(jobRuns)
        .set({ status: "failed", finishedAt: new Date() })
        .where(eq(jobRuns.id, jobRun.id));

      throw e
    }
  };
}
