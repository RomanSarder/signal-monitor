import { Worker } from "bullmq";
import { createScoreProcessor } from "./score-processor";
import { classifyIntent } from "./classify-intent";
import { registerWorkerListeners } from "../register-listeners";
import { logger } from "../../logger";
import { db } from "../connection";

const log = logger.child({ worker: "score-worker" });

const connection = {
  host: process.env.REDIS_HOST!,
  port: parseInt(process.env.REDIS_PORT!, 10),
};

const worker = new Worker("scoreQueue", createScoreProcessor({ db, classifyIntent }), { connection });

registerWorkerListeners(worker, "scoreQueue", log);
