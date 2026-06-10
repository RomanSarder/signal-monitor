import "dotenv/config";
import { ConnectionOptions, Queue } from "bullmq";

export interface PollQueueJob {
  monitorId: string;
}

export interface ScoreQueueJob {
  resultId: string;
}

const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST!,
  port: parseInt(process.env.REDIS_URL!, 10) || 6379,
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
>("pollQueue", { connection });
export const scoreQueue = new Queue<
  ScoreQueueJob,
  void,
  string,
  ScoreQueueJob,
  void,
  string
>("scoreQueue", { connection });
export const digestQueue = new Queue("digestQueue", { connection });
