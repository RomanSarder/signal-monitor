import { Worker } from "bullmq";
import { createScoreProcessor } from "./score-processor";
import { classifyIntent } from "./classify-intent";
import { db } from "../connection";

new Worker("scoreQueue", createScoreProcessor({ db, classifyIntent }), {
  connection: {
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!, 10),
  },
});
