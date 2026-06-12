import { Worker } from "bullmq";
import { Resend } from "resend";
import { db, redisConnection } from "../connection";
import { createDigestProcessor } from "./digest-processor";
import { registerWorkerListeners } from "../register-listeners";
import { logger } from "../../logger";

const log = logger.child({ worker: "digest-worker" });

const resend = new Resend(process.env.RESEND_API_KEY!);

const worker = new Worker(
  "digestQueue",
  createDigestProcessor({
    db,
    sendEmail: (params) => resend.emails.send(params),
  }),
  { connection: redisConnection },
);

registerWorkerListeners(worker, "digestQueue", log);
