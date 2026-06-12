import { Worker } from "bullmq";
import { Resend } from "resend";
import { db } from "../connection";
import { createDigestProcessor } from "./digest-processor";
import { registerWorkerListeners } from "../register-listeners";
import { logger } from "../../logger";

const log = logger.child({ worker: "digest-worker" });

const resend = new Resend(process.env.RESEND_API_KEY!);

const connection = {
  host: process.env.REDIS_HOST!,
  port: parseInt(process.env.REDIS_PORT!, 10),
};

const worker = new Worker(
  "digestQueue",
  createDigestProcessor({
    db,
    sendEmail: (params) => resend.emails.send(params),
  }),
  { connection },
);

registerWorkerListeners(worker, "digestQueue", log);
