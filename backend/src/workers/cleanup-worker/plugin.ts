import { FastifyPluginAsync } from "fastify";

const cleanupPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.cleanupQueue.upsertJobScheduler("cleanup-job-gen", {
    every: 24 * 60 * 60 * 1000,
  }, { name: "cleanup-request", data: {} });
};

export default cleanupPlugin;
