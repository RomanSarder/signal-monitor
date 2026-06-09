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
        reply.send(err);
      }
    },
  );
});
