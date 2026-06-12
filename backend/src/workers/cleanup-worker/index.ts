import { Worker } from "bullmq";
import { db } from "../connection";
import { createCleanupProcessor } from "./cleanup-processor";
import { registerWorkerListeners } from "../register-listeners";
import { logger } from "../../logger";

const log = logger.child({ worker: "cleanup-worker" });

const connection = {
  host: process.env.REDIS_HOST!,
  port: parseInt(process.env.REDIS_PORT!, 10),
};

const worker = new Worker(
  "cleanupQueue",
  createCleanupProcessor({ db }),
  { connection },
);

registerWorkerListeners(worker, "cleanupQueue", log);
