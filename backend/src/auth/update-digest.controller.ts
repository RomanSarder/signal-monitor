import { FastifyPluginAsync } from "fastify";
import { UpdateDigestBody, updateDigestBodySchema } from "./auth.schema";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const updateDigestController: FastifyPluginAsync = async (fastify) => {
  fastify.patch<{ Body: UpdateDigestBody }>(
    "/digest",
    {
      onRequest: [fastify.authenticate],
      schema: { body: updateDigestBodySchema },
    },
    async (request, reply) => {
      await fastify.db
        .update(users)
        .set({ digestMinutes: request.body.digestMinutes })
        .where(eq(users.id, request.user.id));

      return reply.status(204).send();
    },
  );
};

export default updateDigestController;
