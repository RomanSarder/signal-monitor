import { FastifyPluginAsync } from "fastify";
import { AuthBody, authBodySchema } from "./auth.schema";
import { users } from "../db/schema";
import bcrypt from "bcrypt";

const signUpController: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: AuthBody }>(
    "/sign-up",
    {
      schema: {
        body: authBodySchema,
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const [user] = await fastify.db
        .insert(users)
        .values({
          email,
          passwordHash: await bcrypt.hash(password, 12),
        })
        .returning()
        .onConflictDoNothing();

      await fastify.signJwt({ id: user.id, email: user.email }, reply);

      return reply.code(201).send("ok");
    },
  );
};

export default signUpController;
