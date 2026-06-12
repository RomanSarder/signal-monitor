import fastifyPlugin from "fastify-plugin";
import jwt, { FastifyJwtNamespace } from "@fastify/jwt";
import { FastifyReply, FastifyRequest } from "fastify";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string; email: string };
    user: { id: string; email: string };
  }
}

declare module "fastify" {
  interface FastifyInstance extends FastifyJwtNamespace<{
    namespace: "security";
  }> {
    authenticate(req: FastifyRequest, reply: FastifyReply): Promise<void>;
    signJwt(
      { id, email }: { id: string; email: string },
      reply: FastifyReply,
    ): Promise<void>;
  }
}

export const COOKIE_NAME = "signalmonitor";

export default fastifyPlugin(async (fastify) => {
  fastify.register(jwt, {
    secret: fastify.config.SECRET,
    cookie: { cookieName: COOKIE_NAME, signed: false },
  });

  fastify.decorate(
    "authenticate",
    async function (req: FastifyRequest, reply: FastifyReply) {
      try {
        await req.jwtVerify();
      } catch (err) {
        return reply.unauthorized("Unauthorized");
      }
    },
  );

  fastify.decorate(
    "signJwt",
    async function (
      { id, email }: { id: string; email: string },
      reply: FastifyReply,
    ) {
      const token = await reply.jwtSign({
        id: id,
        email: email,
      });

      const isProd = process.env.NODE_ENV === "production";
      reply.setCookie(COOKIE_NAME, token, {
        path: "/",
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    },
  );
});
