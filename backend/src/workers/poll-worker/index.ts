import { Worker } from "bullmq";
import { hackerNewsSourceAdapter } from "../../source";
import { scoreQueue } from "../../queues";
import { registerWorkerListeners } from "../register-listeners";
import { createPollProcessor } from "./poll-processor";
import { logger } from "../../logger";
import { db, redis } from "../connection";

const log = logger.child({ worker: "poll-worker" });

const { hostname, port } = new URL(process.env.REDIS_URL!);
const connection = { host: hostname, port: parseInt(port) };

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
