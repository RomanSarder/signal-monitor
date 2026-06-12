import { FastifyPluginAsync } from "fastify";

export const digest: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.register(
    async (fastify) => {
      fastify.post<{ Querystring: { force?: boolean } }>(
        "/send",
        {
          schema: {
            querystring: {
              type: "object",
              properties: {
                force: { type: "boolean" },
              },
            },
          },
        },
        async (request, reply) => {
          const { force } = request.query;
          const userId = request.user.id;
          await fastify.digestQueue.add("digest-request", { force, userId });
          return reply.code(202).send({ queued: true });
        },
      );
    },
    { prefix: "/digest" },
  );
};
