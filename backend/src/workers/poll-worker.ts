import { Worker } from "bullmq";
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import Redis from "ioredis";
import { hackerNewsSourceAdapter } from "../source";
import { scoreQueue } from "../queues";
import { createPollProcessor } from "./poll-processor";

const db = drizzle({
  connection: {
    url: process.env.DATABASE_URL!,
  },
});
const redis = new Redis(process.env.REDIS_URL!);

new Worker(
  "pollQueue",
  createPollProcessor({ db, redis, scoreQueue, hnAdapter: hackerNewsSourceAdapter }),
  {
    connection: {
      host: process.env.REDIS_HOST!,
      port: parseInt(process.env.REDIS_PORT!, 10),
    },
  },
);
