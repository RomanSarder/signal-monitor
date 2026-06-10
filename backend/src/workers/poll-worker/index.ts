import { Worker } from "bullmq";
import { hackerNewsSourceAdapter } from "../../source";
import { scoreQueue } from "../../queues";
import { createPollProcessor } from "./poll-processor";

import { db, redis } from "../connection";

new Worker(
  "pollQueue",
  createPollProcessor({
    db,
    redis,
    scoreQueue,
    hnAdapter: hackerNewsSourceAdapter,
  }),
  {
    connection: {
      host: process.env.REDIS_HOST!,
      port: parseInt(process.env.REDIS_PORT!, 10),
    },
  },
);
