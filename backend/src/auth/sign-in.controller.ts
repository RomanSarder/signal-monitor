import { FastifyPluginAsync } from "fastify";
import { AuthBody, authBodySchema } from "./auth.schema";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const signInController: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: AuthBody }>(
    "/sign-in",
    { schema: { body: authBodySchema } },
    async (request, reply) => {
      const { email, password } = request.body;
      const [existingUser] = await fastify.db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!existingUser) {
        // Be deliberately vague about which credention is incorrect
        // To prevent user enumeration
        return reply.unauthorized("Invalid credentials");
      }

      const isCorrectPassword = await bcrypt.compare(
        password,
        existingUser.passwordHash,
      );

      if (!isCorrectPassword) {
        return reply.unauthorized("Invalid credentials");
      }

      await fastify.signJwt(
        { id: existingUser.id, email: existingUser.email },
        reply,
      );

      return reply.status(200).send("ok");
    },
  );
};

export default signInController;
