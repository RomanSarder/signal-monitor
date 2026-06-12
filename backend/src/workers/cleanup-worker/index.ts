import { Worker } from "bullmq";
import { db } from "../connection";
import { createCleanupProcessor } from "./cleanup-processor";
import { registerWorkerListeners } from "../register-listeners";
import { logger } from "../../logger";

const log = logger.child({ worker: "cleanup-worker" });

const { hostname, port } = new URL(process.env.REDIS_URL!);
const connection = { host: hostname, port: parseInt(port) };

const worker = new Worker(
  "cleanupQueue",
  createCleanupProcessor({ db }),
  { connection },
);

registerWorkerListeners(worker, "cleanupQueue", log);
