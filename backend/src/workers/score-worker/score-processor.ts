import { Job } from "bullmq";
import { eq } from "drizzle-orm";
import { ScoreQueueJob } from "../../queues";
import { results } from "../../db/schema";
import { jobRuns } from "../../db/schema/jobRuns";
import { logger } from "../../logger";
import { isRelevant } from "./classify-relevance";
import type { IntentClassification } from "./classify-intent";
import type { db as DbInstance } from "../connection";

type Db = typeof DbInstance;

const log = logger.child({ worker: "score-worker" });

export function createScoreProcessor({ db, classifyIntent }: {
  db: Db;
  classifyIntent: (params: {
    id: string;
    matchedKeywords: string[];
    title: string | null;
    snippet: string;
  }) => Promise<IntentClassification>;
}) {
  return async (job: Job<ScoreQueueJob>) => {
    const { resultId } = job.data;
    log.info({ resultId }, "score job started");

    const runResults = await db
      .select()
      .from(results)
      .where(eq(results.id, resultId));

    const monitorId = runResults[0]?.monitorId ?? null;
    const [jobRun] = await db
      .insert(jobRuns)
      .values({ jobType: "score", status: "started", monitorId, startedAt: new Date() })
      .returning();

    if (runResults.length === 0) {
      log.info({ resultId }, "result not found, skipping");
      await db.update(jobRuns).set({ status: "completed", finishedAt: new Date() }).where(eq(jobRuns.id, jobRun.id));
      return;
    }

    try {
      const noiseResults = [];
      const usefulResults = [];

      for (const result of runResults) {
        if (isRelevant(result.snippet, result.title, result.matchedKeywords)) {
          usefulResults.push(result);
        } else {
          noiseResults.push(result);
        }
      }

      log.info(
        {
          resultId,
          noiseCount: noiseResults.length,
          usefulCount: usefulResults.length,
        },
        "relevance filter complete",
      );

      await Promise.all(
        noiseResults.map((result) =>
          db
            .update(results)
            .set({ intentScore: 1, intentCategory: "noise" })
            .where(eq(results.id, result.id)),
        ),
      );

      await Promise.all(
        usefulResults.map(async (result) => {
          log.info({ resultId: result.id }, "sending to claude for intent classification");

          const t = Date.now();
          let classification;
          try {
            classification = await classifyIntent({
              id: result.id,
              matchedKeywords: result.matchedKeywords,
              title: result.title,
              snippet: result.snippet,
            });
          } catch (err) {
            log.error({ resultId: result.id, err }, "intent classification failed");
            throw err;
          }

          log.info(
            {
              resultId: result.id,
              score: classification.score,
              category: classification.category,
              durationMs: Date.now() - t,
            },
            "intent classification complete",
          );

          await db
            .update(results)
            .set({
              intentScore: classification.score,
              intentCategory: classification.category,
              intentReason: classification.reason,
              scoredAt: new Date(),
            })
            .where(eq(results.id, result.id));
        }),
      );

      await db.update(jobRuns).set({ status: "completed", finishedAt: new Date() }).where(eq(jobRuns.id, jobRun.id));
      log.info({ resultId }, "score job finished");
    } catch (err) {
      await db.update(jobRuns).set({ status: "failed", finishedAt: new Date() }).where(eq(jobRuns.id, jobRun.id));
      throw err;
    }
  };
}
