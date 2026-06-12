import { Worker } from "bullmq";
import { Resend } from "resend";
import { db } from "../connection";
import { createDigestProcessor } from "./digest-processor";
import { logger } from "../../logger";

const log = logger.child({ worker: "digest-worker" });

const resend = new Resend(process.env.RESEND_API_KEY!);

const connection = {
  host: process.env.REDIS_HOST!,
  port: parseInt(process.env.REDIS_PORT!, 10),
};

const worker = new Worker(
  "digestQueue",
  createDigestProcessor({
    db,
    sendEmail: (params) => resend.emails.send(params),
  }),
  { connection },
);

worker.on("failed", (job, err) =>
  log.error({ jobId: job?.id, jobData: job?.data, err }, "job failed"),
);
worker.on("error", (err) => log.error({ err }, "worker error"));
worker.on("stalled", (jobId) => log.warn({ jobId }, "job stalled"));
