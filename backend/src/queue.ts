import { Queue } from "bullmq";
import fastifyPlugin from "fastify-plugin";
import { pollQueue, scoreQueue, digestQueue } from "./queues";

export type { PollQueueJob, ScoreQueueJob } from "./queues";

declare module "fastify" {
  interface FastifyInstance {
    pollQueue: Queue;
    scoreQueue: Queue;
    digestQueue: Queue;
  }
}

export default fastifyPlugin(async (fastify) => {
  fastify.decorate("pollQueue", pollQueue);
  fastify.decorate("scoreQueue", scoreQueue);
  fastify.decorate("digestQueue", digestQueue);
});
