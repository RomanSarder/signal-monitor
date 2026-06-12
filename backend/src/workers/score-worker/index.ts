import { Worker } from "bullmq";
import { createScoreProcessor } from "./score-processor";
import { classifyIntent } from "./classify-intent";
import { logger } from "../../logger";
import { db } from "../connection";

const log = logger.child({ worker: "score-worker" });

const connection = {
  host: process.env.REDIS_HOST!,
  port: parseInt(process.env.REDIS_PORT!, 10),
};

const worker = new Worker("scoreQueue", createScoreProcessor({ db, classifyIntent }), { connection });

worker.on("failed", (job, err) =>
  log.error({ jobId: job?.id, jobData: job?.data, err }, "job failed"),
);
worker.on("error", (err) => log.error({ err }, "worker error"));
worker.on("stalled", (jobId) => log.warn({ jobId }, "job stalled"));
