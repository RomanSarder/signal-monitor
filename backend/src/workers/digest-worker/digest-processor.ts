import { Job } from "bullmq";
import { and, desc, eq, gte, isNotNull, isNull, sql } from "drizzle-orm";
import { DigestJob } from "../../queues";
import { digestLogs, monitors, results, users } from "../../db/schema";
import { jobRuns } from "../../db/schema/jobRuns";
import { logger } from "../../logger";
import { generateDigestEmail, DigestResult } from "./email";

const log = logger.child({ worker: "digest-worker" });

export interface DigestProcessorDeps {
  db: any;
  sendEmail: (params: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }) => Promise<{ error: { message: string } | null }>;
}

export function createDigestProcessor({ db, sendEmail }: DigestProcessorDeps) {
  return async (job: Job<DigestJob>) => {
    const dueUsersWithLogs = await db
      .select()
      .from(users)
      .leftJoin(digestLogs, and(eq(users.id, digestLogs.userId), sql`${digestLogs.sentAt}::date = current_date`))
      .where(and(
        job.data.userId ? eq(users.id, job.data.userId) : undefined,
        job.data.force ? undefined : isNull(digestLogs.id),
      ));
    const dueUsers = dueUsersWithLogs.map((record: any) => record.users);

    const [jobRun] = await db
      .insert(jobRuns)
      .values({ jobType: "digest", status: "started", monitorId: null, startedAt: new Date() })
      .returning();

    log.info({ dueUserCount: dueUsers.length, targetUserId: job.data.userId }, "digest job started");

    let sentCount = 0;
    let skippedCount = 0;

    try {
      for (const dueUser of dueUsers) {
        const relevantResults = await db.select().from(users)
          .innerJoin(monitors, eq(monitors.userId, users.id))
          .innerJoin(results, eq(results.monitorId, monitors.id))
          .where(and(
            eq(users.id, dueUser.id),
            eq(results.isRead, false),
            isNotNull(results.intentScore),
            gte(results.intentScore, 6),
          ))
          .orderBy(desc(results.intentScore))
          .limit(10);

        const digestResults: DigestResult[] = relevantResults.map((r: any) => ({
          title: r.results.title,
          snippet: r.results.snippet,
          url: r.results.url,
          intentScore: r.results.intentScore!,
          intentCategory: r.results.intentCategory as DigestResult["intentCategory"],
          intentReason: r.results.intentReason,
          author: r.results.author,
          publishedAt: r.results.publishedAt,
        }));

        if (digestResults.length === 0) {
          log.info({ userId: dueUser.id }, "no results for user, skipping");
          await db.insert(digestLogs).values({ userId: dueUser.id, sentAt: new Date(), resultCount: 0 });
          skippedCount++;
          continue;
        }

        const count = digestResults.length;
        const html = generateDigestEmail(digestResults, dueUser.email);

        log.info({ userId: dueUser.id, resultCount: count }, "sending digest email");
        const t = Date.now();
        const { error } = await sendEmail({
          from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
          to: dueUser.email,
          subject: `Your Signal Monitor Digest — ${count} signal${count !== 1 ? "s" : ""}`,
          html,
        });

        if (error) {
          log.error({ userId: dueUser.id, err: error }, "email send failed");
          throw new Error(`Resend error: ${error.message}`);
        }

        log.info({ userId: dueUser.id, resultCount: count, durationMs: Date.now() - t }, "digest email sent");
        await db.insert(digestLogs).values({ userId: dueUser.id, sentAt: new Date(), resultCount: count });
        sentCount++;
      }

      await db.update(jobRuns).set({ status: "completed", finishedAt: new Date() }).where(eq(jobRuns.id, jobRun.id));
      log.info({ sentCount, skippedCount }, "digest job finished");
    } catch (e) {
      await db.update(jobRuns).set({ status: "failed", finishedAt: new Date() }).where(eq(jobRuns.id, jobRun.id));
      throw e;
    }
  };
}
