import { Worker } from "bullmq";
import { db, redisConnection } from "../connection";
import { createCleanupProcessor } from "./cleanup-processor";
import { registerWorkerListeners } from "../register-listeners";
import { logger } from "../../logger";

const log = logger.child({ worker: "cleanup-worker" });

const worker = new Worker(
  "cleanupQueue",
  createCleanupProcessor({ db }),
  { connection: redisConnection },
);

registerWorkerListeners(worker, "cleanupQueue", log);
