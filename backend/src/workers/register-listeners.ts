import { Worker } from "bullmq";
import type { Logger } from "pino";
import { deadLetterQueue, DLQJob } from "../queues";

export function registerWorkerListeners(
  worker: Worker,
  queueName: DLQJob["originalQueue"],
  log: Logger,
): void {
  worker.on("failed", (job, err) => {
    log.error({ jobId: job?.id, jobData: job?.data, err }, "job failed");

    if (!job) return;
    const isTerminal = job.attemptsMade >= (job.opts.attempts ?? 1);
    if (!isTerminal) return;

    deadLetterQueue.add("dlq-entry", {
      originalQueue: queueName,
      originalJobName: job.name,
      originalJobData: job.data,
      failedReason: err.message,
      stackTrace: err.stack,
      failedAt: new Date().toISOString(),
      attemptsMade: job.attemptsMade,
    }).catch((e) => log.error({ err: e }, "failed to write to DLQ"));
  });

  worker.on("error", (err) => log.error({ err }, "worker error"));
  worker.on("stalled", (jobId) => log.warn({ jobId }, "job stalled"));
}
