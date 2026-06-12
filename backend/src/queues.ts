import "dotenv/config";
import { ConnectionOptions, Queue } from "bullmq";

export interface PollQueueJob {
  monitorId: string;
}

export interface ScoreQueueJob {
  resultId: string;
}

export interface DigestJob {
  userId?: string;
  force?: boolean;
}

export interface DLQJob {
  originalQueue: "pollQueue" | "scoreQueue" | "digestQueue";
  originalJobName: string;
  originalJobData: PollQueueJob | ScoreQueueJob | DigestJob;
  failedReason: string;
  stackTrace?: string;
  failedAt: string;
  attemptsMade: number;
}

const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST!,
  port: parseInt(process.env.REDIS_PORT!, 10) || 6379,
};

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: "exponential" as const, delay: 1000 },
};

// Provide all 6 type params so NameType resolves to a concrete `string` rather
// than staying as the deferred conditional ExtractNameType<...>.
export const pollQueue = new Queue<
  PollQueueJob,
  void,
  string,
  PollQueueJob,
  void,
  string
>("pollQueue", { connection, defaultJobOptions });
export const scoreQueue = new Queue<
  ScoreQueueJob,
  void,
  string,
  ScoreQueueJob,
  void,
  string
>("scoreQueue", { connection, defaultJobOptions });
export const digestQueue = new Queue<
  DigestJob,
  void,
  string,
  DigestJob,
  void,
  string
>("digestQueue", { connection, defaultJobOptions });
export const deadLetterQueue = new Queue<DLQJob>("deadLetterQueue", { connection });
