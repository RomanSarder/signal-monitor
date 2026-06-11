import { FastifyPluginAsync } from "fastify";
import { MeResponse, meResponseSchema } from "./auth.schema";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const meController: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Reply: MeResponse }>(
    "/me",
    {
      onRequest: [fastify.authenticate],
      schema: {
        response: {
          200: meResponseSchema,
        },
      },
    },
    async (request) => {
      const id = request.user.id;
      const [existingUser] = await fastify.db
        .select()
        .from(users)
        .where(eq(users.id, id));

      const { passwordHash, ...rest } = existingUser;
      return { ...rest, createdAt: rest.createdAt.toISOString() };
    },
  );
};

export default meController;
