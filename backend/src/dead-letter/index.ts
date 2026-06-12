import { FastifyPluginAsync } from "fastify";
import { DLQJob } from "../queue";

export const deadLetter: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.register(
    async (fastify) => {
      fastify.get("/", async () => {
        const jobs = await fastify.deadLetterQueue.getJobs(["waiting", "delayed", "failed"]);
        return jobs.map((j) => ({
          id: j.id,
          data: j.data as DLQJob,
          enqueuedAt: new Date(j.timestamp).toISOString(),
        }));
      });

      fastify.post<{ Params: { id: string } }>("/:id/replay", async (request, reply) => {
        const job = await fastify.deadLetterQueue.getJob(request.params.id);
        if (!job) return reply.notFound();

        const { originalQueue, originalJobName, originalJobData } = job.data as DLQJob;
        const queueMap = {
          pollQueue: fastify.pollQueue,
          scoreQueue: fastify.scoreQueue,
          digestQueue: fastify.digestQueue,
        };

        await queueMap[originalQueue].add(originalJobName, originalJobData);
        await job.remove();
        return { replayed: true };
      });

      fastify.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
        const job = await fastify.deadLetterQueue.getJob(request.params.id);
        if (!job) return reply.notFound();
        await job.remove();
        return reply.code(204).send();
      });
    },
    { prefix: "/dead-letter" },
  );
};
