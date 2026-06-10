import { Job } from "bullmq";
import { eq } from "drizzle-orm";
import { PollQueueJob } from "../queues";
import { logger } from "../logger";
import { monitors } from "../db/schema";
import { results } from "../db/schema/results";
import { jobRuns } from "../db/schema/jobRuns";
import { jobRunSources } from "../db/schema/jobRunSources";
import { SourceAdapter } from "../source/adapter";

const log = logger.child({ worker: "poll-worker" });

export interface PollProcessorDeps {
  db: any;
  redis: { eval: (...args: any[]) => Promise<unknown> };
  scoreQueue: { add: (name: string, data: { resultId: string }) => Promise<any> };
  hnAdapter: SourceAdapter;
}

export function createPollProcessor({ db, redis, scoreQueue, hnAdapter }: PollProcessorDeps) {
  return async (job: Job<PollQueueJob>) => {
    const data = job.data;

    const [monitor] = await db
      .select()
      .from(monitors)
      .where(eq(monitors.id, data.monitorId));

    if (!monitor || monitor.status === "paused") {
      log.info({ monitorId: data.monitorId }, "monitor not found or paused, skipping");
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

    log.info({ monitorId: monitor.id, jobRunId: jobRun.id }, "poll job started");

    try {
      for (const source of ["hn"]) {
        let hasErrors = false;
        let hitsCount = 0;
        const failedKeywords: string[] = [];

        log.info({ monitorId: monitor.id, keywords: monitor.keywords }, "starting keyword fetch");

        for (const keyword of monitor.keywords) {
          try {
            const sinceTimestamp =
              Math.floor(Date.now() / 1000) - monitor.intervalMinutes * 60;
            const hits = await hnAdapter.fetchKeyword(keyword, sinceTimestamp);

            log.info({ hits }, "hits");
            hitsCount += hits.length;
            for (const hit of hits) {
              const dedupKey = `dedup:${monitor.id}:hn`;
              const dedup = (await redis.eval(
                `local seen = redis.call('SISMEMBER', KEYS[1], ARGV[1])
            if seen == 1 then
              return 1
            end
            redis.call('SADD', KEYS[1], ARGV[1])
            redis.call('EXPIRE', KEYS[1], ARGV[2])
            return 0`,
                1,
                dedupKey,
                hit.source_id,
                30 * 24 * 60 * 60,
              )) as 0 | 1;

              log.info({ dedup }, "Dedup result");

              if (dedup === 1) {
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
                  .returning({ id: results.id });

                await scoreQueue.add("score-request", { resultId: inserted.id });
              }
            }
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
          { monitorId: monitor.id, jobRunId: jobRun.id, status: finalStatus, hitsCount },
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
    }
  };
}
