import { Job } from "bullmq";
import { eq } from "drizzle-orm";
import { PollQueueJob } from "../../queues";
import { logger } from "../../logger";
import { monitors } from "../../db/schema";
import { results } from "../../db/schema/results";
import { jobRuns } from "../../db/schema/jobRuns";
import { jobRunSources } from "../../db/schema/jobRunSources";
import { SourceAdapter } from "../../source/adapter";
import { RateLimitError } from "../../source/errors";

const log = logger.child({ worker: "poll-worker" });

export interface PollProcessorDeps {
  db: any;
  redis: { set: (key: string, value: number, mode: "EX", duration: number, flag: "NX") => Promise<"OK" | null> };
  scoreQueue: {
    add: (name: string, data: { resultId: string }) => Promise<any>;
  };
  pollQueue: {
    add: (name: string, data: PollQueueJob, opts?: { delay: number }) => Promise<any>;
  };
  adapters: Record<string, SourceAdapter>;
}

export function createPollProcessor({
  db,
  redis,
  scoreQueue,
  pollQueue,
  adapters,
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

    const workItems: Array<{ source: string; keywords: string[] }> =
      data.remainingWork ??
      monitor.sources.map((source: string) => ({ source, keywords: monitor.keywords }));

    const rateLimitedWork: Array<{ source: string; keywords: string[]; retryAfterMs: number }> = [];
    let anyErrors = false;
    let totalHits = 0;

    try {
      for (const workItem of workItems) {
        const adapter = adapters[workItem.source];
        if (!adapter) {
          log.warn({ monitorId: monitor.id, source: workItem.source }, "no adapter registered, skipping source");
          continue;
        }

        let hasErrors = false;
        let hitsCount = 0;
        const failedKeywords: string[] = [];

        for (let i = 0; i < workItem.keywords.length; i++) {
          const keyword = workItem.keywords[i];
          try {
            const sinceTimestamp =
              Math.floor(Date.now() / 1000) - monitor.intervalMinutes * 60;
            const t = Date.now();
            const hits = await adapter.fetchKeyword(keyword, sinceTimestamp);
            const fetchDurationMs = Date.now() - t;

            let newCount = 0;
            let dedupCount = 0;
            hitsCount += hits.length;

            for (const hit of hits) {
              const dedupKey = `dedup:${monitor.id}:${workItem.source}:${hit.source_id}`;
              const dedup = await redis.set(dedupKey, 1, "EX", 30 * 24 * 60 * 60, "NX");

              if (dedup === null) {
                dedupCount++;
                continue;
              } else {
                const [inserted] = await db
                  .insert(results)
                  .values({
                    source: workItem.source,
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
              { monitorId: monitor.id, jobRunId: jobRun.id, source: workItem.source, keyword, hitCount: hits.length, newCount, dedupCount, fetchDurationMs },
              "keyword fetch complete",
            );
          } catch (e: any) {
            if (e instanceof RateLimitError) {
              const remaining = workItem.keywords.slice(i);
              rateLimitedWork.push({ source: workItem.source, keywords: remaining, retryAfterMs: e.retryAfterMs });
              log.warn(
                { monitorId: monitor.id, jobRunId: jobRun.id, source: workItem.source, keyword, remainingCount: remaining.length },
                "rate limit hit, will reschedule remaining keywords",
              );
              hasErrors = true;
              anyErrors = true;
              failedKeywords.push(...remaining);
              break;
            }
            hasErrors = true;
            anyErrors = true;
            failedKeywords.push(keyword);
            log.error(
              { monitorId: monitor.id, jobRunId: jobRun.id, source: workItem.source, keyword, err: e },
              "failed to fetch keyword",
            );
          }
        }

        totalHits += hitsCount;

        await db.insert(jobRunSources).values({
          jobRunId: jobRun.id,
          source: workItem.source,
          status: hasErrors ? "completed_with_errors" : "completed",
          resultFetched: hitsCount,
          failedKeywords,
          createdAt: new Date(),
        });
      }

      if (rateLimitedWork.length > 0) {
        const delay = Math.max(...rateLimitedWork.map((w) => w.retryAfterMs));
        await pollQueue.add(
          "poll-request",
          { monitorId: monitor.id, remainingWork: rateLimitedWork.map(({ source, keywords }) => ({ source, keywords })) },
          { delay },
        );
      }

      const finalStatus = anyErrors ? "completed_with_errors" : "completed";

      log.info(
        { monitorId: monitor.id, jobRunId: jobRun.id, status: finalStatus, totalHits },
        "poll job finished",
      );

      await db.update(monitors).set({
        lastRunAt: new Date(),
        lastResultCount: totalHits,
      });

      await db
        .update(jobRuns)
        .set({ status: finalStatus, finishedAt: new Date() })
        .where(eq(jobRuns.id, jobRun.id));

    } catch (e) {
      log.error(
        { monitorId: monitor.id, jobRunId: jobRun.id, err: e },
        "poll job failed",
      );
      await db
        .update(jobRuns)
        .set({ status: "failed", finishedAt: new Date() })
        .where(eq(jobRuns.id, jobRun.id));

      throw e;
    }
  };
}
