import { Worker } from "bullmq";
import { hackerNewsSourceAdapter } from "../../source";
import { scoreQueue } from "../../queues";
import { registerWorkerListeners } from "../register-listeners";
import { createPollProcessor } from "./poll-processor";
import { logger } from "../../logger";
import { db, redis } from "../connection";

const log = logger.child({ worker: "poll-worker" });

const connection = {
  host: process.env.REDIS_HOST!,
  port: parseInt(process.env.REDIS_PORT!, 10),
};

const worker = new Worker(
  "pollQueue",
  createPollProcessor({
    db,
    redis,
    scoreQueue,
    hnAdapter: hackerNewsSourceAdapter,
  }),
  { connection },
);

registerWorkerListeners(worker, "pollQueue", log);
