import { Worker } from "bullmq";
import { createScoreProcessor } from "./score-processor";
import { classifyIntent } from "./classify-intent";
import { registerWorkerListeners } from "../register-listeners";
import { logger } from "../../logger";
import { db, redisConnection } from "../connection";

const log = logger.child({ worker: "score-worker" });

const worker = new Worker("scoreQueue", createScoreProcessor({ db, classifyIntent }), { connection: redisConnection });

registerWorkerListeners(worker, "scoreQueue", log);
