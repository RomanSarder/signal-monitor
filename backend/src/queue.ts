import { Queue } from "bullmq";
import fastifyPlugin from "fastify-plugin";
import { pollQueue, scoreQueue, digestQueue, deadLetterQueue } from "./queues";

export type { PollQueueJob, ScoreQueueJob, DLQJob } from "./queues";

declare module "fastify" {
  interface FastifyInstance {
    pollQueue: Queue;
    scoreQueue: Queue;
    digestQueue: Queue;
    deadLetterQueue: Queue;
  }
}

export default fastifyPlugin(async (fastify) => {
  fastify.decorate("pollQueue", pollQueue);
  fastify.decorate("scoreQueue", scoreQueue);
  fastify.decorate("digestQueue", digestQueue);
  fastify.decorate("deadLetterQueue", deadLetterQueue);
});
