import { ConnectionOptions, Queue } from "bullmq";
import IORedis from "ioredis";
import fastifyPlugin from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    pollQueue: Queue;
    scoreQueue: Queue;
    digestQueue: Queue;
  }
}

export default fastifyPlugin(async (fastify) => {
  const connection = new IORedis({
    host: fastify.config.REDIS_HOST,
    port: parseInt(fastify.config.REDIS_PORT, 10),
  }) as unknown as ConnectionOptions;

  fastify.decorate(
    "pollQueue",
    new Queue("pollQueue", {
      connection,
    }),
  );

  fastify.decorate(
    "scoreQueue",
    new Queue("scoreQueue", {
      connection,
    }),
  );

  fastify.decorate(
    "digestQueue",
    new Queue("digestQueue", {
      connection,
    }),
  );
});
