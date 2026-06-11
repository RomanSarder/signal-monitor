import { FastifyPluginAsync } from "fastify";
import {
  PatchResultBody,
  ResultParams,
  patchResultBodySchema,
  resultParamsSchema,
  resultSchema,
} from "./schema";
import { monitors, results } from "../db/schema";
import { and, eq, inArray } from "drizzle-orm";

export const patchResultController: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.patch<{ Params: ResultParams; Body: PatchResultBody }>(
    "/:id",
    {
      schema: {
        params: resultParamsSchema,
        body: patchResultBodySchema,
        response: { 200: resultSchema },
      },
    },
    async (request, reply) => {
      const userMonitorIds = fastify.db
        .select({ id: monitors.id })
        .from(monitors)
        .where(eq(monitors.userId, request.user.id));

      const [updated] = await fastify.db
        .update(results)
        .set(request.body)
        .where(
          and(
            eq(results.id, request.params.id),
            inArray(results.monitorId, userMonitorIds),
          ),
        )
        .returning();

      if (!updated) return reply.notFound("Result not found");
      return updated;
    },
  );
};
