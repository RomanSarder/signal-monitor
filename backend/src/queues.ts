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

export interface CleanupJob {}

export interface DLQJob {
  originalQueue: "pollQueue" | "scoreQueue" | "digestQueue" | "cleanupQueue";
  originalJobName: string;
  originalJobData: PollQueueJob | ScoreQueueJob | DigestJob;
  failedReason: string;
  stackTrace?: string;
  failedAt: string;
  attemptsMade: number;
}

const { hostname, port } = new URL(process.env.REDIS_URL!);
const connection: ConnectionOptions = { host: hostname, port: parseInt(port) };

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
export const cleanupQueue = new Queue<
  CleanupJob,
  void,
  string,
  CleanupJob,
  void,
  string
>("cleanupQueue", { connection, defaultJobOptions });
export const deadLetterQueue = new Queue<DLQJob>("deadLetterQueue", { connection });
