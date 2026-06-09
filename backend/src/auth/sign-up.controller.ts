import { FastifyPluginAsync } from "fastify";
import { AuthBody, authBodySchema } from "./auth.schema";
import { users } from "../db/schema";
import bcrypt from "bcrypt";
import { COOKIE_NAME } from "./jwt";

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

      const token = await reply.jwtSign({
        id: user.id,
        email: user.email,
      });

      reply
        .setCookie(COOKIE_NAME, token, {
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7,
        })
        .code(200)
        .send("ok");
    },
  );
};

export default signUpController;
