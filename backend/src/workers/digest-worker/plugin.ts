import { FastifyPluginAsync } from "fastify";

const digestPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.digestQueue.upsertJobScheduler("digest-job-gen", {
    every: 60 * 60 * 1000,
  }, { name: "digest-request", data: { force: false } });
}

export default digestPlugin
