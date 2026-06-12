import { Worker } from "bullmq";
import { createScoreProcessor } from "./score-processor";
import { classifyIntent } from "./classify-intent";
import { registerWorkerListeners } from "../register-listeners";
import { logger } from "../../logger";
import { db } from "../connection";

const log = logger.child({ worker: "score-worker" });

const { hostname, port } = new URL(process.env.REDIS_URL!);
const connection = { host: hostname, port: parseInt(port) };

const worker = new Worker("scoreQueue", createScoreProcessor({ db, classifyIntent }), { connection });

registerWorkerListeners(worker, "scoreQueue", log);
