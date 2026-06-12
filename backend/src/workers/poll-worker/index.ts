import { Worker } from "bullmq";
import { hackerNewsSourceAdapter } from "../../source";
import { scoreQueue } from "../../queues";
import { registerWorkerListeners } from "../register-listeners";
import { createPollProcessor } from "./poll-processor";
import { logger } from "../../logger";
import { db, redis, redisConnection } from "../connection";

const log = logger.child({ worker: "poll-worker" });

const worker = new Worker(
  "pollQueue",
  createPollProcessor({
    db,
    redis,
    scoreQueue,
    hnAdapter: hackerNewsSourceAdapter,
  }),
  { connection: redisConnection },
);

registerWorkerListeners(worker, "pollQueue", log);
