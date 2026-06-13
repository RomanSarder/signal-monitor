import { Worker } from "bullmq";
import { adapters } from "../../source";
import { scoreQueue, pollQueue } from "../../queues";
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
    pollQueue,
    adapters,
  }),
  { connection: redisConnection },
);

registerWorkerListeners(worker, "pollQueue", log);
